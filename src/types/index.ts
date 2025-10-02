export type Level = 'soft' | 'mild' | 'hot' | 'spicy' | 'kinky' | 'Progressive' | 'Custom'

export type ItemKind = 'truth' | 'dare'

export interface CustomChallenge {
  id: string
  text: string
  kind: ItemKind
  level: Level
  isCustom: boolean
  originalId?: string // For challenges from the original game
  gender_for: Gender[] // Genders that can receive this challenge
  gender_target: Gender[] // Genders that this challenge can be performed on
  tags: string[] // Tags for filtering/exclusion
}

export type Gender = 'male' | 'female'

export interface Player {
  id: string
  name: string
  gender: Gender
  consecutiveTruths: number
  consecutiveDares: number
}

export interface PlayerSnapshot {
  id: string
  name: string
  gender: Gender
}

export interface GameMeta {
  id: string // Game ID (nanoid)
  createdAt: number // epoch ms
  players: PlayerSnapshot[] // id, name, gender (no counters here)
  selectedLevel: Level // initial selection on Homepage
  priorGameIds: string[] // used to skip repeats unless reset
  currentLevel: Exclude<Level, 'Progressive'> // actual level in play
  isProgressive: boolean
  turnIndex: number // index into players array
  totalTurnsAtCurrentLevel: number // for 10-turn suggestion
  usedItems: Record<string, Record<string, string[]>> // Item IDs used in this game, organized by level and kind
  respectPriorGames: boolean // false if user pressed "Reset" on Homepage
  playerCounters: Record<string, { consecutiveTruths: number; consecutiveDares: number }> // per-player consecutive counters
  customItems?: Item[] // Custom challenges for custom games
  isCustomGame?: boolean // Flag to identify custom games
  customGameMode?: 'random' | 'progressive' // Mode for custom games
}

export interface Item {
  id: string // Item ID
  level: Exclude<Level, 'Progressive' | 'Custom'>
  kind: ItemKind
  text: string
  gender_for: Gender[] // Genders that can receive this challenge
  gender_target: Gender[] // Genders that this challenge can be performed on
  tags: string[] // Tags for filtering/exclusion
  updated_at?: string // Last updated timestamp
}

export interface GameHistoryEntry {
  id: string
  createdAt: number
}

export type Screen = 'choice' | 'item'

export interface GameState {
  // Current game state
  currentGame: GameMeta | null
  currentItem: Item | null
  items: Item[]
  isWildCard: boolean // tracks if current item is a wild card
  challengePairLoading: boolean // tracks if challenge pairs are loading
  challengePairError: string | null // tracks challenge pair loading errors
}

export interface GameActions {
  // Game lifecycle
  startGame: (players: PlayerSnapshot[], level: Level, priorGameIds: string[]) => Promise<string | null>
  startCustomGame: (players: PlayerSnapshot[], customChallenges: CustomChallenge[], gameMode: 'random' | 'progressive') => string
  loadGame: (gameId: string) => void
  exitGame: () => void
  
  // Gameplay
  pickItem: (kind: ItemKind) => Promise<void>
  pickWildCard: () => Promise<void>
  skipItem: () => void
  completeItem: () => void
  completeWildCard: () => Promise<void>
  goNextLevel: () => Promise<void>
  changeLevel: (newLevel: Level) => Promise<void>
  
  // Settings
  toggleRespectPriorGames: (respect: boolean) => void
  
  // Data loading
  loadItems: () => void
  
  // Clear game state
  clearGame: () => void
}
