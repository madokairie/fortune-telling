'use client';

import { useRef, useCallback, KeyboardEvent, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    // Max 4 lines (~96px)
    const maxHeight = 96;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const value = textarea.value.trim();
    if (!value || disabled) return;
    onSend(value);
    textarea.value = '';
    textarea.style.height = 'auto';
    textarea.focus();
  }, [onSend, disabled]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div
      className="border-t border-border/50 bg-background px-4 py-3"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div
        className={cn(
          'flex items-end gap-2 rounded-xl border bg-card px-3 py-2 transition-colors',
          disabled ? 'border-border/30' : 'border-brand-gold/40 focus-within:border-brand-gold/70'
        )}
      >
        <textarea
          ref={textareaRef}
          placeholder="質問を入力..."
          disabled={disabled}
          rows={1}
          onInput={adjustHeight}
          onKeyDown={handleKeyDown}
          className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleSend}
          disabled={disabled}
          className={cn(
            'shrink-0 transition-colors',
            disabled
              ? 'text-muted-foreground'
              : 'text-brand-gold hover:text-brand-gold/80 hover:bg-brand-gold/10'
          )}
        >
          <SendHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  );
}
