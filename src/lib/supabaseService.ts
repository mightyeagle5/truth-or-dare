import { supabase } from './supabase'
import { Item, ChallengeReaction, ReactionType } from '../types'

export interface ChallengeSummary {
  level: string
  kind: string
  total: number
}

// Challenge service for Supabase operations
export class SupabaseChallengeService {
  // Convert database row to Item type
  private static convertDbRowToItem(row: any): Item {
    return {
      id: row.id,
      level: row.level,
      kind: row.kind,
      text: row.text,
      gender_for: row.gender_for || [],
      gender_target: row.gender_target || [],
      tags: row.tags || [],
      is_deleted: row.is_deleted || false,
      deleted_at: row.deleted_at,
      updated_at: row.updated_at,
      is_time_based: row.is_time_based || false,
      duration: row.duration || 0
    }
  }

  // Convert Item to database insert/update format
  private static convertItemToDb(item: Item) {
    return {
      id: item.id,
      level: item.level,
      kind: item.kind,
      text: item.text,
      gender_for: item.gender_for,
      gender_target: item.gender_target,
      tags: item.tags,
      is_deleted: item.is_deleted,
      deleted_at: item.deleted_at,
      is_time_based: item.is_time_based,
      duration: item.duration
    }
  }

  // Get all challenges (for game - excludes deleted)
  static async getAllChallenges(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching all challenges:', error)
      throw error
    }

