import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '../config/theme';
import { useApp, actions } from '../store';
import { VoiceService } from '../services/voice';
import { TranscriptionService } from '../services/transcription';
import { AIService } from '../services/ai';
import type { Message, Conversation, Memory } from '../types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default function TalkScreen() {
  const { state, dispatch } = useApp();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const conversation = state.currentConversation;
  const messages = conversation?.messages || [];

  // Initialize a new conversation if none exists
  useEffect(() => {
    if (!conversation) {
      const newConv: Conversation = {
        id: generateId(),
        title: 'New Conversation',
        messages: [],
        memoryIds: [],
        createdAt: new Date().toISOString(),
        userId: state.userId || 'local',
      };
      dispatch(actions.addConversation(newConv));
      dispatch(actions.setCurrentConversation(newConv));
    }
  }, []);

  // Pulse animation for recording indicator
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  useEffect(scrollToBottom, [messages.length]);

  // Save user messages as memories with AI-powered analysis
  const saveAsMemory = async (text: string, isVoice: boolean) => {
    try {
      let tags: string[] = [];
      let summary: string | undefined;
      let suggestedRoom: string | undefined;

      // Try AI analysis if configured
      if (AIService.isConfigured()) {
        try {
          const analysis = await AIService.analyzeMemory(text);
          tags = analysis.tags;
          summary = analysis.summary;
          suggestedRoom = analysis.suggestedRoom;
        } catch {
          // Fall back to basic tag extraction
          tags = extractBasicTags(text);
        }
      } else {
        tags = extractBasicTags(text);
      }

      // Find matching room by suggested name
      let roomId: string | undefined;
      if (suggestedRoom) {
        const matchingRoom = state.rooms.find(
          (r) => r.name.toLowerCase().includes(suggestedRoom!.toLowerCase())
        );
        roomId = matchingRoom?.id;
      }

      const memory: Memory = {
        id: generateId(),
        content: text,
        summary,
        type: isVoice ? 'voice' : 'conversation',
        tags,
        connections: [],
        roomId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: state.userId || 'local',
      };

      dispatch(actions.addMemory(memory));
    } catch (error) {
      console.error('Failed to save memory:', error);
    }
  };

  // Basic tag extraction without AI
  const extractBasicTags = (text: string): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'it', 'this', 'that', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they', 'them', 'and', 'or', 'but', 'not', 'so', 'if', 'about', 'just', 'also', 'then', 'than', 'very', 'really', 'think', 'like', 'want', 'know']);
    const wordCounts = new Map<string, number>();
    words.forEach((w) => {
      const clean = w.replace(/[^a-z]/g, '');
      if (clean.length > 3 && !stopWords.has(clean)) {
        wordCounts.set(clean, (wordCounts.get(clean) || 0) + 1);
      }
    });
    return Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([word]) => word);
  };

  const sendMessage = async (text: string, isVoice: boolean = false) => {
    if (!text.trim() || !conversation) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
      isVoice,
    };

    dispatch(actions.addMessage(conversation.id, userMessage));
    setInputText('');

    // Auto-save as memory in the background
    saveAsMemory(text.trim(), isVoice);

    // Get AI response
    setIsThinking(true);
    try {
      const allMessages = [...messages, userMessage];
      const recentMemoryContext = state.memories.slice(0, 8).map((m) => ({
        content: m.content,
        tags: m.tags,
      }));
      const systemPrompt = AIService.getThinkingPartnerPrompt(recentMemoryContext);
      const response = await AIService.chat(allMessages, systemPrompt);

      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      dispatch(actions.addMessage(conversation.id, aiMessage));
    } catch (error) {
      const errorMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: `I'm having trouble connecting right now. ${error instanceof Error ? error.message : 'Please try again.'}`,
        timestamp: new Date().toISOString(),
      };
      dispatch(actions.addMessage(conversation.id, errorMsg));
    } finally {
      setIsThinking(false);
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      dispatch(actions.setRecording(false));
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
        durationTimer.current = null;
      }

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const result = await VoiceService.stopRecording();

        // Transcribe
        setIsTranscribing(true);
        const text = await TranscriptionService.transcribe(result.uri);
        setIsTranscribing(false);

        if (text) {
          await sendMessage(text, true);
        }
      } catch (error) {
        setIsTranscribing(false);
        console.error('Recording/transcription error:', error);
      }

      setRecordingDuration(0);
    } else {
      // Start recording
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await VoiceService.startRecording();
        setIsRecording(true);
        dispatch(actions.setRecording(true));

        // Start duration timer
        durationTimer.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      } catch (error) {
        console.error('Failed to start recording:', error);
      }
    }
  };

  const startNewConversation = () => {
    const newConv: Conversation = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      memoryIds: [],
      createdAt: new Date().toISOString(),
      userId: state.userId || 'local',
    };
    dispatch(actions.addConversation(newConv));
    dispatch(actions.setCurrentConversation(newConv));
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={14} color={colors.primary} />
          </View>
        )}
        <View style={[styles.messageContent, isUser ? styles.userContent : styles.aiContent]}>
          <Text style={[styles.messageText, isUser && styles.userText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thinking Partner</Text>
        <TouchableOpacity onPress={startNewConversation} style={styles.newChatBtn}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>Start a conversation</Text>
          <Text style={styles.emptySubtitle}>
            Tap the mic to speak, or type a message to start thinking out loud with your AI partner.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Thinking indicator */}
      {isThinking && (
        <View style={styles.thinkingIndicator}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.thinkingText}>Thinking...</Text>
        </View>
      )}

      {/* Transcribing indicator */}
      {isTranscribing && (
        <View style={styles.thinkingIndicator}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.thinkingText}>Transcribing...</Text>
        </View>
      )}

      {/* Recording overlay */}
      {isRecording && (
        <View style={styles.recordingOverlay}>
          <Animated.View style={[styles.recordingPulse, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.recordingDot} />
          </Animated.View>
          <Text style={styles.recordingTime}>{formatDuration(recordingDuration)}</Text>
          <Text style={styles.recordingHint}>Tap mic to stop</Text>
        </View>
      )}

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={2000}
          editable={!isRecording && !isTranscribing}
        />

        {inputText.trim() ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => sendMessage(inputText, false)}
            disabled={isThinking}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonRecording]}
            onPress={handleVoiceRecord}
            disabled={isTranscribing}
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={22}
              color="#FFF"
            />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  newChatBtn: {
    padding: spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  messageContent: {
    maxWidth: '78%',
    padding: spacing.sm + 2,
    borderRadius: borderRadius.lg,
  },
  userContent: {
    backgroundColor: colors.primary,
    marginLeft: 'auto',
    borderBottomRightRadius: borderRadius.sm,
  },
  aiContent: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    lineHeight: 21,
  },
  userText: {
    color: '#FFFFFF',
  },
  thinkingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  thinkingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  recordingOverlay: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  recordingPulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.recordingPulse,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.recording,
  },
  recordingTime: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.recording,
    marginTop: spacing.sm,
  },
  recordingHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonRecording: {
    backgroundColor: colors.recording,
  },
});
