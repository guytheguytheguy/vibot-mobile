/**
 * Surprise Engine - The Heart of Vibot
 *
 * Generates delightful, unexpected insights by analyzing your memories.
 * Surfaces "on this day" memories, finds hidden connections between ideas,
 * generates creative prompts based on your interests, and nudges you
 * when it's been a while since you recorded thoughts on a topic.
 *
 * This is what makes Vibot feel alive and personal.
 */

import type { Memory, Room } from '../types';
import { AIService } from './ai';

export type SurpriseType =
  | 'on_this_day'      // Memories from the same day in previous weeks/months
  | 'connection'        // Hidden connection between two memories
  | 'idea_spark'        // Creative prompt based on your interests
  | 'forgotten_gem'     // A memory you haven't revisited in a while
  | 'pattern'           // A recurring theme in your thinking
  | 'nudge'             // Gentle reminder to think about a neglected topic
  | 'mashup'            // Two unrelated memories combined into a new idea
  | 'question';         // A thought-provoking question based on your memories

export interface Surprise {
  id: string;
  type: SurpriseType;
  title: string;
  content: string;
  relatedMemoryIds: string[];
  icon: string;
  gradient: [string, string];
  createdAt: string;
}

// Icons and gradients for each surprise type
const SURPRISE_STYLES: Record<SurpriseType, { icon: string; gradient: [string, string] }> = {
  on_this_day:  { icon: 'calendar',       gradient: ['#6C3CE1', '#8B5CF6'] },
  connection:   { icon: 'git-merge',       gradient: ['#3B82F6', '#06B6D4'] },
  idea_spark:   { icon: 'flash',           gradient: ['#F59E0B', '#EF4444'] },
  forgotten_gem:{ icon: 'diamond',         gradient: ['#EC4899', '#8B5CF6'] },
  pattern:      { icon: 'analytics',       gradient: ['#10B981', '#3B82F6'] },
  nudge:        { icon: 'hand-left',       gradient: ['#F59E0B', '#10B981'] },
  mashup:       { icon: 'shuffle',         gradient: ['#EF4444', '#6C3CE1'] },
  question:     { icon: 'help-circle',     gradient: ['#06B6D4', '#3B82F6'] },
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function daysBetween(d1: Date, d2: Date): number {
  return Math.floor(Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

function sameDay(d1: Date, d2: Date): boolean {
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth();
}

class SurpriseEngineClass {
  /**
   * Generate a batch of surprises for the user's home screen.
   * Mix of different types for variety.
   */
  async generateSurprises(
    memories: Memory[],
    rooms: Room[],
    count: number = 3
  ): Promise<Surprise[]> {
    if (memories.length === 0) {
      return [this.generateWelcomeSurprise()];
    }

    const surprises: Surprise[] = [];
    const generators: (() => Surprise | null | Promise<Surprise | null>)[] = [
      () => this.findOnThisDay(memories),
      () => this.findForgottenGem(memories),
      () => this.findPattern(memories),
      () => this.generateNudge(memories, rooms),
      () => this.generateMashup(memories),
      () => this.generateQuestion(memories),
    ];

    // If AI is configured, add AI-powered generators
    if (AIService.isConfigured()) {
      generators.push(
        () => this.generateAIConnection(memories),
        () => this.generateAIIdeaSpark(memories),
      );
    }

    // Shuffle generators for variety
    const shuffled = generators.sort(() => Math.random() - 0.5);

    for (const gen of shuffled) {
      if (surprises.length >= count) break;
      try {
        const surprise = await gen();
        if (surprise) {
          surprises.push(surprise);
        }
      } catch (error) {
        console.error('Surprise generation error:', error);
      }
    }

    // Always return at least one surprise
    if (surprises.length === 0) {
      surprises.push(this.generateRandomEncouragement(memories));
    }

    return surprises;
  }

  /**
   * "On This Day" - Find memories from the same calendar day
   */
  findOnThisDay(memories: Memory[]): Surprise | null {
    const now = new Date();
    const matches = memories.filter((m) => {
      const created = new Date(m.createdAt);
      return sameDay(created, now) && daysBetween(created, now) >= 7;
    });

    if (matches.length === 0) return null;

    const memory = matches[Math.floor(Math.random() * matches.length)];
    const created = new Date(memory.createdAt);
    const weeksAgo = Math.round(daysBetween(created, now) / 7);
    const timeLabel = weeksAgo >= 4
      ? `${Math.round(weeksAgo / 4)} month${Math.round(weeksAgo / 4) > 1 ? 's' : ''} ago`
      : `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;

    return this.makeSurprise('on_this_day', {
      title: `On This Day (${timeLabel})`,
      content: memory.summary || memory.content.substring(0, 120) + '...',
      relatedMemoryIds: [memory.id],
    });
  }

  /**
   * "Forgotten Gem" - Surface a memory not visited in a long time
   */
  findForgottenGem(memories: Memory[]): Surprise | null {
    if (memories.length < 5) return null;

    const now = new Date();
    const oldMemories = memories
      .filter((m) => daysBetween(new Date(m.createdAt), now) > 14)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (oldMemories.length === 0) return null;

    // Pick from the oldest third
    const pool = oldMemories.slice(0, Math.max(1, Math.floor(oldMemories.length / 3)));
    const memory = pool[Math.floor(Math.random() * pool.length)];

    return this.makeSurprise('forgotten_gem', {
      title: 'Forgotten Gem',
      content: `You thought about this a while back: "${(memory.summary || memory.content).substring(0, 100)}..." - still relevant?`,
      relatedMemoryIds: [memory.id],
    });
  }

  /**
   * "Pattern" - Find recurring tags/themes
   */
  findPattern(memories: Memory[]): Surprise | null {
    if (memories.length < 3) return null;

    const tagCounts = new Map<string, number>();
    const recentMemories = memories.slice(0, 20);

    recentMemories.forEach((m) => {
      m.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const topTags = Array.from(tagCounts.entries())
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1]);

    if (topTags.length === 0) return null;

    const [tag, count] = topTags[0];
    const relatedIds = recentMemories
      .filter((m) => m.tags.includes(tag))
      .slice(0, 3)
      .map((m) => m.id);

    return this.makeSurprise('pattern', {
      title: 'Thinking Pattern',
      content: `"${tag}" keeps coming up in your thoughts (${count} times recently). Seems like something important to you.`,
      relatedMemoryIds: relatedIds,
    });
  }

  /**
   * "Nudge" - Notice a room/topic that's been neglected
   */
  generateNudge(memories: Memory[], rooms: Room[]): Surprise | null {
    if (rooms.length === 0) return null;

    const now = new Date();
    const roomActivity = rooms.map((room) => {
      const roomMemories = memories.filter((m) => m.roomId === room.id);
      const lastActivity = roomMemories.length > 0
        ? Math.max(...roomMemories.map((m) => new Date(m.createdAt).getTime()))
        : 0;
      return { room, memoryCount: roomMemories.length, lastActivity };
    });

    // Find rooms with memories but no recent activity
    const neglected = roomActivity
      .filter((r) => r.memoryCount > 0 && daysBetween(new Date(r.lastActivity), now) > 7)
      .sort((a, b) => a.lastActivity - b.lastActivity);

    if (neglected.length === 0) return null;

    const { room, memoryCount } = neglected[0];
    const daysAgo = daysBetween(new Date(neglected[0].lastActivity), now);

    return this.makeSurprise('nudge', {
      title: 'Missing You',
      content: `Your "${room.name}" room has ${memoryCount} memories but hasn't seen you in ${daysAgo} days. Any new thoughts?`,
      relatedMemoryIds: [],
    });
  }

  /**
   * "Mashup" - Combine two random memories into a creative prompt
   */
  generateMashup(memories: Memory[]): Surprise | null {
    if (memories.length < 4) return null;

    // Pick two memories from different rooms/tags
    const shuffled = [...memories].sort(() => Math.random() - 0.5);
    let m1 = shuffled[0];
    let m2 = shuffled.find((m) =>
      m.id !== m1.id &&
      m.roomId !== m1.roomId &&
      !m.tags.some((t) => m1.tags.includes(t))
    );

    if (!m2) m2 = shuffled[1]; // Fallback

    const topic1 = m1.tags[0] || 'idea';
    const topic2 = m2.tags[0] || 'thought';

    return this.makeSurprise('mashup', {
      title: 'Idea Mashup',
      content: `What if you combined "${topic1}" with "${topic2}"? Sometimes the best ideas come from unexpected connections.`,
      relatedMemoryIds: [m1.id, m2.id],
    });
  }

  /**
   * "Question" - Generate a thought-provoking question based on recent topics
   */
  generateQuestion(memories: Memory[]): Surprise | null {
    if (memories.length === 0) return null;

    const recentTags = new Set<string>();
    memories.slice(0, 10).forEach((m) => m.tags.forEach((t) => recentTags.add(t)));

    const questions = [
      `What's one thing about ${pickRandom([...recentTags]) || 'your recent thinking'} that you haven't explored yet?`,
      `If you could only keep 3 of your recent ideas, which would they be?`,
      `What would your past self from a month ago think about your current focus?`,
      `Is there someone you should share your "${pickRandom([...recentTags]) || 'latest'}" thoughts with?`,
      `What's the boldest next step you could take on your recent ideas?`,
      `What assumption are you making about "${pickRandom([...recentTags]) || 'things'}" that might be wrong?`,
      `If you had unlimited resources, how would you act on your recent thoughts?`,
    ];

    const question = questions[Math.floor(Math.random() * questions.length)];

    return this.makeSurprise('question', {
      title: 'Think About This',
      content: question,
      relatedMemoryIds: memories.slice(0, 2).map((m) => m.id),
    });
  }

  /**
   * AI-powered connection discovery between memories
   */
  async generateAIConnection(memories: Memory[]): Promise<Surprise | null> {
    if (memories.length < 3) return null;

    // Pick two seemingly unrelated memories
    const shuffled = [...memories].sort(() => Math.random() - 0.5);
    const m1 = shuffled[0];
    const m2 = shuffled.find((m) =>
      m.id !== m1.id && !m.tags.some((t) => m1.tags.includes(t))
    ) || shuffled[1];

    const systemPrompt = `You find surprising, insightful connections between ideas. Given two memories, find one unexpected but meaningful connection in 1-2 sentences. Be specific and creative. Don't be generic.`;

    const messages = [{
      id: 'conn',
      role: 'user' as const,
      content: `Memory 1: ${m1.content.substring(0, 200)}\n\nMemory 2: ${m2.content.substring(0, 200)}\n\nWhat's a surprising connection between these?`,
      timestamp: new Date().toISOString(),
    }];

    const response = await AIService.chat(messages, systemPrompt);

    return this.makeSurprise('connection', {
      title: 'Hidden Connection',
      content: response.substring(0, 200),
      relatedMemoryIds: [m1.id, m2.id],
    });
  }

  /**
   * AI-powered idea spark based on your memory themes
   */
  async generateAIIdeaSpark(memories: Memory[]): Promise<Surprise | null> {
    if (memories.length < 2) return null;

    const recentTopics = memories
      .slice(0, 10)
      .flatMap((m) => m.tags)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 5);

    if (recentTopics.length === 0) return null;

    const systemPrompt = `You're a creative thinking partner. Given a person's recent interests, suggest ONE fun, actionable idea they could explore. Be specific and exciting. 1-2 sentences max.`;

    const messages = [{
      id: 'spark',
      role: 'user' as const,
      content: `My recent interests: ${recentTopics.join(', ')}. Give me one exciting idea to explore.`,
      timestamp: new Date().toISOString(),
    }];

    const response = await AIService.chat(messages, systemPrompt);

    return this.makeSurprise('idea_spark', {
      title: 'Idea Spark',
      content: response.substring(0, 200),
      relatedMemoryIds: memories.slice(0, 2).map((m) => m.id),
    });
  }

  /**
   * Fallback: encouraging message
   */
  private generateRandomEncouragement(memories: Memory[]): Surprise {
    const count = memories.length;
    const messages = [
      `You've captured ${count} memories so far. Each one is a piece of your thinking. Keep going!`,
      `Your memory palace is growing. The more you add, the more surprising connections I can find.`,
      `Talk to me about what's on your mind - I'll remember it and surprise you with insights later.`,
    ];

    return this.makeSurprise('idea_spark', {
      title: 'Keep Talking',
      content: messages[Math.floor(Math.random() * messages.length)],
      relatedMemoryIds: [],
    });
  }

  /**
   * Welcome surprise for new users
   */
  private generateWelcomeSurprise(): Surprise {
    return this.makeSurprise('idea_spark', {
      title: 'Welcome to Your Memory Palace',
      content: 'Start by talking to me about anything - an idea, a thought, a dream. I\'ll remember everything and surprise you with connections you never expected.',
      relatedMemoryIds: [],
    });
  }

  /**
   * Helper to construct a Surprise object
   */
  private makeSurprise(
    type: SurpriseType,
    data: { title: string; content: string; relatedMemoryIds: string[] }
  ): Surprise {
    const style = SURPRISE_STYLES[type];
    return {
      id: generateId(),
      type,
      title: data.title,
      content: data.content,
      relatedMemoryIds: data.relatedMemoryIds,
      icon: style.icon,
      gradient: style.gradient,
      createdAt: new Date().toISOString(),
    };
  }
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

export const SurpriseEngine = new SurpriseEngineClass();
