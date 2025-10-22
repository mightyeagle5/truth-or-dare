import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentPlayer, getDisabledChoices, getAvailableItemCounts, getCurrentPlayerWithCounters } from '../../store/selectors'
import { useGameStore } from '../../store'
import { challengePairManager } from '../../lib/challengePairs'
import { canChooseType } from '../../lib/guards'
import { Pill } from '../ui/Pill'
import styles from './ChoiceScreen.module.css'

export const ChoiceScreen: React.FC = () => {
  const { 
    currentGame, 
    items,
    pickItem, 
    changeLevel,
    challengePairLoading
  } = useGameStore()


  if (!currentGame) return null

  const currentPlayer = getCurrentPlayer(currentGame)
  
  // For regular games, use challengePairManager state; for custom games, use items array
  const isCustomGame = currentGame.isCustomGame
  let disabledChoices: { truth: boolean; dare: boolean }
  let availableCounts: { truth: number; dare: number }
  
  if (isCustomGame) {
    // Custom games use the old logic with items array
    disabledChoices = getDisabledChoices(currentGame, items, currentGame.respectPriorGames)
    availableCounts = getAvailableItemCounts(currentGame, items, currentGame.respectPriorGames)
  } else {
    // Regular games use challengePairManager
    const currentPair = challengePairManager.getCurrentPair()
    const playerWithCounters = getCurrentPlayerWithCounters(currentGame)
    
    // Check if we have a valid pair
    const hasTruth = currentPair.truth !== null
    const hasDare = currentPair.dare !== null
    
    // Check consecutive limits
    const truthBlocked = playerWithCounters ? !canChooseType(playerWithCounters, 'truth', currentGame.gameConfiguration) : false
    const dareBlocked = playerWithCounters ? !canChooseType(playerWithCounters, 'dare', currentGame.gameConfiguration) : false
    
    disabledChoices = {
      truth: !hasTruth || (truthBlocked && hasDare),
      dare: !hasDare || (dareBlocked && hasTruth)
    }
    
    availableCounts = {
      truth: hasTruth ? 1 : 0,
      dare: hasDare ? 1 : 0
    }
  }

  // Determine the reason for disabling each choice
  const truthDisabledReason = disabledChoices.truth ? (availableCounts.truth === 0 ? 'no-items' : 'consecutive') : null
  const dareDisabledReason = disabledChoices.dare ? (availableCounts.dare === 0 ? 'no-items' : 'consecutive') : null

  const handleTruthClick = () => {
    if (!disabledChoices.truth && !challengePairLoading) {
      pickItem('truth')
    }
  }

  const handleDareClick = () => {
    if (!disabledChoices.dare && !challengePairLoading) {
      pickItem('dare')
    }
  }



  const levelColor = (level: 'soft' | 'mild' | 'hot' | 'spicy' | 'kinky') => {
    const root = document.documentElement;
    const getColor = (varName: string) => getComputedStyle(root).getPropertyValue(varName).trim();
    
    switch (level) {
      case 'soft': return getColor('--color-level-soft')
      case 'mild': return getColor('--color-level-mild')
      case 'hot': return getColor('--color-level-hot')
      case 'spicy': return getColor('--color-level-spicy')
      case 'kinky': return getColor('--color-level-kinky')
      default: return getColor('--color-text-muted')
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

  // Get available levels for custom games in "By level" mode
  const getAvailableLevels = () => {
    if (!currentGame.isCustomGame || currentGame.customGameMode === 'random') {
      return ['soft','mild','hot','spicy','kinky'] as const
    }
    
    // For custom games in "By level" mode, only show levels that have items
    if (currentGame.customItems) {
      const availableLevels = new Set(currentGame.customItems.map(item => item.level))
      return (['soft','mild','hot','spicy','kinky'] as const).filter(level => 
        availableLevels.has(level)
      )
    }
    
    return ['soft','mild','hot','spicy','kinky'] as const
  }

  const availableLevels = getAvailableLevels()

  return (
    <div className={styles.container}>
      {/* Only show level bar if not in random mode for custom games */}
      {!(currentGame.isCustomGame && currentGame.customGameMode === 'random') && (
        <div className={styles.levelBar}>
          {availableLevels.map((lvl) => (
            <Pill
              key={lvl}
              active={currentGame.currentLevel === lvl}
              className={styles.levelPill}
              style={{
                '--level-color': levelColor(lvl),
                '--level-color-bg': `${levelColor(lvl)}20`,
                '--level-color-border': levelColor(lvl)
              } as React.CSSProperties}
              onClick={() => { if (!challengePairLoading) changeLevel(lvl) }}
              disabled={challengePairLoading}
            >
              {displayName(lvl)}
            </Pill>
          ))}
        </div>
      )}

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
              className={`${styles.choiceCard} ${styles.truthCard} ${disabledChoices.truth || challengePairLoading ? styles.disabled : ''}`}
              onClick={handleTruthClick}
              disabled={disabledChoices.truth || challengePairLoading}
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
              className={`${styles.choiceCard} ${styles.dareCard} ${disabledChoices.dare || challengePairLoading ? styles.disabled : ''}`}
              onClick={handleDareClick}
              disabled={disabledChoices.dare || challengePairLoading}
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
