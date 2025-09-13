import type { GameMeta, Item, ItemKind } from '../types'
import { getAvailableItems, getItemCounts } from '../lib/items'
import { canChooseType } from '../lib/guards'
import { getPriorGameItems } from './storage'

export const getCurrentPlayer = (game: GameMeta | null) => {
  if (!game || !game.players.length) return null
  return game.players[game.turnIndex]
}

export const getCurrentPlayerWithCounters = (game: GameMeta | null) => {
  if (!game || !game.players.length) return null
  
  const player = game.players[game.turnIndex]
  const counters = game.playerCounters[player.id] || { consecutiveTruths: 0, consecutiveDares: 0 }
  
  return {
    ...player,
    consecutiveTruths: counters.consecutiveTruths,
    consecutiveDares: counters.consecutiveDares
  }
}

export const getDisabledChoices = (
  game: GameMeta | null,
  items: Item[],
  respectPriorGames: boolean = true
): { truth: boolean; dare: boolean } => {
  if (!game || !items.length) return { truth: true, dare: true }
  
  const currentPlayer = getCurrentPlayerWithCounters(game)
  if (!currentPlayer) return { truth: true, dare: true }
  
  const priorGameItems = respectPriorGames ? getPriorGameItems(game.priorGameIds) : []
  const counts = getItemCounts(items, game.currentLevel, game.usedItems, priorGameItems)
  
  // If one type is exhausted, disable consecutive counter for the other type
  const truthExhausted = counts.truth === 0
  const dareExhausted = counts.dare === 0
  
  const truthDisabled = truthExhausted || (!dareExhausted && !canChooseType(currentPlayer, 'truth'))
  const dareDisabled = dareExhausted || (!truthExhausted && !canChooseType(currentPlayer, 'dare'))
  
  return { truth: truthDisabled, dare: dareDisabled }
}

export const getAvailableItemCounts = (
  game: GameMeta | null,
  items: Item[],
  respectPriorGames: boolean = true
): { truth: number; dare: number } => {
  if (!game || !items.length) return { truth: 0, dare: 0 }
  
  const priorGameItems = respectPriorGames ? getPriorGameItems(game.priorGameIds) : []
  return getItemCounts(items, game.currentLevel, game.usedItems, priorGameItems)
}

export const shouldShowLevelSuggestion = (game: GameMeta | null, items: Item[] = [], respectPriorGames: boolean = true): boolean => {
  if (!game || !game.isProgressive) return false
  
  // Show suggestion after 10 turns OR when one type of cards is exhausted
  const hasReachedTurnLimit = game.totalTurnsAtCurrentLevel >= 10
  
  if (hasReachedTurnLimit) return true
  
  // Check if one type of cards is exhausted
  const priorGameItems = respectPriorGames ? getPriorGameItems(game.priorGameIds) : []
  const counts = getItemCounts(items, game.currentLevel, game.usedItems, priorGameItems)
  const oneTypeExhausted = counts.truth === 0 || counts.dare === 0
  
  return oneTypeExhausted
}

export const canAdvanceLevel = (game: GameMeta | null): boolean => {
  if (!game || !game.isProgressive) return false
  return game.currentLevel !== 'Kinky'
}

export const getNextLevel = (game: GameMeta | null): Exclude<GameMeta['currentLevel'], 'Progressive'> | null => {
  if (!game || !game.isProgressive) return null
  
  const levels = ['Soft', 'Mild', 'Hot', 'Spicy', 'Kinky'] as const
  const currentIndex = levels.indexOf(game.currentLevel)
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null
}
