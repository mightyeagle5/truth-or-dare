import React from 'react'
import { LEVELS } from '../../lib/constants'
import { Pill } from '../ui/Pill'
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
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Choose Your Level</h3>
      <div className={styles.levels}>
        {LEVELS.map((level) => {
          const levelColor = getLevelColor(level)
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
                '--level-color-border': levelColor
              } as React.CSSProperties}
            >
              {getDisplayName(level)}
            </Pill>
          )
        })}
      </div>
    </div>
  )
}
