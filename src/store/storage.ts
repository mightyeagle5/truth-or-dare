import type { GameMeta, GameHistoryEntry } from '../types'
import { STORAGE_KEYS } from '../lib/constants'

export const getGameHistory = (): GameHistoryEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAMES)
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    
    const filtered = parsed.filter((entry: any) => 
      entry && 
      typeof entry.id === 'string' && 
      typeof entry.createdAt === 'number'
    )
    
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
