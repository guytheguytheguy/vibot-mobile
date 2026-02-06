/**
 * Global state management for Vibot Mobile
 *
 * Uses React Context + useReducer for simple, performant state management.
 * For a production app, consider Zustand or Redux Toolkit for more complex needs.
 */

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Memory,
  Room,
  Conversation,
  Message,
  AppSettings,
  RecordingState,
} from '../types';

// State shape
export interface AppState {
  memories: Memory[];
  rooms: Room[];
  conversations: Conversation[];
  currentConversation: Conversation | null;
  recordingState: RecordingState;
  settings: AppSettings;
  userId: string | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AppState = {
  memories: [],
  rooms: [],
  conversations: [],
  currentConversation: null,
  recordingState: {
    isRecording: false,
    duration: 0,
  },
  settings: {
    voiceEnabled: true,
    autoTranscribe: true,
    darkMode: true,
    hapticFeedback: true,
    aiModel: 'claude',
    language: 'en',
  },
  userId: null,
  isLoading: false,
  error: null,
};

// Action types
export type AppAction =
  | { type: 'SET_USER_ID'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_MEMORY'; payload: Memory }
  | { type: 'UPDATE_MEMORY'; payload: { id: string; updates: Partial<Memory> } }
  | { type: 'DELETE_MEMORY'; payload: string }
  | { type: 'SET_MEMORIES'; payload: Memory[] }
  | { type: 'ADD_ROOM'; payload: Room }
  | { type: 'UPDATE_ROOM'; payload: { id: string; updates: Partial<Room> } }
  | { type: 'DELETE_ROOM'; payload: string }
  | { type: 'SET_ROOMS'; payload: Room[] }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: Conversation | null }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'UPDATE_RECORDING_STATE'; payload: Partial<RecordingState> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'RESET_STATE' };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER_ID':
      return { ...state, userId: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'ADD_MEMORY': {
      const newMemory = action.payload;
      return {
        ...state,
        memories: [newMemory, ...state.memories],
        rooms: newMemory.roomId
          ? state.rooms.map((room) =>
              room.id === newMemory.roomId
                ? { ...room, memoryCount: room.memoryCount + 1 }
                : room
            )
          : state.rooms,
      };
    }

    case 'UPDATE_MEMORY':
      return {
        ...state,
        memories: state.memories.map((memory) =>
          memory.id === action.payload.id
            ? { ...memory, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : memory
        ),
      };

    case 'DELETE_MEMORY': {
      const deleted = state.memories.find((m) => m.id === action.payload);
      return {
        ...state,
        memories: state.memories.filter((memory) => memory.id !== action.payload),
        rooms: deleted?.roomId
          ? state.rooms.map((room) =>
              room.id === deleted.roomId
                ? { ...room, memoryCount: Math.max(0, room.memoryCount - 1) }
                : room
            )
          : state.rooms,
      };
    }

    case 'SET_MEMORIES':
      return { ...state, memories: action.payload };

    case 'ADD_ROOM':
      return {
        ...state,
        rooms: [...state.rooms, action.payload],
      };

    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map((room) =>
          room.id === action.payload.id
            ? { ...room, ...action.payload.updates }
            : room
        ),
      };

    case 'DELETE_ROOM':
      return {
        ...state,
        rooms: state.rooms.filter((room) => room.id !== action.payload),
      };

    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };

    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };

    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };

    case 'SET_CURRENT_CONVERSATION':
      return { ...state, currentConversation: action.payload };

    case 'ADD_MESSAGE': {
      const { conversationId, message } = action.payload;
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? { ...conv, messages: [...conv.messages, message] }
            : conv
        ),
        currentConversation:
          state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: [...state.currentConversation.messages, message],
              }
            : state.currentConversation,
      };
    }

    case 'SET_RECORDING':
      return {
        ...state,
        recordingState: {
          ...state.recordingState,
          isRecording: action.payload,
        },
      };

    case 'UPDATE_RECORDING_STATE':
      return {
        ...state,
        recordingState: {
          ...state.recordingState,
          ...action.payload,
        },
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: '@vibot:settings',
  ROOMS: '@vibot:rooms',
  MEMORIES: '@vibot:memories',
  CONVERSATIONS: '@vibot:conversations',
} as const;

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted settings on mount
  useEffect(() => {
    loadPersistedData();
  }, []);

  // Persist settings when they change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
  }, [state.settings]);

  // Persist rooms when they change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(state.rooms));
  }, [state.rooms]);

  // Persist memories when they change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(state.memories));
  }, [state.memories]);

  // Persist conversations when they change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(state.conversations));
  }, [state.conversations]);

  async function loadPersistedData() {
    try {
      const [settingsJson, roomsJson, memoriesJson, conversationsJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.ROOMS),
        AsyncStorage.getItem(STORAGE_KEYS.MEMORIES),
        AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS),
      ]);

      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      }

      if (roomsJson) {
        const rooms = JSON.parse(roomsJson);
        dispatch({ type: 'SET_ROOMS', payload: rooms });
      }

      if (memoriesJson) {
        const memories = JSON.parse(memoriesJson);
        dispatch({ type: 'SET_MEMORIES', payload: memories });
      }

      if (conversationsJson) {
        const conversations = JSON.parse(conversationsJson);
        dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
      }
    } catch (error) {
      console.error('Error loading persisted data:', error);
    }
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the app context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks for specific state slices
export function useMemories() {
  const { state } = useApp();
  return state.memories;
}

