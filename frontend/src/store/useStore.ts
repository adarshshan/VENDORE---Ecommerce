import { create } from "zustand";
import type { User } from "../types/User";

interface StoreState {
  user: User | null;
  setUser: (user: User | null) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  logout: () => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  logout: () => set({ user: null }),
}));
