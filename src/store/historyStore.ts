import { create } from 'zustand'
import type { GameHistoryEntry } from '../types'
import { 
  getGameHistory, 
  removeGameFromHistory as removeGameFromStorage,
  cleanupCustomGames
} from './storage'

interface HistoryState {
  gameHistory: GameHistoryEntry[]
}

interface HistoryActions {
  loadGameHistory: () => void
  removeGameFromHistory: (gameId: string) => void
  refreshHistory: () => void
}

type HistoryStore = HistoryState & HistoryActions

export const useHistoryStore = create<HistoryStore>((set) => ({
  // Initial state
  gameHistory: [],

  // Actions
  loadGameHistory: () => {
    // Clean up any existing custom games first
    cleanupCustomGames()
    const history = getGameHistory()
    set({ gameHistory: history })
  },

  removeGameFromHistory: (gameId: string) => {
    removeGameFromStorage(gameId)
    const history = getGameHistory()
    set({ gameHistory: history })
  },

  refreshHistory: () => {
    const history = getGameHistory()
    set({ gameHistory: history })
  }
}))

export default useHistoryStore
