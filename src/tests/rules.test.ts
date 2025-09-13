import { describe, it, expect } from 'vitest'
import { canChooseType } from '../lib/guards'
import { CONSECUTIVE_LIMIT } from '../lib/constants'

describe('Consecutive Choice Rules', () => {
  it('should allow choosing truth when under limit', () => {
    const player = { consecutiveTruths: 0, consecutiveDares: 0 }
    expect(canChooseType(player, 'truth')).toBe(true)
  })

  it('should allow choosing dare when under limit', () => {
    const player = { consecutiveTruths: 0, consecutiveDares: 0 }
    expect(canChooseType(player, 'dare')).toBe(true)
  })

  it('should block truth after 2 consecutive truths', () => {
    const player = { consecutiveTruths: 2, consecutiveDares: 0 }
    expect(canChooseType(player, 'truth')).toBe(false)
  })

  it('should block dare after 2 consecutive dares', () => {
    const player = { consecutiveTruths: 0, consecutiveDares: 2 }
    expect(canChooseType(player, 'dare')).toBe(false)
  })

  it('should allow switching types when at limit', () => {
    const player = { consecutiveTruths: 2, consecutiveDares: 0 }
    expect(canChooseType(player, 'dare')).toBe(true)
  })

  it('should respect the consecutive limit constant', () => {
    const player = { consecutiveTruths: CONSECUTIVE_LIMIT, consecutiveDares: 0 }
    expect(canChooseType(player, 'truth')).toBe(false)
  })
})
