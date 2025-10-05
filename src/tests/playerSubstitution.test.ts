import { describe, it, expect } from 'vitest'
import { substitutePlayerNames } from '../lib/playerSubstitution'
import type { Player } from '../types'

describe('playerSubstitution', () => {
  const mockPlayer1: Player = {
    id: '1',
    name: 'Alice',
    gender: 'female'
  }

  const mockPlayer2: Player = {
    id: '2', 
    name: 'Bob',
    gender: 'male'
  }

  it('should substitute both placeholders when target player is provided', () => {
    const text = '{active_player}, kiss {other_player}'
    const result = substitutePlayerNames(text, mockPlayer1, mockPlayer2)
    expect(result).toBe('Alice, kiss Bob')
  })

  it('should substitute active_player and use generic term for other_player when target is null', () => {
    const text = '{active_player}, kiss {other_player}'
    const result = substitutePlayerNames(text, mockPlayer1, null)
    expect(result).toBe('Alice, kiss another player')
  })

  it('should handle multiple occurrences of placeholders', () => {
    const text = '{active_player}, what do you think about {other_player}? Tell {other_player} something nice.'
    const result = substitutePlayerNames(text, mockPlayer1, mockPlayer2)
    expect(result).toBe('Alice, what do you think about Bob? Tell Bob something nice.')
  })

  it('should handle multiple occurrences when target is null', () => {
    const text = '{active_player}, what do you think about {other_player}? Tell {other_player} something nice.'
    const result = substitutePlayerNames(text, mockPlayer1, null)
    expect(result).toBe('Alice, what do you think about another player? Tell another player something nice.')
  })

  it('should handle text without placeholders', () => {
    const text = 'This is a simple challenge without placeholders'
    const result = substitutePlayerNames(text, mockPlayer1, mockPlayer2)
    expect(result).toBe('This is a simple challenge without placeholders')
  })
})
