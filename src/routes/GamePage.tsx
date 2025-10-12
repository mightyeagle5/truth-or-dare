import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Header } from '../components/layout'
import { ChoiceScreen, ItemScreen } from '../components/game'
import { ConfirmDialog } from '../components/ui'
import { useGameStore, useUIStore } from '../store'
import styles from './GamePage.module.css'

export const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { 
    currentGame, 
    loadGame, 
    exitGame
  } = useGameStore()
  const { currentScreen, isLoading, error } = useUIStore()
  const [showExitDialog, setShowExitDialog] = useState(false)

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
    setShowExitDialog(true)
  }

  const handleConfirmExit = () => {
    setShowExitDialog(false)
    exitGame()
    navigate('/')
  }

  const handleCancelExit = () => {
    setShowExitDialog(false)
  }

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

      <ConfirmDialog
        isOpen={showExitDialog}
        title="Exit Game"
        message="Are you sure you want to exit the game? Your progress will be saved to history, but you'll need to start a new game to continue playing."
        confirmText="Exit"
        cancelText="Stay"
        variant="danger"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </div>
  )
}
