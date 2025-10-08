import type { Item, ItemKind, Level } from '../types'

// Helper functions for the new usedItems structure
export const addUsedItem = (
  usedItems: Record<string, Record<string, string[]>>,
  item: Item
): Record<string, Record<string, string[]>> => {
  const newUsedItems = { ...usedItems }
  
  if (!newUsedItems[item.level]) {
    newUsedItems[item.level] = {}
  }
  if (!newUsedItems[item.level][item.kind]) {
    newUsedItems[item.level][item.kind] = []
  }
  
  if (!newUsedItems[item.level][item.kind].includes(item.id)) {
    newUsedItems[item.level][item.kind].push(item.id)
  }
  
  return newUsedItems
}

export const isItemUsed = (
  usedItems: Record<string, Record<string, string[]>>,
  item: Item
): boolean => {
  return usedItems[item.level]?.[item.kind]?.includes(item.id) || false
}

export const getUsedItemsForLevelKind = (
  usedItems: Record<string, Record<string, string[]>>,
  level: string,
  kind: string
): string[] => {
  return usedItems[level]?.[kind] || []
}

// Placeholder data structure - user will replace with actual game_questions.json
export const PLACEHOLDER_ITEMS: Item[] = [
  {
    id: 'soft-truth-1',
    level: 'soft',
    kind: 'truth',
    text: 'What is your biggest turn-on?',
    gender_for: ['female', 'male'],
    gender_target: ['female', 'male'],
    tags: []
  },
  {
    id: 'soft-dare-1',
    level: 'soft',
    kind: 'dare',
    text: 'Give your partner a 30-second massage.',
    gender_for: ['female', 'male'],
    gender_target: ['female', 'male'],
    tags: ['physical', 'massage']
  },
  {
    id: 'mild-truth-1',
    level: 'mild',
    kind: 'truth',
    text: 'What is your favorite position?',
    gender_for: ['female', 'male'],
    gender_target: ['female', 'male'],
    tags: ['sexual']
  },
  {
    id: 'mild-dare-1',
    level: 'mild',
    kind: 'dare',
    text: 'Send a sexy text to your partner.',
    gender_for: ['female', 'male'],
    gender_target: ['female', 'male'],
    tags: ['technology', 'sexual']
  },
  {
    id: 'hot-truth-1',
    level: 'hot',
    kind: 'truth',
    text: 'What is your wildest fantasy?',
    gender_for: ['female', 'male'],
    gender_target: ['female', 'male'],
    tags: ['sexual', 'fantasy']
  },
  {
    id: 'hot-dare-1',
    level: 'hot',
    kind: 'dare',
    text: 'Striptease for your partner for 2 minutes.',
    gender_for: ['female', 'male'],
    gender_target: ['female', 'male'],
    tags: ['physical', 'sexual', 'dancing']
  },
  {
    id: 'spicy-truth-1',
    level: 'spicy',
    kind: 'truth',
    text: 'What is the kinkiest thing you have ever done?',
    gender_for: ['female', 'male'],
    gender_target: ['female', 'male'],
    tags: ['sexual', 'kinky']
  },
  {
    id: 'spicy-dare-1',
    level: 'spicy',
    kind: 'dare',
    text: 'Let your partner choose your underwear for the day.',
    gender_for: ['female', 'male'],
    gender_target: ['female', 'male'],
    tags: ['clothing', 'control']
  },
  {
    id: 'kinky-truth-1',
    level: 'kinky',
    kind: 'truth',
    text: 'What is your most taboo desire?',
    gender_for: ['female', 'male'],
    gender_target: ['female', 'male'],
    tags: ['sexual', 'taboo']
  },
  {
    id: 'kinky-dare-1',
    level: 'kinky',
    kind: 'dare',
    text: 'Be your partner\'s slave for the next hour.',
    gender_for: ['female', 'male'],
    gender_target: ['female', 'male'],
    tags: ['control', 'dominance', 'submission']
  }
]

export const createItemLookup = (items: Item[]) => {
  const lookup: Record<Exclude<Level, 'Progressive' | 'Custom'>, Record<ItemKind, Item[]>> = {
    soft: { truth: [], dare: [] },
    mild: { truth: [], dare: [] },
    hot: { truth: [], dare: [] },
    spicy: { truth: [], dare: [] },
    kinky: { truth: [], dare: [] }
  }

  items.forEach(item => {
    if (item.level !== 'Progressive' && item.level !== 'Custom' && item.level in lookup && item.kind in lookup[item.level]) {
      lookup[item.level][item.kind].push(item)
    }
  })

  return lookup
}

export const getAvailableItems = (
  items: Item[],
  level: Exclude<Level, 'Progressive'>,
  kind: ItemKind,
  usedItems: Record<string, Record<string, string[]>>,
  priorGameItems: string[] = [],
  excludedTags: string[] = []
): Item[] => {
  const usedForLevelKind = getUsedItemsForLevelKind(usedItems, level, kind)
  
  return items.filter(item => {
    // Basic checks
    if (item.level !== level || item.kind !== kind) return false
    if (usedForLevelKind.includes(item.id)) return false
    if (priorGameItems.includes(item.id)) return false
    
    // Check if item has any excluded tags
    if (excludedTags.length > 0 && item.tags && item.tags.length > 0) {
      const hasExcludedTag = item.tags.some(tag => excludedTags.includes(tag))
      if (hasExcludedTag) return false
    }
    
    return true
  })
}

export const getRandomItem = (availableItems: Item[]): Item | null => {
  if (availableItems.length === 0) return null
  
  const randomIndex = Math.floor(Math.random() * availableItems.length)
  return availableItems[randomIndex]
}

export const getWildCardItem = (
  items: Item[],
  _level: Exclude<Level, 'Progressive'>,
  usedItems: Record<string, Record<string, string[]>>,
  priorGameItems: string[] = [],
  excludedTags: string[] = []
): Item | null => {
  const availableItems = items.filter(item => {
    // Basic checks
    if (isItemUsed(usedItems, item)) return false
    if (priorGameItems.includes(item.id)) return false
    
    // Check if item has any excluded tags
    if (excludedTags.length > 0 && item.tags && item.tags.length > 0) {
      const hasExcludedTag = item.tags.some(tag => excludedTags.includes(tag))
      if (hasExcludedTag) return false
    }
    
    return true
  })
  
  return getRandomItem(availableItems)
}

export const getItemCounts = (
  items: Item[],
  level: Exclude<Level, 'Progressive'>,
  usedItems: Record<string, Record<string, string[]>>,
  priorGameItems: string[] = [],
  excludedTags: string[] = []
): { truth: number; dare: number } => {
  const truthItems = getAvailableItems(items, level, 'truth', usedItems, priorGameItems, excludedTags)
  const dareItems = getAvailableItems(items, level, 'dare', usedItems, priorGameItems, excludedTags)
  
  return {
    truth: truthItems.length,
    dare: dareItems.length
  }
}

export const isWildCardAvailable = (
  items: Item[],
  usedItems: Record<string, Record<string, string[]>>,
  priorGameItems: string[] = []
): boolean => {
  const availableItems = items.filter(item => 
    !isItemUsed(usedItems, item) &&
    !priorGameItems.includes(item.id)
  )
  
  return availableItems.length > 0
}
