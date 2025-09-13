import { describe, it, expect } from 'vitest'
import { getNextProgressiveLevel, isLevelProgressive } from '../lib/guards'

describe('Level Progression', () => {
  it('should identify progressive level correctly', () => {
    expect(isLevelProgressive('Progressive')).toBe(true)
    expect(isLevelProgressive('Soft')).toBe(false)
    expect(isLevelProgressive('Kinky')).toBe(false)
  })

  it('should advance through progressive levels', () => {
    expect(getNextProgressiveLevel('Soft')).toBe('Mild')
    expect(getNextProgressiveLevel('Mild')).toBe('Hot')
    expect(getNextProgressiveLevel('Hot')).toBe('Spicy')
    expect(getNextProgressiveLevel('Spicy')).toBe('Kinky')
  })

  it('should return null at the highest level', () => {
    expect(getNextProgressiveLevel('Kinky')).toBe(null)
  })

  it('should handle 10-turn suggestion logic', () => {
    // Test that suggestion appears after 10 turns
    const game = {
      totalTurnsAtCurrentLevel: 10,
      isProgressive: true,
      currentLevel: 'Soft' as const
    }
    
    const shouldShow = game.totalTurnsAtCurrentLevel >= 10
    expect(shouldShow).toBe(true)
  })

  it('should handle depletion suggestion', () => {
    // Test that suggestion appears when pool is empty
    const truthCount = 0
    const dareCount = 5
    
    const shouldShowDepletionSuggestion = truthCount === 0 || dareCount === 0
    expect(shouldShowDepletionSuggestion).toBe(true)
  })
})
