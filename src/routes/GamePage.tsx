import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Header } from '../components/layout'
import { ChoiceScreen, ItemScreen } from '../components/game'
import { useGameStore, useUIStore } from '../store'
import { getCurrentPlayer } from '../store/selectors'
import { useTheme } from '../hooks/useTheme'
import styles from './GamePage.module.css'

export const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { 
    currentGame, 
    loadGame, 
    exitGame, 
    pickWildCard, 
    skipItem, 
    completeItem 
  } = useGameStore()
  const { currentScreen, isLoading, error } = useUIStore()
  
  // Initialize theme
  useTheme()

  useEffect(() => {
    if (gameId && (!currentGame || currentGame.id !== gameId)) {
      loadGame(gameId)
    }
  }, [gameId, currentGame, loadGame])

  useEffect(() => {
    // If loading has finished and the game was not found, redirect to home
    if (!isLoading && error === 'Game not found') {
      navigate('/')
    }
  }, [isLoading, error, navigate])

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit the game? Your progress will be saved.')) {
      exitGame()
      navigate('/')
    }
  }

  const currentPlayer = getCurrentPlayer(currentGame)

  if (!currentGame) {
    // If there's no current game after attempting to load, redirect to home.
    // This avoids showing a loading state that never resolves for invalid game IDs.
    return (
      <div className={styles.container}>
        <Header title="Truth or Dare" subtitle="The sexy version" />
        <main className={styles.main}>
          <div className={styles.loading}>
            <p>Loading game...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Header
        title="Truth or Dare"
        subtitle="The sexy version"
        showGameInfo
        onExit={handleExit}
      />
      
      <main className={styles.main}>
        <div className={styles.gameArea}>
          <AnimatePresence mode="wait">
            {currentScreen === 'choice' ? (
              <ChoiceScreen key="choice" />
            ) : (
              <ItemScreen key="item" />
            )}
          </AnimatePresence>
        </div>
      </main>
      <button className={styles.exitSticky} onClick={handleExit} type="button">Exit game</button>
    </div>
  )
}
