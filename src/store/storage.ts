import type { GameMeta, GameHistoryEntry } from '../types'
import { STORAGE_KEYS } from '../lib/constants'

export const getGameHistory = (): GameHistoryEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAMES)
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    
    const filtered = parsed.filter((entry: any) => {
      if (!entry || typeof entry.id !== 'string' || typeof entry.createdAt !== 'number') {
        return false
      }
      
      // Check if this is a custom game by looking at the actual game data
      try {
        const gameData = localStorage.getItem(`${STORAGE_KEYS.GAME_PREFIX}${entry.id}`)
        if (gameData) {
          const game = JSON.parse(gameData) as GameMeta
          if (game.isCustomGame) {
            // Remove custom game from localStorage and history
            localStorage.removeItem(`${STORAGE_KEYS.GAME_PREFIX}${entry.id}`)
            return false // Exclude custom games
          }
        }
      } catch {
        // If we can't parse the game data, include it (it's probably an old game)
      }
      
      return true
    })
    
    // Update the history in localStorage to remove any custom games
    if (filtered.length !== parsed.length) {
      saveGameHistory(filtered)
    }
    
    // Sort by creation date (most recent first)
    return filtered.sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return []
  }
}

export const saveGameHistory = (history: GameHistoryEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save game history:', error)
  }
}

export const getGame = (gameId: string): GameMeta | null => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEYS.GAME_PREFIX}${gameId}`)
    if (!stored) return null
    
    const parsed = JSON.parse(stored)
    return parsed
  } catch {
    return null
  }
}

export const saveGame = (game: GameMeta): void => {
  try {
    localStorage.setItem(`${STORAGE_KEYS.GAME_PREFIX}${game.id}`, JSON.stringify(game))
  } catch (error) {
    console.error('Failed to save game:', error)
  }
}

export const addGameToHistory = (gameId: string, createdAt: number): void => {
  const history = getGameHistory()
  const existingIndex = history.findIndex(entry => entry.id === gameId)
  
  if (existingIndex === -1) {
    history.unshift({ id: gameId, createdAt })
    saveGameHistory(history)
  }
}

export const removeGameFromHistory = (gameId: string): void => {
  const history = getGameHistory()
  const filtered = history.filter(entry => entry.id !== gameId)
  saveGameHistory(filtered)
}

export const getPriorGameItems = (priorGameIds: string[]): string[] => {
  const allUsedItems: string[] = []
  
  priorGameIds.forEach(gameId => {
    const game = getGame(gameId)
    if (game) {
      allUsedItems.push(...game.usedItems)
    }
  })
  
  return allUsedItems
}

export const cleanupCustomGames = (): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAMES)
    if (!stored) return
    
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return
    
    const customGameIds: string[] = []
    
    // Find all custom game IDs
    parsed.forEach((entry: any) => {
      if (entry && typeof entry.id === 'string') {
        try {
          const gameData = localStorage.getItem(`${STORAGE_KEYS.GAME_PREFIX}${entry.id}`)
          if (gameData) {
            const game = JSON.parse(gameData) as GameMeta
            if (game.isCustomGame) {
              customGameIds.push(entry.id)
            }
          }
        } catch {
          // Ignore parsing errors
        }
      }
    })
    
    // Remove custom games from localStorage
    customGameIds.forEach(gameId => {
      localStorage.removeItem(`${STORAGE_KEYS.GAME_PREFIX}${gameId}`)
    })
    
    // Remove custom games from history
    const filteredHistory = parsed.filter((entry: any) => !customGameIds.includes(entry.id))
    if (filteredHistory.length !== parsed.length) {
      saveGameHistory(filteredHistory)
    }
  } catch (error) {
    console.error('Failed to cleanup custom games:', error)
  }
}
