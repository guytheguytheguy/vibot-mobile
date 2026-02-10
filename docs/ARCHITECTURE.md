# Architecture Documentation

## Overview

Vibot Mobile is a voice-first AI Memory Palace app built with React Native and Expo. The app follows a modular architecture with clear separation of concerns between UI components, state management, business logic, and external services.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    UI Layer                         │
│  (Screens, Components, Navigation)                  │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│              State Management                       │
│      (React Context + useReducer)                   │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│            Services Layer                           │
│  (AI, Voice, Transcription, Surprise)               │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│         External Services & Storage                 │
│  (AsyncStorage, Anthropic API, OpenAI API)          │
└─────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── MemoryCard.tsx   # Display individual memories
│   └── SurpriseCard.tsx # Animated surprise/insight cards
│
├── config/              # Configuration and setup
│   ├── supabase.ts      # Supabase client initialization
│   └── theme.ts         # Design system tokens
│
├── navigation/          # React Navigation setup
│   └── index.tsx        # Tab + stack navigator configuration
│
├── screens/             # Full-screen views
│   ├── HomeScreen.tsx   # Dashboard with surprises
│   ├── TalkScreen.tsx   # AI chat interface
│   ├── PalaceScreen.tsx # Memory rooms organization
│   ├── SearchScreen.tsx # Search and filter memories
│   └── SettingsScreen.tsx # App settings
│
├── services/            # Business logic and external APIs
│   ├── ai.ts            # Anthropic Claude API integration
│   ├── voice.ts         # expo-av recording logic
│   ├── transcription.ts # OpenAI Whisper API
│   └── surprise.ts      # AI insight generation
│
├── store/               # Global state management
│   └── index.tsx        # Context provider, reducer, actions
│
└── types/               # TypeScript type definitions
    └── index.ts         # Core data models
