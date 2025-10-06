import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabaseChallengeService } from '../lib/supabaseService'
import { ReactionType } from '../types'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { id: 'test-id', challenge_id: 'challenge-1', reaction: 'up', created_at: '2024-01-01T00:00:00Z' },
          error: null
        }))
      }))
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [
            { id: 'test-id', challenge_id: 'challenge-1', reaction: 'up', created_at: '2024-01-01T00:00:00Z' }
          ],
          error: null
        }))
      }))
    }))
  }))
}

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}))

describe('ChallengeRating', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('SupabaseChallengeService', () => {
    it('should submit a reaction successfully', async () => {
      const challengeId = 'challenge-1'
      const reaction: ReactionType = 'up'

      const result = await SupabaseChallengeService.submitReaction(challengeId, reaction)

      expect(result).toEqual({
        id: 'test-id',
        challenge_id: 'challenge-1',
        reaction: 'up',
        created_at: '2024-01-01T00:00:00Z'
      })
    })

    it('should get reactions for a challenge', async () => {
      const challengeId = 'challenge-1'

      const result = await SupabaseChallengeService.getReactionsForChallenge(challengeId)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'test-id',
        challenge_id: 'challenge-1',
        reaction: 'up',
        created_at: '2024-01-01T00:00:00Z'
      })
    })

    it('should get reaction stats for a challenge', async () => {
      const challengeId = 'challenge-1'
      
      // Mock the select method to return reaction data
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [
            { reaction: 'up' },
            { reaction: 'up' },
            { reaction: 'down' }
          ],
          error: null
        }))
      }))
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect
      })

      const result = await SupabaseChallengeService.getReactionStats(challengeId)

      expect(result).toEqual({ up: 2, down: 1 })
    })
  })
})
