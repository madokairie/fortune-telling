'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { DailyAdvice, DailyAdviceCache } from '@/lib/types';

/** 今日の日付を YYYY-MM-DD (JST) で返す */
function getTodayJST(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
}

interface UseDailyAdviceReturn {
  advice: DailyAdvice | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDailyAdvice(): UseDailyAdviceReturn {
  const [advice, setAdvice] = useState<DailyAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = useCallback(async () => {
    const today = getTodayJST();
    setIsLoading(true);
    setError(null);

    try {
      // 1. IndexedDB キャッシュを確認
      const cached: DailyAdviceCache | undefined =
        await db.dailyAdviceCache.get(today);

      if (cached) {
        setAdvice(cached.advice);
        setIsLoading(false);
        return;
      }

      // 2. キャッシュがなければ API を呼び出す
      const res = await fetch(`/api/daily-advice?date=${today}`);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `API returned ${res.status}`);
      }

      const data = await res.json();

      // API レスポンスを DailyAdvice 型に変換
      const dailyAdvice: DailyAdvice = {
        date: data.date,
        lunarDate: data.lunarDate || '',
        calendar: data.calendar || undefined,
        caution: data.caution || undefined,
        overallFortune: data.advice.overall,
        workFortune: {
          mCreate: data.advice.work.mCreate,
          jyBee: data.advice.work.jyBee,
        },
        privateFortune: data.advice.private,
        luckyDirection: data.advice.luckyDirection,
        luckyColor: data.advice.luckyColor,
        luckyItem: data.advice.luckyItem,
        generatedAt: data.generatedAt,
      };

      // 3. IndexedDB にキャッシュ保存
      await db.dailyAdviceCache.put({
        date: today,
        advice: dailyAdvice,
        generatedAt: new Date(),
      });

      setAdvice(dailyAdvice);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'アドバイスの取得に失敗しました';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvice();
  }, [fetchAdvice]);

  return { advice, isLoading, error, refetch: fetchAdvice };
}
