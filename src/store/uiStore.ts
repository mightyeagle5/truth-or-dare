import { create } from 'zustand'

export type Screen = 'choice' | 'item'

interface UIState {
  currentScreen: Screen
  isLoading: boolean
  error: string | null
}

interface UIActions {
  setCurrentScreen: (screen: Screen) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetUI: () => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  currentScreen: 'choice',
  isLoading: false,
  error: null,

  // Actions
  setCurrentScreen: (screen: Screen) => set({ currentScreen: screen }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  resetUI: () => set({ 
    currentScreen: 'choice', 
    isLoading: false, 
    error: null 
  })
}))

export default useUIStore