    return (data || []).map(row => this.convertDbRowToItem(row))
  }

  // Get all challenges including deleted (for admin panel)
  static async getAllChallengesForAdmin(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching challenges for admin:', error)
      throw error
    }

    return (data || []).map(row => this.convertDbRowToItem(row))
  }

  // Get challenge by ID
  static async getChallengeById(id: string): Promise<Item | null> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching challenge:', error)
      return null
    }

    return this.convertDbRowToItem(data)
  }

  // Create new challenge
  static async createChallenge(challenge: Omit<Item, 'id'>): Promise<Item> {
    // Don't include ID - let database generate it
    const dbData = {
      level: challenge.level,
      kind: challenge.kind,
      text: challenge.text,
      gender_for: challenge.gender_for,
      gender_target: challenge.gender_target,
      tags: challenge.tags,
      is_time_based: challenge.is_time_based,
      duration: challenge.duration
    }
    
    const { data, error } = await supabase
      .from('challenges')
      .insert([dbData])
      .select()
      .single()

    if (error) {
      console.error('Error creating challenge:', error)
      throw error
    }

    return this.convertDbRowToItem(data)
  }

  // Update challenge
  static async updateChallenge(id: string, updates: Partial<Item>): Promise<Item> {
    const dbData = this.convertItemToDb(updates as Item)
    const { data, error } = await supabase
      .from('challenges')
      .update({
        ...dbData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating challenge:', error)
      throw error
    }

    return this.convertDbRowToItem(data)
  }

  // Soft delete challenge
  static async softDeleteChallenge(id: string): Promise<void> {
    const { error } = await supabase
      .from('challenges')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error soft deleting challenge:', error)
      throw error
    }
  }

  // Restore challenge
  static async restoreChallenge(id: string): Promise<void> {
    const { error } = await supabase
      .from('challenges')
      .update({
        is_deleted: false,
        deleted_at: null
      })
      .eq('id', id)

    if (error) {
      console.error('Error restoring challenge:', error)
      throw error
    }
  }

  // Batch operations for admin panel
  static async batchCreateChallenges(challenges: Omit<Item, 'id'>[]): Promise<Item[]> {
    // Don't include ID - let database generate it
    const dbData = challenges.map(challenge => ({
      level: challenge.level,
      kind: challenge.kind,
      text: challenge.text,
      gender_for: challenge.gender_for,
      gender_target: challenge.gender_target,
      tags: challenge.tags,
      is_time_based: challenge.is_time_based,
      duration: challenge.duration
    }))
    
    const { data, error } = await supabase
      .from('challenges')
      .insert(dbData)
      .select()

    if (error) {
      console.error('Error batch creating challenges:', error)
      throw error
    }

    return (data || []).map(row => this.convertDbRowToItem(row))
  }

  static async batchUpdateChallenges(updates: { id: string; updates: Partial<Item> }[]): Promise<Item[]> {
    const promises = updates.map(({ id, updates }) => 
      this.updateChallenge(id, updates)
    )
    
    return Promise.all(promises)
  }

  static async batchSoftDeleteChallenges(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('challenges')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .in('id', ids)

    if (error) {
      console.error('Error batch soft deleting challenges:', error)
      throw error
    }
  }

  // Get challenges summary for custom game creation (excludes deleted)
  static async getChallengesSummary(): Promise<ChallengeSummary[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('level, kind')
      .eq('is_deleted', false)

    if (error) {
      console.error('Error fetching challenges summary:', error)
      throw error
    }

    // Group by level and kind, counting items
    const summary: Record<string, Record<string, number>> = {}
    
    data?.forEach(item => {
      if (!summary[item.level]) {
        summary[item.level] = {}
      }
      if (!summary[item.level][item.kind]) {
        summary[item.level][item.kind] = 0
      }
      summary[item.level][item.kind]++
    })

    // Convert to array format
    const result: ChallengeSummary[] = []
    Object.keys(summary).forEach(level => {
      Object.keys(summary[level]).forEach(kind => {
        result.push({
          level,
          kind,
          total: summary[level][kind]
        })
      })
    })

    // Sort by level and kind
    const levelOrder = ['soft', 'mild', 'hot', 'spicy', 'kinky']
    result.sort((a, b) => {
      const levelDiff = levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
      if (levelDiff !== 0) return levelDiff
      return a.kind.localeCompare(b.kind)
    })

    return result
  }

  // Get challenges by level and kind for custom game creation (excludes deleted)
  static async getChallengesByLevelAndKind(level: string, kind: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('level', level)
      .eq('kind', kind)
      .eq('is_deleted', false)
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching challenges by level and kind:', error)
      throw error
    }

    return (data || []).map(row => this.convertDbRowToItem(row))
  }

  // Get challenges by level and kind for admin panel (includes deleted)
  static async getChallengesByLevelAndKindForAdmin(level: string, kind: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('level', level)
      .eq('kind', kind)
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching challenges by level and kind for admin:', error)
      throw error
    }

    return (data || []).map(row => this.convertDbRowToItem(row))
  }

  // Fetch a random challenge pair (1 truth + 1 dare) for gameplay
  static async fetchChallengePair(
    level: string,
    usedItemIds: string[],
    priorGameItemIds: string[],
    excludedTags: string[],
    genderFor?: string[]
  ): Promise<{ truth: Item | null; dare: Item | null }> {
    // Combine all excluded IDs
    const allExcludedIds = [...usedItemIds, ...priorGameItemIds]

    // Call the stored function to get 1 random truth and 1 random dare
    const [truthResult, dareResult] = await Promise.all([
      supabase.rpc('get_random_challenge', {
        p_level: level,
        p_kind: 'truth',
        p_excluded_ids: allExcludedIds
      }),
      supabase.rpc('get_random_challenge', {
        p_level: level,
        p_kind: 'dare',
        p_excluded_ids: allExcludedIds
      })
    ])

    if (truthResult.error) {
      console.error('Supabase error (truth):', truthResult.error)
      throw truthResult.error
    }

    if (dareResult.error) {
      console.error('Supabase error (dare):', dareResult.error)
      throw dareResult.error
    }

    // Convert to Item objects (RPC returns array, we take first item)
    const truthData = Array.isArray(truthResult.data) && truthResult.data.length > 0 
      ? this.convertDbRowToItem(truthResult.data[0])
      : null
    const dareData = Array.isArray(dareResult.data) && dareResult.data.length > 0
      ? this.convertDbRowToItem(dareResult.data[0])
      : null

    // Client-side filtering for tags and gender (since we can't do complex array operations in SQL easily)
    let randomTruth = truthData
    let randomDare = dareData

    // Filter by excluded tags
    if (randomTruth && excludedTags.length > 0 && randomTruth.tags?.some(tag => excludedTags.includes(tag))) {
      randomTruth = null
    }
    if (randomDare && excludedTags.length > 0 && randomDare.tags?.some(tag => excludedTags.includes(tag))) {
      randomDare = null
    }

    // Filter by gender
    if (randomTruth && genderFor && genderFor.length > 0) {
      if (randomTruth.gender_for && randomTruth.gender_for.length > 0 && !randomTruth.gender_for.some(g => genderFor.includes(g))) {
        randomTruth = null
      }
    }
    if (randomDare && genderFor && genderFor.length > 0) {
      if (randomDare.gender_for && randomDare.gender_for.length > 0 && !randomDare.gender_for.some(g => genderFor.includes(g))) {
        randomDare = null
      }
    }

    return { truth: randomTruth, dare: randomDare }
  }

  // Rating/Reaction methods
  static async submitReaction(challengeId: string, reaction: ReactionType): Promise<ChallengeReaction> {
    const { data, error } = await supabase
      .from('challenge_reactions')
      .insert([{
        challenge_id: challengeId,
        reaction: reaction
      }])
      .select()
      .single()

    if (error) {
      console.error('Error submitting reaction:', error)
      throw error
    }

    return {
      id: data.id,
      challenge_id: data.challenge_id,
      reaction: data.reaction,
      created_at: data.created_at
    }
  }

  static async getReactionsForChallenge(challengeId: string): Promise<ChallengeReaction[]> {
    const { data, error } = await supabase
      .from('challenge_reactions')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reactions:', error)
      throw error
    }

    return (data || []).map(row => ({
      id: row.id,
      challenge_id: row.challenge_id,
      reaction: row.reaction,
      created_at: row.created_at
    }))
  }

  static async getReactionStats(challengeId: string): Promise<{ up: number; down: number }> {
    const { data, error } = await supabase
      .from('challenge_reactions')
      .select('reaction')
      .eq('challenge_id', challengeId)

    if (error) {
      console.error('Error fetching reaction stats:', error)
      throw error
    }

    const stats = { up: 0, down: 0 }
    data?.forEach(row => {
      if (row.reaction === 'up') stats.up++
      else if (row.reaction === 'down') stats.down++
    })

    return stats
  }
}
