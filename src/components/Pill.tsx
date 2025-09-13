import React from 'react'
import styles from './Pill.module.css'

interface PillProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}

export const Pill: React.FC<PillProps> = ({ 
  children, 
  active = false, 
  onClick,
  disabled = false,
  className = '',
  style
}) => {
  return (
    <button
      className={`${styles.pill} ${active ? styles.active : ''} ${disabled ? styles.disabled : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
      style={style}
    >
      {children}
    </button>
  )
}
