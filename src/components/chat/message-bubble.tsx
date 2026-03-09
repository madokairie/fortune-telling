'use client';

import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KnowledgeReference } from '@/lib/types';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  references?: KnowledgeReference[];
  isStreaming?: boolean;
}

function renderMarkdown(text: string) {
  // Split into lines, then process each segment
  const parts: React.ReactNode[] = [];
  const lines = text.split('\n');

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      parts.push(<br key={`br-${lineIdx}`} />);
    }

    // Process bold **text** within each line
    const segments = line.split(/(\*\*[^*]+\*\*)/g);
    segments.forEach((seg, segIdx) => {
      if (seg.startsWith('**') && seg.endsWith('**')) {
        parts.push(
          <strong key={`${lineIdx}-${segIdx}`} className="font-semibold">
            {seg.slice(2, -2)}
          </strong>
        );
      } else {
        parts.push(seg);
      }
    });
  });

  return parts;
}

function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block size-1.5 rounded-full bg-brand-gold/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </span>
  );
}

export function MessageBubble({
  role,
  content,
  references,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn(
        'flex gap-2.5 px-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-gold/20">
          <Star className="size-4 text-brand-gold" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-brand-indigo text-brand-pearl rounded-br-md'
            : 'bg-card text-card-foreground rounded-bl-md'
        )}
      >
        <div className="whitespace-pre-wrap break-words">
          {renderMarkdown(content)}
          {isStreaming && <TypingIndicator />}
        </div>

        {/* Reference tags */}
        {references && references.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border/30 pt-2">
            {references.map((ref, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md bg-brand-gold/10 px-2 py-0.5 text-xs text-brand-gold"
              >
                <span className="opacity-70">&#128206;</span>
                {ref.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
