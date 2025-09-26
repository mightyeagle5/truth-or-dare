import type { Level } from '../types'

export const LEVELS: Level[] = ['soft', 'mild', 'hot', 'spicy', 'kinky', 'Progressive']

export const LEVEL_TOOLTIPS: Record<Level, string> = {
  soft: 'Gentle and romantic challenges to get you started.',
  mild: 'A bit more adventurous with some playful teasing.',
  hot: 'Steamy challenges that will heat things up.',
  spicy: 'Intense and daring with explicit content.',
  kinky: 'The wildest challenges for experienced players.',
  Progressive: 'Start soft and work your way up through all levels.',
  Custom: 'Your own custom challenges'
}

export const GENDER_COLORS = {
  male: '#3B82F6', // blue
  female: '#EC4899' // magenta
} as const

export const GENDER_ICONS = {
  male: '♂',
  female: '♀'
} as const

export const MAX_PLAYERS = 8
export const MIN_PLAYERS = 2
export const CONSECUTIVE_LIMIT = 2
export const TURN_SUGGESTION_INTERVAL = 10

export const STORAGE_KEYS = {
  GAMES: 'tod.games',
  GAME_PREFIX: 'tod.game.'
} as const

export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 100,
  CONFIRM_EXIT_MESSAGE: 'Are you sure you want to exit the game? Your progress will be saved.'
} as const
