import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../config/theme';
import { useApp, actions } from '../store';
import { VoiceService } from '../services/voice';
import { TranscriptionService } from '../services/transcription';
import { AIService } from '../services/ai';

export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const settings = state.settings;

  const updateSetting = (key: string, value: boolean | string) => {
    dispatch(actions.updateSettings({ [key]: value }));
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all memories, rooms, and conversations from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: () => {
            dispatch(actions.resetState());
          },
        },
      ]
    );
  };

  const serviceStatus = {
    voice: VoiceService.isRecording() ? 'Active' : 'Ready',
    transcription: TranscriptionService.isConfigured() ? 'Configured' : 'Not configured',
    ai: AIService.isConfigured() ? 'Configured' : 'Not configured',
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Voice & Recording */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice & Recording</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Voice Capture</Text>
              <Text style={styles.settingDescription}>Enable microphone recording</Text>
            </View>
            <Switch
              value={settings.voiceEnabled}
              onValueChange={(v) => updateSetting('voiceEnabled', v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-Transcribe</Text>
              <Text style={styles.settingDescription}>
                Automatically convert voice to text
              </Text>
            </View>
            <Switch
              value={settings.autoTranscribe}
              onValueChange={(v) => updateSetting('autoTranscribe', v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>
      </View>

      {/* AI Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Thinking Partner</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>AI Model</Text>
              <Text style={styles.settingDescription}>
                {settings.aiModel === 'claude' ? 'Claude (Anthropic)' : 'GPT (OpenAI)'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                updateSetting(
                  'aiModel',
                  settings.aiModel === 'claude' ? 'gpt' : 'claude'
                )
              }
              style={styles.toggleButton}
            >
              <Text style={styles.toggleButtonText}>
                {settings.aiModel === 'claude' ? 'Claude' : 'GPT'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>Vibration on interactions</Text>
            </View>
            <Switch
              value={settings.hapticFeedback}
              onValueChange={(v) => updateSetting('hapticFeedback', v)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>
      </View>

      {/* Service Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Status</Text>
        <View style={styles.card}>
          {Object.entries(serviceStatus).map(([service, status], index) => (
            <React.Fragment key={service}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.statusRow}>
                <Ionicons
                  name={
                    service === 'voice'
                      ? 'mic-outline'
                      : service === 'transcription'
                      ? 'text-outline'
                      : 'sparkles-outline'
                  }
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={styles.statusLabel}>
                  {service.charAt(0).toUpperCase() + service.slice(1)}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    status === 'Not configured' && styles.statusBadgeWarning,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      status === 'Not configured' && styles.statusTextWarning,
                    ]}
                  >
                    {status}
                  </Text>
                </View>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.card}>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Memories</Text>
            <Text style={styles.dataValue}>{state.memories.length}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Rooms</Text>
            <Text style={styles.dataValue}>{state.rooms.length}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Conversations</Text>
            <Text style={styles.dataValue}>{state.conversations.length}</Text>
          </View>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.aboutSection}>
        <Text style={styles.appName}>Vibot - AI Memory Palace</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  settingDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  toggleButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
  },
  toggleButtonText: {
    color: '#FFF',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  statusLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  statusBadge: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  statusBadgeWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  statusTextWarning: {
    color: colors.warning,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  dataLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  dataValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: spacing.sm,
  },
  dangerButtonText: {
    color: colors.error,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
  },
  aboutSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appName: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.semiBold,
  },
  version: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
});
