// --- Conversation Categories ---

export type ConversationCategory =
  | 'business-mcreate'
  | 'business-jyb'
  | 'private'
  | 'health'
  | 'partnership'
  | 'general';

// --- Database Entity Types ---

export interface Conversation {
  id?: number;
  title: string;
  category: ConversationCategory;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id?: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  references?: KnowledgeReference[];
  createdAt: Date;
}

export interface DailyAdviceCache {
  date: string; // YYYY-MM-DD (primary key)
  advice: DailyAdvice;
  generatedAt: Date;
}

export interface Bookmark {
  id?: number;
  messageId: number;
  conversationId: number;
  note?: string;
  createdAt: Date;
}

export interface Settings {
  key: string; // primary key
  value: string;
}

// --- Domain Types ---

export interface DailyAdvice {
  date: string;
  lunarDate: string;
  overallFortune: string;
  workFortune: {
    mCreate: string;
    jyBee: string;
  };
  privateFortune: string;
  luckyDirection: string;
  luckyColor: string;
  luckyItem: string;
  generatedAt: string;
}

export interface KnowledgeReference {
  source: string;
  label: string;
  relevanceScore: number;
  excerpt: string;
}

export interface ProfileData {
  basicInfo: {
    name: string;
    birthDate: string;
    lunarDate: string;
    gender: string;
    yinYang: string;
    fiveElementBureau: string;
    meiShu: string;
    shinShu: string;
    meiKyu: {
      palace: string;
      stars: string[];
    };
  };
  traits: Trait[];
  currentDaigen: DaigenInfo;
  yearFortune: YearFortuneInfo;
  actionGuidelines: string[];
}

export interface Trait {
  icon: string;
  title: string;
  description: string;
  relatedStar: string;
}

export interface DaigenInfo {
  ageRange: string;
  theme: string;
  description: string;
}

export interface YearFortuneInfo {
  year: number;
  highlights: string[];
  cautions: string[];
}
