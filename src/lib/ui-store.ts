import { create } from "@/lib/brand-store";

export type Theme = "light" | "dark";

type UIState = {
  theme: Theme;
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  aiAssistantOpen: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setSidebarOpen: (v: boolean) => void;
  toggleAiAssistant: () => void;
  setAiAssistantOpen: (v: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  theme: "light",
  sidebarCollapsed: false,
  sidebarOpen: false,
  aiAssistantOpen: false,
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleAiAssistant: () => set((s) => ({ aiAssistantOpen: !s.aiAssistantOpen })),
  setAiAssistantOpen: (aiAssistantOpen) => set({ aiAssistantOpen }),
}));
