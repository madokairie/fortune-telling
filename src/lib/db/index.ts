import Dexie, { type EntityTable } from 'dexie';
import type {
  Conversation,
  Message,
  DailyAdviceCache,
  Bookmark,
  Settings,
} from '@/lib/types';

const db = new Dexie('FortuneTellingDB') as Dexie & {
  conversations: EntityTable<Conversation, 'id'>;
  messages: EntityTable<Message, 'id'>;
  dailyAdviceCache: EntityTable<DailyAdviceCache, 'date'>;
  bookmarks: EntityTable<Bookmark, 'id'>;
  settings: EntityTable<Settings, 'key'>;
};

db.version(1).stores({
  conversations: '++id, createdAt, category, title',
  messages: '++id, conversationId, role, createdAt, [conversationId+createdAt]',
  dailyAdviceCache: 'date, generatedAt',
  bookmarks: '++id, messageId, conversationId, createdAt',
  settings: 'key',
});

export { db };
