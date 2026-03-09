/**
 * サーバーサイド会話データ永続化
 *
 * チャットの会話をJSONファイルとしてサーバーのファイルシステムに保存する。
 * IndexedDBと併用し、データの永続性を担保する。
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'conversations');

interface ServerMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface ServerConversation {
  id: string;
  title: string;
  category: string;
  messages: ServerMessage[];
  createdAt: string;
  updatedAt: string;
}

/** 月別ファイルパスを返す (data/conversations/2026-03.json) */
function getMonthFilePath(date: string): string {
  const monthKey = date.slice(0, 7); // "2026-03"
  return path.join(DATA_DIR, `${monthKey}.json`);
}

/** 月別の全会話を読み込む */
async function loadMonthData(monthKey: string): Promise<ServerConversation[]> {
  const filePath = path.join(DATA_DIR, `${monthKey}.json`);
  if (!existsSync(filePath)) return [];
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 月別の全会話を保存する */
async function saveMonthData(monthKey: string, data: ServerConversation[]): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  const filePath = path.join(DATA_DIR, `${monthKey}.json`);
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/** 今日の日付キーをJSTで取得 */
function getTodayJST(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
}

/**
 * 会話にメッセージを追加保存する
 * 会話が存在しなければ新規作成する
 */
export async function saveMessage(params: {
  conversationId: string;
  title: string;
  category: string;
  role: 'user' | 'assistant';
  content: string;
}): Promise<void> {
  const now = getTodayJST();
  const monthKey = now.slice(0, 7);
  const conversations = await loadMonthData(monthKey);

  const existing = conversations.find((c) => c.id === params.conversationId);

  if (existing) {
    existing.messages.push({
      role: params.role,
      content: params.content,
      createdAt: new Date().toISOString(),
    });
    existing.updatedAt = new Date().toISOString();
  } else {
    conversations.push({
      id: params.conversationId,
      title: params.title,
      category: params.category,
      messages: [
        {
          role: params.role,
          content: params.content,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  await saveMonthData(monthKey, conversations);
}

/**
 * 指定月の全会話を取得する（まとめ機能用）
 */
export async function getMonthConversations(
  year: number,
  month: number
): Promise<ServerConversation[]> {
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  return loadMonthData(monthKey);
}

/**
 * 保存済みの月一覧を取得する
 */
export async function getAvailableMonths(): Promise<string[]> {
  if (!existsSync(DATA_DIR)) return [];
  const { readdir } = await import('fs/promises');
  const files = await readdir(DATA_DIR);
  return files
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
    .sort()
    .reverse();
}

// ============================================================
// 月間まとめの永続化
// ============================================================

const SUMMARIES_DIR = path.join(process.cwd(), 'data', 'summaries');

/**
 * 月間まとめを保存する
 */
export async function saveMonthlySummary(
  year: number,
  month: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summary: any
): Promise<void> {
  if (!existsSync(SUMMARIES_DIR)) {
    await mkdir(SUMMARIES_DIR, { recursive: true });
  }
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const filePath = path.join(SUMMARIES_DIR, `${monthKey}.json`);
  await writeFile(filePath, JSON.stringify(summary, null, 2), 'utf-8');
}

/**
 * 保存済みの月間まとめを取得する
 */
export async function getMonthlySummary(
  year: number,
  month: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null> {
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const filePath = path.join(SUMMARIES_DIR, `${monthKey}.json`);
  if (!existsSync(filePath)) return null;
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
