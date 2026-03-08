import { create } from 'zustand';

interface AppState {
  theme: 'dark' | 'light';
  isSidebarOpen: boolean;

  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  isSidebarOpen: false,

  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
