# Vibot Mobile - AI Memory Palace

A voice-first mobile app that captures your thoughts, organizes them spatially in a "Memory Palace," and surprises you with AI-powered insights and connections.

## Features

### 🎤 Voice-First Capture
- Tap-and-hold mic button for instant voice recording
- Automatic transcription with OpenAI Whisper
- Save voice notes as memories with AI-extracted tags

### 🤖 AI Thinking Partner
- Chat with Claude, an AI assistant that remembers your past thoughts
- Get follow-up questions that deepen your thinking
- AI references your memory history to make surprising connections

### 🏛️ Memory Palace
- Organize memories into spatial "rooms" (Work, Ideas, Learning, etc.)
- Visual room cards with gradients, icons, and memory counts
- Long-press rooms to delete

### ✨ Surprise Engine
- **On This Day**: Memories from the same day in past weeks/months
- **Hidden Connections**: AI finds unexpected links between memories
- **Patterns**: Recurring themes in your thinking
- **Idea Sparks**: Creative prompts based on your interests
- **Forgotten Gems**: Old memories resurfaced
- **Nudges**: Reminders for neglected topics
- **Mashups**: Two random ideas combined

### 🔍 Search
- Full-text search across all memories
- Filter by type (voice, text, conversation)
- Tag-based filtering
- Popular tag cloud

## Tech Stack

- **Framework**: React Native + Expo SDK 54
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation (tabs + stack)
- **State**: Context API + useReducer
- **Storage**: AsyncStorage (local), Supabase (ready for cloud sync)
- **AI**: Anthropic Claude API
- **Voice**: expo-av for recording, OpenAI Whisper for transcription
- **UI**: expo-linear-gradient, expo-haptics, @expo/vector-icons

## Setup

1. Clone and install dependencies:
```bash
git clone https://github.com/guyigood/vibot-mobile.git
cd vibot-mobile
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your API keys to `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
```

4. Start the app:
```bash
npx expo start
```

5. Scan the QR code with Expo Go app (iOS/Android)

## Project Structure

```
vibot-mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── MemoryCard.tsx   # Memory display card
│   │   └── SurpriseCard.tsx # Animated surprise card
│   ├── config/              # App configuration
│   │   ├── supabase.ts      # Supabase client
│   │   └── theme.ts         # Design tokens
│   ├── navigation/          # Navigation setup
│   │   └── index.tsx        # Tab + stack navigators
│   ├── screens/             # App screens
│   │   ├── HomeScreen.tsx   # Dashboard
│   │   ├── TalkScreen.tsx   # AI chat
│   │   ├── PalaceScreen.tsx # Memory rooms
│   │   ├── SearchScreen.tsx # Search
│   │   └── SettingsScreen.tsx
│   ├── services/            # Business logic
│   │   ├── ai.ts            # Claude API
│   │   ├── voice.ts         # expo-av recording
│   │   ├── transcription.ts # Whisper API
│   │   └── surprise.ts      # Insight generation
│   ├── store/               # State management
│   │   └── index.tsx        # Context + reducer
│   └── types/               # TypeScript types
│       └── index.ts
├── App.tsx                  # Entry point
├── package.json
└── tsconfig.json
```

## Key Concepts

### Memory
A captured thought (voice note, text note, or conversation excerpt) with:
- Content (transcribed text)
- Tags (AI-extracted)
- Room assignment
- Connections to other memories

### Room
A spatial container in the Memory Palace:
- Name, icon, color
- Contains related memories
- Helps with organization and recall

### Surprise
AI-generated insight surfaced on the home screen:
- Connections between memories
- Patterns in your thinking
- Creative prompts
- Forgotten memories
- Milestones

## API Requirements

### Anthropic Claude (AI Thinking Partner)
- Sign up at https://console.anthropic.com/
- Create an API key
- Add to `.env` as `EXPO_PUBLIC_ANTHROPIC_API_KEY`

### OpenAI (Whisper Transcription)
- Sign up at https://platform.openai.com/
- Create an API key
- Add to `.env` as `EXPO_PUBLIC_OPENAI_API_KEY`

### Supabase (Optional - Cloud Sync)
- Create project at https://supabase.com/
- Get URL and anon key from Settings > API
- Add to `.env`

## Design

### Colors
- **Primary**: Deep Purple (#6C3CE1)
- **Background**: Cosmic Dark (#0A0A1A)
- **Cards**: Dark Purple (#1A1A3E)
- **Text**: White primary, gray secondary

### Typography
- System font (San Francisco on iOS, Roboto on Android)
- Sizes: xs(12) → 5xl(48)
- Weights: regular, medium, semibold, bold

### Room Colors
Cosmic, Nebula, Stellar, Aurora, Sunset, Ember, Twilight, Ocean, Forest, Lavender

## License

MIT

## Credits

Built with [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/).

Powered by [Claude](https://www.anthropic.com/claude) and [OpenAI Whisper](https://openai.com/research/whisper).
