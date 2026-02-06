/**
 * Audio Transcription Service
 *
 * Uses OpenAI Whisper API to transcribe audio recordings to text.
 * Supports multiple audio formats and handles retries for network failures.
 */

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

export interface TranscriptionOptions {
  language?: string; // Optional language code (e.g., 'en', 'es', 'fr')
  prompt?: string; // Optional context to improve accuracy
  temperature?: number; // 0-1, controls randomness (default 0)
}

class TranscriptionServiceClass {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openai.com/v1/audio/transcriptions';
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 1000;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

    if (!this.apiKey) {
      console.error(
        '⚠️  OpenAI API key missing!\n' +
        'Please add to .env file:\n' +
        '  EXPO_PUBLIC_OPENAI_API_KEY=your-api-key\n'
      );
    }
  }

  /**
   * Validate API key is configured
   */
  private validateApiKey(): void {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error('OpenAI API key not configured. Please add EXPO_PUBLIC_OPENAI_API_KEY to your .env file.');
    }
  }

  /**
   * Sleep utility for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create FormData for the transcription request
   */
  private async createFormData(
    audioUri: string,
    options: TranscriptionOptions = {}
  ): Promise<FormData> {
    // Read the audio file
    const fileInfo = await FileSystem.getInfoAsync(audioUri);

    if (!fileInfo.exists) {
      throw new Error(`Audio file not found at ${audioUri}`);
    }

    // Determine file extension and MIME type
    const extension = audioUri.split('.').pop()?.toLowerCase() || 'm4a';
    const mimeTypes: Record<string, string> = {
      'm4a': 'audio/m4a',
      'mp4': 'audio/mp4',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'webm': 'audio/webm',
      'ogg': 'audio/ogg',
    };
    const mimeType = mimeTypes[extension] || 'audio/m4a';

    // Create FormData
    const formData = new FormData();

    // Read file as blob for web, or use URI for native
    if (Platform.OS === 'web') {
      const response = await fetch(audioUri);
      const blob = await response.blob();
      formData.append('file', blob, `recording.${extension}`);
    } else {
      // For React Native, use the file URI
      formData.append('file', {
        uri: audioUri,
        type: mimeType,
        name: `recording.${extension}`,
      } as any);
    }

    // Required: model parameter
    formData.append('model', 'whisper-1');

    // Optional parameters
    if (options.language) {
      formData.append('language', options.language);
    }

    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }

    if (options.temperature !== undefined) {
      formData.append('temperature', options.temperature.toString());
    }

    return formData;
  }

  /**
   * Transcribe audio file to text using OpenAI Whisper API
   * @param audioUri Local file URI of the audio recording
   * @param options Optional transcription parameters
   * @returns Transcribed text
   */
  async transcribe(
    audioUri: string,
    options: TranscriptionOptions = {}
  ): Promise<string> {
    this.validateApiKey();

    let lastError: Error | null = null;

    // Retry logic for network failures
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Transcription attempt ${attempt}/${this.maxRetries}`);

        const formData = await this.createFormData(audioUri, options);

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage: string;

          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error?.message || errorText;
          } catch {
            errorMessage = errorText;
          }

          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            throw new Error(`OpenAI API error (${response.status}): ${errorMessage}`);
          }

          // Retry on server errors (5xx)
          throw new Error(`OpenAI API error (${response.status}): ${errorMessage}`);
        }

        const result = await response.json();

        if (!result.text) {
          throw new Error('No transcription text in response');
        }

        console.log('Transcription successful:', result.text.substring(0, 100));

        return result.text.trim();

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Transcription attempt ${attempt} failed:`, lastError.message);

        // Don't retry on validation errors or client errors (4xx)
        if (
          lastError.message.includes('not configured') ||
          lastError.message.includes('not found') ||
          /API error \(4\d{2}\)/.test(lastError.message)
        ) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
          console.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    throw new Error(
      `Transcription failed after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Transcribe with detailed result including metadata
   */
  async transcribeDetailed(
    audioUri: string,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    const startTime = Date.now();
    const text = await this.transcribe(audioUri, options);
    const duration = Date.now() - startTime;

    return {
      text,
      language: options.language,
      duration,
    };
  }

  /**
   * Check if service is configured properly
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey.trim() !== '');
  }
}

// Export singleton instance
export const TranscriptionService = new TranscriptionServiceClass();
