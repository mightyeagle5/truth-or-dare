import React from 'react'
import { LEVELS } from '../lib/constants'
import { Pill } from './Pill'
import type { Level } from '../types'
import styles from './LevelSelector.module.css'

const getLevelColor = (level: Level) => {
  switch (level) {
    case 'Soft': return '#6EE7B7'
    case 'Mild': return '#60A5FA'
    case 'Hot': return '#F59E0B'
    case 'Spicy': return '#F87171'
    case 'Kinky': return '#A78BFA'
    case 'Progressive': return '#8B5CF6'
    default: return '#9CA3AF'
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
              {level}
            </Pill>
          )
        })}
      </div>
    </div>
  )
}
