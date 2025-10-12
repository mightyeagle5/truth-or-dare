import type { GameMeta, Item, ItemKind, Level, GameConfiguration } from '../types'
import { CONSECUTIVE_LIMIT } from './constants'

export const isValidPlayer = (player: any): player is { id: string; name: string; gender: 'male' | 'female' } => {
  return (
    player &&
    typeof player.id === 'string' &&
    typeof player.name === 'string' &&
    player.name.trim().length > 0 &&
    (player.gender === 'male' || player.gender === 'female')
  )
}

export const isValidGame = (game: any): game is GameMeta => {
  return (
    game &&
    typeof game.id === 'string' &&
    typeof game.createdAt === 'number' &&
    Array.isArray(game.players) &&
    game.players.every(isValidPlayer) &&
    typeof game.selectedLevel === 'string' &&
    Array.isArray(game.priorGameIds) &&
    typeof game.currentLevel === 'string' &&
    typeof game.isProgressive === 'boolean' &&
    typeof game.turnIndex === 'number' &&
    typeof game.totalTurnsAtCurrentLevel === 'number' &&
    typeof game.usedItems === 'object' && game.usedItems !== null &&
    typeof game.respectPriorGames === 'boolean'
  )
}

export const isValidItem = (item: any): item is Item => {
  return (
    item &&
    typeof item.id === 'string' &&
    typeof item.level === 'string' &&
    (item.kind === 'truth' || item.kind === 'dare') &&
    typeof item.text === 'string'
  )
}

export const canChooseType = (
  player: { consecutiveTruths: number; consecutiveDares: number }, 
  kind: ItemKind, 
  gameConfiguration?: GameConfiguration
): boolean => {
  // If no game configuration provided, use default limit
  if (!gameConfiguration) {
    const consecutiveLimit = CONSECUTIVE_LIMIT
    if (kind === 'truth') {
      return player.consecutiveTruths < consecutiveLimit
    } else {
      return player.consecutiveDares < consecutiveLimit
    }
  }
  
  // If limit is explicitly set to null (disabled), allow unlimited consecutive challenges
  if (gameConfiguration.consecutiveLimit === null) {
    return true
  }
  
  // Use the configured limit
  const consecutiveLimit = gameConfiguration.consecutiveLimit
  
  if (kind === 'truth') {
    return player.consecutiveTruths < consecutiveLimit
  } else {
    return player.consecutiveDares < consecutiveLimit
  }
}

export const isLevelProgressive = (level: Level): boolean => {
  return level === 'Progressive'
}

export const getProgressiveLevels = (): Exclude<Level, 'Progressive'>[] => {
  return ['soft', 'mild', 'hot', 'spicy', 'kinky']
}

export const getNextProgressiveLevel = (currentLevel: Exclude<Level, 'Progressive'>): Exclude<Level, 'Progressive'> | null => {
  const levels = getProgressiveLevels()
  const currentIndex = levels.indexOf(currentLevel)
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null
}

// Custom game progressive level functions
export const getCustomProgressiveLevels = (customItems: Item[]): Exclude<Level, 'Progressive'>[] => {
  const levels = new Set<Exclude<Level, 'Progressive'>>()
  customItems.forEach(item => {
    levels.add(item.level)
  })
  
  // Sort levels in the standard order
  const standardLevels = getProgressiveLevels()
  return standardLevels.filter(level => levels.has(level))
}

export const getNextCustomProgressiveLevel = (
  currentLevel: Exclude<Level, 'Progressive'>, 
  customItems: Item[]
): Exclude<Level, 'Progressive'> | null => {
  const availableLevels = getCustomProgressiveLevels(customItems)
  const currentIndex = availableLevels.indexOf(currentLevel)
  return currentIndex < availableLevels.length - 1 ? availableLevels[currentIndex + 1] : null
}
