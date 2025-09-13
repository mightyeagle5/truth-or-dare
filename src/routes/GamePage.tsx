import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Header } from '../components/Header'
import { ChoiceScreen } from '../components/ChoiceScreen'
import { ItemScreen } from '../components/ItemScreen'
import { StickyFooterControls } from '../components/StickyFooterControls'
import { useGameStore } from '../store/gameStore'
import { getCurrentPlayer } from '../store/selectors'
import styles from './GamePage.module.css'

export const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { 
    currentGame, 
    currentScreen, 
    loadGame, 
    exitGame, 
    pickWildCard, 
    skipItem, 
    completeItem 
  } = useGameStore()

  useEffect(() => {
    if (gameId && (!currentGame || currentGame.id !== gameId)) {
      loadGame(gameId)
    }
  }, [gameId, currentGame, loadGame])

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit the game? Your progress will be saved.')) {
      exitGame()
      navigate('/')
    }
  }

  const currentPlayer = getCurrentPlayer(currentGame)

  if (!currentGame) {
    return (
      <div className={styles.container}>
        <Header title="Loading..." />
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
      
      <StickyFooterControls />
    </div>
  )
}
