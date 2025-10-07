import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageLayout } from '../components/layout'
import { PlayerList, PreviousGamesPicker } from '../components/forms'
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
    // Level is defaulted to 'soft' and UI is hidden, but logic remains for later use.
    if (!selectedLevel || !canStartGame) return
    
    setIsStarting(true)
    try {
      const gameId = await startGame(players, selectedLevel, selectedPriorGames)
      if (gameId) {
        navigate(`/game/${gameId}`)
      }
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
    <PageLayout hideHeader title="" subtitle="">
      <div className={styles.container}>
        {import.meta.env.DEV && (
          <Link to="/admin/edit-challenges" className={styles.fixedAdminLink}>Admin</Link>
        )}
        <div className={styles.content}>
          <div className={styles.sections}>
            <div className={styles.homeTitle}>Truth or Dare</div>
            <PlayerList
              players={players}
              onPlayersChange={setPlayers}
            />
            {/* Actions moved below players and above previous games. */}
            <div className={styles.actionsInline}>
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
            
            {/* Level selector hidden for now. Leaving logic/state in place for future use. */}
            
            <div className={styles.configSection}>
              <h3 className={styles.sectionTitle}>Game configuration</h3>
              <PreviousGamesPicker
                gameHistory={gameHistory}
                selectedGameIds={selectedPriorGames}
                onSelectionChange={setSelectedPriorGames}
                onRemoveGame={removeGameFromHistory}
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
