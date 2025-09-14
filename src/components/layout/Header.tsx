import React from 'react'
import styles from './Header.module.css'

interface HeaderProps {
  title: string
  subtitle?: string
  showGameInfo?: boolean
  currentPlayer?: string
  currentLevel?: string
  gameId?: string
  onExit?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showGameInfo = false,
  currentPlayer,
  currentLevel,
  gameId,
  onExit
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && (
            <p className={styles.subtitle}>{subtitle}</p>
          )}
        </div>
        
        {showGameInfo && onExit && (
          <div className={styles.gameInfo}>
            <button
              className={styles.exitButton}
              onClick={onExit}
              type="button"
            >
              Exit
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
