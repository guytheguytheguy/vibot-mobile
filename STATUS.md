# Vibot Mobile - Status & Strategy

> Last updated: 2026-02-10

## Overview

Vibot Mobile is a voice-first AI memory management application built with React Native and Expo. It acts as a personal thinking partner that captures thoughts through voice or text, organizes them spatially in a "Memory Palace" with themed rooms, and surfaces hidden connections through an AI-powered Surprise Engine. Users can chat with Claude AI, which remembers past thoughts and makes creative connections between ideas.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native | 0.81.5 |
| Development | Expo SDK | 54 |
| Language | TypeScript | 5.9.2 (strict mode) |
| UI Library | React | 19.1.0 |
| Navigation | React Navigation 7 | bottom tabs + native stack |
| Gradients | expo-linear-gradient | latest |
| Icons | @expo/vector-icons (Ionicons) | latest |
| Haptics | expo-haptics | latest |
| State | Context API + useReducer | built-in |
| Local Storage | AsyncStorage | latest |
| AI Chat | Anthropic Claude Sonnet 4.5 | via REST API |
| Voice-to-Text | OpenAI Whisper API | via REST API |
| Audio Recording | expo-av | M4A, 44.1kHz, mono, 128kbps |
| Cloud Backend | Supabase | configured but unused |
| Secure Storage | expo-secure-store | latest |
| Dates | date-fns | 4.1 |
| IDs | uuid | 13.0 |
| File System | expo-file-system | latest |
| Build | EAS Build | cloud APK/AAB |

## Current Status

**Overall: Production-Ready Core, Local-Only, Cloud Features Unused**

### Fully Working

