# API Integration Guide

## Overview

Vibot Mobile integrates with three external APIs:
1. **Anthropic Claude API** - AI thinking partner and memory analysis
2. **OpenAI API** - Whisper speech-to-text transcription
3. **Supabase** (Optional) - Cloud sync and authentication

This guide covers setup, usage, costs, and best practices for each API.

## Anthropic Claude API

### Purpose
Powers the AI thinking partner feature, memory analysis, tag extraction, and connection discovery.

### Getting Started

1. **Sign Up**
   - Visit [console.anthropic.com](https://console.anthropic.com/)
   - Create an account
   - Verify your email

2. **Get API Key**
   - Navigate to "API Keys" in the console
   - Click "Create Key"
   - Copy the key (starts with `sk-ant-`)
   - Add to your `.env` file:
     ```env
     EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-...
     ```

3. **Add Credits**
   - Go to "Billing" section
   - Add payment method
   - Purchase credits or set up auto-reload

### Usage in Vibot

The app uses Claude for several features:

#### 1. AI Chat (Thinking Partner)

```typescript
import { AIService } from '../services/ai';

const response = await AIService.chat(
  messages,
  AIService.getThinkingPartnerPrompt(recentMemories)
);
```

**Model:** `claude-sonnet-4-5-20250929`
- High quality responses
- Large context window (200K tokens)
- Good balance of speed and capability

**System Prompt:** Configured to:
- Ask thoughtful follow-up questions
- Reference past memories
- Make surprising connections
- Keep responses concise (2-4 sentences)

#### 2. Memory Analysis

```typescript
const analysis = await AIService.analyzeMemory(transcribedText);
// Returns: { tags: string[], summary: string, suggestedRoom: string }
```

Extracts:
- 3-5 relevant topic tags
- 1-2 sentence summary
- Suggested room category

#### 3. Connection Discovery

```typescript
const connections = await AIService.findConnections(
  newMemoryContent,
  existingMemories
);
// Returns: [{ memoryId: string, relationship: string, strength: number }]
```

Identifies:
- Related memories (strength > 0.3)
- How they relate (relationship description)
- Connection strength (0-1 score)
- Maximum 5 connections

### API Limits & Costs

**Rate Limits (as of 2024):**
- Free tier: Limited requests per day
- Paid tier: Higher limits based on plan

**Pricing:**
- Input tokens: $3 per million tokens
- Output tokens: $15 per million tokens
- Claude Sonnet 4.5 pricing may vary

**Estimated Usage:**
- Memory analysis: ~500 tokens per memory
- Chat message: ~1000 tokens per exchange
- Connection discovery: ~2000 tokens per analysis

**Cost Optimization:**
- Limit memory context to 8-20 most recent items
- Cache system prompts where possible
- Use streaming for long responses
- Debounce chat inputs

### Error Handling

```typescript
try {
  const response = await AIService.chat(messages);
} catch (error) {
  if (error.message.includes('401')) {
    // Invalid API key
  } else if (error.message.includes('429')) {
    // Rate limit exceeded
  } else if (error.message.includes('500')) {
    // API server error
  }
}
```

### Best Practices

1. **API Key Security**
   - Never commit `.env` to git
   - Use environment variables
   - Rotate keys periodically

2. **Request Optimization**
   - Batch related operations
   - Cache responses when appropriate
   - Use abort controllers for cancellation

3. **Error Recovery**
   - Implement retry logic with exponential backoff
   - Provide fallback responses
   - Show user-friendly error messages

## OpenAI API (Whisper)

### Purpose
Converts voice recordings to text using the Whisper speech-to-text model.

### Getting Started

1. **Sign Up**
   - Visit [platform.openai.com](https://platform.openai.com/)
   - Create an account
   - Verify your email

2. **Get API Key**
   - Go to [API Keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)
   - Add to `.env`:
     ```env
     EXPO_PUBLIC_OPENAI_API_KEY=sk-...
     ```

3. **Add Payment Method**
   - Navigate to "Billing"
   - Add payment method
   - Set spending limits

### Usage in Vibot

#### Audio Transcription

```typescript
import { transcribeAudio } from '../services/transcription';

const text = await transcribeAudio(audioUri);
```

**Model:** `whisper-1`
- Supports 50+ languages
- Automatic language detection
- High accuracy
- Fast processing

**Supported Formats:**
- m4a (used by Vibot)
- mp3, mp4, mpeg, mpga, wav, webm

**File Size Limit:** 25 MB

### API Limits & Costs

**Rate Limits:**
- Free tier: Limited requests
- Pay-as-you-go: 50 requests per minute

**Pricing:**
- $0.006 per minute of audio
- Typical voice note (30 seconds): $0.003

**Estimated Monthly Cost:**
- 100 voice notes/month: ~$0.30
- 500 voice notes/month: ~$1.50
- 1000 voice notes/month: ~$3.00

### Error Handling

```typescript
try {
  const text = await transcribeAudio(audioUri);
} catch (error) {
  if (error.message.includes('file size')) {
    // File too large (>25MB)
  } else if (error.message.includes('format')) {
    // Unsupported format
  } else if (error.message.includes('401')) {
    // Invalid API key
  }
}
```

### Best Practices

1. **Audio Quality**
   - Record at reasonable bitrate (64-128 kbps)
   - Reduce background noise
   - Keep recordings under 2 minutes for faster processing

2. **Error Handling**
   - Provide retry option
   - Save recordings even if transcription fails
   - Allow manual transcription edit

3. **Optimization**
   - Compress audio before upload
   - Use m4a format (smaller than wav)
   - Cache transcriptions

## Supabase (Optional)

### Purpose
Future feature for cloud sync, authentication, and collaborative rooms.

### Getting Started

1. **Create Project**
   - Visit [supabase.com](https://supabase.com/)
   - Sign up and create new project
   - Choose region closest to users

2. **Get Credentials**
   - Go to Settings > API
   - Copy "Project URL"
   - Copy "anon/public" key
   - Add to `.env`:
     ```env
     EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
     ```

### Current Status

Supabase integration is **prepared but not active**. The client is configured in `src/config/supabase.ts` but not used.

### Future Features

When cloud sync is implemented:

**Database Schema:**
```sql
-- Users table
create table users (
  id uuid primary key,
  email text unique,
  display_name text,
  created_at timestamp default now()
);

-- Memories table
create table memories (
  id uuid primary key,
  user_id uuid references users(id),
  content text,
  summary text,
  type text,
  tags text[],
  room_id uuid,
  created_at timestamp,
  updated_at timestamp
);

-- Rooms table
create table rooms (
  id uuid primary key,
  user_id uuid references users(id),
  name text,
  icon text,
  color text,
  memory_count int,
  created_at timestamp
);
```

**Real-time Sync:**
```typescript
supabase
  .channel('memories')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'memories' },
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe();
```

### Pricing

**Free Tier:**
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

Sufficient for development and small-scale deployment.

## API Configuration Check

Verify your API keys are configured correctly:

```typescript
import { AIService } from './services/ai';

// Check if APIs are configured
console.log('Claude configured:', AIService.isConfigured());

// Test the APIs
async function testAPIs() {
  try {
    // Test Claude
    const analysis = await AIService.analyzeMemory('Test memory');
    console.log('Claude working:', analysis);

    // Test Whisper
    const text = await transcribeAudio(testAudioUri);
    console.log('Whisper working:', text);
  } catch (error) {
    console.error('API test failed:', error);
  }
}
```

## Environment Variables

Complete `.env` file template:

```env
# Required: Anthropic Claude API
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-...

# Required: OpenAI Whisper API
EXPO_PUBLIC_OPENAI_API_KEY=sk-...

# Optional: Supabase (for future cloud sync)
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Optional: Environment flag
EXPO_PUBLIC_ENV=development
```

## Security Best Practices

### 1. Never Expose Keys

```typescript
// ❌ Bad - hardcoded key
const apiKey = 'sk-ant-api03-...';

// ✅ Good - environment variable
const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
```

### 2. Validate Keys on Startup

```typescript
if (!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
  console.error('Missing Anthropic API key!');
}
```

### 3. Use Backend Proxy (Production)

For production apps, proxy API calls through your backend:

```
Mobile App → Your Backend → AI API
```

Benefits:
- Hide API keys from client
- Rate limiting
- Cost tracking
- Request logging

### 4. Rotate Keys Regularly

- Rotate API keys every 3-6 months
- Rotate immediately if exposed
- Use separate keys for dev/prod

## Monitoring & Analytics

### Track API Usage

```typescript
async function trackAPICall(service: string, operation: string) {
  const start = Date.now();
  try {
    // Make API call
    const result = await apiCall();
    const duration = Date.now() - start;

    // Log metrics
    console.log({ service, operation, duration, success: true });

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.log({ service, operation, duration, success: false, error });
    throw error;
  }
}
```

### Monitor Costs

1. **Anthropic Console**
   - View usage dashboard
   - Set spending limits
   - Monitor API key usage

2. **OpenAI Dashboard**
   - Check usage by model
   - Set monthly budgets
   - View cost trends

## Troubleshooting

### Common Issues

**1. API Key Not Working**
```bash
# Test Claude API
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $EXPO_PUBLIC_ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-5-20250929","max_tokens":100,"messages":[{"role":"user","content":"Hello"}]}'

# Test OpenAI API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $EXPO_PUBLIC_OPENAI_API_KEY"
```

**2. CORS Errors**
- Not applicable for React Native
- Only affects web builds

**3. Rate Limiting**
- Implement exponential backoff
- Show user-friendly message
- Queue requests

**4. Network Errors**
- Check internet connection
- Verify API endpoint URLs
- Check firewall/proxy settings

## Further Resources

### Anthropic
- [API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [Best Practices](https://docs.anthropic.com/claude/docs/best-practices)

### OpenAI
- [Whisper Documentation](https://platform.openai.com/docs/guides/speech-to-text)
- [API Reference](https://platform.openai.com/docs/api-reference/audio)
- [Usage Policies](https://openai.com/policies/usage-policies)

### Supabase
- [Documentation](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Real-time Guide](https://supabase.com/docs/guides/realtime)
