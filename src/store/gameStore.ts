import { create } from 'zustand'
import type { GameState, GameActions, GameMeta, PlayerSnapshot, Item, Level, CustomChallenge, ItemKind } from '../types'
import { createGameId } from '../lib/ids'
import { getNextProgressiveLevel, getNextCustomProgressiveLevel, getCustomProgressiveLevels } from '../lib/guards'
import { getRandomItem, getWildCardItem, getAvailableItems, getItemCounts } from '../lib/items'
import { substitutePlayerNames, selectTargetPlayer } from '../lib/playerSubstitution'
import { 
  getGame,
  saveGame, 
  addGameToHistory, 
  getPriorGameItems 
} from './storage'
import { useUIStore } from './uiStore'
import { useDevStore } from './devStore'
import { useHistoryStore } from './historyStore'
import { SupabaseChallengeService } from '../lib/supabaseService'

const useGameStore = create<GameState & GameActions>((set, get) => ({
  // Initial state
  currentGame: null,
  currentItem: null,
  items: [] as Item[], // Will be loaded from Supabase
  isWildCard: false,

  // Game lifecycle
  startGame: async (players: PlayerSnapshot[], level: Level, priorGameIds: string[]) => {
    const gameId = createGameId()
    const isProgressive = level === 'Progressive'
    const currentLevel = isProgressive ? 'soft' : level as Exclude<Level, 'Progressive'>
    
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

    // Load items from Supabase
    try {
      const items = await SupabaseChallengeService.getAllChallenges()
      
      // Save game and add to history (only if not in dev mode with saving disabled)
      const devStore = useDevStore.getState()
      if (!devStore.disableGameSaving) {
        saveGame(game)
        addGameToHistory(gameId, game.createdAt)
        // Refresh history store to show the new game immediately
        useHistoryStore.getState().refreshHistory()
      }

      // Update UI state
      useUIStore.getState().setCurrentScreen('choice')
      useUIStore.getState().setError(null)

      set({
        currentGame: game,
        items,
        currentItem: null,
        isWildCard: false
      })

      return gameId
    } catch (error) {
      console.error('Failed to load challenges from Supabase:', error)
      useUIStore.getState().setError('Failed to load challenges')
      return null
    }
  },

  loadGame: async (gameId: string) => {
    const game = get().currentGame
    if (game?.id === gameId) return

    const uiStore = useUIStore.getState()
    uiStore.setLoading(true)
    uiStore.setError(null)
    
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

        // Load items from Supabase (unless it's a custom game)
        const items = loadedGame.isCustomGame 
          ? (loadedGame.customItems || [])
          : await SupabaseChallengeService.getAllChallenges()

        uiStore.setCurrentScreen('choice')
        uiStore.setLoading(false)

        set({ 
          currentGame: loadedGame, 
          items
        })
      } else {
        uiStore.setError('Game not found')
        uiStore.setLoading(false)
      }
    } catch (error) {
      console.error('Failed to load game:', error)
      uiStore.setError('Failed to load game')
      uiStore.setLoading(false)
    }
  },

  exitGame: () => {
    const game = get().currentGame
    if (game) {
      const devStore = useDevStore.getState()
      if (!devStore.disableGameSaving) {
        saveGame(game)
        // Refresh history store to show the new game immediately
        useHistoryStore.getState().refreshHistory()
      }
    }
    
    useUIStore.getState().resetUI()
    
    set({
      currentGame: null,
      currentItem: null
    })
  },

  // Gameplay
  pickItem: (kind: ItemKind) => {
    const { currentGame, items } = get()
    if (!currentGame) return

    const priorGameItems = currentGame.respectPriorGames 
      ? getPriorGameItems(currentGame.priorGameIds) 
      : []

    // Get current player
    const currentPlayer = currentGame.players[currentGame.turnIndex]

    // For custom games in Random mode, don't filter by level
    const availableItems = currentGame.isCustomGame && currentGame.customGameMode === 'random'
      ? items.filter(item => 
          item.kind === kind &&
          !currentGame.usedItems.includes(item.id) &&
          !priorGameItems.includes(item.id) &&
          (item.gender_for || ['female', 'male']).includes(currentPlayer.gender) // Filter by gender_for
        )
      : getAvailableItems(
          items,
          currentGame.currentLevel,
          kind,
          currentGame.usedItems,
          priorGameItems
        ).filter(item => (item.gender_for || ['female', 'male']).includes(currentPlayer.gender)) // Filter by gender_for

    const selectedItem = getRandomItem(availableItems)
    if (!selectedItem) return

    useUIStore.getState().setCurrentScreen('item')
    
    set({
      currentItem: selectedItem,
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

    useUIStore.getState().setCurrentScreen('item')
    
    set({
      currentItem: wildItem,
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

    const devStore = useDevStore.getState()
    if (!devStore.disableGameSaving) {
      saveGame(updatedGame)
    }

    useUIStore.getState().setCurrentScreen('choice')
    
    set({
      currentGame: updatedGame,
      currentItem: null,
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

    const devStore = useDevStore.getState()
    if (!devStore.disableGameSaving) {
      saveGame(updatedGame)
    }

    useUIStore.getState().setCurrentScreen('choice')
    
    set({
      currentGame: updatedGame,
      currentItem: null,
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

    const devStore = useDevStore.getState()
    if (!devStore.disableGameSaving) {
      saveGame(updatedGame)
    }

    useUIStore.getState().setCurrentScreen('choice')
    
    set({
      currentGame: updatedGame,
      currentItem: null,
      isWildCard: false
    })
  },

  goNextLevel: () => {
    const { currentGame } = get()
    if (!currentGame || !currentGame.isProgressive) return

    // For custom games, use custom progressive level logic
    const nextLevel = currentGame.isCustomGame && currentGame.customItems
      ? getNextCustomProgressiveLevel(currentGame.currentLevel, currentGame.customItems)
      : getNextProgressiveLevel(currentGame.currentLevel)
    
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

    const devStore = useDevStore.getState()
    if (!devStore.disableGameSaving) {
      saveGame(updatedGame)
    }

    useUIStore.getState().setCurrentScreen('choice')
    
    set({
      currentGame: updatedGame
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

    const devStore = useDevStore.getState()
    if (!devStore.disableGameSaving) {
      saveGame(updatedGame)
    }

    set({ currentGame: updatedGame })
  },

  // Data loading
  loadItems: async () => {
    try {
      const items = await SupabaseChallengeService.getAllChallenges()
      set({ items })
    } catch (error) {
      console.error('Failed to load items from Supabase:', error)
      useUIStore.getState().setError('Failed to load challenges')
    }
  },

  // Clear game state
  clearGame: () => {
    set({
      currentGame: null,
      items: [],
      currentItem: null,
      isWildCard: false
    })
  },


  // Custom game functionality
  startCustomGame: (players: PlayerSnapshot[], customChallenges: CustomChallenge[], gameMode: 'random' | 'progressive') => {
    const gameId = createGameId()
    const isProgressive = gameMode === 'progressive'
    
    // Convert custom challenges to regular items for the game
    const customItems: Item[] = customChallenges
      .filter(challenge => challenge.level !== 'Progressive') // Filter out Progressive challenges
      .map(challenge => ({
        id: challenge.id,
        text: challenge.text,
        kind: challenge.kind,
        level: challenge.level as Exclude<Level, 'Progressive' | 'Custom'>,
        gender_for: challenge.gender_for,
        gender_target: challenge.gender_target,
        tags: challenge.tags
      }))
    
    // Initialize player counters
    const playerCounters: Record<string, { consecutiveTruths: number; consecutiveDares: number }> = {}
    players.forEach(player => {
      playerCounters[player.id] = { consecutiveTruths: 0, consecutiveDares: 0 }
    })
    
    // For Random mode, determine the most common level or use 'Soft' as default
    const getRandomModeLevel = (customItems: Item[]): Exclude<Level, 'Progressive'> => {
      if (customItems.length === 0) return 'soft'
      
      // Count items by level
      const levelCounts: Record<string, number> = {}
      customItems.forEach(item => {
        levelCounts[item.level] = (levelCounts[item.level] || 0) + 1
      })
      
      // Find the most common level
      const mostCommonLevel = Object.entries(levelCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] as Exclude<Level, 'Progressive'> || 'Soft'
      
      return mostCommonLevel
    }
    
    // For Progressive mode, start with the lowest available level
    const getProgressiveModeLevel = (customItems: Item[]): Exclude<Level, 'Progressive'> => {
      if (customItems.length === 0) return 'soft'
      
      const availableLevels = getCustomProgressiveLevels(customItems)
      return availableLevels[0] || 'Soft'
    }
    
    const initialLevel = isProgressive ? getProgressiveModeLevel(customItems) : getRandomModeLevel(customItems)
    
    const game: GameMeta = {
      id: gameId,
      players,
      selectedLevel: isProgressive ? 'Progressive' : 'Custom',
      currentLevel: initialLevel,
      turnIndex: 0,
      usedItems: [],
      totalTurnsAtCurrentLevel: 0,
      isProgressive,
      priorGameIds: [],
      respectPriorGames: false,
      playerCounters,
      createdAt: Date.now(),
      customItems, // Store custom items separately
      isCustomGame: true,
      customGameMode: gameMode
    }
    
    // Update UI state
    useUIStore.getState().setCurrentScreen('choice')
    useUIStore.getState().setError(null)
    
    // Set custom items as the game items
    set({ 
      currentGame: game, 
      items: customItems,
      currentItem: null,
      isWildCard: false
    })
    
    // Save custom games only if not in dev mode with saving disabled
    const devStore = useDevStore.getState()
    if (!devStore.disableGameSaving) {
      saveGame(game)
      addGameToHistory(gameId, game.createdAt)
      // Refresh history store to show the new game immediately
      useHistoryStore.getState().refreshHistory()
    }
    
    return gameId
  }
}))

export { useGameStore }
export default useGameStore
