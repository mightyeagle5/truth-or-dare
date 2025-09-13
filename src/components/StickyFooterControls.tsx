import React from 'react'
import { useGameStore } from '../store/gameStore'
import styles from './StickyFooterControls.module.css'

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Soft': return '#6EE7B7'
    case 'Mild': return '#60A5FA'
    case 'Hot': return '#F59E0B'
    case 'Spicy': return '#F87171'
    case 'Kinky': return '#A78BFA'
    default: return '#9CA3AF'
  }
}

export const StickyFooterControls: React.FC = () => {
  const { currentGame } = useGameStore()

  const levelColor = currentGame ? getLevelColor(currentGame.currentLevel) : '#9CA3AF'

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
            {currentGame.currentLevel}
          </div>
        )}
      </div>
    </div>
  )
}
