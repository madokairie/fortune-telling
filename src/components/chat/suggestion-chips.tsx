'use client';

import { motion } from 'motion/react';
import { Sparkles, PenLine } from 'lucide-react';
import type { ConversationCategory } from '@/lib/types';

interface SuggestionChipsProps {
  category: ConversationCategory;
  onSelect: (text: string) => void;
  onStartJournal?: () => void;
}

/** カテゴリ別サジェスション */
const CATEGORY_SUGGESTIONS: Record<ConversationCategory, string[]> = {
  general: [
    '今月の運勢を教えて',
    '今の私の課題は何？',
    '来月に向けて準備しておくことは？',
    '最近気になっていることを相談したい',
  ],
  'business-mcreate': [
    '今月の事業運を教えて',
    '来週の講座開催にいい日は？',
    'SNS投稿のベストなタイミングは？',
    '新サービスのローンチ時期のアドバイス',
  ],
  'business-jyb': [
    'JYB協会の今月の展開運は？',
    '新講師の採用に良いタイミングは？',
    '次のイベント開催の方位と日取り',
    '陰陽五行的に今注力すべきことは？',
  ],
  private: [
    'プライベートの運勢を教えて',
    '旅行に良い方位と時期は？',
    '人間関係で意識すべきことは？',
    'パートナーシップについてアドバイス',
  ],
  health: [
    '今の健康運を教えて',
    '食事で気をつけることは？',
    '体調管理のアドバイスが欲しい',
    '休息をとるべきタイミングは？',
  ],
  partnership: [
    '今の恋愛運を教えて',
    'パートナー候補の特徴は？',
    '出会いに良い時期と場所は？',
    '女性性を出すためのアドバイス',
  ],
  journal: [
    '今日あったことを話したい',
    '今日モヤモヤしたことがある',
    '今日うれしいことがあった',
    '今日の仕事の振り返り',
  ],
};

/** カテゴリ別の説明文 */
const CATEGORY_DESCRIPTIONS: Record<ConversationCategory, string> = {
  general: '紫微斗数に基づくAI相談をご利用いただけます',
  'business-mcreate': 'エムクリエイトの事業に関する相談',
  'business-jyb': 'JYB協会の事業に関する相談',
  private: 'プライベートの運勢・アドバイス',
  health: '健康・体調に関する相談',
  partnership: 'パートナーシップ・恋愛の相談',
  journal: '今日の出来事や思ったことを気軽に記録',
};

export function SuggestionChips({ category, onSelect, onStartJournal }: SuggestionChipsProps) {
  const suggestions = CATEGORY_SUGGESTIONS[category] || CATEGORY_SUGGESTIONS.general;
  const description = CATEGORY_DESCRIPTIONS[category] || CATEGORY_DESCRIPTIONS.general;
  const isJournal = category === 'journal';

  return (
    <div className="flex flex-col items-center gap-6 px-6 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className={`flex size-12 items-center justify-center rounded-full ${
          isJournal ? 'bg-brand-gold/20' : 'bg-brand-gold/15'
        }`}>
          {isJournal
            ? <PenLine className="size-6 text-brand-gold" />
            : <Sparkles className="size-6 text-brand-gold" />
          }
        </div>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {/* 日記トリガー — generalの時だけ表示 */}
      {onStartJournal && category === 'general' && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onStartJournal}
          className="flex w-full max-w-sm items-center gap-3 rounded-xl border-2 border-brand-gold/30 bg-brand-gold/5 px-4 py-3.5 text-left transition-colors hover:border-brand-gold/50 hover:bg-brand-gold/10 active:scale-[0.98]"
        >
          <PenLine className="size-5 text-brand-gold" />
          <div>
            <p className="text-sm font-medium text-foreground">
              今日の出来事・思ったことを記録
            </p>
            <p className="text-xs text-muted-foreground">
              気が向いた時にサッとメモ → 月末にAIが分析
            </p>
          </div>
        </motion.button>
      )}

      <div className="flex w-full max-w-sm flex-col gap-2">
        {suggestions.map((text, i) => (
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
