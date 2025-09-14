import React from 'react'
import styles from './IconButton.module.css'

interface IconButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  'aria-label'?: string
  className?: string
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  children, 
  onClick,
  disabled = false,
  variant = 'ghost',
  size = 'md',
  'aria-label': ariaLabel,
  className = ''
}) => {
  return (
    <button
      className={`${styles.iconButton} ${styles[variant]} ${styles[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      type="button"
    >
      {children}
    </button>
  )
}
