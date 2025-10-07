import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentPlayer, getDisabledChoices, getAvailableItemCounts } from '../../store/selectors'
import { useGameStore, useUIStore } from '../../store'
import { Pill } from '../ui/Pill'
import styles from './ChoiceScreen.module.css'

export const ChoiceScreen: React.FC = () => {
  const { 
    currentGame, 
    items,
    pickItem, 
    pickWildCard,
    exitGame,
    changeLevel,
    challengePairLoading
  } = useGameStore()

  const [isWildCardPicking, setIsWildCardPicking] = useState(false)

  if (!currentGame) return null

  const currentPlayer = getCurrentPlayer(currentGame)
  const disabledChoices = getDisabledChoices(currentGame, items, currentGame.respectPriorGames)
  const availableCounts = getAvailableItemCounts(currentGame, items, currentGame.respectPriorGames)

  // Determine the reason for disabling each choice
  const truthDisabledReason = disabledChoices.truth ? (availableCounts.truth === 0 ? 'no-items' : 'consecutive') : null
  const dareDisabledReason = disabledChoices.dare ? (availableCounts.dare === 0 ? 'no-items' : 'consecutive') : null

  const handleTruthClick = () => {
    if (!disabledChoices.truth) {
      pickItem('truth')
    }
  }

  const handleDareClick = () => {
    if (!disabledChoices.dare) {
      pickItem('dare')
    }
  }


  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit the game? Your progress will be saved.')) {
      exitGame()
    }
  }

  const levelColor = (level: 'soft' | 'mild' | 'hot' | 'spicy' | 'kinky') => {
    switch (level) {
      case 'soft': return '#6EE7B7'
      case 'mild': return '#60A5FA'
      case 'hot': return '#F59E0B'
      case 'spicy': return '#F87171'
      case 'kinky': return '#A78BFA'
      default: return '#9CA3AF'
    }
  }

  const displayName = (level: 'soft' | 'mild' | 'hot' | 'spicy' | 'kinky') => {
    switch (level) {
      case 'soft': return 'Soft'
      case 'mild': return 'Mild'
      case 'hot': return 'Hot'
      case 'spicy': return 'Spicy'
      case 'kinky': return 'Kinky'
      default: return level
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.levelBar}>
        {(['soft','mild','hot','spicy','kinky'] as const).map((lvl) => (
          <Pill
            key={lvl}
            active={currentGame.currentLevel === lvl}
            className={styles.levelPill}
            style={{
              '--level-color': levelColor(lvl),
              '--level-color-bg': `${levelColor(lvl)}20`,
              '--level-color-border': levelColor(lvl)
            } as React.CSSProperties}
            onClick={() => { changeLevel(lvl) }}
          >
            {displayName(lvl)}
          </Pill>
        ))}
      </div>

      <div className={styles.playerName}>
        {(currentPlayer?.name && currentPlayer.name.trim().length > 0)
          ? currentPlayer.name
          : `Player ${currentGame.turnIndex + 1}`}&#39;s turn
      </div>

      <div className={styles.choicesWrap}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGame.currentLevel}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className={styles.choices}
          >
            <button
              className={`${styles.choiceCard} ${styles.truthCard} ${disabledChoices.truth ? styles.disabled : ''}`}
              onClick={handleTruthClick}
              disabled={disabledChoices.truth}
              type="button"
            >
              <div className={styles.choiceContent}>
                <h3 className={styles.choiceTitle}>Truth</h3>
                {!disabledChoices.truth && disabledChoices.dare && dareDisabledReason === 'consecutive' && (
                  <p className={styles.mandatoryMessage}>Mandatory choice to keep things interesting</p>
                )}
                {disabledChoices.truth && truthDisabledReason === 'no-items' && (
                  <p className={styles.mandatoryMessage}>Nothing left to answer on this level</p>
                )}
              </div>
            </button>

            <button
              className={`${styles.choiceCard} ${styles.dareCard} ${disabledChoices.dare ? styles.disabled : ''}`}
              onClick={handleDareClick}
              disabled={disabledChoices.dare}
              type="button"
            >
              <div className={styles.choiceContent}>
                <h3 className={styles.choiceTitle}>Dare</h3>
                {!disabledChoices.dare && disabledChoices.truth && truthDisabledReason === 'consecutive' && (
                  <p className={styles.mandatoryMessage}>Mandatory choice to keep things interesting</p>
                )}
                {disabledChoices.dare && dareDisabledReason === 'no-items' && (
                  <p className={styles.mandatoryMessage}>Nothing left to dare on this level</p>
                )}
              </div>
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {challengePairLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
        </div>
      )}
    </div>
  )
}
