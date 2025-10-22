import React from 'react'
import { IoFemaleSharp, IoMaleSharp } from "react-icons/io5"
import { GENDER_COLORS } from '../../lib/constants'
import type { Gender } from '../../types'
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
          <IoMaleSharp />
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
          <IoFemaleSharp />
        </span>
        <span className={styles.label}>Female</span>
      </label>
    </div>
  )
}
