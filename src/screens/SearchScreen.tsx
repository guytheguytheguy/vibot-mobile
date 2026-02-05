import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../config/theme';
import { useApp } from '../store';
import MemoryCard from '../components/MemoryCard';
import type { Memory } from '../types';

export default function SearchScreen() {
  const { state } = useApp();
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<Memory['type'] | 'all'>('all');

  const memories = state.memories;

  const filteredMemories = useMemo(() => {
    let results = memories;

    // Filter by type
    if (selectedType !== 'all') {
      results = results.filter((m) => m.type === selectedType);
    }

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (m) =>
          m.content.toLowerCase().includes(lowerQuery) ||
          (m.summary && m.summary.toLowerCase().includes(lowerQuery)) ||
          m.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return results;
  }, [memories, query, selectedType]);

  const typeFilters: { key: Memory['type'] | 'all'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'grid-outline' },
    { key: 'voice', label: 'Voice', icon: 'mic-outline' },
    { key: 'text', label: 'Text', icon: 'document-text-outline' },
    { key: 'conversation', label: 'Chats', icon: 'chatbubbles-outline' },
  ];

  const allTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    memories.forEach((m) => {
      m.tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [memories]);

  return (
    <View style={styles.container}>
      {/* Search input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search memories..."
          placeholderTextColor={colors.textTertiary}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Type filters */}
      <View style={styles.filterRow}>
        {typeFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedType === filter.key && styles.filterChipActive,
            ]}
            onPress={() => setSelectedType(filter.key)}
          >
            <Ionicons
              name={filter.icon}
              size={16}
              color={selectedType === filter.key ? '#FFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedType === filter.key && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tag cloud when no query */}
      {!query.trim() && allTags.length > 0 && (
        <View style={styles.tagCloud}>
          <Text style={styles.tagCloudTitle}>Popular Tags</Text>
          <View style={styles.tagRow}>
            {allTags.map(([tag, count]) => (
              <TouchableOpacity
                key={tag}
                style={styles.tagChip}
                onPress={() => setQuery(tag)}
              >
                <Text style={styles.tagChipText}>{tag}</Text>
                <Text style={styles.tagCount}>{count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results */}
      {memories.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No memories yet</Text>
          <Text style={styles.emptySubtext}>
            Start capturing thoughts with the Talk tab, and they'll appear here for search.
          </Text>
        </View>
      ) : filteredMemories.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="funnel-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No results</Text>
          <Text style={styles.emptySubtext}>
            Try a different search term or filter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMemories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              <MemoryCard memory={item} />
            </View>
          )}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semiBold,
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  tagCloud: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  tagCloudTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  tagChipText: {
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  tagCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  resultsList: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  resultCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  resultItem: {
    marginBottom: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
