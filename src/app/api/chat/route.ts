/**
 * POST /api/chat
 *
 * AI相談チャットエンドポイント
 * Claude API (claude-sonnet-4-6) でストリーミングレスポンスを返す
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildPrompt } from '@/lib/ai/system-prompt';
import { searchKnowledge } from '@/lib/ai/knowledge';

/** リクエストボディの型 */
interface ChatRequestBody {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  category?: 'mcreate' | 'jybee' | 'private' | 'general';
}

/** SSEイベントの型 */
interface SSEEvent {
  type: 'text' | 'references' | 'done' | 'error';
  content?: string;
  references?: Array<{
    source: string;
    label: string;
    excerpt: string;
  }>;
}

function formatSSEEvent(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: NextRequest): Promise<Response> {
  // APIキーの確認
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured' },
      { status: 500 }
    );
  }

  // リクエストボディのパース
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  // バリデーション
  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      { error: 'messages array is required and must not be empty' },
      { status: 400 }
    );
  }

  // 最後のユーザーメッセージでRAG検索
  const lastUserMessage = [...body.messages]
    .reverse()
    .find((m) => m.role === 'user');

  let ragContext: string | undefined;
  let ragResults: string[] = [];

  if (lastUserMessage) {
    try {
      ragResults = await searchKnowledge(lastUserMessage.content, 3);
      if (ragResults.length > 0) {
        ragContext = ragResults.join('\n\n---\n\n');
      }
    } catch (error) {
      console.warn('[chat] RAG search failed:', error);
    }
  }

  // システムプロンプト構築
  const systemPrompt = buildPrompt(body.category, ragContext);

  // Anthropic クライアント初期化
  const client = new Anthropic({ apiKey });

  // ストリーミングレスポンスを構築
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        // Claude API ストリーミング呼び出し
        const messageStream = client.messages.stream({
          model: 'claude-sonnet-4-6-20250514',
          max_tokens: 2048,
          system: systemPrompt,
          messages: body.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        // テキストイベントをストリーミング送信
        messageStream.on('text', (text) => {
          const event: SSEEvent = { type: 'text', content: text };
          controller.enqueue(encoder.encode(formatSSEEvent(event)));
        });

        // ストリーミング完了を待つ
        await messageStream.finalMessage();

        // 参照情報を送信（RAG結果があれば）
        if (ragResults.length > 0) {
          const references = ragResults.map((r) => {
            const sourceMatch = r.match(/\[出典: (.+?) \//);
            const source = sourceMatch ? sourceMatch[1] : 'unknown';
            // ソースファイル名からラベルを生成
            const label = source === 'kantei-transcript-full.txt'
              ? 'プロ鑑定(2025/11)'
              : source === 'fudosan-kantei.md'
                ? '不動産鑑定データ'
                : source;
            // 最初の100文字を抜粋
            const textStart = r.indexOf('\n');
            const excerpt = textStart >= 0
              ? r.slice(textStart + 1, textStart + 101)
              : r.slice(0, 100);

            return { source, label, excerpt };
          });

          const refEvent: SSEEvent = { type: 'references', references };
          controller.enqueue(encoder.encode(formatSSEEvent(refEvent)));
        }

        // 完了イベント
        const doneEvent: SSEEvent = { type: 'done' };
        controller.enqueue(encoder.encode(formatSSEEvent(doneEvent)));
      } catch (error) {
        console.error('[chat] Streaming error:', error);

        const errorMessage =
          error instanceof Anthropic.APIError
            ? `Claude API error: ${error.message}`
            : error instanceof Error
              ? error.message
              : 'Unknown error occurred';

        const errorEvent: SSEEvent = { type: 'error', content: errorMessage };
        controller.enqueue(encoder.encode(formatSSEEvent(errorEvent)));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
