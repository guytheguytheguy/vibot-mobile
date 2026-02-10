# Development Guide

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Expo CLI** - Installed automatically with the project
- **Expo Go app** - Download on your iOS/Android device
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Optional Tools

- **Xcode** (macOS only) - For iOS simulator
- **Android Studio** - For Android emulator
- **React Native Debugger** - Enhanced debugging experience
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - React Native Tools
  - TypeScript and JavaScript Language Features

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/guyigood/vibot-mobile.git
cd vibot-mobile
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages from `package.json`.

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required: Anthropic API key for Claude
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...

# Required: OpenAI API key for Whisper transcription
EXPO_PUBLIC_OPENAI_API_KEY=sk-...

# Optional: Supabase credentials (for future cloud sync)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

See [API.md](./API.md) for detailed instructions on obtaining API keys.

### 4. Start the Development Server

```bash
npm start
```

This starts the Expo development server. You'll see a QR code in your terminal.

### 5. Run on Device/Simulator

**On Physical Device:**
- Open Expo Go app
- Scan the QR code
- App will load on your device

**On iOS Simulator (macOS only):**
```bash
npm run ios
```

**On Android Emulator:**
```bash
npm run android
```

## Project Scripts

```bash
npm start         # Start Expo development server
npm run android   # Run on Android emulator/device
npm run ios       # Run on iOS simulator/device
npm run web       # Run in web browser (limited functionality)
```

## Development Workflow

### Code Organization

Follow these patterns when adding new code:

#### 1. Components
Place in `src/components/`. Use functional components with hooks.

```typescript
// src/components/MyComponent.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../config/theme';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
  },
});
```

#### 2. Screens
Place in `src/screens/`. Register in navigation.

```typescript
// src/screens/MyScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useApp } from '../store';

export function MyScreen() {
  const { state, dispatch } = useApp();

  return (
    <View>
      <Text>My Screen</Text>
    </View>
  );
}
```

#### 3. Services
Place in `src/services/`. Keep business logic separate from UI.

```typescript
// src/services/myService.ts
class MyServiceClass {
  async doSomething(): Promise<void> {
    // Implementation
  }
}

export const MyService = new MyServiceClass();
```

#### 4. Types
Add to `src/types/index.ts`.

```typescript
export interface MyType {
  id: string;
  name: string;
}
```

### State Management

#### Reading State

Use convenience hooks:

```typescript
import { useMemories, useRooms, useSettings } from '../store';

function MyComponent() {
  const memories = useMemories();
  const rooms = useRooms();
  const settings = useSettings();

  // Use state...
}
```

#### Updating State

Dispatch actions:

```typescript
import { useApp, actions } from '../store';

function MyComponent() {
  const { dispatch } = useApp();

  const handleAddMemory = (memory: Memory) => {
    dispatch(actions.addMemory(memory));
  };

  const handleUpdateSettings = () => {
    dispatch(actions.updateSettings({ darkMode: false }));
  };
}
```

### Styling Best Practices

#### Use Theme Tokens

```typescript
import { colors, spacing, borderRadius } from '../config/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
});
```

#### Avoid Magic Numbers

```typescript
// ❌ Bad
padding: 16,
fontSize: 18,

// ✅ Good
padding: spacing.md,
fontSize: typography.fontSize.lg,
```

#### Use Flexbox

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
```

### TypeScript Guidelines

#### Strict Mode

TypeScript is configured in strict mode. Always type your code:

```typescript
// ✅ Good
function greet(name: string): string {
  return `Hello, ${name}`;
}

// ❌ Bad
function greet(name) {
  return `Hello, ${name}`;
}
```

#### Type Imports

Import types explicitly:

```typescript
import type { Memory, Room } from '../types';
import { useMemories } from '../store';
```

#### Avoid `any`

Use proper types or `unknown`:

```typescript
// ❌ Bad
const data: any = fetchData();

