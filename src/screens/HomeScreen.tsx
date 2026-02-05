import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import MemoryCard from '../components/MemoryCard';
import SurpriseCard from '../components/SurpriseCard';
import { useApp } from '../store';
import { SurpriseEngine, type Surprise } from '../services/surprise';
import { colors, spacing, typography, borderRadius } from '../config/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { state } = useApp();
  const navigation = useNavigation();
  const [greeting, setGreeting] = useState('');
  const [surprises, setSurprises] = useState<Surprise[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const memories = state.memories;
  const rooms = state.rooms;
  const recentMemories = memories.slice(0, 5);

  useEffect(() => {
    updateGreeting();
    loadSurprises();
  }, [memories.length]);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  };

  const loadSurprises = async () => {
    try {
      const newSurprises = await SurpriseEngine.generateSurprises(memories, rooms, 3);
      setSurprises(newSurprises);
    } catch (error) {
      console.error('Failed to load surprises:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadSurprises();
    setRefreshing(false);
  }, [memories, rooms]);

  const handleDismissSurprise = (id: string) => {
    setSurprises((prev) => prev.filter((s) => s.id !== id));
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleQuickCapture = () => {
    (navigation as any).navigate('Talk');
  };

  const totalConnections = memories.reduce(
    (acc, m) => acc + m.connections.length,
    0
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.date}>{formatDate()}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => (navigation as any).navigate('Settings')}
          >
            <Ionicons name="person-circle-outline" size={36} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{memories.length}</Text>
            <Text style={styles.statLabel}>Memories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{rooms.length}</Text>
            <Text style={styles.statLabel}>Rooms</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalConnections}</Text>
            <Text style={styles.statLabel}>Links</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{state.conversations.length}</Text>
            <Text style={styles.statLabel}>Chats</Text>
          </View>
        </View>

        {/* Surprises */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="sparkles" size={18} color={colors.accent} />
              <Text style={styles.sectionTitle}>Surprises For You</Text>
            </View>
            <TouchableOpacity onPress={onRefresh}>
              <Ionicons name="refresh" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <View style={styles.surprisesContainer}>
            {surprises.map((surprise, index) => (
              <SurpriseCard
                key={surprise.id}
                surprise={surprise}
                index={index}
                onDismiss={() => handleDismissSurprise(surprise.id)}
              />
            ))}
          </View>
        </View>

        {/* Recent Memories */}
        {recentMemories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Memories</Text>
              <TouchableOpacity onPress={() => (navigation as any).navigate('Search')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {recentMemories.map((memory) => (
                <View key={memory.id} style={styles.horizontalCard}>
                  <MemoryCard memory={memory} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Your Palace */}
        {rooms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Palace</Text>
              <TouchableOpacity onPress={() => (navigation as any).navigate('Palace')}>
                <Text style={styles.seeAll}>View all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.roomGrid}>
              {rooms.slice(0, 4).map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={styles.roomCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    (navigation as any).navigate('Palace');
                  }}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[room.color, `${room.color}CC`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roomGradient}
                  >
                    <Text style={styles.roomIcon}>{room.icon}</Text>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <View style={styles.roomFooter}>
                      <Ionicons name="albums-outline" size={14} color="#FFF" />
                      <Text style={styles.roomCount}>
                        {memories.filter((m) => m.roomId === room.id).length}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Empty state for new users */}
        {memories.length === 0 && rooms.length === 0 && surprises.length === 0 && (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#6C3CE1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyGradient}
            >
              <Ionicons name="mic" size={48} color="#FFF" />
              <Text style={styles.emptyTitle}>Start Your Memory Palace</Text>
              <Text style={styles.emptySubtitle}>
                Tap the mic below to have a conversation. I'll remember everything and surprise you with insights you didn't expect.
              </Text>
            </LinearGradient>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Quick Capture FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleQuickCapture}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#6C3CE1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="mic" size={28} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  profileButton: {
    padding: 4,
  },
  statsStrip: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  surprisesContainer: {
    paddingHorizontal: 20,
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  horizontalCard: {
    width: width * 0.75,
    marginRight: 12,
  },
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  roomCard: {
    width: (width - 52) / 2,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  roomGradient: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  roomIcon: {
    fontSize: 28,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  roomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomCount: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
    opacity: 0.9,
  },
  emptyState: {
    marginHorizontal: 20,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  emptyGradient: {
    alignItems: 'center',
    paddingVertical: spacing.xl + 16,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFF',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  bottomPadding: {
    height: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
