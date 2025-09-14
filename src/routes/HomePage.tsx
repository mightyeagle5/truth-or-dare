import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/layout'
import { GameSetupForm, CustomGameSection } from '../components/forms'
import { useGameStore } from '../store/gameStore'
import { useGameSetup, useCustomGame } from '../hooks'
import styles from './HomePage.module.css'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { startGame, startCustomGame, gameHistory, loadGameHistory, removeGameFromHistory } = useGameStore()
  
  // Custom hooks
  const gameSetup = useGameSetup()
  const customGame = useCustomGame()

  useEffect(() => {
    loadGameHistory()
  }, [loadGameHistory])

  const handleStartGame = async () => {
    if (!gameSetup.selectedLevel || gameSetup.players.length < 2) return
    
    // Validate player names
    const validPlayers = gameSetup.getValidPlayers()
    if (validPlayers.length < 2) return
    
    gameSetup.setIsStarting(true)
    
    try {
      const gameId = startGame(validPlayers, gameSetup.selectedLevel, gameSetup.selectedPriorGames)
      navigate(`/game/${gameId}`)
    } catch (error) {
      console.error('Failed to start game:', error)
    } finally {
      gameSetup.setIsStarting(false)
    }
  }

  const handleStartCustomGame = async () => {
    if (!gameSetup.canStartCustomGame || customGame.customChallenges.length === 0) return
    
    // Validate player names
    const validPlayers = gameSetup.getValidPlayers()
    if (validPlayers.length < 2) return
    
    gameSetup.setIsStarting(true)
    
    try {
      const gameId = startCustomGame(validPlayers, customGame.customChallenges, customGame.gameMode)
      navigate(`/game/${gameId}`)
    } catch (error) {
      console.error('Failed to start custom game:', error)
    } finally {
      gameSetup.setIsStarting(false)
    }
  }


  return (
    <PageLayout
      title="Truth or Dare"
      subtitle="The sexy version"
    >
      {gameSetup.showCustomGame ? (
        <CustomGameSection
          // Players
          players={gameSetup.players}
          onPlayersChange={gameSetup.setPlayers}
          
          // Custom challenges
          customChallenges={customGame.customChallenges}
          setCustomChallenges={customGame.setCustomChallenges}
          
          // Custom challenge form
          customChallengeForm={customGame.customChallengeForm}
          setCustomChallengeForm={customGame.setCustomChallengeForm}
          
          // Game challenge selector
          gameChallengeSelector={customGame.gameChallengeSelector}
          setGameChallengeSelector={customGame.setGameChallengeSelector}
          
          // Challenge filter and display
          challengeFilter={customGame.challengeFilter}
          setChallengeFilter={customGame.setChallengeFilter}
          showAllChallenges={customGame.showAllChallenges}
          setShowAllChallenges={customGame.setShowAllChallenges}
          
          // Game mode
          gameMode={customGame.gameMode}
          setGameMode={customGame.setGameMode}
          
          // Actions
          onBackToHome={() => gameSetup.setShowCustomGame(false)}
          onStartCustomGame={handleStartCustomGame}
          isStarting={gameSetup.isStarting}
          canStartCustomGame={gameSetup.canStartCustomGame && customGame.customChallenges.length > 0}
        />
      ) : (
        <div className={styles.content}>
          <div className={styles.sections}>
            <GameSetupForm
              players={gameSetup.players}
              onPlayersChange={gameSetup.setPlayers}
              selectedLevel={gameSetup.selectedLevel}
              onLevelChange={gameSetup.setSelectedLevel}
              selectedPriorGames={gameSetup.selectedPriorGames}
              onPriorGamesChange={gameSetup.setSelectedPriorGames}
              gameHistory={gameHistory}
              onRemoveGame={removeGameFromHistory}
            />
          </div>
          
          <div className={styles.actions}>
            <button
              className={styles.customGameButton}
              onClick={() => gameSetup.setShowCustomGame(true)}
              type="button"
            >
              Create Custom Game
            </button>
            <button
              className={styles.startButton}
              onClick={handleStartGame}
              disabled={!gameSetup.canStartGame || gameSetup.isStarting}
              type="button"
            >
              {gameSetup.isStarting ? 'Starting...' : 'Start Game'}
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
