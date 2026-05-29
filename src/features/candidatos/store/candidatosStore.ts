import { create } from 'zustand'

type CandidatosStore = {
  nuevosCount: number
  setNuevosCount: (count: number) => void
}

export const useCandidatosStore = create<CandidatosStore>((set) => ({
  nuevosCount: 0,
  setNuevosCount: (count) => set({ nuevosCount: count }),
}))
