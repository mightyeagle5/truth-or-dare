import { create } from 'zustand'
import type { GameMeta } from '../types'
import { saveGame } from './storage'

interface SettingsState {
  respectPriorGames: boolean
}

interface SettingsActions {
  toggleRespectPriorGames: (respect: boolean, currentGame: GameMeta | null) => void
  updateGameSetting: (game: GameMeta, setting: keyof GameMeta, value: any) => void
}

type SettingsStore = SettingsState & SettingsActions

export const useSettingsStore = create<SettingsStore>((set) => ({
  // Initial state
  respectPriorGames: true,

  // Actions
  toggleRespectPriorGames: (respect: boolean, currentGame: GameMeta | null) => {
    if (!currentGame) return

    const updatedGame = {
      ...currentGame,
      respectPriorGames: respect
    }

    saveGame(updatedGame)
    set({ respectPriorGames: respect })
  },

  updateGameSetting: (game: GameMeta, setting: keyof GameMeta, value: any) => {
    const updatedGame = {
      ...game,
      [setting]: value
    }

    saveGame(updatedGame)
  }
}))

export default useSettingsStore
