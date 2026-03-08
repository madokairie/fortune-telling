/**
 * ナレッジファイル読み込み & 簡易キーワード検索
 *
 * 本格的なベクトルDBによるRAGは後続フェーズで実装。
 * 現時点ではテキストベースのキーワードマッチングで関連チャンクを返す。
 */

import { readFile } from 'fs/promises';
import path from 'path';

/** ナレッジチャンク */
export interface KnowledgeChunk {
  /** チャンクテキスト */
  text: string;
  /** ソースファイル名 */
  source: string;
  /** チャンクインデックス */
  index: number;
}

/** 検索結果 */
export interface KnowledgeSearchResult {
  /** チャンクテキスト */
  text: string;
  /** ソースファイル名 */
  source: string;
  /** 関連度スコア (0〜1) */
  score: number;
}

// ナレッジファイルのベースディレクトリ
const KNOWLEDGE_DIR = path.join(process.cwd(), 'data', 'knowledge');

// チャンクサイズ（文字数ベース。トークンベースは後で改善）
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 200;

// メモリキャッシュ
let cachedChunks: KnowledgeChunk[] | null = null;

/**
 * テキストをチャンクに分割する
 *
 * @param text - 分割対象テキスト
 * @param source - ソースファイル名
 * @returns チャンク配列
 */
function splitIntoChunks(text: string, source: string): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    const chunkText = text.slice(start, end).trim();

    if (chunkText.length > 0) {
      chunks.push({ text: chunkText, source, index });
      index++;
    }

    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
}

/**
 * ナレッジファイルを読み込んでチャンクに分割する
 *
 * @returns 全ナレッジチャンク
 */
async function loadKnowledgeChunks(): Promise<KnowledgeChunk[]> {
  if (cachedChunks) {
    return cachedChunks;
  }

  const files = [
    'kantei-transcript-full.txt',
    'fudosan-kantei.md',
    // meiban-core.md はシステムプロンプトに常時ロードされるため除外
  ];

  const allChunks: KnowledgeChunk[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(KNOWLEDGE_DIR, file);
      const content = await readFile(filePath, 'utf-8');
      const chunks = splitIntoChunks(content, file);
      allChunks.push(...chunks);
    } catch (error) {
      console.warn(`[knowledge] Failed to load ${file}:`, error);
    }
  }

  cachedChunks = allChunks;
  return allChunks;
}

/**
 * キーワードベースの簡易スコアリング
 *
 * クエリを形態素に分割（簡易的にスペース区切り + 2文字以上のN-gram）し、
 * 各チャンク内の出現頻度をスコア化する。
 *
 * @param query - 検索クエリ
 * @param chunk - 検索対象チャンク
 * @returns 0〜1 のスコア
 */
function scoreChunk(query: string, chunk: string): number {
  const normalizedQuery = query.toLowerCase();
  const normalizedChunk = chunk.toLowerCase();

  // クエリをキーワードに分割（スペース、句読点で分割し、2文字以上を採用）
  const keywords = normalizedQuery
    .split(/[\s、。,.!?！？・\n]+/)
    .filter((k) => k.length >= 2);

  if (keywords.length === 0) {
    return 0;
  }

  let matchCount = 0;
  let totalWeight = 0;

  for (const keyword of keywords) {
    const occurrences = normalizedChunk.split(keyword).length - 1;
    if (occurrences > 0) {
      // キーワードの長さに比例した重み
      const weight = Math.min(keyword.length / 4, 1);
      matchCount += weight * Math.min(occurrences, 3); // 最大3回までカウント
      totalWeight += weight;
    } else {
      totalWeight += Math.min(keyword.length / 4, 1);
    }
  }

  if (totalWeight === 0) {
    return 0;
  }

  return Math.min(matchCount / totalWeight, 1);
}

/**
 * ナレッジを検索する
 *
 * 簡易的なキーワードマッチングで関連チャンクを返す。
 * 本格的なベクトル検索は後続フェーズで実装予定。
 *
 * @param query - 検索クエリ
 * @param limit - 返却件数上限（デフォルト: 5）
 * @returns 関連テキストの配列
 */
export async function searchKnowledge(
  query: string,
  limit: number = 5
): Promise<string[]> {
  const chunks = await loadKnowledgeChunks();

  const scored: KnowledgeSearchResult[] = chunks.map((chunk) => ({
    text: chunk.text,
    source: chunk.source,
    score: scoreChunk(query, chunk.text),
  }));

  // スコア降順でソートし、閾値以上のもののみ返す
  const threshold = 0.1;
  const results = scored
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return results.map(
    (r) => `[出典: ${r.source} / 関連度: ${(r.score * 100).toFixed(0)}%]\n${r.text}`
  );
}

/**
 * ナレッジ検索（詳細結果付き）
 *
 * @param query - 検索クエリ
 * @param limit - 返却件数上限
 * @returns 検索結果の詳細配列
 */
export async function searchKnowledgeDetailed(
  query: string,
  limit: number = 5
): Promise<KnowledgeSearchResult[]> {
  const chunks = await loadKnowledgeChunks();

  const scored: KnowledgeSearchResult[] = chunks.map((chunk) => ({
    text: chunk.text,
    source: chunk.source,
    score: scoreChunk(query, chunk.text),
  }));

  const threshold = 0.1;
  return scored
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * キャッシュをクリアする（テスト用）
 */
export function clearKnowledgeCache(): void {
  cachedChunks = null;
}
