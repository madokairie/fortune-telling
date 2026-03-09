/**
 * GET /api/monthly-summary/saved?year=2026&month=3
 *
 * 保存済みの月間まとめを返す。なければ null。
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMonthlySummary } from '@/lib/server/conversations';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || '');
  const month = parseInt(searchParams.get('month') || '');

  if (!year || !month) {
    return NextResponse.json(null);
  }

  const summary = await getMonthlySummary(year, month);
  return NextResponse.json(summary);
}