- **Voice Recording** -- Tap-and-hold mic with real-time duration display, M4A format (44.1kHz, mono, 128kbps), proper iOS/Android permission handling, file management via expo-file-system
- **Transcription** -- OpenAI Whisper API integration with retry logic (3 attempts, exponential backoff), platform-aware FormData handling (Blob for web, URI for native), smart error classification (client errors skip retry, server errors retry)
- **AI Chat (TalkScreen, 555 lines)** -- Text and voice input, real-time conversation with Claude, AI references past memories during conversation, animated recording indicator with pulsing effect, auto-saves user messages as memories
- **Memory Management** -- Full CRUD (add, update, delete), auto-tagging via AI analysis, three memory types (voice, text, conversation), AI-generated summaries, connection tracking between memories, persistent AsyncStorage
- **Home Dashboard** -- Time-based greeting, statistics overview (memory count, room count, connections), pull-to-refresh with surprise regeneration, quick capture navigation
- **Surprise Engine (8 types)** -- On This Day (same calendar day in past), Forgotten Gems (resurfaced old memories), Patterns (recurring tag analysis), Nudges (neglected room reminders, >7 days), Mashups (random memory combinations), Questions (thought-provoking prompts), AI Connection (hidden relationships, requires API key), AI Idea Spark (creative prompts from recent interests, requires API key); always returns at least one surprise via fallback
- **Memory Palace (PalaceScreen, 522 lines)** -- Room creation with custom names, emojis, and colors; 10 predefined color gradients (cosmic, nebula, stellar, aurora, sunset, ember, twilight, ocean, forest, lavender); room deletion with memory preservation; memory count per room
- **Search (SearchScreen, 286 lines)** -- Full-text search across content and summaries, tag-based filtering, memory type filtering, tag cloud with frequency ranking, memoized live filtering
- **Settings (SettingsScreen, 355 lines)** -- Voice recording toggle, auto-transcription toggle, haptic feedback toggle, dark mode toggle, AI model selection (claude/gpt), language selection, service status display, clear all data with confirmation
- **Design System (theme.ts)** -- Primary deep purple (#6C3CE1), cosmic dark background (#0A0A1A), 10 room color gradients, typography scale (12px-48px), spacing/shadow/border tokens, animation durations (fast 150ms, normal 250ms, slow 400ms)
- **State Management (store/index.tsx)** -- 15 action types with type-safe creators, convenience hooks (useMemories, useRooms, useConversations, etc.), automatic AsyncStorage persistence, atomic updates

### Implemented But Underutilized

- **Supabase Integration** -- Client configured with secure storage adapter, auth state listener implemented, type-safe table names defined, but not actively used for cloud sync (all data is local-only)
- **Memory Connections** -- Data structure supports connections, `AIService.findConnections()` implemented, but connections are not visualized in the UI
- **Memory Embeddings** -- Type definition includes `embedding?: number[]` field, but vector similarity search is not implemented
- **Conversation History** -- Full persistence implemented with message history, but not deeply integrated into UI navigation

### Not Implemented

- Voice playback (audio files saved but no playback UI)
- Authentication (single-user local app, userId defaults to "local")
- Cloud sync and backup (no multi-device support)
- User-visible error messages (errors logged to console only)
- Onboarding flow (first-time users see empty home screen)
- Memory connection visualization
- Vector/semantic search via embeddings

## Architecture

### Directory Structure

```
C:\dev\vibot-mobile\
  src/
    components/
      MemoryCard.tsx          # Memory display with type icon, timestamp, tags, preview
      SurpriseCard.tsx         # Animated gradient card with staggered timing, haptics
    config/
      supabase.ts             # Supabase client + secure storage adapter (unused)
      theme.ts                # Complete design system tokens
    hooks/                    # Empty (no custom hooks yet)
    navigation/
      index.tsx               # Tab + stack navigators (5 screens)
    screens/                  # 5 screens, 1,718 total lines
      HomeScreen.tsx           # Dashboard with surprises (~100 lines)
      TalkScreen.tsx           # AI chat + voice recording (555 lines)
      PalaceScreen.tsx         # Memory rooms (522 lines)
      SearchScreen.tsx         # Search + filtering (286 lines)
      SettingsScreen.tsx       # Settings (355 lines)
    services/                 # 4 business logic services
      ai.ts                   # Claude API: chat, analyze, findConnections
      voice.ts                # expo-av: record, stop, cancel, getDuration
      transcription.ts        # Whisper API: transcribe with retries
      surprise.ts             # 8 insight generators
    store/
      index.tsx               # Context + reducer + 10+ convenience hooks
    types/
      index.ts                # Memory, Room, Conversation, Message interfaces
    utils/                    # Empty
  App.tsx                     # Root component (provider wrapper)
  index.ts                    # Expo entry point
  app.json                    # Expo configuration
  eas.json                    # EAS build profiles (dev, preview, prod)
  tsconfig.json               # TypeScript strict mode
  package.json                # 27 dependencies
  vibot-v1.0.0.apk            # Pre-built APK artifact (14 MB)
```

### Core Data Flows

**Voice Note to Memory:**
1. User taps mic on TalkScreen
2. VoiceService.startRecording() -> expo-av audio capture (M4A)
3. User releases -> VoiceService.stopRecording() -> {uri, duration, size}
4. TranscriptionService.transcribe(audioUri) -> OpenAI Whisper -> text
5. AIService.analyzeMemory(text) -> {tags, summary, suggestedRoom}
6. Create Memory object -> dispatch(addMemory) -> reducer -> AsyncStorage

**Surprise Generation:**
1. HomeScreen mounts or user pulls-to-refresh
2. SurpriseEngine.generateSurprises(memories, rooms, count)
3. Shuffles 6 rule-based + 2 AI generators
4. Each returns Surprise or null
5. Animated SurpriseCard components rendered with staggered timing

**AI Chat:**
1. User types or speaks message on TalkScreen
2. dispatch(addMessage) to current conversation
3. AIService.chat() with system prompt + recent memories as context
4. Claude response added to conversation
5. Both user and assistant messages saved as memories

### State Shape

```
memories: Memory[]              -- All captured thoughts
rooms: Room[]                   -- Memory Palace rooms
conversations: Conversation[]   -- Chat history
currentConversation: Conversation | null
recordingState: { isRecording, duration }
settings: { voiceEnabled, autoTranscribe, darkMode, hapticFeedback, aiModel, language }
userId: string | null           -- Defaults to "local"
isLoading: boolean
error: string | null
```

## Features

- Voice recording with tap-and-hold gesture, real-time duration, M4A format
- OpenAI Whisper transcription with exponential backoff retry (3 attempts)
- Claude AI chat with memory-aware context (references past thoughts)
- Full memory CRUD with auto-tagging and AI-generated summaries
- Memory Palace spatial organization with 10 themed room color gradients
- Surprise Engine with 8 insight types (on this day, forgotten gems, patterns, nudges, mashups, questions, AI connections, AI idea sparks)
- Full-text and tag-based search with live filtering
- Settings with voice, transcription, haptic, dark mode, model, and language toggles
- 5-tab bottom navigation (Home, Talk, Palace, Search, Settings)
- Cosmic dark design system with deep purple accent
- Pre-built Android APK (14 MB)

## Known Issues

| Issue | Severity | Detail |
|-------|----------|--------|
| No `.env` file in repo | High | App requires `EXPO_PUBLIC_ANTHROPIC_API_KEY` and `EXPO_PUBLIC_OPENAI_API_KEY`; silent failures if missing |
| No authentication | Medium | Single-user local app; userId hardcoded to "local" |
| No cloud sync | Medium | All data in AsyncStorage only; no backup or multi-device support |
| No user-visible errors | Medium | API errors logged to console but not shown to users |
| No voice playback | Medium | Audio files saved but no playback UI despite expo-av support |
| No onboarding | Low | First-time users see empty home with only a welcome surprise |
| Memory connections not visualized | Low | findConnections() works but results are not rendered in the UI |
| Empty hooks/ and utils/ dirs | Low | Placeholder directories with no content |
| Supabase configured but unused | Low | Cloud backend ready but not wired into data flow |

## Strategy & Next Steps

### Immediate (P0 -- Core Polish)

1. Add user-visible error messages and toast notifications for API failures
2. Implement voice playback UI for recorded audio memories
3. Create onboarding flow with guided room creation and first memory capture
4. Add `.env.example` documenting all required and optional API keys

### Short-Term (P1 -- Cloud Readiness)

5. Implement Supabase authentication (magic link or OAuth)
6. Wire AsyncStorage data to Supabase for cloud sync and backup
7. Add offline-first sync strategy (local writes, background upload)
8. Implement multi-device support via user accounts

### Medium-Term (P2 -- Discovery Features)

9. Build memory connection visualization (graph or map view)
10. Implement vector embeddings for semantic search
11. Add memory timeline view with chronological browsing
12. Expand Surprise Engine with more AI-powered insight types
13. Add memory export (JSON, Markdown, PDF)

### Long-Term (P3 -- Platform Growth)

14. iOS App Store and Google Play Store submissions
15. Add sharing and collaboration (shared rooms, shared memories)
16. Implement subscription model for premium AI features
17. Build web companion app for desktop access
18. Add integrations (calendar, notes apps, voice assistants)
