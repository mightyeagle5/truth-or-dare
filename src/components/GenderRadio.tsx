import React from 'react'
import { GENDER_COLORS, GENDER_ICONS } from '../lib/constants'
import type { Gender } from '../types'
import styles from './GenderRadio.module.css'

interface GenderRadioProps {
  value: Gender
  onChange: (gender: Gender) => void
  disabled?: boolean
}

export const GenderRadio: React.FC<GenderRadioProps> = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  return (
    <div className={styles.container}>
      <label className={`${styles.option} ${value === 'male' ? styles.selected : ''}`}>
        <input
          type="radio"
          name="gender"
          value="male"
          checked={value === 'male'}
          onChange={() => onChange('male')}
          disabled={disabled}
          className={styles.input}
        />
        <span 
          className={styles.icon}
          style={{ color: GENDER_COLORS.male }}
        >
          {GENDER_ICONS.male}
        </span>
        <span className={styles.label}>Male</span>
      </label>
      
      <label className={`${styles.option} ${value === 'female' ? styles.selected : ''}`}>
        <input
          type="radio"
          name="gender"
          value="female"
          checked={value === 'female'}
          onChange={() => onChange('female')}
          disabled={disabled}
          className={styles.input}
        />
        <span 
          className={styles.icon}
          style={{ color: GENDER_COLORS.female }}
        >
          {GENDER_ICONS.female}
        </span>
        <span className={styles.label}>Female</span>
      </label>
    </div>
  )
}
