'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { MessageBubble } from '@/components/chat/message-bubble';
import { ChatInput } from '@/components/chat/chat-input';
import { SuggestionChips } from '@/components/chat/suggestion-chips';
import { ConversationList } from '@/components/chat/conversation-list';
import { useChat } from '@/lib/hooks/use-chat';
import type { ConversationCategory } from '@/lib/types';

const CATEGORIES: { value: ConversationCategory; label: string }[] = [
  { value: 'general', label: '一般' },
  { value: 'business-mcreate', label: 'エムクリエイト' },
  { value: 'business-jyb', label: 'JYB協会' },
  { value: 'private', label: 'プライベート' },
  { value: 'health', label: '健康' },
  { value: 'partnership', label: 'パートナーシップ' },
  { value: 'journal', label: 'その日の出来事・思ったこと' },
];

export default function ChatPage() {
  const {
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
  } = useChat();

  const scrollEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or streaming
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content);
    },
    [sendMessage]
  );

  const hasMessages = messages && messages.length > 0;

  return (
    <div className="flex h-dvh flex-col lg:h-full">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-4">
        <div className="flex items-center gap-2">
          <ConversationList
            conversations={conversations}
            currentId={currentConversationId}
            onSelect={switchConversation}
          />
          <h1 className="font-heading text-base font-medium">AI相談</h1>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Category selector */}
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  {CATEGORIES.find((c) => c.value === category)?.label || '一般'}
                  <ChevronDown className="size-3" />
                </Button>
              }
            />
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>カテゴリ選択</SheetTitle>
                <SheetDescription>相談の内容に合ったカテゴリを選んでください</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-2 p-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`rounded-xl border px-4 py-3 text-sm transition-colors ${
                      category === cat.value
                        ? 'border-brand-gold bg-brand-gold/10 text-brand-gold font-medium'
                        : 'border-border/60 bg-card/50 text-foreground hover:border-brand-gold/30'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* New conversation button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={startNewConversation}
            aria-label="新しい会話"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {/* Message area */}
      <ScrollArea className="flex-1">
        <div className="flex min-h-full flex-col">
          {!hasMessages ? (
            <div className="flex flex-1 items-center justify-center">
              <SuggestionChips
                category={category}
                onSelect={handleSend}
                onStartJournal={() => {
                  setCategory('journal');
                  startNewConversation();
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  references={msg.references}
                />
              ))}

              {/* Streaming message */}
              {isStreaming && streamingContent && (
                <MessageBubble
                  role="assistant"
                  content={streamingContent}
                  isStreaming
                />
              )}

              {/* Streaming indicator (no content yet) */}
              {isStreaming && !streamingContent && (
                <MessageBubble
                  role="assistant"
                  content=""
                  isStreaming
                />
              )}

              <div ref={scrollEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
