import type { PlayerSnapshot, PlayerPreferences } from '../types'

const PLAYER_NAMES_KEY = 'truthOrDare_playerNames'
const PLAYER_PREFERENCES_KEY = 'truthOrDare_playerPreferences'
const EXPIRY_HOURS = 24

interface StoredData<T> {
  data: T
  expiryTime: number
}

// Helper to check if data is expired
const isExpired = (expiryTime: number): boolean => {
  return Date.now() > expiryTime
}

// Helper to get expiry time (24 hours from now)
const getExpiryTime = (): number => {
  return Date.now() + (EXPIRY_HOURS * 60 * 60 * 1000)
}

// Save player names to localStorage
export const savePlayerNames = (players: PlayerSnapshot[]): void => {
  const names = players.map(p => ({ id: p.id, name: p.name, gender: p.gender }))
  const stored: StoredData<typeof names> = {
    data: names,
    expiryTime: getExpiryTime()
  }
  localStorage.setItem(PLAYER_NAMES_KEY, JSON.stringify(stored))
}

// Load player names from localStorage
export const loadPlayerNames = (): Array<{ id: string; name: string; gender: string }> | null => {
  try {
    const stored = localStorage.getItem(PLAYER_NAMES_KEY)
    if (!stored) return null

    const parsed: StoredData<Array<{ id: string; name: string; gender: string }>> = JSON.parse(stored)
    
    if (isExpired(parsed.expiryTime)) {
      localStorage.removeItem(PLAYER_NAMES_KEY)
      return null
    }

    // Refresh expiry time on access
    const refreshed: StoredData<typeof parsed.data> = {
      data: parsed.data,
      expiryTime: getExpiryTime()
    }
    localStorage.setItem(PLAYER_NAMES_KEY, JSON.stringify(refreshed))

    return parsed.data
  } catch (error) {
    console.error('Error loading player names:', error)
    return null
  }
}

// Save player preferences to localStorage
export const savePlayerPreferences = (playerId: string, preferences: PlayerPreferences): void => {
  try {
    // Load existing preferences
    const allPreferences = loadAllPlayerPreferences() || {}
    
    // Update this player's preferences
    allPreferences[playerId] = preferences

    const stored: StoredData<Record<string, PlayerPreferences>> = {
      data: allPreferences,
      expiryTime: getExpiryTime()
    }
    localStorage.setItem(PLAYER_PREFERENCES_KEY, JSON.stringify(stored))
  } catch (error) {
    console.error('Error saving player preferences:', error)
  }
}

// Load all player preferences from localStorage
export const loadAllPlayerPreferences = (): Record<string, PlayerPreferences> | null => {
  try {
    const stored = localStorage.getItem(PLAYER_PREFERENCES_KEY)
    if (!stored) return null

    const parsed: StoredData<Record<string, PlayerPreferences>> = JSON.parse(stored)
    
    if (isExpired(parsed.expiryTime)) {
      localStorage.removeItem(PLAYER_PREFERENCES_KEY)
      return null
    }

    // Refresh expiry time on access
    const refreshed: StoredData<typeof parsed.data> = {
      data: parsed.data,
      expiryTime: getExpiryTime()
    }
    localStorage.setItem(PLAYER_PREFERENCES_KEY, JSON.stringify(refreshed))

    return parsed.data
  } catch (error) {
    console.error('Error loading player preferences:', error)
    return null
  }
}

// Load preferences for a specific player
export const loadPlayerPreferences = (playerId: string): PlayerPreferences | null => {
  const allPreferences = loadAllPlayerPreferences()
  return allPreferences?.[playerId] || null
}

// Clear all stored player data
export const clearPlayerData = (): void => {
  localStorage.removeItem(PLAYER_NAMES_KEY)
  localStorage.removeItem(PLAYER_PREFERENCES_KEY)
}

// Reset preferences for a specific player
export const resetPlayerPreferences = (playerId: string): void => {
  try {
    const allPreferences = loadAllPlayerPreferences() || {}
    delete allPreferences[playerId]
    
    const stored: StoredData<Record<string, PlayerPreferences>> = {
      data: allPreferences,
      expiryTime: getExpiryTime()
    }
    localStorage.setItem(PLAYER_PREFERENCES_KEY, JSON.stringify(stored))
  } catch (error) {
    console.error('Error resetting player preferences:', error)
  }
}
