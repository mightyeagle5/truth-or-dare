import type { Player, PlayerSnapshot } from '../types'

/**
 * Substitutes player name placeholders in challenge text with actual player names
 * @param text - The challenge text with {active_player} and {other_player} placeholders
 * @param activePlayer - The player whose turn it is
 * @param targetPlayer - The player the challenge is performed on (can be null)
 * @returns The text with player names substituted
 */
export const substitutePlayerNames = (
  text: string,
  activePlayer: Player | PlayerSnapshot,
  targetPlayer: Player | PlayerSnapshot | null
): string => {
  let result = text.replace(/{active_player}/g, activePlayer.name)
  
  if (targetPlayer) {
    result = result.replace(/{other_player}/g, targetPlayer.name)
  } else {
    // If no target player, replace {other_player} with a generic term
    result = result.replace(/{other_player}/g, 'another player')
  }
  
  return result
}

/**
 * Selects a target player for a challenge based on gender requirements
 * @param activePlayer - The player whose turn it is
 * @param allPlayers - All players in the game
 * @param genderTarget - Array of valid target genders
 * @returns A valid target player or null if none available
 */
export const selectTargetPlayer = (
  activePlayer: Player | PlayerSnapshot,
  allPlayers: (Player | PlayerSnapshot)[],
  genderTarget: string[]
): Player | PlayerSnapshot | null => {
  // Handle missing or empty genderTarget array
  if (!genderTarget || genderTarget.length === 0) {
    // If no gender requirements, select any other player
    const otherPlayers = allPlayers.filter(player => player.id !== activePlayer.id)
    if (otherPlayers.length === 0) return null
    return otherPlayers[Math.floor(Math.random() * otherPlayers.length)]
  }
  
  // Filter players based on gender_target requirements
  const validTargets = allPlayers.filter(player => 
    player.id !== activePlayer.id && // Can't target self
    genderTarget.includes(player.gender)
  )
  
  // Return null if no valid targets
  if (validTargets.length === 0) {
    return null
  }
  
  // Select random target from valid options
  return validTargets[Math.floor(Math.random() * validTargets.length)]
}

/**
 * Checks if a challenge can be given to a specific player based on gender requirements
 * @param player - The player to check
 * @param genderFor - Array of valid genders for this challenge
 * @returns True if the challenge can be given to this player
 */
export const canGiveChallengeToPlayer = (
  player: Player | PlayerSnapshot,
  genderFor: string[]
): boolean => {
  return genderFor.includes(player.gender)
}

/**
 * Checks if a challenge can be performed on a specific player based on gender requirements
 * @param player - The player to check
 * @param genderTarget - Array of valid target genders for this challenge
 * @returns True if the challenge can be performed on this player
 */
export const canPerformChallengeOnPlayer = (
  player: Player | PlayerSnapshot,
  genderTarget: string[]
): boolean => {
  return genderTarget.includes(player.gender)
}
