/**
 * GET /api/daily-advice
 *
 * 今日のアドバイス生成エンドポイント
 * 実際の干支暦データ + 命盤 + 四化影響をプロンプトに含めてClaude APIで生成
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildDailyAdvicePrompt } from '@/lib/ai/system-prompt';
import { searchKnowledge } from '@/lib/ai/knowledge';
import {
  getDailyFortuneData,
  getNextUDays,
  getUMonthPeriod,
  type DailyFortuneData,
} from '@/lib/fortune/calendar';

/** アドバイスレスポンスの型 */
interface DailyAdviceResponse {
  date: string;
  calendar: {
    yearGanZhi: string;
    monthGanZhi: string;
    dayGanZhi: string;
  };
  caution: {
    level: 'high' | 'medium' | 'low' | 'none';
    isUMonth: boolean;
    isUDay: boolean;
    message: string;
    nextUDays: string[];
    uMonthPeriod: { start: string; end: string } | null;
  };
  advice: {
    overall: string;
    work: {
      mCreate: string;
      jyBee: string;
    };
    private: string;
    luckyDirection: string;
    luckyColor: string;
    luckyItem: string;
  };
  generatedAt: string;
}

/**
 * 今日の日付を YYYY-MM-DD 形式で取得する（JST）
 */
function getTodayJST(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
}

/**
 * 運勢データをAI用のコンテキスト文字列に変換
 */
function buildFortuneContext(fortune: DailyFortuneData): string {
  const { yearGanZhi, monthGanZhi, dayGanZhi, caution, fortuneImpact } = fortune;

  const lines: string[] = [
    `## 今日の暦データ（計算済み）`,
    `- 西暦: ${fortune.date}`,
    `- 年柱: ${yearGanZhi.full}（${yearGanZhi.stem}${yearGanZhi.branch}年）`,
    `- 月柱: ${monthGanZhi.full}（${monthGanZhi.stem}${monthGanZhi.branch}月）`,
    `- 日柱: ${dayGanZhi.full}（${dayGanZhi.stem}${dayGanZhi.branch}日）`,
    '',
    `## 日の四化（${dayGanZhi.stem}日の飛星）`,
    `- 化禄: ${fortuneImpact.daySiHua.huaLu}`,
    `- 化権: ${fortuneImpact.daySiHua.huaQuan}`,
    `- 化科: ${fortuneImpact.daySiHua.huaKe}`,
    `- 化忌: ${fortuneImpact.daySiHua.huaJi}`,
  ];

  if (fortuneImpact.impacts.length > 0) {
    lines.push('', `## 命盤への影響`);
    for (const impact of fortuneImpact.impacts) {
      const emoji = impact.effect === 'positive' ? '✦' : '⚠';
      lines.push(`${emoji} ${impact.description}`);
    }
    lines.push(`→ 総合判定: ${fortuneImpact.overallTone}`);
  }

  if (caution.level !== 'none') {
    lines.push(
      '',
      `## ⚠️ 卯の注意（レベル: ${caution.level}）`,
      caution.message,
      `- 卯月: ${caution.isUMonth ? 'はい' : 'いいえ'}`,
      `- 卯日: ${caution.isUDay ? 'はい' : 'いいえ'}`
    );
  }

  return lines.join('\n');
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // APIキーの確認
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured' },
      { status: 500 }
    );
  }

  // dateパラメータを取得（指定なければ今日）
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || getTodayJST();

  // 日付フォーマットのバリデーション
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: 'Invalid date format. Expected YYYY-MM-DD' },
      { status: 400 }
    );
  }

  try {
    // 干支暦データを計算
    const fortuneData = getDailyFortuneData(date);
    const fortuneContext = buildFortuneContext(fortuneData);
    const nextUDays = getNextUDays(date, 3);
    const year = parseInt(date.split('-')[0]);
    const uMonthPeriod = getUMonthPeriod(year);

    // RAG検索（今日の運勢に関連するナレッジ）
    let ragContext: string | undefined;
    try {
      // 干支情報を含めてRAG検索（より関連性の高い結果を得る）
      const ragQuery = `${date} ${fortuneData.dayGanZhi.full} ${fortuneData.monthGanZhi.branch}月 運勢 アドバイス 方位`;
      const ragResults = await searchKnowledge(ragQuery, 3);
      if (ragResults.length > 0) {
        ragContext = ragResults.join('\n\n---\n\n');
      }
    } catch (error) {
      console.warn('[daily-advice] RAG search failed:', error);
    }

    // プロンプト構築（実際の暦データを注入）
    const systemPrompt = buildDailyAdvicePrompt(date, ragContext, fortuneContext);

    // Claude API 呼び出し（非ストリーミング）
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${date}（${fortuneData.dayGanZhi.full}日）の円香さんへのアドバイスをJSON形式で生成してください。`,
        },
      ],
    });

    // レスポンステキストの取得
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    // JSONパース（コードブロックの除去も対応）
    let adviceData: DailyAdviceResponse['advice'];
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
      adviceData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('[daily-advice] Failed to parse AI response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 500 }
      );
    }

    // レスポンス構築（暦データ + 注意情報を含む）
    const response: DailyAdviceResponse = {
      date,
      calendar: {
        yearGanZhi: fortuneData.yearGanZhi.full,
        monthGanZhi: fortuneData.monthGanZhi.full,
        dayGanZhi: fortuneData.dayGanZhi.full,
      },
      caution: {
        level: fortuneData.caution.level,
        isUMonth: fortuneData.caution.isUMonth,
        isUDay: fortuneData.caution.isUDay,
        message: fortuneData.caution.message,
        nextUDays,
        uMonthPeriod,
      },
      advice: {
        overall: adviceData.overall || '',
        work: {
          mCreate: adviceData.work?.mCreate || '',
          jyBee: adviceData.work?.jyBee || '',
        },
        private: adviceData.private || '',
        luckyDirection: adviceData.luckyDirection || '',
        luckyColor: adviceData.luckyColor || '',
        luckyItem: adviceData.luckyItem || '',
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[daily-advice] Error:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
