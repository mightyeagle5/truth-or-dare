import React from 'react'
import { LEVELS } from '../../lib/constants'
import { Pill } from '../ui/Pill'
import { useResponsivePills } from '../../hooks/useResponsivePills'
import type { Level } from '../../types'
import styles from './LevelSelector.module.css'

const getLevelColor = (level: Level) => {
  switch (level) {
    case 'soft': return '#6EE7B7'
    case 'mild': return '#60A5FA'
    case 'hot': return '#F59E0B'
    case 'spicy': return '#F87171'
    case 'kinky': return '#A78BFA'
    case 'Progressive': return '#8B5CF6'
    default: return '#9CA3AF'
  }
}

const getDisplayName = (level: Level) => {
  switch (level) {
    case 'soft': return 'Soft'
    case 'mild': return 'Mild'
    case 'hot': return 'Hot'
    case 'spicy': return 'Spicy'
    case 'kinky': return 'Kinky'
    case 'Progressive': return 'Progressive'
    default: return level
  }
}

interface LevelSelectorProps {
  selectedLevel: Level | null
  onLevelChange: (level: Level) => void
  disabled?: boolean
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({ 
  selectedLevel, 
  onLevelChange, 
  disabled = false 
}) => {
  const { pillWidth, shouldShowPeek, totalPillsVisible } = useResponsivePills({
    pillCount: LEVELS.length,
    containerPadding: 32, // 16px padding on each side
    pillGap: 16,
    minPillWidth: 80
  })

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Choose Your Level</h3>
      <div 
        className={styles.levels}
        style={{
          width: '100%',
          overflowX: shouldShowPeek ? 'auto' : 'visible',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
      >
        <div 
          className={styles.pillsContainer}
          style={{
            display: 'flex',
            gap: '16px',
            width: shouldShowPeek ? 'max-content' : '100%',
            paddingRight: shouldShowPeek ? '8px' : '0'
          }}
        >
          {LEVELS.map((level, index) => {
            const levelColor = getLevelColor(level)
            const isVisible = index < totalPillsVisible
            
            return (
              <Pill
                key={level}
                active={selectedLevel === level}
                onClick={() => onLevelChange(level)}
                disabled={disabled}
                className={styles.levelPill}
                style={{
                  '--level-color': levelColor,
                  '--level-color-bg': `${levelColor}20`,
                  '--level-color-border': levelColor,
                  width: `${pillWidth}px`,
                  minWidth: `${pillWidth}px`,
                  flexShrink: 0,
                  opacity: isVisible ? 1 : 0,
                  visibility: isVisible ? 'visible' : 'hidden'
                } as React.CSSProperties}
              >
                {getDisplayName(level)}
              </Pill>
            )
          })}
        </div>
      </div>
    </div>
  )
}
