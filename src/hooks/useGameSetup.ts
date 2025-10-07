import { useState, useEffect } from 'react'
import { createPlayerId } from '../lib/ids'
import type { PlayerSnapshot, Level, GameHistoryEntry, GameConfiguration } from '../types'

export const useGameSetup = () => {
  const [players, setPlayers] = useState<PlayerSnapshot[]>([
    { id: createPlayerId(), name: '', gender: 'male' },
    { id: createPlayerId(), name: '', gender: 'female' }
  ])
  // Default game level to 'soft' by default. The level selector UI is hidden on
  // the home screen, but the state and logic remain for future use.
  const [selectedLevel, setSelectedLevel] = useState<Level | null>('soft')
  const [selectedPriorGames, setSelectedPriorGames] = useState<string[]>([])
  const [isStarting, setIsStarting] = useState(false)
  const [showCustomGame, setShowCustomGame] = useState(false)
  const [gameConfiguration, setGameConfiguration] = useState<GameConfiguration>({
    wildCardEnabled: true,
    skipEnabled: true,
    consecutiveLimit: null
  })

  // Computed values
  // Allow starting with optional names. Names will default to "Player 1", "Player 2" at start.
  const canStartGame = Boolean(selectedLevel && players.length >= 2)
  const canStartCustomGame = players.length >= 2
  const getValidPlayers = () => players

  // Actions
  const resetForm = () => {
    setPlayers([
      { id: createPlayerId(), name: '', gender: 'male' },
      { id: createPlayerId(), name: '', gender: 'female' }
    ])
    // Keep defaulting to 'soft' on reset as level selection is currently hidden.
    setSelectedLevel('soft')
    setSelectedPriorGames([])
    setIsStarting(false)
    setShowCustomGame(false)
    setGameConfiguration({
      wildCardEnabled: true,
      skipEnabled: true,
      consecutiveLimit: null
    })
  }

  return {
    // State
    players,
    selectedLevel,
    selectedPriorGames,
    isStarting,
    showCustomGame,
    gameConfiguration,
    
    // Setters
    setPlayers,
    setSelectedLevel,
    setSelectedPriorGames,
    setIsStarting,
    setShowCustomGame,
    setGameConfiguration,
    
    // Computed
    canStartGame,
    canStartCustomGame,
    getValidPlayers,
    
    // Actions
    resetForm
  }
}