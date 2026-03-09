/**
 * POST /api/conversations - メッセージをサーバーに保存
 * GET  /api/conversations?year=2026&month=3 - 月別会話データを取得
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveMessage, getMonthConversations } from '@/lib/server/conversations';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { conversationId, title, category, role, content } = body;

    if (!conversationId || !role || !content) {
      return NextResponse.json(
        { error: 'conversationId, role, content are required' },
        { status: 400 }
      );
    }

    await saveMessage({
      conversationId: String(conversationId),
      title: title || '無題',
      category: category || 'general',
      role,
      content,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[conversations] Save error:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '');
    const month = parseInt(searchParams.get('month') || '');

    if (!year || !month) {
      return NextResponse.json(
        { error: 'year and month are required' },
        { status: 400 }
      );
    }

    const conversations = await getMonthConversations(year, month);

    return NextResponse.json({
      year,
      month,
      conversationCount: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error('[conversations] Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
