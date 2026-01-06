import { create } from 'zustand'

export type Screen = 'choice' | 'item'

interface UIState {
  currentScreen: Screen
  isLoading: boolean
  error: string | null
  toast: string | null
}

interface UIActions {
  setCurrentScreen: (screen: Screen) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setToast: (message: string | null) => void
  resetUI: () => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  currentScreen: 'choice',
  isLoading: false,
  error: null,
  toast: null,

  // Actions
  setCurrentScreen: (screen: Screen) => set({ currentScreen: screen }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  setToast: (message: string | null) => set({ toast: message }),
  resetUI: () => set({ 
    currentScreen: 'choice', 
    isLoading: false, 
    error: null,
    toast: null
  })
}))

export default useUIStore
