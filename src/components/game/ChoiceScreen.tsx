import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentPlayer, getDisabledChoices, getAvailableItemCounts, shouldShowLevelSuggestion, canAdvanceLevel } from '../../store/selectors'
import { useGameStore, useUIStore } from '../../store'
import { Pill } from '../ui/Pill'
import styles from './ChoiceScreen.module.css'

export const ChoiceScreen: React.FC = () => {
  const { 
    currentGame, 
    items,
    pickItem, 
    pickWildCard,
    goNextLevel, 
    toggleRespectPriorGames,
    exitGame
  } = useGameStore()

  const [isWildCardPicking, setIsWildCardPicking] = useState(false)

  if (!currentGame) return null

  const currentPlayer = getCurrentPlayer(currentGame)
  const disabledChoices = getDisabledChoices(currentGame, items, currentGame.respectPriorGames)
  const availableCounts = getAvailableItemCounts(currentGame, items, currentGame.respectPriorGames)
  const showLevelSuggestion = shouldShowLevelSuggestion(currentGame, items, currentGame.respectPriorGames)
  const canAdvance = canAdvanceLevel(currentGame)

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

  const handleNextLevel = () => {
    goNextLevel()
  }

  const handleResetPriorGames = () => {
    toggleRespectPriorGames(false)
  }

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit the game? Your progress will be saved.')) {
      exitGame()
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

      <div className={styles.choices}>
        <button
          className={`${styles.choiceCard} ${styles.truthCard} ${disabledChoices.truth ? styles.disabled : ''}`}
          onClick={handleTruthClick}
          disabled={disabledChoices.truth}
          type="button"
        >
          <div className={styles.choiceContent}>
            <div className={styles.choiceIcon}>💭</div>
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
            <div className={styles.choiceIcon}>🔥</div>
            <h3 className={styles.choiceTitle}>Dare</h3>
            {!disabledChoices.dare && disabledChoices.truth && truthDisabledReason === 'consecutive' && (
              <p className={styles.mandatoryMessage}>Mandatory choice to keep things interesting</p>
            )}
            {disabledChoices.dare && dareDisabledReason === 'no-items' && (
              <p className={styles.mandatoryMessage}>Nothing left to dare on this level</p>
            )}
          </div>
        </button>
      </div>

      {showLevelSuggestion && (
        <div className={styles.suggestion}>
          <div className={styles.suggestionContent}>
            <p className={styles.suggestionText}>
              Move to the next level?
            </p>
            <div className={styles.suggestionButtons}>
              <button
                className={styles.stayButton}
                onClick={() => {/* Hide suggestion for next 10 turns */}}
                type="button"
              >
                Stay
              </button>
              <button
                className={styles.goButton}
                onClick={handleNextLevel}
                type="button"
              >
                Go to next level
              </button>
            </div>
          </div>
        </div>
      )}

      {currentGame.priorGameIds.length > 0 && currentGame.respectPriorGames && (
        <div className={styles.priorGamesNotice}>
          <p className={styles.noticeText}>
            Some challenges are filtered based on previous games.
          </p>
          <button
            className={styles.resetButton}
            onClick={handleResetPriorGames}
            type="button"
          >
            Reset Filters
          </button>
        </div>
      )}

    </motion.div>
  )
}
