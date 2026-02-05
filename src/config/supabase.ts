/**
 * Supabase client configuration for Vibot Mobile
 *
 * Uses expo-secure-store for secure token persistence in React Native.
 * Environment variables should be defined in .env file:
 * - EXPO_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 */

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Secure storage adapter for Expo
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      // Fallback to localStorage for web
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      // Fallback to localStorage for web
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      // Fallback to localStorage for web
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️  Supabase configuration missing!\n' +
    'Please create a .env file with:\n' +
    '  EXPO_PUBLIC_SUPABASE_URL=your-project-url\n' +
    '  EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n'
  );
}

// Create Supabase client with secure storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'vibot-mobile',
    },
  },
});

// Type-safe table names
export const TABLES = {
  MEMORIES: 'memories',
  ROOMS: 'rooms',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  MEMORY_CONNECTIONS: 'memory_connections',
  USER_PROFILES: 'user_profiles',
} as const;

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== '' &&
    supabaseAnonKey !== '' &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-anon'));
};

// Helper to get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user?.id || null;
};

// Auth state change listener type
export type AuthChangeCallback = (userId: string | null) => void;

// Subscribe to auth state changes
export const onAuthStateChange = (callback: AuthChangeCallback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user?.id || null);
  });
};
