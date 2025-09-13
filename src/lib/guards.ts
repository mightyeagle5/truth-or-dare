import type { GameMeta, Item, ItemKind, Level } from '../types'
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
    Array.isArray(game.usedItems) &&
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

export const canChooseType = (player: { consecutiveTruths: number; consecutiveDares: number }, kind: ItemKind): boolean => {
  if (kind === 'truth') {
    return player.consecutiveTruths < CONSECUTIVE_LIMIT
  } else {
    return player.consecutiveDares < CONSECUTIVE_LIMIT
  }
}

export const isLevelProgressive = (level: Level): boolean => {
  return level === 'Progressive'
}

export const getProgressiveLevels = (): Exclude<Level, 'Progressive'>[] => {
  return ['Soft', 'Mild', 'Hot', 'Spicy', 'Kinky']
}

export const getNextProgressiveLevel = (currentLevel: Exclude<Level, 'Progressive'>): Exclude<Level, 'Progressive'> | null => {
  const levels = getProgressiveLevels()
  const currentIndex = levels.indexOf(currentLevel)
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null
}
