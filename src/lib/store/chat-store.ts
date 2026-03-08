import { create } from 'zustand';
import type { ConversationCategory } from '@/lib/types';

interface ChatState {
  currentConversationId: number | null;
  isStreaming: boolean;
  streamingContent: string;
  category: ConversationCategory;

  setConversation: (id: number | null) => void;
  setStreaming: (streaming: boolean) => void;
  appendStreamContent: (chunk: string) => void;
  clearStreamContent: () => void;
  setCategory: (category: ConversationCategory) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentConversationId: null,
  isStreaming: false,
  streamingContent: '',
  category: 'general',

  setConversation: (id) => set({ currentConversationId: id }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  appendStreamContent: (chunk) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),

  clearStreamContent: () => set({ streamingContent: '' }),

  setCategory: (category) => set({ category }),
}));
