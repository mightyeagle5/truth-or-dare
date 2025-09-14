import { useState, useEffect } from 'react'
import { createPlayerId } from '../lib/ids'
import type { PlayerSnapshot, Level } from '../types'

export const useGameSetup = () => {
  // Game setup state
  const [players, setPlayers] = useState<PlayerSnapshot[]>([
    { id: createPlayerId(), name: '', gender: 'male' },
    { id: createPlayerId(), name: '', gender: 'female' }
  ])
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [selectedPriorGames, setSelectedPriorGames] = useState<string[]>([])
  const [isStarting, setIsStarting] = useState(false)
  const [showCustomGame, setShowCustomGame] = useState(false)

  // Computed values
  const canStartGame = selectedLevel && players.length >= 2 && players.every(p => p.name.trim().length > 0)
  
  const canStartCustomGame = (customChallengesCount: number) => 
    customChallengesCount > 0 && players.length >= 2 && players.every(p => p.name.trim().length > 0)

  // Validate players for game start
  const getValidPlayers = () => {
    return players.filter(p => p.name.trim().length > 0)
  }

  // Reset form state
  const resetForm = () => {
    setPlayers([
      { id: createPlayerId(), name: '', gender: 'male' },
      { id: createPlayerId(), name: '', gender: 'female' }
    ])
    setSelectedLevel(null)
    setSelectedPriorGames([])
    setShowCustomGame(false)
  }

  return {
    // State
    players,
    selectedLevel,
    selectedPriorGames,
    isStarting,
    showCustomGame,
    
    // Setters
    setPlayers,
    setSelectedLevel,
    setSelectedPriorGames,
    setIsStarting,
    setShowCustomGame,
    
    // Computed values
    canStartGame,
    canStartCustomGame,
    getValidPlayers,
    
    // Actions
    resetForm
  }
}
