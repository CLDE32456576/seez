import { create } from 'zustand'
import { api } from '../lib/api'

export const useUserStore = create((set, get) => ({
  card: null,
  profile: null,
  loading: false,

  fetchCard: async (userId) => {
    set({ loading: true })
    try {
      const card = await api.getCard(userId)
      set({ card, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  updateCard: (updates) => set((state) => ({ card: { ...state.card, ...updates } })),
}))
