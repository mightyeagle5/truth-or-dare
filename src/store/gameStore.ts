import { create } from 'zustand'
import type { GameState, GameActions, GameMeta, PlayerSnapshot, Item, Level, CustomChallenge, ItemKind } from '../types'
import { createGameId } from '../lib/ids'
import { getNextProgressiveLevel, getNextCustomProgressiveLevel, getCustomProgressiveLevels } from '../lib/guards'
import { getRandomItem, getWildCardItem, getAvailableItems, getItemCounts, addUsedItem, isItemUsed } from '../lib/items'
import { challengePairManager } from '../lib/challengePairs'
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
  challengePairLoading: false,
  challengePairError: null,

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
      usedItems: {},
      respectPriorGames: true,
      playerCounters
    }

    // Load items from Supabase and initialize challenge pairs
    try {
      const items = await SupabaseChallengeService.getAllChallenges()
      
      // Initialize challenge pair manager
      const priorGameItems = getPriorGameItems(priorGameIds)
      challengePairManager.initialize(items, currentLevel as Exclude<Level, 'Progressive' | 'Custom'>, {}, priorGameItems)
      
      // Load initial pair
      set({ challengePairLoading: true, challengePairError: null })
      await challengePairManager.loadInitialPair()
      
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
        isWildCard: false,
        challengePairLoading: false,
        challengePairError: null
      })

      return gameId
    } catch (error) {
      console.error('Failed to load challenges:', error)
      useUIStore.getState().setError('Failed to load challenges')
      set({ challengePairLoading: false, challengePairError: 'Failed to load challenges' })
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

        // Initialize challenge pair manager for regular games
        if (!loadedGame.isCustomGame) {
          const priorGameItems = loadedGame.respectPriorGames 
            ? getPriorGameItems(loadedGame.priorGameIds) 
            : []
          challengePairManager.initialize(items, loadedGame.currentLevel as Exclude<Level, 'Progressive' | 'Custom'>, loadedGame.usedItems, priorGameItems)
          
          // Load initial pair
          set({ challengePairLoading: true, challengePairError: null })
          await challengePairManager.loadInitialPair()
        }

        uiStore.setCurrentScreen('choice')
        uiStore.setLoading(false)

        set({ 
          currentGame: loadedGame, 
          items,
          challengePairLoading: false,
          challengePairError: null
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
  pickItem: async (kind: ItemKind) => {
    const { currentGame } = get()
    if (!currentGame) return

    // For custom games, use the old logic
    if (currentGame.isCustomGame) {
      const { items } = get()
      const priorGameItems = currentGame.respectPriorGames 
        ? getPriorGameItems(currentGame.priorGameIds) 
        : []

      const currentPlayer = currentGame.players[currentGame.turnIndex]

      const availableItems = currentGame.customGameMode === 'random'
        ? items.filter(item => 
            item.kind === kind &&
            !isItemUsed(currentGame.usedItems, item) &&
            !priorGameItems.includes(item.id) &&
            (item.gender_for || ['female', 'male']).includes(currentPlayer.gender)
          )
        : getAvailableItems(
            items,
            currentGame.currentLevel,
            kind,
            currentGame.usedItems,
            priorGameItems
          ).filter(item => (item.gender_for || ['female', 'male']).includes(currentPlayer.gender))

      const selectedItem = getRandomItem(availableItems)
      if (!selectedItem) return

      useUIStore.getState().setCurrentScreen('item')
      
      set({
        currentItem: selectedItem,
        isWildCard: false
      })
      return
    }

    // For regular games, use challenge pairs
    const currentPair = challengePairManager.getCurrentPair()
    const selectedItem = kind === 'truth' ? currentPair.truth : currentPair.dare

    if (!selectedItem) {
      useUIStore.getState().setError('No more challenges available for this level')
      return
    }

    // Mark the selected item as used and fetch new next pair
    await challengePairManager.markItemAsUsed(selectedItem.id, false)
    
    useUIStore.getState().setCurrentScreen('item')
    
    set({
      currentItem: selectedItem,
      isWildCard: false
    })
  },

  pickWildCard: async () => {
    const { currentGame } = get()
    if (!currentGame) return

    // For custom games, use the old logic
    if (currentGame.isCustomGame) {
      const { items } = get()
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
      return
    }

    // For regular games, use challenge pairs
    try {
      const wildItem = await challengePairManager.getRandomFromNextPair()

      if (!wildItem) {
        useUIStore.getState().setError('No more challenges available for this level')
        return
      }

      // Mark the wild card item as used in the next pair and fetch new next pair
      await challengePairManager.markWildCardItemAsUsed(wildItem.id)
      
      useUIStore.getState().setCurrentScreen('item')
      
      set({
        currentItem: wildItem,
        isWildCard: true
      })
    } catch (error) {
      useUIStore.getState().setError('Failed to load wild card')
    }
  },

  skipItem: async () => {
    const { currentGame, currentItem } = get()
    if (!currentGame || !currentItem) return

    // Check if item already used
    const alreadyUsed = isItemUsed(currentGame.usedItems, currentItem)
    console.log(`[UsedItems] check id=${currentItem.id} used=${alreadyUsed}`)

    const updatedGame = {
      ...currentGame,
      usedItems: addUsedItem(currentGame.usedItems, currentItem),
      totalTurnsAtCurrentLevel: currentGame.totalTurnsAtCurrentLevel + 1
    }

    console.log(`[UsedItems] moved id=${currentItem.id} level=${currentItem.level} kind=${currentItem.kind}`)

    // Update challenge pair manager with new used items
    if (!currentGame.isCustomGame) {
      const priorGameItems = currentGame.respectPriorGames 
        ? getPriorGameItems(currentGame.priorGameIds) 
        : []
      challengePairManager.updateUsedItems(updatedGame.usedItems, priorGameItems)
      
      // Move to next pair and start background fetch
      await challengePairManager.moveToNext()
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

  completeItem: async () => {
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

    // Check if item already used
    const alreadyUsed = isItemUsed(currentGame.usedItems, currentItem)
    console.log(`[UsedItems] check id=${currentItem.id} used=${alreadyUsed}`)

    const updatedGame = {
      ...currentGame,
      usedItems: addUsedItem(currentGame.usedItems, currentItem),
      turnIndex: (currentGame.turnIndex + 1) % currentGame.players.length,
      totalTurnsAtCurrentLevel: currentGame.totalTurnsAtCurrentLevel + 1,
      playerCounters: updatedCounters
    }

    console.log(`[UsedItems] moved id=${currentItem.id} level=${currentItem.level} kind=${currentItem.kind}`)

    // Update challenge pair manager with new used items
    if (!currentGame.isCustomGame) {
      console.log('✅ Completing item and moving to next pair')
      challengePairManager.updateUsedItems(updatedGame.usedItems, priorGameItems)
      
      // Move to next pair and start background fetch
      await challengePairManager.moveToNext()
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

  completeWildCard: async () => {
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

    // Check if item already used
    const alreadyUsed = isItemUsed(currentGame.usedItems, currentItem)
    console.log(`[UsedItems] check id=${currentItem.id} used=${alreadyUsed}`)

    const updatedGame = {
      ...currentGame,
      usedItems: addUsedItem(currentGame.usedItems, currentItem),
      turnIndex: (currentGame.turnIndex + 1) % currentGame.players.length,
      totalTurnsAtCurrentLevel: currentGame.totalTurnsAtCurrentLevel + 1,
      playerCounters: updatedCounters
    }

    console.log(`[UsedItems] moved id=${currentItem.id} level=${currentItem.level} kind=${currentItem.kind}`)

    // Handle wild card completion in challenge pair manager
    if (!currentGame.isCustomGame) {
      const priorGameItems = currentGame.respectPriorGames 
        ? getPriorGameItems(currentGame.priorGameIds) 
        : []
      challengePairManager.updateUsedItems(updatedGame.usedItems, priorGameItems)
      
      // Handle wild card completion and move to next pair
      await challengePairManager.handleWildCardCompletion()
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

  goNextLevel: async () => {
    const { currentGame } = get()
    if (!currentGame || !currentGame.isProgressive) return

    // For custom games, use custom progressive level logic
    const nextLevel = currentGame.isCustomGame && currentGame.customItems
      ? getNextCustomProgressiveLevel(currentGame.currentLevel, currentGame.customItems)
      : getNextProgressiveLevel(currentGame.currentLevel)
    
    if (!nextLevel) return

    try {
      set({ challengePairLoading: true, challengePairError: null })

      // Update challenge pair manager with new level
      if (!currentGame.isCustomGame) {
        await challengePairManager.changeLevel(nextLevel as Exclude<Level, 'Progressive' | 'Custom'>)
      }

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
        currentGame: updatedGame,
        challengePairLoading: false,
        challengePairError: null
      })
    } catch (error) {
      set({
        challengePairLoading: false,
        challengePairError: 'Failed to load challenges for new level'
      })
    }
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

    // Update challenge pair manager so availability reflects the new prior-game filter
    if (!updatedGame.isCustomGame) {
      const priorGameItems = respect ? getPriorGameItems(updatedGame.priorGameIds) : []
      challengePairManager.updateUsedItems(updatedGame.usedItems, priorGameItems)
      // Optionally refresh background next pair to reflect new availability
      if (!challengePairManager.isExhausted()) {
        challengePairManager.loadNextPair()
      }
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
      usedItems: {},
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
  },

  // Change level and fetch new challenge pairs
  changeLevel: async (newLevel: Level) => {
    const { currentGame } = get()
    if (!currentGame || currentGame.isCustomGame) return

    try {
      set({ challengePairLoading: true, challengePairError: null })
      
      // Change level in challenge pair manager
      await challengePairManager.changeLevel(newLevel as Exclude<Level, 'Progressive' | 'Custom'>)
      
      // Update game state
      const updatedGame = {
        ...currentGame,
        currentLevel: newLevel as Exclude<Level, 'Progressive'>,
        totalTurnsAtCurrentLevel: 0
      }

      const devStore = useDevStore.getState()
      if (!devStore.disableGameSaving) {
        saveGame(updatedGame)
      }

      set({
        currentGame: updatedGame,
        challengePairLoading: false,
        challengePairError: null
      })

    } catch (error) {
      console.error('Failed to change level:', error)
      set({
        challengePairLoading: false,
        challengePairError: 'Failed to load challenges for new level'
      })
    }
  }
}))

export { useGameStore }
export default useGameStore
