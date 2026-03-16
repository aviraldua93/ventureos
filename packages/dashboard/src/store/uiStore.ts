import { create } from 'zustand';

interface UIStore {
  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedAgentId: null,
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),
}));
