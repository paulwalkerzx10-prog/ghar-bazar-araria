import { create } from 'zustand';

interface UserState {
  phoneNumber: string | null;
  setPhoneNumber: (phone: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  phoneNumber: null,
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
}));
