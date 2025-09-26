import React from 'react'
import { useGameStore, useUIStore } from '../../store'
import styles from './StickyFooterControls.module.css'

const getLevelColor = (level: string) => {
  switch (level) {
    case 'soft': return '#6EE7B7'
    case 'mild': return '#60A5FA'
    case 'hot': return '#F59E0B'
    case 'spicy': return '#F87171'
    case 'kinky': return '#A78BFA'
    case 'Custom': return '#8B5CF6' // Purple for custom games
    default: return '#9CA3AF'
  }
}

const getDisplayName = (level: string) => {
  switch (level) {
    case 'soft': return 'Soft'
    case 'mild': return 'Mild'
    case 'hot': return 'Hot'
    case 'spicy': return 'Spicy'
    case 'kinky': return 'Kinky'
    case 'Custom': return 'Custom'
    default: return level
  }
}

export const StickyFooterControls: React.FC = () => {
  const { currentGame } = useGameStore()

  const getDisplayLevel = () => {
    if (!currentGame) return 'Custom'
    
    // For custom games in Random mode, show "Custom" instead of the level
    if (currentGame.isCustomGame && currentGame.customGameMode === 'random') {
      return 'Custom'
    }
    
    return currentGame.currentLevel
  }

  const displayLevel = getDisplayLevel()
  const levelColor = currentGame ? getLevelColor(displayLevel) : '#9CA3AF'
  const displayName = getDisplayName(displayLevel)

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {currentGame && (
          <div 
            className={styles.levelInfo}
            style={{ 
              color: levelColor,
              borderColor: levelColor,
              backgroundColor: `${levelColor}20`
            }}
          >
            {displayName}
          </div>
        )}
      </div>
    </div>
  )
}
