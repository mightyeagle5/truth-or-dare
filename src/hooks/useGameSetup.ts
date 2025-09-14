import { useState, useEffect } from 'react'
import { createPlayerId } from '../lib/ids'
import type { PlayerSnapshot, Level, GameHistoryEntry } from '../types'

export const useGameSetup = () => {
  const [players, setPlayers] = useState<PlayerSnapshot[]>([
    { id: createPlayerId(), name: '', gender: 'male' },
    { id: createPlayerId(), name: '', gender: 'female' }
  ])
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [selectedPriorGames, setSelectedPriorGames] = useState<string[]>([])
  const [isStarting, setIsStarting] = useState(false)
  const [showCustomGame, setShowCustomGame] = useState(false)

  // Computed values
  const canStartGame = Boolean(selectedLevel && players.length >= 2 && players.every(p => p.name.trim().length > 0))
  const canStartCustomGame = players.length >= 2 && players.every(p => p.name.trim().length > 0)
  const getValidPlayers = () => players.filter(p => p.name.trim().length > 0)

  // Actions
  const resetForm = () => {
    setPlayers([
      { id: createPlayerId(), name: '', gender: 'male' },
      { id: createPlayerId(), name: '', gender: 'female' }
    ])
    setSelectedLevel(null)
    setSelectedPriorGames([])
    setIsStarting(false)
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
    
    // Computed
    canStartGame,
    canStartCustomGame,
    getValidPlayers,
    
    // Actions
    resetForm
  }
}