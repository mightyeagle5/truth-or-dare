import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Header, StickyFooterControls } from '../components/layout'
import { ChoiceScreen, ItemScreen } from '../components/game'
import { useGameStore, useUIStore } from '../store'
import { getCurrentPlayer } from '../store/selectors'
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
  const { currentScreen } = useUIStore()

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
