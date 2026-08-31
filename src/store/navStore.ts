import { create } from 'zustand';

interface NavState {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (val: boolean) => void;
}

export const useNavStore = create<NavState>((set) => ({
  hasUnsavedChanges: false,
  setHasUnsavedChanges: (val) => set({ hasUnsavedChanges: val }),
}));
