import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DevState {
  isDevMode: boolean
  disableGameSaving: boolean
}

interface DevActions {
  setDevMode: (isDev: boolean) => void
  setDisableGameSaving: (disable: boolean) => void
}

type DevStore = DevState & DevActions

export const useDevStore = create<DevStore>()(
  persist(
    (set) => ({
      // Initial state
      isDevMode: import.meta.env.DEV,
      disableGameSaving: false,

      // Actions
      setDevMode: (isDev: boolean) => set({ isDevMode: isDev }),
      setDisableGameSaving: (disable: boolean) => set({ disableGameSaving: disable }),
    }),
    {
      name: 'tod-dev-settings',
      // Only persist in development
      skipHydration: !import.meta.env.DEV,
    }
  )
)

export default useDevStore