```

## Core Data Models

### Memory
Represents a captured thought, voice note, or conversation excerpt.

```typescript
interface Memory {
  id: string;
  content: string;           // Transcribed text or typed note
  summary?: string;          // AI-generated summary
  type: 'voice' | 'text' | 'conversation';
  tags: string[];            // AI-extracted topics
  connections: string[];     // IDs of related memories
  roomId?: string;           // Assignment to a room
  createdAt: string;
  updatedAt: string;
  audioUri?: string;         // Local file path to recording
  embedding?: number[];      // Vector for similarity search
  userId: string;
}
```

### Room
A spatial container in the Memory Palace for organizing related memories.

```typescript
interface Room {
  id: string;
  name: string;              // e.g., "Work Ideas", "Learning"
  icon: string;              // Emoji or icon name
  color: string;             // Theme color
  memoryCount: number;
  lastVisited?: string;
  userId: string;
  createdAt: string;
}
```

### Conversation
An AI chat session with message history.

```typescript
interface Conversation {
  id: string;
  title?: string;
  messages: Message[];
  memoryIds: string[];       // Memories created/referenced
  createdAt: string;
  userId: string;
}
```

## State Management

### Architecture Choice
Uses **React Context + useReducer** for predictable, centralized state management. This approach provides:
- Single source of truth
- Predictable state updates via actions
- Type-safe with TypeScript
- No external dependencies
- Good performance for this app size

For larger apps, consider migrating to Zustand or Redux Toolkit.

### State Shape

```typescript
interface AppState {
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
```

### Action Pattern

All state changes go through typed actions:

```typescript
dispatch({ type: 'ADD_MEMORY', payload: newMemory });
dispatch({ type: 'UPDATE_SETTINGS', payload: { darkMode: true } });
```

### Persistence

State is persisted to AsyncStorage automatically:
- Settings saved on every change
- Memories, rooms, and conversations saved on change
- Data loaded on app startup

Storage keys:
- `@vibot:settings`
- `@vibot:memories`
- `@vibot:rooms`
- `@vibot:conversations`

## Services Layer

### AI Service (`src/services/ai.ts`)

Handles all Claude API interactions:
- `chat()` - Send messages and get responses
- `analyzeMemory()` - Extract tags, summary, and room suggestions
- `findConnections()` - Discover relationships between memories
- `getThinkingPartnerPrompt()` - Generate context-aware system prompts

**Configuration:**
- Model: `claude-sonnet-4-5-20250929`
- Max tokens: 1024
- API key from `EXPO_PUBLIC_ANTHROPIC_API_KEY`

### Voice Service (`src/services/voice.ts`)

Manages audio recording with expo-av:
- Request microphone permissions
- Start/stop recording
- Save audio files to local filesystem
- Manage recording state

### Transcription Service (`src/services/transcription.ts`)

Converts audio to text using OpenAI Whisper:
- Upload audio file to Whisper API
- Return transcribed text
- API key from `EXPO_PUBLIC_OPENAI_API_KEY`

### Surprise Service (`src/services/surprise.ts`)

Generates AI-powered insights:
- On This Day memories
- Hidden connections between memories
- Pattern detection
- Idea sparks and creative prompts
- Forgotten gems resurface
- Nudges for neglected topics

## Navigation Structure

```
AppNavigator (Tab Navigator)
├── Home (Stack)
│   └── HomeScreen
├── Talk (Stack)
│   └── TalkScreen
├── Palace (Stack)
│   ├── PalaceScreen
│   └── RoomDetailScreen (future)
├── Search (Stack)
│   └── SearchScreen
└── Settings (Stack)
    └── SettingsScreen
```

Each tab has its own stack navigator for future sub-screens.

## Design System

### Theme Tokens
All visual design tokens are centralized in `src/config/theme.ts`:
- Colors (primary, accent, semantic, room colors)
- Typography (sizes, weights, families)
- Spacing (xs to 3xl scale)
- Border radius
- Shadows
- Animation durations
- Layout constants
- Icon sizes

### Color Palette
- **Primary:** Deep purple (#6C3CE1) - brand color
- **Background:** Cosmic dark (#0A0A1A) - main background
- **Cards:** Dark purple (#1A1A3E) - elevated surfaces
- **Room Colors:** 10 gradient-friendly colors for rooms

### Typography
- System fonts (SF Pro on iOS, Roboto on Android)
- Scale: xs(12) → 5xl(48)
- Weights: regular, medium, semibold, bold

## Key Technical Decisions

### Why React Native + Expo?
- Cross-platform (iOS/Android) from single codebase
- Rich ecosystem of native modules (audio, file system, haptics)
- Fast iteration with hot reload
- OTA updates via Expo Application Services

### Why Context + useReducer?
- Simple, built-in React solution
- No external state library needed
- Type-safe with TypeScript
- Good performance for app scale
- Easy to debug with Redux DevTools if needed

### Why AsyncStorage?
- Simple key-value persistence
- Sufficient for local-first architecture
- Can migrate to Supabase for cloud sync later
- No complex setup required

### Why Claude API?
- Best-in-class for conversational AI
- Excellent at making connections and insights
- Large context window for memory history
- Strong instruction following for JSON responses

### Why OpenAI Whisper?
- State-of-the-art transcription accuracy
- Supports multiple languages
- Good performance on voice notes
- Simple API integration

## Performance Considerations

### Memory Management
- Limit AI context to most recent 8-20 memories
- Lazy load old memories from storage
- Clean up audio files periodically

### State Updates
- Use `useCallback` for event handlers
- Memoize expensive computations
- Batch related state updates in reducer

### API Calls
- Debounce search queries
- Cancel in-flight requests on navigation
- Cache AI responses when appropriate
- Show loading states for long operations

## Future Architecture Considerations

### Scaling State Management
If the app grows significantly, consider:
- Zustand for simpler API
- Redux Toolkit for complex workflows
- Jotai for atomic state management

### Cloud Sync
Supabase integration is ready but not active:
- Real-time sync across devices
- Backup and restore
- Collaborative rooms (future feature)

### Vector Search
For advanced memory connections:
- Generate embeddings for each memory
- Store in vector database (Pinecone, Supabase pgvector)
- Semantic similarity search

### Offline-First
Current implementation:
- All data in AsyncStorage
- Works fully offline
- Future: sync when online

## Testing Strategy

### Unit Tests
- Services layer (AI, voice, transcription)
- Reducers and action creators
- Utility functions

### Integration Tests
- API integrations
- State persistence
- Navigation flows

### E2E Tests
- Voice recording flow
- AI chat flow
- Memory creation and organization

## Security Considerations

### API Keys
- Never commit `.env` file
- Use environment variables
- Validate keys on startup

### User Data
- All data stored locally
- No telemetry or tracking
- Audio files stored in app sandbox

### Future Enhancements
- End-to-end encryption for cloud sync
- Biometric authentication
- Secure key storage with expo-secure-store

## Related Documentation

- [Development Guide](./DEVELOPMENT.md)
- [API Integration](./API.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
