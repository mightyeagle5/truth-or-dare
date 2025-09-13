import { describe, it, expect, beforeEach } from 'vitest'
import { 
  getGameHistory, 
  saveGameHistory, 
  getGame, 
  saveGame,
  addGameToHistory,
  removeGameFromHistory,
  getPriorGameItems
} from '../store/storage'
import type { GameMeta, GameHistoryEntry } from '../types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Local Storage', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('should save and retrieve game history', () => {
    const history: GameHistoryEntry[] = [
      { id: 'game1', createdAt: Date.now() },
      { id: 'game2', createdAt: Date.now() - 1000 }
    ]

    saveGameHistory(history)
    const retrieved = getGameHistory()

    expect(retrieved).toHaveLength(2)
    expect(retrieved[0].id).toBe('game1')
  })

  it('should sort game history by creation date (most recent first)', () => {
    const now = Date.now()
    const history: GameHistoryEntry[] = [
      { id: 'oldest', createdAt: now - 2000 },
      { id: 'newest', createdAt: now },
      { id: 'middle', createdAt: now - 1000 }
    ]

    saveGameHistory(history)
    const retrieved = getGameHistory()

    expect(retrieved[0].id).toBe('newest')
    expect(retrieved[1].id).toBe('middle')
    expect(retrieved[2].id).toBe('oldest')
  })

  it('should save and retrieve individual games', () => {
    const game: GameMeta = {
      id: 'test-game',
      createdAt: Date.now(),
      players: [{ id: 'p1', name: 'Player 1', gender: 'male' }],
      selectedLevel: 'Soft',
      priorGameIds: [],
      currentLevel: 'Soft',
      isProgressive: false,
      turnIndex: 0,
      totalTurnsAtCurrentLevel: 0,
      usedItems: [],
      respectPriorGames: true
    }

    saveGame(game)
    const retrieved = getGame('test-game')

    expect(retrieved).toEqual(game)
  })

  it('should add games to history', () => {
    const gameId = 'new-game'
    const createdAt = Date.now()

    addGameToHistory(gameId, createdAt)
    const history = getGameHistory()

    expect(history).toHaveLength(1)
    expect(history[0].id).toBe(gameId)
    expect(history[0].createdAt).toBe(createdAt)
  })

  it('should remove games from history', () => {
    const history: GameHistoryEntry[] = [
      { id: 'game1', createdAt: Date.now() },
      { id: 'game2', createdAt: Date.now() - 1000 }
    ]

    saveGameHistory(history)
    removeGameFromHistory('game1')
    const retrieved = getGameHistory()

    expect(retrieved).toHaveLength(1)
    expect(retrieved[0].id).toBe('game2')
  })

  it('should collect prior game items', () => {
    const game1: GameMeta = {
      id: 'game1',
      createdAt: Date.now(),
      players: [],
      selectedLevel: 'Soft',
      priorGameIds: [],
      currentLevel: 'Soft',
      isProgressive: false,
      turnIndex: 0,
      totalTurnsAtCurrentLevel: 0,
      usedItems: ['item1', 'item2'],
      respectPriorGames: true
    }

    const game2: GameMeta = {
      id: 'game2',
      createdAt: Date.now(),
      players: [],
      selectedLevel: 'Soft',
      priorGameIds: [],
      currentLevel: 'Soft',
      isProgressive: false,
      turnIndex: 0,
      totalTurnsAtCurrentLevel: 0,
      usedItems: ['item3'],
      respectPriorGames: true
    }

    saveGame(game1)
    saveGame(game2)

    const priorItems = getPriorGameItems(['game1', 'game2'])
    expect(priorItems).toContain('item1')
    expect(priorItems).toContain('item2')
    expect(priorItems).toContain('item3')
    expect(priorItems).toHaveLength(3)
  })
})
