'use client';

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Briefcase,
  Heart,
  TrendingUp,
  Target,
  ArrowRight,
  Loader2,
  Compass,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MonthReview {
  overview: string;
  work: {
    summary: string;
    patterns: string;
  };
  private: {
    summary: string;
    patterns: string;
  };
  fortuneAlignment: string;
  growthPoints: string[];
}

interface NextMonthGuide {
  overview: string;
  workAdvice: string;
  privateAdvice: string;
  keyDates: string;
  actionItems: string[];
}

interface SummaryData {
  year: number;
  month: number;
  conversationCount: number;
  calendar: {
    monthGanZhi: string;
    isUMonth: boolean;
  };
  monthReview: MonthReview;
  nextMonthGuide: NextMonthGuide;
  generatedAt: string;
}

function getJSTDate(): { year: number; month: number } {
  const dateStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  const [y, m] = dateStr.split('-').map(Number);
  return { year: y, month: m };
}

export default function SummaryPage() {
  const jstDate = getJSTDate();
  const [year, setYear] = useState(jstDate.year);
  const [month, setMonth] = useState(jstDate.month);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToPrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
    setSummary(null);
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
    setSummary(null);
  };

  const generateSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59);

      const allConversations = await db.conversations
        .where('createdAt')
        .between(monthStart, monthEnd)
        .toArray();

      const conversationsWithMessages = await Promise.all(
        allConversations.map(async (conv) => {
          const messages = await db.messages
            .where('conversationId')
            .equals(conv.id!)
            .sortBy('createdAt');

          return {
            category: conv.category,
            title: conv.title,
            date: conv.createdAt.toISOString().split('T')[0],
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          };
        })
      );

      const res = await fetch('/api/monthly-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          month,
          conversations: conversationsWithMessages,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `API returned ${res.status}`);
      }

      const data: SummaryData = await res.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'まとめの生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-8 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          月間まとめ
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          出来事メモ＆相談記録からAIが分析・来月の指針を生成
        </p>
      </motion.div>

      {/* Month selector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="mt-6 flex items-center justify-between"
      >
        <Button variant="ghost" size="icon-sm" onClick={goToPrevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="font-heading text-lg font-medium">
          {year}年{month}月
        </span>
        <Button variant="ghost" size="icon-sm" onClick={goToNextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </motion.div>

      <div className="mt-6 space-y-5">
        {/* Generate button */}
        {!summary && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <Button
              onClick={generateSummary}
              className="w-full gap-2 bg-brand-gold text-brand-indigo hover:bg-brand-gold/90"
              size="lg"
            >
              <Sparkles className="h-5 w-5" />
              {year}年{month}月のまとめを生成
            </Button>
            {error && (
              <p className="mt-3 text-center text-sm text-red-500">{error}</p>
            )}
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
              <p className="text-sm text-muted-foreground">
                {month}月の記録を分析中...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {summary && (
          <>
            {/* Meta info */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardContent className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {summary.calendar.monthGanZhi}月 · {summary.conversationCount}件の記録を分析
                  </span>
                  {summary.calendar.isUMonth && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      卯月
                    </span>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* ===== 今月の振り返り ===== */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              <h2 className="mb-3 font-heading text-sm font-medium text-muted-foreground">
                今月の振り返り
              </h2>

              <div className="space-y-3">
                {/* Overview */}
                <Card>
                  <CardContent className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                      <p className="text-sm leading-relaxed">
                        {summary.monthReview.overview}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Work */}
                <Card>
                  <CardContent className="space-y-3 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Briefcase className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          仕事の動き
                        </p>
                        <p className="mt-1 text-sm leading-relaxed">
                          {summary.monthReview.work.summary}
                        </p>
                      </div>
                    </div>
                    <div className="ml-7 rounded-md bg-muted/50 px-3 py-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        思考・行動パターン
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed">
                        {summary.monthReview.work.patterns}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Private */}
                <Card>
                  <CardContent className="space-y-3 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Heart className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          プライベートの動き
                        </p>
                        <p className="mt-1 text-sm leading-relaxed">
                          {summary.monthReview.private.summary}
                        </p>
                      </div>
                    </div>
                    <div className="ml-7 rounded-md bg-muted/50 px-3 py-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        思考・行動パターン
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed">
                        {summary.monthReview.private.patterns}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Fortune alignment */}
                <Card>
                  <CardContent className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Compass className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          運勢との一致度
                        </p>
                        <p className="mt-1 text-sm leading-relaxed">
                          {summary.monthReview.fortuneAlignment}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Growth points */}
                {summary.monthReview.growthPoints.length > 0 && (
                  <Card>
                    <CardContent className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            今月の成長・気づき
                          </p>
                          <ul className="mt-2 space-y-1.5">
                            {summary.monthReview.growthPoints.map((point, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm"
                              >
                                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-gold" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.section>

            {/* ===== 来月の過ごし方 ===== */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <h2 className="mb-3 flex items-center gap-1.5 font-heading text-sm font-medium text-muted-foreground">
                <ArrowRight className="h-3.5 w-3.5" />
                来月の過ごし方
              </h2>

              <div className="space-y-3">
                {/* Overview */}
                <Card>
                  <CardContent className="px-4 py-4">
                    <p className="text-sm leading-relaxed">
                      {summary.nextMonthGuide.overview}
                    </p>
                  </CardContent>
                </Card>

                {/* Work & Private advice */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Card>
                    <CardContent className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <Briefcase className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            仕事で意識すること
                          </p>
                          <p className="mt-1 text-sm leading-relaxed">
                            {summary.nextMonthGuide.workAdvice}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <Heart className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            プライベートで意識すること
                          </p>
                          <p className="mt-1 text-sm leading-relaxed">
                            {summary.nextMonthGuide.privateAdvice}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Key dates */}
                {summary.nextMonthGuide.keyDates && (
                  <Card>
                    <CardContent className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <Target className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            スケジュールのポイント
                          </p>
                          <p className="mt-1 text-sm leading-relaxed">
                            {summary.nextMonthGuide.keyDates}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action items */}
                {summary.nextMonthGuide.actionItems.length > 0 && (
                  <Card>
                    <CardContent className="px-4 py-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        来月のアクション
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {summary.nextMonthGuide.actionItems.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="mt-1.5 text-brand-gold">→</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.section>

            {/* Regenerate */}
            <Button
              variant="outline"
              onClick={generateSummary}
              className="w-full gap-2"
              size="sm"
            >
              <Sparkles className="h-4 w-4" />
              再生成
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
