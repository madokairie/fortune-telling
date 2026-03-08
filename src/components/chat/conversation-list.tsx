'use client';

import { MessageCircle } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Conversation, ConversationCategory } from '@/lib/types';

interface ConversationListProps {
  conversations: Conversation[] | undefined;
  currentId: number | null;
  onSelect: (id: number) => void;
}

const CATEGORY_LABELS: Record<ConversationCategory, string> = {
  'general': '一般',
  'business-mcreate': 'エムクリエイト',
  'business-jyb': 'JYビー',
  'private': 'プライベート',
  'health': '健康',
  'partnership': 'パートナーシップ',
};

function formatDate(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return '昨日';
  if (diffDays < 7) return `${diffDays}日前`;

  return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

export function ConversationList({
  conversations,
  currentId,
  onSelect,
}: ConversationListProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="会話履歴">
            <MessageCircle className="size-4" />
          </Button>
        }
      />
      <SheetContent side="left" className="w-[85%] sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>会話履歴</SheetTitle>
          <SheetDescription>過去の相談を選択して続きを確認できます</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          {!conversations || conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <MessageCircle className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">会話履歴はまだありません</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1 pb-4">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => conv.id != null && onSelect(conv.id)}
                  className={cn(
                    'flex flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors',
                    conv.id === currentId
                      ? 'bg-brand-gold/10 border border-brand-gold/20'
                      : 'hover:bg-muted/50 border border-transparent'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {conv.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(conv.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {CATEGORY_LABELS[conv.category] || conv.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {conv.messageCount}件
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
