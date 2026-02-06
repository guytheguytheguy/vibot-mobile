/**
 * AI Thinking Partner Service
 *
 * Connects to Claude API for the AI thinking partner feature.
 * Handles conversation management, memory analysis, and tag extraction.
 */

import type { Message, Memory } from '../types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

class AIServiceClass {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';

    if (!this.apiKey) {
      console.error(
        'Anthropic API key missing!\n' +
        'Please add to .env file:\n' +
        '  EXPO_PUBLIC_ANTHROPIC_API_KEY=your-api-key\n'
      );
    }
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey.trim() !== '');
  }

  /**
   * Send a message to the AI thinking partner and get a response
   */
  async chat(
    messages: Message[],
    systemPrompt?: string
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Anthropic API key not configured. Please add EXPO_PUBLIC_ANTHROPIC_API_KEY to your .env file.');
    }

    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const body: Record<string, unknown> = {
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: formattedMessages,
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    return result.content?.[0]?.text || '';
  }

  /**
   * Analyze a memory and extract tags, summary, and connections
   */
  async analyzeMemory(content: string): Promise<{
    tags: string[];
    summary: string;
    suggestedRoom?: string;
  }> {
    const systemPrompt = `You are a memory analysis assistant. Given a piece of text (a transcribed voice note, written note, or conversation excerpt), extract:
1. tags: 3-5 relevant topic tags (lowercase, single words or short phrases)
2. summary: A concise 1-2 sentence summary
3. suggestedRoom: A suggested category room name (e.g., "Work & Projects", "Ideas Lab", "Learning", "Personal")

Respond in JSON format only: {"tags": [...], "summary": "...", "suggestedRoom": "..."}`;

    const messages: Message[] = [{
      id: 'analysis',
      role: 'user',
      content: `Analyze this memory:\n\n${content}`,
      timestamp: new Date().toISOString(),
    }];

    const response = await this.chat(messages, systemPrompt);

    try {
      return JSON.parse(response);
    } catch {
      return {
        tags: [],
        summary: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      };
    }
  }

  /**
   * Find connections between a new memory and existing ones
   */
  async findConnections(
    newMemory: string,
    existingMemories: Memory[]
  ): Promise<{ memoryId: string; relationship: string; strength: number }[]> {
    if (existingMemories.length === 0) return [];

    const memoryList = existingMemories
      .slice(0, 20) // Limit to most recent 20
      .map((m) => `[${m.id}] ${m.summary || m.content.substring(0, 100)}`)
      .join('\n');

    const systemPrompt = `You find connections between memories. Given a new memory and a list of existing memories, identify which existing memories are related and how.

Respond in JSON format only: [{"memoryId": "...", "relationship": "...", "strength": 0.0-1.0}]
Only include memories with strength > 0.3. Maximum 5 connections.`;

    const messages: Message[] = [{
      id: 'connections',
      role: 'user',
      content: `New memory: ${newMemory}\n\nExisting memories:\n${memoryList}`,
      timestamp: new Date().toISOString(),
    }];

    const response = await this.chat(messages, systemPrompt);

    try {
      return JSON.parse(response);
    } catch {
      return [];
    }
  }

  /**
   * Get the thinking partner system prompt, optionally with memory context
   */
  getThinkingPartnerPrompt(recentMemories?: { content: string; tags: string[] }[]): string {
    let memoryContext = '';
    if (recentMemories && recentMemories.length > 0) {
      const summaries = recentMemories
        .slice(0, 8)
        .map((m) => `- ${m.content.substring(0, 80)} [${m.tags.join(', ')}]`)
        .join('\n');
      memoryContext = `\n\nHere are some of the user's recent memories for context (use them to make connections and surprises):\n${summaries}`;
    }

    return `You are Vibot, an AI thinking partner inside a Memory Palace app. Your role is to:

1. Help users think through ideas by asking thoughtful follow-up questions
2. Make connections between their current thoughts and previous memories
3. Offer new perspectives and gentle challenges to deepen thinking
4. Summarize and organize thoughts when asked
5. Be warm, encouraging, and intellectually curious
6. Sometimes surprise the user by referencing something they mentioned before that connects to what they're saying now

Keep responses concise (2-4 sentences typically). Ask one good question at a time rather than overwhelming with multiple questions. Be conversational, not formal.

When you notice a connection between what the user is saying and something from their memory history, point it out! This is one of the most delightful parts of the experience.${memoryContext}`;
  }
}

export const AIService = new AIServiceClass();
