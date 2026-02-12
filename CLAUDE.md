# Vibot Mobile - AI Memory Palace App

## Overview
Voice-first mobile app (React Native + Expo) that functions as an "AI Memory Palace" - a digital thinking partner. Captures thoughts via voice, organizes them spatially in themed rooms, and generates AI-powered insights and connections between memories. Features voice recording with Whisper transcription and Claude as the AI thinking partner.

## Tech Stack
- **Framework**: React Native 0.81, Expo SDK 54, TypeScript (strict)
- **Navigation**: React Navigation (bottom tabs + native stack)
- **State**: Context API + useReducer (persisted to AsyncStorage)
- **Cloud**: Supabase (optional, ready for sync)
- **Voice**: expo-av (recording)
- **Transcription**: OpenAI Whisper API
- **AI**: Anthropic Claude API (claude-sonnet-4-5-20250929)
- **Storage**: AsyncStorage (local), expo-secure-store (tokens)
- **UI**: expo-linear-gradient, expo-haptics, @expo/vector-icons

## Key Directories
- `src/screens/` - HomeScreen, PalaceScreen, TalkScreen, SearchScreen, SettingsScreen
- `src/services/` - ai.ts (Claude), voice.ts (recording), transcription.ts (Whisper), surprise.ts (insights)
- `src/store/` - Global Context + Reducer + AsyncStorage persistence
- `src/components/` - MemoryCard, SurpriseCard
- `src/config/` - supabase.ts, theme.ts (design tokens)
- `src/navigation/` - Tab navigator + stack config
- `src/types/` - Memory, Room, Conversation, Message types

## Commands
```bash
npm start            # Expo dev server (QR code for Expo Go)
npm run android      # EAS build + run on Android
npm run ios          # EAS build + run on iOS
npm run web          # Web development server
```

## Important Patterns
- Dark mode only app (userInterfaceStyle: "dark")
- State persisted to AsyncStorage keys: `@vibot:settings`, `@vibot:rooms`, `@vibot:memories`, `@vibot:conversations`
- Platform-aware secure storage (expo-secure-store on mobile, localStorage on web)
- Supabase tables: memories, rooms, conversations, messages, memory_connections, user_profiles
- 10 predefined room color palette (cosmic, nebula, stellar, aurora, sunset, etc.)
- AI analyzes memories to extract tags, summaries, and suggest rooms
- Connection finding uses AI to discover related memories

## Environment Variables
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- OpenAI API key (for Whisper transcription)
- Anthropic API key (for Claude AI partner)
