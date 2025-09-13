import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPlayerId } from '../lib/ids'
import { Header } from '../components/Header'
import { PlayerList } from '../components/PlayerList'
import { LevelSelector } from '../components/LevelSelector'
import { PreviousGamesPicker } from '../components/PreviousGamesPicker'
import { useGameStore } from '../store/gameStore'
import type { PlayerSnapshot, Level } from '../types'
import styles from './HomePage.module.css'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { startGame, gameHistory, loadGameHistory, removeGameFromHistory } = useGameStore()
  
  const [players, setPlayers] = useState<PlayerSnapshot[]>([
    { id: createPlayerId(), name: '', gender: 'male' },
    { id: createPlayerId(), name: '', gender: 'female' }
  ])
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [selectedPriorGames, setSelectedPriorGames] = useState<string[]>([])
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    loadGameHistory()
  }, [loadGameHistory])

  const handleStartGame = async () => {
    if (!selectedLevel || players.length < 2) return
    
    // Validate player names
    const validPlayers = players.filter(p => p.name.trim().length > 0)
    if (validPlayers.length < 2) return
    
    setIsStarting(true)
    
    try {
      const gameId = startGame(validPlayers, selectedLevel, selectedPriorGames)
      navigate(`/game/${gameId}`)
    } catch (error) {
      console.error('Failed to start game:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const canStartGame = selectedLevel && players.length >= 2 && players.every(p => p.name.trim().length > 0)

  return (
    <div className={styles.container}>
      <Header 
        title="Truth or Dare" 
        subtitle="The sexy version" 
      />
      
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.sections}>
            <PlayerList
              players={players}
              onPlayersChange={setPlayers}
            />
            
            <LevelSelector
              selectedLevel={selectedLevel}
              onLevelChange={setSelectedLevel}
            />
            
            <PreviousGamesPicker
              gameHistory={gameHistory}
              selectedGameIds={selectedPriorGames}
              onSelectionChange={setSelectedPriorGames}
              onRemoveGame={(gameId) => {
                // Remove from local state and call store method
                setSelectedPriorGames(prev => prev.filter(id => id !== gameId))
                removeGameFromHistory(gameId)
              }}
            />
          </div>
          
          <div className={styles.actions}>
            <button
              className={styles.startButton}
              onClick={handleStartGame}
              disabled={!canStartGame || isStarting}
              type="button"
            >
              {isStarting ? 'Starting...' : 'Start Game'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
