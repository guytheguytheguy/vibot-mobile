import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '../config/theme';
import type { Surprise } from '../services/surprise';

interface SurpriseCardProps {
  surprise: Surprise;
  onPress?: () => void;
  onDismiss?: () => void;
  index?: number;
}

export default function SurpriseCard({ surprise, onPress, onDismiss, index = 0 }: SurpriseCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Stagger entrance animation
    const delay = index * 150;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
        <LinearGradient
          colors={surprise.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <Ionicons
                name={surprise.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color="#FFF"
              />
            </View>
            <Text style={styles.title}>{surprise.title}</Text>
            {onDismiss && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onDismiss();
                }}
                style={styles.dismissBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={16} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.content}>{surprise.content}</Text>
          {surprise.relatedMemoryIds.length > 0 && (
            <View style={styles.footer}>
              <Ionicons name="link-outline" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.footerText}>
                {surprise.relatedMemoryIds.length} related {surprise.relatedMemoryIds.length === 1 ? 'memory' : 'memories'}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  gradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: '#FFF',
    letterSpacing: 0.3,
  },
  dismissBtn: {
    padding: 4,
  },
  content: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 21,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 4,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
  },
});
