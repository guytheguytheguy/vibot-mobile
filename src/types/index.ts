/**
 * Core type definitions for Vibot Mobile - AI Memory Palace
 *
 * These types define the data structures for:
 * - Memories: Captured thoughts, notes, and conversations
 * - Rooms: Spatial containers in the memory palace
 * - Conversations: AI thinking partner interactions
 * - Connections: Knowledge graph relationships between memories
 */

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Memory - a captured thought/note/conversation
export interface Memory {
  id: string;
  content: string;           // transcribed text or typed note
  summary?: string;          // AI-generated summary
  type: 'voice' | 'text' | 'conversation';
  tags: string[];            // AI-extracted topics
  connections: string[];     // IDs of related memories
  roomId?: string;           // which "room" in the memory palace
  createdAt: string;
  updatedAt: string;
  audioUri?: string;         // local URI to voice recording
  embedding?: number[];      // vector embedding for similarity search
  userId: string;
}

// Room in the Memory Palace - a spatial container for related memories
export interface Room {
  id: string;
  name: string;              // e.g. "Work Ideas", "Personal Goals", "Reading Notes"
  icon: string;              // emoji or icon name
  color: string;             // theme color for the room
  memoryCount: number;
  lastVisited?: string;
  userId: string;
  createdAt: string;
}

// Conversation with the AI thinking partner
export interface Conversation {
  id: string;
  title?: string;
  messages: Message[];
  memoryIds: string[];       // memories referenced/created during conversation
  createdAt: string;
  userId: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isVoice?: boolean;
}

// Connection between memories (knowledge graph edge)
export interface MemoryConnection {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;      // AI-generated description of how they relate
  strength: number;          // 0-1 similarity score
  createdAt: string;
}

// App settings
export interface AppSettings {
  voiceEnabled: boolean;
  autoTranscribe: boolean;
  darkMode: boolean;
  hapticFeedback: boolean;
  aiModel: 'claude' | 'gpt';
  language: string;
}

// User profile
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  settings: AppSettings;
}

// Recording state
export interface RecordingState {
  isRecording: boolean;
  duration: number;
  uri?: string;
}

// Search/Query result
export interface SearchResult {
  memory: Memory;
  score: number;
  highlights: string[];
}

// AI response metadata
export interface AIMetadata {
  model: string;
  tokensUsed: number;
  latencyMs: number;
  suggestedTags?: string[];
  suggestedConnections?: string[];
}
