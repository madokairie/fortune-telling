/**
 * POST /api/monthly-summary
 *
 * 月間チャット記録をもとに振り返り＆来月の過ごし方をAIで生成
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getDailyFortuneData, getUMonthPeriod } from '@/lib/fortune/calendar';

interface MonthlySummaryRequest {
  year: number;
  month: number; // 1-12
  conversations: Array<{
    category: string;
    title: string;
    date: string;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
  }>;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured' },
      { status: 500 }
    );
  }

  let body: MonthlySummaryRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }

  if (!body.year || !body.month || !body.conversations) {
    return NextResponse.json(
      { error: 'year, month, conversations are required' },
      { status: 400 }
    );
  }

  // 対象月の運勢データを取得（月初・月中・月末）
  const monthStr = String(body.month).padStart(2, '0');
  const firstDay = `${body.year}-${monthStr}-01`;
  const midDay = `${body.year}-${monthStr}-15`;
  const fortuneFirst = getDailyFortuneData(firstDay);
  const fortuneMid = getDailyFortuneData(midDay);

  // 来月の運勢データ
  const nextMonth = body.month === 12 ? 1 : body.month + 1;
  const nextYear = body.month === 12 ? body.year + 1 : body.year;
  const nextMonthStr = String(nextMonth).padStart(2, '0');
  const nextFirstDay = `${nextYear}-${nextMonthStr}-01`;
  const fortuneNext = getDailyFortuneData(nextFirstDay);
  const nextUMonth = getUMonthPeriod(nextYear);

  // 会話データをカテゴリ別にまとめる
  const categorySummaries: Record<string, string[]> = {};
  for (const conv of body.conversations) {
    const cat = conv.category || 'general';
    if (!categorySummaries[cat]) categorySummaries[cat] = [];

    // ユーザーのメッセージだけ抽出（記録の要旨として）
    const userMsgs = conv.messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content.slice(0, 200));
    const assistantMsgs = conv.messages
      .filter((m) => m.role === 'assistant')
      .map((m) => m.content.slice(0, 200));

    categorySummaries[cat].push(
      `【${conv.date} ${conv.title}】\n相談: ${userMsgs.join(' / ')}\n回答要旨: ${assistantMsgs.join(' / ')}`
    );
  }

  const categoryLabels: Record<string, string> = {
    'business-mcreate': 'エムクリエイト',
    'business-jyb': 'JYB協会',
    'private': 'プライベート',
    'health': '健康',
    'partnership': 'パートナーシップ',
    'journal': 'その日の出来事・思ったこと',
    'general': '一般',
  };

  let conversationContext = '';
  for (const [cat, entries] of Object.entries(categorySummaries)) {
    conversationContext += `\n### ${categoryLabels[cat] || cat}（${entries.length}件）\n`;
    conversationContext += entries.join('\n\n');
    conversationContext += '\n';
  }

  const systemPrompt = `あなたは紫微斗数の専門AIアドバイザーです。
円香（まどか）さんの月間の「出来事メモ」や相談記録を分析し、振り返りと来月の指針を作成します。

## 円香さんの基本情報
- 44歳女性、辛酉年生まれ、五行局: 木三局、命宮: 文曲・天機
- 主星: 貪狼（自由・モテ星）、七殺（プロフェッショナル）、破軍（財運）
- 性質: 男性性8割、直感鋭い、プロ気質、火の玉の性質、止まると自分を見失う
- 株式会社エムクリエイト代表（SNSコンサル）+ JYB協会代表（陰陽五行美容）
- 現在42〜51歳の大限: 仲間が集まり飛躍する時期、天閲（展開点）入り
- 2026年: 結婚の星＋モテ星入り、プライベート運がいい、長期の星入り

## ${body.year}年${body.month}月の暦データ
- 月柱: ${fortuneFirst.monthGanZhi.full}月 / 年柱: ${fortuneFirst.yearGanZhi.full}
- 卯月（注意月）: ${fortuneFirst.caution.isUMonth ? 'はい ⚠️ → ローンチ・契約に注意' : 'いいえ'}

## 来月（${nextYear}年${nextMonth}月）の暦データ
- 月柱: ${fortuneNext.monthGanZhi.full}月
- 卯月: ${fortuneNext.caution.isUMonth ? 'はい ⚠️ → 重要な契約・ローンチは避ける' : 'いいえ'}
${nextUMonth ? `- 今年の卯月期間: ${nextUMonth.start}〜${nextUMonth.end}` : ''}

## ${body.year}年${body.month}月の記録データ
${conversationContext || '（記録なし）'}

## 分析の重要ポイント
1. **「出来事メモ」カテゴリを最優先で分析**。日々の記録から思考・行動パターンを読み取る
2. 相談内容も併せて、仕事とプライベートそれぞれの動きを把握する
3. 今月の運勢（月柱・四化）と実際の出来事が合っていたか照合する
4. 命盤の性質（七殺のプロ気質、貪狼の自由さ、火の玉）がどう出ていたか分析する
5. 来月は暦データに基づいた具体的な過ごし方を提案する

## 出力形式
以下のJSON形式で出力してください。JSON以外のテキストは含めないでください:
{
  "monthReview": {
    "overview": "今月の総括（150〜200文字。出来事メモからの具体的エピソードを含める）",
    "work": {
      "summary": "仕事面の動き（100〜150文字。エムクリエイト・JYB両方）",
      "patterns": "見えた仕事の思考・行動パターン（80〜120文字。七殺やプロ気質がどう出たか）"
    },
    "private": {
      "summary": "プライベート面の動き（100〜150文字）",
      "patterns": "プライベートの思考・行動パターン（80〜120文字。貪狼の自由さや人間関係）"
    },
    "fortuneAlignment": "今月の運勢と実際の出来事の一致度（100〜150文字。月柱の影響がどう出ていたか、卯月なら注意を守れていたか）",
    "growthPoints": ["今月の成長・気づき1", "気づき2", "気づき3"]
  },
  "nextMonthGuide": {
    "overview": "来月の過ごし方（150〜200文字。暦データ＋今月のパターンを踏まえた具体策）",
    "workAdvice": "仕事で意識すること（100〜150文字。今月のパターンの活かし方・修正点）",
    "privateAdvice": "プライベートで意識すること（100〜150文字。2026年のプライベート運も考慮）",
    "keyDates": "注意すべき日程（卯日、吉日、スケジュールの組み方の指針）",
    "actionItems": ["具体的アクション1", "アクション2", "アクション3"]
  }
}`;

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${body.year}年${body.month}月の振り返りと、来月の過ごし方をまとめてください。`,
        },
      ],
    });

    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    let summaryData;
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
      summaryData = JSON.parse(jsonStr);
    } catch {
      console.error('[monthly-summary] Parse error:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      year: body.year,
      month: body.month,
      conversationCount: body.conversations.length,
      calendar: {
        monthGanZhi: fortuneFirst.monthGanZhi.full,
        isUMonth: fortuneFirst.caution.isUMonth,
      },
      ...summaryData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[monthly-summary] Error:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
