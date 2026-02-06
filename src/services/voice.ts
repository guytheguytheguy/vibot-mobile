/**
 * Voice Recording Service
 *
 * Handles audio recording using expo-av with proper permission management
 * and high-quality recording settings for optimal transcription accuracy.
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface RecordingResult {
  uri: string;
  duration: number;
  size: number;
}

class VoiceServiceClass {
  private recording: Audio.Recording | null = null;
  private isInitialized = false;

  /**
   * Initialize audio mode for recording
   * Sets up iOS-specific settings and audio session configuration
   */
  private async initializeAudio(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio mode:', error);
      throw new Error('Audio initialization failed. Please restart the app.');
    }
  }

  /**
   * Request microphone permissions
   * @returns true if permission granted, false otherwise
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();

      if (status !== 'granted') {
        console.warn('Microphone permission denied');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting microphone permissions:', error);
      return false;
    }
  }

  /**
   * Check if microphone permissions are granted
   */
  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   * @throws Error if permissions not granted or recording fails
   */
  async startRecording(): Promise<void> {
    try {
      // Check and request permissions
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Microphone permission required to record audio');
        }
      }

      // Initialize audio mode
      await this.initializeAudio();

      // Stop any existing recording
      if (this.recording) {
        await this.stopRecording();
      }

      // Create new recording instance
      const recording = new Audio.Recording();

      // Prepare recording with high-quality settings optimized for speech
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1, // Mono for voice
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1, // Mono for voice
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      // Start recording
      await recording.startAsync();
      this.recording = recording;

      console.log('Recording started');
    } catch (error) {
      this.recording = null;
      console.error('Failed to start recording:', error);
      throw new Error(`Recording failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop recording and return the audio file URI
   * @returns Recording result with URI, duration, and file size
   */
  async stopRecording(): Promise<RecordingResult> {
    if (!this.recording) {
      throw new Error('No active recording to stop');
    }

    try {
      // Get recording status before stopping
      const status = await this.recording.getStatusAsync();

      // Stop and unload recording
      await this.recording.stopAndUnloadAsync();

      // Get the URI of the recorded file
      const uri = this.recording.getURI();

      if (!uri) {
        throw new Error('Recording URI is null');
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);

      const result: RecordingResult = {
        uri,
        duration: status.durationMillis || 0,
        size: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
      };

      console.log('Recording stopped:', result);

      // Clear recording instance
      this.recording = null;

      return result;
    } catch (error) {
      this.recording = null;
      console.error('Failed to stop recording:', error);
      throw new Error(`Failed to stop recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel current recording without saving
   */
  async cancelRecording(): Promise<void> {
    if (!this.recording) {
      return;
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      // Delete the file
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

      this.recording = null;
      console.log('Recording cancelled');
    } catch (error) {
      this.recording = null;
      console.error('Failed to cancel recording:', error);
    }
  }

  /**
   * Get current recording duration in milliseconds
   * @returns Duration in milliseconds, or 0 if not recording
   */
  async getRecordingDuration(): Promise<number> {
    if (!this.recording) {
      return 0;
    }

    try {
      const status = await this.recording.getStatusAsync();
      return status.durationMillis || 0;
    } catch (error) {
      console.error('Failed to get recording duration:', error);
      return 0;
    }
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.recording !== null;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
      this.recording = null;
    }
  }
}

// Export singleton instance
export const VoiceService = new VoiceServiceClass();
