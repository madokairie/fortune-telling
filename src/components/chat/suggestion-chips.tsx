'use client';

import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  '今月の事業運を教えて',
  '来週の講座開催にいい日は？',
  '今の私の課題は何？',
  'パートナーシップについてアドバイス',
] as const;

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
}

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-col items-center gap-6 px-6 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-brand-gold/15">
          <Sparkles className="size-6 text-brand-gold" />
        </div>
        <p className="text-sm text-muted-foreground">
          紫微斗数に基づくAI相談をご利用いただけます
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-2">
        {SUGGESTIONS.map((text, i) => (
          <motion.button
            key={text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: i * 0.05 }}
            onClick={() => onSelect(text)}
            className="w-full rounded-xl border border-border/60 bg-card/50 px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-brand-gold/40 hover:bg-card active:scale-[0.98]"
          >
            {text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
