import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/layout'
import { PlayerList, LevelSelector, PreviousGamesPicker } from '../components/forms'
import { CustomGameSection } from '../components/forms/CustomGameSection'
import { useGameStore, useHistoryStore, useDevStore } from '../store'
import { useGameSetup } from '../hooks/useGameSetup'
import { useCustomGame } from '../hooks/useCustomGame'
import styles from './HomePage.module.css'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { startGame, startCustomGame, clearGame } = useGameStore()
  const { gameHistory, removeGameFromHistory } = useHistoryStore()
  const { isDevMode, disableGameSaving, setDisableGameSaving } = useDevStore()
  
  const [showCustomGame, setShowCustomGame] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  
  // Regular game setup
  const {
    players,
    setPlayers,
    selectedLevel,
    setSelectedLevel,
    selectedPriorGames,
    setSelectedPriorGames,
    canStartGame
  } = useGameSetup()
  
  // Custom game setup
  const customGameProps = useCustomGame()
  
  // Clear game state when returning to homepage
  useEffect(() => {
    clearGame()
  }, [clearGame])
  
  const handleStartGame = async () => {
    if (!selectedLevel || !canStartGame) return
    
    setIsStarting(true)
    try {
      const gameId = startGame(players, selectedLevel, selectedPriorGames)
      navigate(`/game/${gameId}`)
    } catch (error) {
      console.error('Failed to start game:', error)
    } finally {
      setIsStarting(false)
    }
  }
  
  const handleStartCustomGame = () => {
    setShowCustomGame(true)
  }
  
  if (showCustomGame) {
    return (
      <PageLayout
        title="Truth or Dare"
        subtitle="The sexy version"
      >
        <CustomGameSection
            players={players}
            onPlayersChange={setPlayers}
            customChallenges={customGameProps.customChallenges}
            setCustomChallenges={customGameProps.setCustomChallenges}
            customChallengeForm={customGameProps.customChallengeForm}
            setCustomChallengeForm={customGameProps.setCustomChallengeForm}
            gameChallengeSelector={customGameProps.gameChallengeSelector}
            setGameChallengeSelector={customGameProps.setGameChallengeSelector}
            challengeFilter={customGameProps.challengeFilter}
            setChallengeFilter={customGameProps.setChallengeFilter}
            showAllChallenges={customGameProps.showAllChallenges}
            setShowAllChallenges={customGameProps.setShowAllChallenges}
            gameMode={customGameProps.gameMode}
            setGameMode={customGameProps.setGameMode}
            onBackToHome={() => setShowCustomGame(false)}
            onStartCustomGame={async () => {
              setIsStarting(true)
              try {
                const gameId = startCustomGame(players, customGameProps.customChallenges, customGameProps.gameMode)
                navigate(`/game/${gameId}`)
              } catch (error) {
                console.error('Failed to start custom game:', error)
              } finally {
                setIsStarting(false)
              }
            }}
            isStarting={isStarting}
            canStartCustomGame={customGameProps.customChallenges.length > 0}
          />
      </PageLayout>
    )
  }
  
  return (
    <PageLayout
      title="Truth or Dare"
      subtitle="The sexy version"
    >
      <div className={styles.container}>
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
              onRemoveGame={removeGameFromHistory}
            />
          </div>
        </div>
        
        {/* Development-only checkbox */}
        {isDevMode && (
          <div className={styles.devSection}>
            <label className={styles.devCheckbox}>
              <input
                type="checkbox"
                checked={disableGameSaving}
                onChange={(e) => setDisableGameSaving(e.target.checked)}
              />
              <span>Disable game saving (dev mode)</span>
            </label>
          </div>
        )}
        
        <div className={styles.actions}>
          <button
            className={styles.customGameButton}
            onClick={handleStartCustomGame}
            disabled={isStarting}
            type="button"
          >
            Create Custom Game
          </button>
          
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
    </PageLayout>
  )
}
