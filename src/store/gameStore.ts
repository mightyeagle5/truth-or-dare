import { create } from 'zustand'
import type { GameState, GameActions, GameMeta, PlayerSnapshot, Item, Level } from '../types'
import { createGameId } from '../lib/ids'
import { getProgressiveLevels, getNextProgressiveLevel } from '../lib/guards'
import { getRandomItem, getWildCardItem, getAvailableItems, getItemCounts } from '../lib/items'
import { 
  getGameHistory, 
  getGame,
  saveGame, 
  addGameToHistory, 
  removeGameFromHistory, 
  getPriorGameItems 
} from './storage'
import gameQuestions from '../data/game_questions.json'

const useGameStore = create<GameState & GameActions>((set, get) => ({
  // Initial state
  currentGame: null,
  currentItem: null,
  currentScreen: 'choice',
  gameHistory: [],
  items: gameQuestions as Item[],
  isWildCard: false,
  isLoading: false,
  error: null,

  // Game lifecycle
  startGame: (players: PlayerSnapshot[], level: Level, priorGameIds: string[]) => {
    const gameId = createGameId()
    const isProgressive = level === 'Progressive'
    const currentLevel = isProgressive ? 'Soft' : level as Exclude<Level, 'Progressive'>
    
    // Initialize player counters
    const playerCounters: Record<string, { consecutiveTruths: number; consecutiveDares: number }> = {}
    players.forEach(player => {
      playerCounters[player.id] = { consecutiveTruths: 0, consecutiveDares: 0 }
    })
    
    const game: GameMeta = {
      id: gameId,
      createdAt: Date.now(),
      players,
      selectedLevel: level,
      priorGameIds,
      currentLevel,
      isProgressive,
      turnIndex: 0,
      totalTurnsAtCurrentLevel: 0,
      usedItems: [],
      respectPriorGames: true,
      playerCounters
    }

    // Save game and add to history
    saveGame(game)
    addGameToHistory(gameId, game.createdAt)

    set({
      currentGame: game,
      currentScreen: 'choice',
      error: null
    })

    return gameId
  },

  loadGame: (gameId: string) => {
    const game = get().currentGame
    if (game?.id === gameId) return

    set({ isLoading: true, error: null })
    
    try {
      const loadedGame = getGame(gameId)
      if (loadedGame) {
        // Initialize playerCounters if not present (for existing games)
        if (!loadedGame.playerCounters) {
          const playerCounters: Record<string, { consecutiveTruths: number; consecutiveDares: number }> = {}
          loadedGame.players.forEach(player => {
            playerCounters[player.id] = { consecutiveTruths: 0, consecutiveDares: 0 }
          })
          loadedGame.playerCounters = playerCounters
          saveGame(loadedGame)
        }

        set({ 
          currentGame: loadedGame, 
          currentScreen: 'choice',
          isLoading: false 
        })
      } else {
        set({ 
          error: 'Game not found', 
          isLoading: false 
        })
      }
    } catch (error) {
      set({ 
        error: 'Failed to load game', 
        isLoading: false 
      })
    }
  },

  exitGame: () => {
    const game = get().currentGame
    if (game) {
      saveGame(game)
    }
    
    set({
      currentGame: null,
      currentItem: null,
      currentScreen: 'choice'
    })
  },

  // Gameplay
  pickItem: (kind: ItemKind) => {
    const { currentGame, items } = get()
    if (!currentGame) return

    const priorGameItems = currentGame.respectPriorGames 
      ? getPriorGameItems(currentGame.priorGameIds) 
      : []

    const availableItems = getAvailableItems(
      items,
      currentGame.currentLevel,
      kind,
      currentGame.usedItems,
      priorGameItems
    )

    const selectedItem = getRandomItem(availableItems)
    if (!selectedItem) return

    set({
      currentItem: selectedItem,
      currentScreen: 'item',
      isWildCard: false
    })
  },

  pickWildCard: () => {
    const { currentGame, items } = get()
    if (!currentGame) return

    const priorGameItems = currentGame.respectPriorGames 
      ? getPriorGameItems(currentGame.priorGameIds) 
      : []

    const wildItem = getWildCardItem(
      items,
      currentGame.currentLevel,
      currentGame.usedItems,
      priorGameItems
    )

    if (!wildItem) return

    set({
      currentItem: wildItem,
      currentScreen: 'item',
      isWildCard: true
    })
  },

  skipItem: () => {
    const { currentGame, currentItem } = get()
    if (!currentGame || !currentItem) return

    const updatedGame = {
      ...currentGame,
      usedItems: [...currentGame.usedItems, currentItem.id],
      totalTurnsAtCurrentLevel: currentGame.totalTurnsAtCurrentLevel + 1
    }

    saveGame(updatedGame)

    set({
      currentGame: updatedGame,
      currentItem: null,
      currentScreen: 'choice',
      isWildCard: false
    })
  },

  completeItem: () => {
    const { currentGame, currentItem, items } = get()
    if (!currentGame || !currentItem) return

    const currentPlayerId = currentGame.players[currentGame.turnIndex].id
    const currentCounters = currentGame.playerCounters[currentPlayerId]
    
    // Check if one type is exhausted
    const priorGameItems = currentGame.respectPriorGames ? getPriorGameItems(currentGame.priorGameIds) : []
    const counts = getItemCounts(items, currentGame.currentLevel, currentGame.usedItems, priorGameItems)
    const truthExhausted = counts.truth === 0
    const dareExhausted = counts.dare === 0
    
    // Update counters: increment the completed type, reset the other
    // But don't increment if the other type is exhausted (consecutive rule disabled)
    const updatedCounters = {
      ...currentGame.playerCounters,
      [currentPlayerId]: {
        consecutiveTruths: currentItem.kind === 'truth' && !dareExhausted ? currentCounters.consecutiveTruths + 1 : 0,
        consecutiveDares: currentItem.kind === 'dare' && !truthExhausted ? currentCounters.consecutiveDares + 1 : 0
      }
    }

    const updatedGame = {
      ...currentGame,
      usedItems: [...currentGame.usedItems, currentItem.id],
      turnIndex: (currentGame.turnIndex + 1) % currentGame.players.length,
      totalTurnsAtCurrentLevel: currentGame.totalTurnsAtCurrentLevel + 1,
      playerCounters: updatedCounters
    }

    saveGame(updatedGame)

    set({
      currentGame: updatedGame,
      currentItem: null,
      currentScreen: 'choice',
      isWildCard: false
    })
  },

  completeWildCard: () => {
    const { currentGame, currentItem } = get()
    if (!currentGame || !currentItem) return

    const currentPlayerId = currentGame.players[currentGame.turnIndex].id
    
    // Reset counters for wild card completion
    const updatedCounters = {
      ...currentGame.playerCounters,
      [currentPlayerId]: {
        consecutiveTruths: 0,
        consecutiveDares: 0
      }
    }

    const updatedGame = {
      ...currentGame,
      usedItems: [...currentGame.usedItems, currentItem.id],
      turnIndex: (currentGame.turnIndex + 1) % currentGame.players.length,
      totalTurnsAtCurrentLevel: currentGame.totalTurnsAtCurrentLevel + 1,
      playerCounters: updatedCounters
    }

    saveGame(updatedGame)

    set({
      currentGame: updatedGame,
      currentItem: null,
      currentScreen: 'choice',
      isWildCard: false
    })
  },

  goNextLevel: () => {
    const { currentGame } = get()
    if (!currentGame || !currentGame.isProgressive) return

    const nextLevel = getNextProgressiveLevel(currentGame.currentLevel)
    if (!nextLevel) return

    // Reset consecutive counters for all players when advancing level
    const resetCounters: Record<string, { consecutiveTruths: number; consecutiveDares: number }> = {}
    currentGame.players.forEach(player => {
      resetCounters[player.id] = { consecutiveTruths: 0, consecutiveDares: 0 }
    })

    const updatedGame = {
      ...currentGame,
      currentLevel: nextLevel,
      totalTurnsAtCurrentLevel: 0,
      playerCounters: resetCounters
    }

    saveGame(updatedGame)

    set({
      currentGame: updatedGame,
      currentScreen: 'choice'
    })
  },

  // Settings
  toggleRespectPriorGames: (respect: boolean) => {
    const { currentGame } = get()
    if (!currentGame) return

    const updatedGame = {
      ...currentGame,
      respectPriorGames: respect
    }

    saveGame(updatedGame)

    set({ currentGame: updatedGame })
  },

  // History management
  removeGameFromHistory: (gameId: string) => {
    removeGameFromHistory(gameId)
    const history = getGameHistory()
    set({ gameHistory: history })
  },

  // Data loading
  loadItems: () => {
    // Load from the JSON file
    set({ items: gameQuestions as Item[] })
  },

  loadGameHistory: () => {
    const history = getGameHistory()
    set({ gameHistory: history })
  }
}))

export { useGameStore }
export default useGameStore
