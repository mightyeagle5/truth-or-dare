import type { Item, Level } from '../types'
import { getAvailableItems } from './items'

export interface ChallengePair {
  truth: Item | null
  dare: Item | null
}

export interface ChallengePairState {
  current: ChallengePair
  next: ChallengePair
  loading: boolean
  error: string | null
  exhausted: boolean
}

export class ChallengePairManager {
  private state: ChallengePairState = {
    current: { truth: null, dare: null },
    next: { truth: null, dare: null },
    loading: false,
    error: null,
    exhausted: false
  }

  private currentLevel: Exclude<Level, 'Progressive' | 'Custom'> = 'soft'
  private allItems: Item[] = []
  private usedItems: Record<string, Record<string, string[]>> = {}
  private priorGameItems: string[] = []
  private loadingStartTime: number = 0
  private loadingTimeout: NodeJS.Timeout | null = null
  private levelCache: Partial<Record<Exclude<Level, 'Progressive' | 'Custom'>, ChallengePair>> = {}

  // Initialize with all items and current game state
  initialize(
    allItems: Item[], 
    currentLevel: Exclude<Level, 'Progressive' | 'Custom'>, 
    usedItems: Record<string, Record<string, string[]>>, 
    priorGameItems: string[] = []
  ) {
    this.allItems = allItems
    this.currentLevel = currentLevel
    this.usedItems = usedItems
    this.priorGameItems = priorGameItems
    this.state = {
      current: { truth: null, dare: null },
      next: { truth: null, dare: null },
      loading: false,
      error: null,
      exhausted: false
    }
    this.levelCache = {}
  }

  // Get current pair (for display)
  getCurrentPair(): ChallengePair {
    return this.state.current
  }

  // Get next pair (for wild card)
  getNextPair(): ChallengePair {
    return this.state.next
  }

  // Check if we have a valid current pair
  hasCurrentPair(): boolean {
    return this.state.current.truth !== null && this.state.current.dare !== null
  }

  // Check if we have a valid next pair
  hasNextPair(): boolean {
    return this.state.next.truth !== null && this.state.next.dare !== null
  }

  // Get loading state
  isLoading(): boolean {
    return this.state.loading
  }

  // Get error state
  getError(): string | null {
    return this.state.error
  }

  // Check if level is exhausted
  isExhausted(): boolean {
    return this.state.exhausted
  }

  // Fetch a new pair for the current level
  async fetchPair(level: Exclude<Level, 'Progressive' | 'Custom'> = this.currentLevel): Promise<ChallengePair> {
    const availableTruth = getAvailableItems(
      this.allItems,
      level,
      'truth',
      this.usedItems,
      this.priorGameItems
    )

    const availableDare = getAvailableItems(
      this.allItems,
      level,
      'dare',
      this.usedItems,
      this.priorGameItems
    )

    // If both are empty, level is exhausted
    if (availableTruth.length === 0 && availableDare.length === 0) {
      this.state.exhausted = true
      const emptyPair: ChallengePair = { truth: null, dare: null }
      this.levelCache[level] = emptyPair
      return emptyPair
    }

    // Pick random items when available (allow partial availability)
    const randomTruth = availableTruth.length > 0
      ? availableTruth[Math.floor(Math.random() * availableTruth.length)]
      : null
    const randomDare = availableDare.length > 0
      ? availableDare[Math.floor(Math.random() * availableDare.length)]
      : null

    const pair: ChallengePair = { truth: randomTruth, dare: randomDare }
    this.levelCache[level] = pair
    return pair
  }

  // Start loading with smart timing
  private startLoading() {
    this.state.loading = true
    this.state.error = null
    this.loadingStartTime = Date.now()

    // Clear any existing timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout)
    }

