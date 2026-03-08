/**
 * GET /api/daily-advice
 *
 * 今日のアドバイス生成エンドポイント
 * 円香さんの命盤 + 当日情報をプロンプトに含めてClaude APIで生成
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildDailyAdvicePrompt } from '@/lib/ai/system-prompt';
import { searchKnowledge } from '@/lib/ai/knowledge';

/** アドバイスレスポンスの型 */
interface DailyAdviceResponse {
  date: string;
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
  const now = new Date();
  const jstOffset = 9 * 60; // UTC+9
  const jst = new Date(now.getTime() + jstOffset * 60 * 1000);
  return jst.toISOString().split('T')[0];
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
    // RAG検索（今日の運勢に関連するナレッジ）
    let ragContext: string | undefined;
    try {
      const ragResults = await searchKnowledge(
        `${date} 今日の運勢 アドバイス 方位 ラッキー`,
        3
      );
      if (ragResults.length > 0) {
        ragContext = ragResults.join('\n\n---\n\n');
      }
    } catch (error) {
      console.warn('[daily-advice] RAG search failed:', error);
    }

    // プロンプト構築
    const systemPrompt = buildDailyAdvicePrompt(date, ragContext);

    // Claude API 呼び出し（非ストリーミング）
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${date}の円香さんへのアドバイスをJSON形式で生成してください。`,
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
      // ```json ... ``` で囲まれている場合を考慮
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

    // レスポンス構築
    const response: DailyAdviceResponse = {
      date,
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
        // 1日キャッシュ（s-maxage はCDN向け、max-age はブラウザ向け）
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
