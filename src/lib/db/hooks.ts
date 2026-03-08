'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './index';
import type {
  Conversation,
  Message,
  DailyAdviceCache,
  Bookmark,
} from '@/lib/types';

/**
 * 会話一覧を作成日時の降順で取得する
 */
export function useConversations(): Conversation[] | undefined {
  return useLiveQuery(
    () => db.conversations.orderBy('createdAt').reverse().toArray()
  );
}

/**
 * 特定の会話に属するメッセージを時系列順で取得する
 */
export function useMessages(
  conversationId: number | null
): Message[] | undefined {
  return useLiveQuery(
    () => {
      if (conversationId === null) return [];
      return db.messages
        .where('conversationId')
        .equals(conversationId)
        .sortBy('createdAt');
    },
    [conversationId]
  );
}

/**
 * 指定日付のアドバイスキャッシュを取得する
 */
export function useDailyAdvice(
  date: string
): DailyAdviceCache | undefined | null {
  return useLiveQuery(
    () => db.dailyAdviceCache.get(date),
    [date]
  );
}

/**
 * ブックマーク一覧を作成日時の降順で取得する
 */
export function useBookmarks(): Bookmark[] | undefined {
  return useLiveQuery(
    () => db.bookmarks.orderBy('createdAt').reverse().toArray()
  );
}
