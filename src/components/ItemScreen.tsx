import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentPlayer } from '../store/selectors'
import { useGameStore } from '../store/gameStore'
import { Badge } from './Badge'
import styles from './ItemScreen.module.css'

export const ItemScreen: React.FC = () => {
  const { 
    currentGame, 
    currentItem, 
    isWildCard,
    pickWildCard, 
    skipItem, 
    completeItem,
    completeWildCard
  } = useGameStore()

  const [isWildCardPicking, setIsWildCardPicking] = useState(false)

  // Reset animation state when item changes
  useEffect(() => {
    setIsWildCardPicking(false)
  }, [currentItem?.id])

  if (!currentGame || !currentItem) return null

  const currentPlayer = getCurrentPlayer(currentGame)

  const handleWildCard = () => {
    setIsWildCardPicking(true)
    // Reset the animation state after the animation completes
    setTimeout(() => {
      pickWildCard()
    }, 300)
  }

  const handleSkip = () => {
    skipItem()
  }

  const handleComplete = () => {
    if (isWildCard) {
      completeWildCard()
    } else {
      completeItem()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className={styles.container}
    >
      <div className={styles.playerName}>
        {currentPlayer?.name || 'Unknown Player'}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className={`${styles.itemCard} ${currentItem.kind === 'truth' ? styles.truthCard : styles.dareCard}`}
        >
          <div className={styles.itemHeader}>
            <div className={styles.itemType}>
              <Badge 
                variant={currentItem.kind === 'truth' ? 'primary' : 'error'} 
                size="md"
              >
                {currentItem.kind === 'truth' ? '💭 Truth' : '🔥 Dare'}
              </Badge>
            </div>
          </div>

          <div className={styles.itemContent}>
            <p className={styles.itemText}>{currentItem.text}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className={styles.actions}>
        <button
          className={styles.wildCardButton}
          onClick={handleWildCard}
          type="button"
        >
          🎲 Wild Card
        </button>
        
        <button
          className={styles.skipButton}
          onClick={handleSkip}
          type="button"
        >
          Skip
        </button>
        <button
          className={styles.completeButton}
          onClick={handleComplete}
          type="button"
        >
          Complete
        </button>
      </div>
    </motion.div>
  )
}