// ✅ Good
interface ApiResponse {
  memories: Memory[];
}
const data: ApiResponse = fetchData();
```

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Coverage report
```

### Writing Tests

Create test files alongside source files:

```
src/
  services/
    ai.ts
    ai.test.ts
```

Example test:

```typescript
import { AIService } from './ai';

describe('AIService', () => {
  it('should analyze memory and extract tags', async () => {
    const result = await AIService.analyzeMemory('Test content');
    expect(result.tags).toBeDefined();
    expect(Array.isArray(result.tags)).toBe(true);
  });
});
```

## Debugging

### React Native Debugger

1. Install [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Open it before running `npm start`
3. Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
4. Select "Debug"

### Console Logs

```typescript
console.log('Debug:', data);
console.warn('Warning:', error);
console.error('Error:', error);
```

### React DevTools

Built into Expo DevTools. Access via browser when running `npm start`.

### Network Debugging

Use Expo's network inspector:
1. Shake device
2. Select "Show Performance Monitor"
3. Enable network requests

### Common Issues

#### Metro Bundler Cache

```bash
npx expo start --clear
```

#### Module Not Found

```bash
rm -rf node_modules package-lock.json
npm install
```

#### iOS Build Issues

```bash
cd ios && pod install && cd ..
```

## Code Quality

### Linting

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

### Formatting

Use Prettier for consistent formatting:

```bash
npm run format      # Format all files
```

### Pre-commit Hooks

Consider setting up Husky for automatic checks:

```bash
npm install -D husky lint-staged
npx husky install
```

## Building for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

### Configuration

Edit `eas.json` for build configurations:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_ANTHROPIC_API_KEY": "production-key"
      }
    }
  }
}
```

## Performance Optimization

### Profiling

Use React DevTools Profiler:
1. Open React DevTools
2. Click "Profiler" tab
3. Click record, interact with app, stop
4. Analyze render times

### Optimization Tips

1. **Memoization**
   ```typescript
   const memoizedValue = useMemo(() => expensiveComputation(), [dep]);
   const memoizedCallback = useCallback(() => handleEvent(), [dep]);
   ```

2. **List Performance**
   ```typescript
   <FlatList
     data={memories}
     renderItem={renderMemory}
     keyExtractor={item => item.id}
     removeClippedSubviews
     maxToRenderPerBatch={10}
   />
   ```

3. **Image Optimization**
   - Use appropriate image sizes
   - Lazy load images
   - Cache images

4. **Bundle Size**
   ```bash
   npx expo-optimize
   ```

## Troubleshooting

### App Won't Load

1. Check Expo Go app is up to date
2. Ensure phone and computer on same network
3. Try restarting Metro bundler

### API Errors

1. Verify API keys in `.env`
2. Check API key permissions
3. Test API keys with curl:
   ```bash
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $EXPO_PUBLIC_ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01"
   ```

### Audio Recording Not Working

1. Check microphone permissions
2. Test on physical device (not simulator)
3. Verify expo-av is installed correctly

## Git Workflow

### Branch Naming

```bash
feature/add-room-colors
fix/voice-recording-crash
refactor/state-management
docs/update-readme
```

### Commit Messages

Follow conventional commits:

```
feat: add room color picker
fix: resolve recording crash on Android
docs: update API documentation
refactor: simplify memory reducer
test: add AI service tests
```

### Pull Requests

1. Create feature branch
2. Make changes
3. Write tests
4. Update documentation
5. Submit PR with description

## Resources

### Documentation
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Community
- [Expo Discord](https://chat.expo.dev/)
- [Reactiflux Discord](https://www.reactiflux.com/)
- [React Native Community](https://github.com/react-native-community)

### Tools
- [Expo Snack](https://snack.expo.dev/) - Online playground
- [React Native Directory](https://reactnative.directory/) - Package directory
- [Can I Use React Native](https://caniusereaсtnative.com/) - Feature compatibility

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Review [API.md](./API.md) for API integration
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) before contributing
