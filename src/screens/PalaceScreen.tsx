import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius, roomColors } from '../config/theme';
import { useApp, actions } from '../store';
import MemoryCard from '../components/MemoryCard';
import { type Room, generateId } from '../types';

const { width } = Dimensions.get('window');

const ROOM_COLOR_OPTIONS = Object.entries(roomColors).map(([name, color]) => ({
  name,
  color,
}));

const ROOM_ICONS = ['💡', '💼', '📚', '🌟', '🧪', '🎯', '🎨', '🏠', '🌍', '💭', '🔬', '🎵'];

export default function PalaceScreen() {
  const { state, dispatch } = useApp();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomIcon, setNewRoomIcon] = useState('💡');
  const [newRoomColor, setNewRoomColor] = useState<string>(roomColors.cosmic);

  const rooms = state.rooms;
  const memories = state.memories;

  const roomMemories = selectedRoom
    ? memories.filter((m) => m.roomId === selectedRoom.id)
    : [];

  const totalMemories = memories.length;
  const totalRooms = rooms.length;

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;

    const room: Room = {
      id: generateId(),
      name: newRoomName.trim(),
      icon: newRoomIcon,
      color: newRoomColor,
      memoryCount: 0,
      lastVisited: new Date().toISOString(),
      userId: state.userId || 'local',
      createdAt: new Date().toISOString(),
    };

    dispatch(actions.addRoom(room));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setNewRoomName('');
    setNewRoomIcon('💡');
    setNewRoomColor(roomColors.cosmic);
    setIsCreating(false);
  };

  const handleDeleteRoom = (room: Room) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete "${room.name}"? Memories inside won't be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(actions.deleteRoom(room.id));
            if (selectedRoom?.id === room.id) {
              setSelectedRoom(null);
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  if (selectedRoom) {
    return (
      <View style={styles.container}>
        {/* Room detail header */}
        <View style={styles.roomDetailHeader}>
          <TouchableOpacity
            onPress={() => setSelectedRoom(null)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.roomDetailIcon}>{selectedRoom.icon}</Text>
          <Text style={styles.roomDetailTitle}>{selectedRoom.name}</Text>
        </View>

        {roomMemories.length === 0 ? (
          <View style={styles.emptyRoom}>
            <Ionicons name="albums-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyRoomText}>No memories in this room yet</Text>
            <Text style={styles.emptyRoomSubtext}>
              Memories will appear here when assigned to this room
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.roomMemories}
            showsVerticalScrollIndicator={false}
          >
            {roomMemories.map((memory) => (
              <View key={memory.id} style={styles.memoryItem}>
                <MemoryCard memory={memory} />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalRooms}</Text>
          <Text style={styles.statLabel}>Rooms</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalMemories}</Text>
          <Text style={styles.statLabel}>Memories</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {memories.reduce((acc, m) => acc + m.connections.length, 0)}
          </Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
      </View>

      {/* Room grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Rooms</Text>
        <TouchableOpacity onPress={() => setIsCreating(true)}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Create room form */}
      {isCreating && (
        <View style={styles.createForm}>
          <TextInput
            style={styles.nameInput}
            value={newRoomName}
            onChangeText={setNewRoomName}
            placeholder="Room name..."
            placeholderTextColor={colors.textTertiary}
            autoFocus
          />

          {/* Icon selector */}
          <Text style={styles.formLabel}>Icon</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.iconRow}>
              {ROOM_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    newRoomIcon === icon && styles.iconOptionSelected,
                  ]}
                  onPress={() => setNewRoomIcon(icon)}
                >
                  <Text style={styles.iconOptionText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Color selector */}
          <Text style={styles.formLabel}>Color</Text>
          <View style={styles.colorRow}>
            {ROOM_COLOR_OPTIONS.map(({ name, color }) => (
              <TouchableOpacity
                key={name}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  newRoomColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => setNewRoomColor(color)}
              />
            ))}
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsCreating(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, !newRoomName.trim() && styles.createButtonDisabled]}
              onPress={handleCreateRoom}
              disabled={!newRoomName.trim()}
            >
              <Text style={styles.createButtonText}>Create Room</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Room cards */}
      {rooms.length === 0 && !isCreating ? (
        <View style={styles.emptyPalace}>
          <Ionicons name="business-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyPalaceTitle}>Build Your Memory Palace</Text>
          <Text style={styles.emptyPalaceSubtext}>
            Create rooms to organize your memories by topic, project, or any category that works for you.
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => setIsCreating(true)}
          >
            <Text style={styles.createFirstButtonText}>Create First Room</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.roomGrid}>
          {rooms.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={styles.roomCard}
              onPress={() => {
                setSelectedRoom(room);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              onLongPress={() => handleDeleteRoom(room)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[room.color, `${room.color}AA`]}
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
      )}
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  createForm: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  nameInput: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.md,
  },
  formLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.sm,
  },
  iconRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOptionSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  iconOptionText: {
    fontSize: 22,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  roomCard: {
    width: (width - spacing.md * 2 - spacing.sm) / 2,
    height: 140,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  roomGradient: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  roomIcon: {
    fontSize: 32,
  },
  roomName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#FFF',
  },
  roomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomCount: {
    fontSize: typography.fontSize.sm,
    color: '#FFF',
    fontWeight: typography.fontWeight.semiBold,
    opacity: 0.9,
  },
  emptyPalace: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyPalaceTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyPalaceSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  createFirstButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  createFirstButtonText: {
    color: '#FFF',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  // Room detail
  roomDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  roomDetailIcon: {
    fontSize: 24,
  },
  roomDetailTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  emptyRoom: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyRoomText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyRoomSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  roomMemories: {
    padding: spacing.md,
  },
  memoryItem: {
    marginBottom: spacing.sm,
  },
});
