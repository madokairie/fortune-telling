'use client';

import { useCallback, useRef } from 'react';
import { db } from '@/lib/db';
import { useMessages, useConversations } from '@/lib/db/hooks';
import { useChatStore } from '@/lib/store/chat-store';
import type { Conversation, Message, KnowledgeReference } from '@/lib/types';

interface SSEEvent {
  type: 'text' | 'references' | 'done' | 'error';
  content?: string;
  references?: Array<{
    source: string;
    label: string;
    excerpt: string;
  }>;
}

export function useChat() {
  const {
    currentConversationId,
    isStreaming,
    streamingContent,
    category,
    setConversation,
    setStreaming,
    appendStreamContent,
    clearStreamContent,
    setCategory,
  } = useChatStore();

  const conversations = useConversations();
  const messages = useMessages(currentConversationId);
  const abortRef = useRef<AbortController | null>(null);

  const createConversation = useCallback(async (title: string): Promise<number> => {
    const now = new Date();
    const id = await db.conversations.add({
      title,
      category,
      messageCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    return id as number;
  }, [category]);

  const startNewConversation = useCallback(() => {
    if (isStreaming && abortRef.current) {
      abortRef.current.abort();
    }
    setConversation(null);
    clearStreamContent();
    setStreaming(false);
  }, [isStreaming, setConversation, clearStreamContent, setStreaming]);

  const switchConversation = useCallback((id: number) => {
    if (isStreaming && abortRef.current) {
      abortRef.current.abort();
    }
    setConversation(id);
    clearStreamContent();
    setStreaming(false);
  }, [isStreaming, setConversation, clearStreamContent, setStreaming]);

  const sendMessage = useCallback(async (content: string) => {
    if (isStreaming || !content.trim()) return;

    let convId = currentConversationId;

    // Create conversation if none exists
    if (!convId) {
      const title = content.slice(0, 40) + (content.length > 40 ? '...' : '');
      convId = await createConversation(title);
      setConversation(convId);
    }

    // Save user message to IndexedDB
    const userMessage: Omit<Message, 'id'> = {
      conversationId: convId,
      role: 'user',
      content,
      createdAt: new Date(),
    };
    await db.messages.add(userMessage as Message);

    // Update conversation
    await db.conversations.update(convId, {
      updatedAt: new Date(),
      messageCount: ((await db.messages.where('conversationId').equals(convId).count()) || 0),
    });

    // Build message history for API
    const allMessages = await db.messages
      .where('conversationId')
      .equals(convId)
      .sortBy('createdAt');

    const apiMessages = allMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Map category for API compatibility
    const categoryMap: Record<string, string> = {
      'business-mcreate': 'mcreate',
      'business-jyb': 'jybee',
      'private': 'private',
      'health': 'general',
      'partnership': 'private',
      'general': 'general',
    };
    const apiCategory = categoryMap[category] || 'general';

    // Start streaming
    setStreaming(true);
    clearStreamContent();

    const abortController = new AbortController();
    abortRef.current = abortController;

    let fullContent = '';
    let references: KnowledgeReference[] = [];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          category: apiCategory,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event: SSEEvent = JSON.parse(jsonStr);

            switch (event.type) {
              case 'text':
                if (event.content) {
                  fullContent += event.content;
                  appendStreamContent(event.content);
                }
                break;
              case 'references':
                if (event.references) {
                  references = event.references.map((r) => ({
                    source: r.source,
                    label: r.label,
                    relevanceScore: 0,
                    excerpt: r.excerpt,
                  }));
                }
                break;
              case 'error':
                throw new Error(event.content || 'Streaming error');
              case 'done':
                break;
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }

      // Save assistant message to IndexedDB
      if (fullContent) {
        const assistantMessage: Omit<Message, 'id'> = {
          conversationId: convId,
          role: 'assistant',
          content: fullContent,
          references: references.length > 0 ? references : undefined,
          createdAt: new Date(),
        };
        await db.messages.add(assistantMessage as Message);

        await db.conversations.update(convId, {
          updatedAt: new Date(),
          messageCount: ((await db.messages.where('conversationId').equals(convId).count()) || 0),
        });
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      console.error('[useChat] Error:', error);
    } finally {
      setStreaming(false);
      clearStreamContent();
      abortRef.current = null;
    }
  }, [
    isStreaming,
    currentConversationId,
    category,
    createConversation,
    setConversation,
    setStreaming,
    clearStreamContent,
    appendStreamContent,
  ]);

  return {
    messages,
    conversations,
    currentConversationId,
    isStreaming,
    streamingContent,
    category,
    sendMessage,
    startNewConversation,
    switchConversation,
    setCategory,
  };
}
