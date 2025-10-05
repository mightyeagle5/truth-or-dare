import { supabase } from './supabase'
import { Item } from '../types'

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
      is_time_based: item.is_time_based,
      duration: item.duration
    }
  }

  // Get all challenges
  static async getAllChallenges(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching challenges:', error)
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

  // Delete challenge
  static async deleteChallenge(id: string): Promise<void> {
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting challenge:', error)
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

  static async batchDeleteChallenges(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('challenges')
      .delete()
      .in('id', ids)

    if (error) {
      console.error('Error batch deleting challenges:', error)
      throw error
    }
  }

  // Get challenges summary for custom game creation
  static async getChallengesSummary(): Promise<ChallengeSummary[]> {
    const { data, error } = await supabase
      .from('challenges_summary')
      .select('*')
      .order('level', { ascending: true })
      .order('kind', { ascending: true })

    if (error) {
      console.error('Error fetching challenges summary:', error)
      throw error
    }

    return (data || []).map(item => ({
      level: item.level,
      kind: item.kind,
      total: item.total
    }))
  }

  // Get challenges by level and kind for custom game creation
  static async getChallengesByLevelAndKind(level: string, kind: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('level', level)
      .eq('kind', kind)
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching challenges by level and kind:', error)
      throw error
    }

    return (data || []).map(row => this.convertDbRowToItem(row))
  }
}
