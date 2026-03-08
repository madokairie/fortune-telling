'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { MessageCircle, Palette, Gift, RefreshCw } from 'lucide-react';
import { useDailyAdvice } from '@/hooks/useDailyAdvice';
import { DailyAdviceCard } from '@/components/dashboard/daily-advice-card';
import { BusinessCard } from '@/components/dashboard/business-card';
import { PrivateCard } from '@/components/dashboard/private-card';
import { LuckyDirection } from '@/components/dashboard/lucky-direction';
import { ShimmerLoading } from '@/components/dashboard/shimmer-loading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// --- Date formatting helpers ---

const WAREKI_ERA = '令和';
const WAREKI_OFFSET = 2018; // 令和元年 = 2019

const KANJI_DIGITS: Record<number, string> = {
  0: '〇', 1: '一', 2: '二', 3: '三', 4: '四',
  5: '五', 6: '六', 7: '七', 8: '八', 9: '九',
  10: '十',
};

function toKanjiNumber(n: number): string {
  if (n <= 10) return KANJI_DIGITS[n];
  if (n < 20) {
    return n === 10 ? '十' : `十${KANJI_DIGITS[n - 10]}`;
  }
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return `${KANJI_DIGITS[tens]}十${ones > 0 ? KANJI_DIGITS[ones] : ''}`;
  }
  return String(n);
}

const DAY_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'];

function formatWareki(date: Date): string {
  const year = date.getFullYear() - WAREKI_OFFSET;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dow = DAY_OF_WEEK[date.getDay()];

  return `${WAREKI_ERA}${toKanjiNumber(year)}年 ${toKanjiNumber(month)}月${toKanjiNumber(day)}日（${dow}）`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'お休みのところ失礼します';
  if (hour < 11) return 'おはようございます';
  if (hour < 17) return 'こんにちは';
  return 'こんばんは';
}

// --- Main page component ---

export default function DashboardPage() {
  const router = useRouter();
  const { advice, isLoading, error, refetch } = useDailyAdvice();
  const today = new Date();
  const warekiDate = formatWareki(today);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-8 pt-6">
      {/* Greeting & date header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        className="space-y-1"
      >
        <p className="text-sm text-muted-foreground">
          {getGreeting()}、円香さん
        </p>
        <h1 className="font-heading text-xl font-bold tracking-tight">
          {warekiDate}
        </h1>
      </motion.header>

      {/* Main content */}
      {isLoading ? (
        <ShimmerLoading />
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              再取得
            </Button>
          </CardContent>
        </Card>
      ) : advice ? (
        <>
          {/* Overall fortune */}
          <DailyAdviceCard overallFortune={advice.overallFortune} />

          {/* Business cards */}
          <section>
            <h2 className="mb-3 font-heading text-sm font-medium text-muted-foreground">
              仕事運
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BusinessCard
                type="mcreate"
                content={advice.workFortune.mCreate}
              />
              <BusinessCard
                type="jybee"
                content={advice.workFortune.jyBee}
              />
            </div>
          </section>

          {/* Private fortune */}
          <PrivateCard content={advice.privateFortune} />

          {/* Lucky section: direction, color, item */}
          <section>
            <h2 className="mb-3 font-heading text-sm font-medium text-muted-foreground">
              今日のラッキー
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {/* Direction - spans full width on mobile */}
              <motion.div
                className="col-span-2 md:col-span-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <Card className="flex items-center justify-center py-4">
                  <CardContent className="p-0">
                    <LuckyDirection direction={advice.luckyDirection} />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Lucky color */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.25 }}
              >
                <Card className="flex h-full flex-col items-center justify-center gap-2 py-6">
                  <CardContent className="flex flex-col items-center gap-2 p-0">
                    <Palette className="h-6 w-6 text-brand-gold" />
                    <p className="text-xs text-muted-foreground">
                      ラッキーカラー
                    </p>
                    <p className="text-sm font-medium">{advice.luckyColor}</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Lucky item */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.3 }}
              >
                <Card className="flex h-full flex-col items-center justify-center gap-2 py-6">
                  <CardContent className="flex flex-col items-center gap-2 p-0">
                    <Gift className="h-6 w-6 text-brand-gold" />
                    <p className="text-xs text-muted-foreground">
                      ラッキーアイテム
                    </p>
                    <p className="text-sm font-medium">{advice.luckyItem}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        </>
      ) : null}

      {/* Quick action */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.35 }}
      >
        <Button
          onClick={() => router.push('/chat')}
          className="w-full gap-2 bg-brand-gold text-brand-indigo hover:bg-brand-gold/90"
          size="lg"
        >
          <MessageCircle className="h-5 w-5" />
          AIに相談する
        </Button>
      </motion.div>
    </div>
  );
}
