import type { Item, ItemKind, Level } from '../types'
import { createId } from './ids'

// Placeholder data structure - user will replace with actual game_questions.json
export const PLACEHOLDER_ITEMS: Item[] = [
  {
    id: 'soft-truth-1',
    level: 'Soft',
    kind: 'truth',
    text: 'What is your biggest turn-on?'
  },
  {
    id: 'soft-dare-1',
    level: 'Soft',
    kind: 'dare',
    text: 'Give your partner a 30-second massage.'
  },
  {
    id: 'mild-truth-1',
    level: 'Mild',
    kind: 'truth',
    text: 'What is your favorite position?'
  },
  {
    id: 'mild-dare-1',
    level: 'Mild',
    kind: 'dare',
    text: 'Send a sexy text to your partner.'
  },
  {
    id: 'hot-truth-1',
    level: 'Hot',
    kind: 'truth',
    text: 'What is your wildest fantasy?'
  },
  {
    id: 'hot-dare-1',
    level: 'Hot',
    kind: 'dare',
    text: 'Striptease for your partner for 2 minutes.'
  },
  {
    id: 'spicy-truth-1',
    level: 'Spicy',
    kind: 'truth',
    text: 'What is the kinkiest thing you have ever done?'
  },
  {
    id: 'spicy-dare-1',
    level: 'Spicy',
    kind: 'dare',
    text: 'Let your partner choose your underwear for the day.'
  },
  {
    id: 'kinky-truth-1',
    level: 'Kinky',
    kind: 'truth',
    text: 'What is your most taboo desire?'
  },
  {
    id: 'kinky-dare-1',
    level: 'Kinky',
    kind: 'dare',
    text: 'Be your partner\'s slave for the next hour.'
  }
]

export const createItemLookup = (items: Item[]) => {
  const lookup: Record<Exclude<Level, 'Progressive' | 'Custom'>, Record<ItemKind, Item[]>> = {
    Soft: { truth: [], dare: [] },
    Mild: { truth: [], dare: [] },
    Hot: { truth: [], dare: [] },
    Spicy: { truth: [], dare: [] },
    Kinky: { truth: [], dare: [] }
  }

  items.forEach(item => {
    if (item.level in lookup && item.kind in lookup[item.level]) {
      lookup[item.level][item.kind].push(item)
    }
  })

  return lookup
}

export const getAvailableItems = (
  items: Item[],
  level: Exclude<Level, 'Progressive'>,
  kind: ItemKind,
  usedItems: string[],
  priorGameItems: string[] = []
): Item[] => {
  return items.filter(item => 
    item.level === level &&
    item.kind === kind &&
    !usedItems.includes(item.id) &&
    !priorGameItems.includes(item.id)
  )
}

export const getRandomItem = (availableItems: Item[]): Item | null => {
  if (availableItems.length === 0) return null
  
  const randomIndex = Math.floor(Math.random() * availableItems.length)
  return availableItems[randomIndex]
}

export const getWildCardItem = (
  items: Item[],
  level: Exclude<Level, 'Progressive'>,
  usedItems: string[],
  priorGameItems: string[] = []
): Item | null => {
  const availableItems = items.filter(item => 
    item.level === level &&
    !usedItems.includes(item.id) &&
    !priorGameItems.includes(item.id)
  )
  
  return getRandomItem(availableItems)
}

export const getItemCounts = (
  items: Item[],
  level: Exclude<Level, 'Progressive'>,
  usedItems: string[],
  priorGameItems: string[] = []
): { truth: number; dare: number } => {
  const truthItems = getAvailableItems(items, level, 'truth', usedItems, priorGameItems)
  const dareItems = getAvailableItems(items, level, 'dare', usedItems, priorGameItems)
  
  return {
    truth: truthItems.length,
    dare: dareItems.length
  }
}