    // Set minimum loading time of 1000ms if loading takes longer than 100ms
    this.loadingTimeout = setTimeout(() => {
      if (this.state.loading && Date.now() - this.loadingStartTime > 100) {
        // Keep loading for full 1000ms to avoid jitter
        setTimeout(() => {
          this.state.loading = false
        }, 1000 - (Date.now() - this.loadingStartTime))
      }
    }, 100)
  }

  // Stop loading
  private stopLoading() {
    const elapsed = Date.now() - this.loadingStartTime
    
    if (elapsed < 100) {
      // If loading was very fast, don't show loading state
      this.state.loading = false
    } else if (elapsed < 1000) {
      // If loading took some time, show for full 1000ms
      setTimeout(() => {
        this.state.loading = false
      }, 1000 - elapsed)
    } else {
      // If loading took longer than 1000ms, stop immediately
      this.state.loading = false
    }

    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout)
      this.loadingTimeout = null
    }
  }

  // Load initial pair for game start
  async loadInitialPair(): Promise<ChallengePair> {
    this.startLoading()
    
    try {
      const pair = await this.fetchPair()
      this.state.current = pair
      this.state.exhausted = pair.truth === null && pair.dare === null
      // Start background fetch for next pair when not exhausted
      if (!this.state.exhausted) {
        this.loadNextPair()
      }
      this.stopLoading()
      return pair
    } catch (error) {
      this.state.error = 'Failed to load challenges'
      this.state.loading = false
      throw error
    }
  }

  // Load next pair in background
  async loadNextPair(): Promise<void> {
    if (this.state.loading || this.state.exhausted) {
      return
    }

    try {
      const pair = await this.fetchPair()
      this.state.next = pair
      if (pair.truth === null && pair.dare === null) {
        this.state.exhausted = true
      }
    } catch (error) {
      this.state.error = 'Failed to load next challenges'
    }
  }

  // Move to next pair (when user completes current)
  async moveToNext(): Promise<ChallengePair> {
    // Move next pair to current
    this.state.current = this.state.next
    this.state.next = { truth: null, dare: null }

    // If current pair is invalid, try to fetch a new one
    if (!this.state.current.truth || !this.state.current.dare) {
      try {
        const newPair = await this.fetchPair()
        this.state.current = newPair
        this.state.exhausted = newPair.truth === null || newPair.dare === null
      } catch (error) {
        this.state.error = 'Failed to load next challenges'
      }
    }

    // Start background fetch for new next pair
    if (!this.state.exhausted) {
      this.loadNextPair()
    }

    return this.state.current
  }

  // Get random item from next pair (for wild card)
  async getRandomFromNextPair(): Promise<Item | null> {
    // If no next pair available, try to fetch one immediately
    if (!this.hasNextPair()) {
      if (!this.state.exhausted) {
        try {
          const pair = await this.fetchPair()
          this.state.next = pair
          if (pair.truth === null || pair.dare === null) {
            this.state.exhausted = true
            return null
          }
        } catch (error) {
          return null
        }
      } else {
        return null
      }
    }

    const { truth, dare } = this.state.next
    const items = [truth, dare].filter(Boolean) as Item[]
    
    if (items.length === 0) {
      return null
    }
    
    const selectedItem = items[Math.floor(Math.random() * items.length)]
    return selectedItem
  }

  // Update used items (when item is selected)
  updateUsedItems(usedItems: Record<string, Record<string, string[]>>, priorGameItems: string[] = []) {
    this.usedItems = usedItems
    this.priorGameItems = priorGameItems
  }

  // Handle wild card completion - move to next pair and start background fetch
  async handleWildCardCompletion(): Promise<void> {
    // Move next pair to current
    this.state.current = this.state.next
    this.state.next = { truth: null, dare: null }

    // If current pair is invalid, try to fetch a new one
    if (!this.state.current.truth || !this.state.current.dare) {
      try {
        const newPair = await this.fetchPair()
        this.state.current = newPair
        this.state.exhausted = newPair.truth === null || newPair.dare === null
      } catch (error) {
        this.state.error = 'Failed to load next challenges'
      }
    }

    // Start background fetch for new next pair
    if (!this.state.exhausted) {
      this.loadNextPair()
    }
  }

  // Handle item selection - mark the selected item as used and fetch new next pair
  async markItemAsUsed(itemId: string, isWildCard: boolean = false): Promise<void> {
    if (isWildCard) {
      // For wild cards, remove the item from the next pair
      if (this.state.next.truth?.id === itemId) {
        this.state.next.truth = null
      } else if (this.state.next.dare?.id === itemId) {
        this.state.next.dare = null
      }
      
      // If next pair is now empty, mark it as invalid
      if (!this.state.next.truth && !this.state.next.dare) {
        this.state.next = { truth: null, dare: null }
      }
    } else {
      // For regular items, remove the item from the current pair
      if (this.state.current.truth?.id === itemId) {
        this.state.current.truth = null
      } else if (this.state.current.dare?.id === itemId) {
        this.state.current.dare = null
      }
    }

    // Immediately fetch a new next pair for the next challenge
    if (!this.state.exhausted) {
      try {
        const newPair = await this.fetchPair()
        this.state.next = newPair
        if (newPair.truth === null && newPair.dare === null) {
          this.state.exhausted = true
        }
      } catch (error) {
        this.state.error = 'Failed to load next challenges'
      }
    }
  }

  // Handle wild card selection - mark the selected item as used and fetch new next pair
  async markWildCardItemAsUsed(itemId: string): Promise<void> {
    return this.markItemAsUsed(itemId, true)
  }

  // Change level and fetch new pair
  async changeLevel(newLevel: Exclude<Level, 'Progressive' | 'Custom'>): Promise<ChallengePair> {
    this.currentLevel = newLevel
    this.state.exhausted = false
    this.state.error = null
    
    this.startLoading()
    
    try {
      // Use cached pair if available; otherwise fetch a new pair
      const cached = this.levelCache[newLevel]
      const pair = cached ?? await this.fetchPair(newLevel)
      this.state.current = pair
      this.state.next = { truth: null, dare: null }
      this.state.exhausted = pair.truth === null && pair.dare === null

      if (cached) {
        // cached pair used
      }
      
      // Start background fetch for next pair
      if (!this.state.exhausted) {
        this.loadNextPair()
      }
      
      this.stopLoading()
      return pair
    } catch (error) {
      this.state.error = 'Failed to load challenges for new level'
      this.state.loading = false
      throw error
    }
  }

  // Get current state for debugging
  getState(): ChallengePairState {
    return { ...this.state }
  }

  // Reset state
  reset() {
    this.state = {
      current: { truth: null, dare: null },
      next: { truth: null, dare: null },
      loading: false,
      error: null,
      exhausted: false
    }
    this.allItems = []
    this.usedItems = {}
    this.priorGameItems = []
    this.levelCache = {}
    
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout)
      this.loadingTimeout = null
    }
  }
}

// Export singleton instance
export const challengePairManager = new ChallengePairManager()