export function useRooms() {
  const { state } = useApp();
  return state.rooms;
}

export function useConversations() {
  const { state } = useApp();
  return state.conversations;
}

export function useCurrentConversation() {
  const { state } = useApp();
  return state.currentConversation;
}

export function useRecordingState() {
  const { state } = useApp();
  return state.recordingState;
}

export function useSettings() {
  const { state } = useApp();
  return state.settings;
}

export function useUserId() {
  const { state } = useApp();
  return state.userId;
}

// Action creators for common operations
export const actions = {
  setUserId: (userId: string | null): AppAction => ({
    type: 'SET_USER_ID',
    payload: userId,
  }),

  addMemory: (memory: Memory): AppAction => ({
    type: 'ADD_MEMORY',
    payload: memory,
  }),

  updateMemory: (id: string, updates: Partial<Memory>): AppAction => ({
    type: 'UPDATE_MEMORY',
    payload: { id, updates },
  }),

  deleteMemory: (id: string): AppAction => ({
    type: 'DELETE_MEMORY',
    payload: id,
  }),

  addRoom: (room: Room): AppAction => ({
    type: 'ADD_ROOM',
    payload: room,
  }),

  updateRoom: (id: string, updates: Partial<Room>): AppAction => ({
    type: 'UPDATE_ROOM',
    payload: { id, updates },
  }),

  deleteRoom: (id: string): AppAction => ({
    type: 'DELETE_ROOM',
    payload: id,
  }),

  addConversation: (conversation: Conversation): AppAction => ({
    type: 'ADD_CONVERSATION',
    payload: conversation,
  }),

  setCurrentConversation: (conversation: Conversation | null): AppAction => ({
    type: 'SET_CURRENT_CONVERSATION',
    payload: conversation,
  }),

  addMessage: (conversationId: string, message: Message): AppAction => ({
    type: 'ADD_MESSAGE',
    payload: { conversationId, message },
  }),

  setRecording: (isRecording: boolean): AppAction => ({
    type: 'SET_RECORDING',
    payload: isRecording,
  }),

  updateRecordingState: (state: Partial<RecordingState>): AppAction => ({
    type: 'UPDATE_RECORDING_STATE',
    payload: state,
  }),

  updateSettings: (settings: Partial<AppSettings>): AppAction => ({
    type: 'UPDATE_SETTINGS',
    payload: settings,
  }),

  resetState: (): AppAction => ({
    type: 'RESET_STATE',
  }),
};
