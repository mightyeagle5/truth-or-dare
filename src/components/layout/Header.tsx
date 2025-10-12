import React from 'react'
import { Link } from 'react-router-dom'
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
  onExit,
}) => {
  const handleTitleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If we're in a game (onExit is provided), call the exit handler
    // The parent component will handle showing the confirmation dialog
    if (onExit) {
      e.preventDefault()
      onExit()
    }
  }
  
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <Link to="/" className={styles.titleSection} onClick={handleTitleClick}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && (
            <p className={styles.subtitle}>{subtitle}</p>
          )}
        </Link>
        
        <div className={styles.actions}>
          {import.meta.env.DEV && (
            <Link to="/admin/edit-challenges" className={styles.adminLink}>
              Admin
            </Link>
          )}
          {onExit && (
            <button className={styles.exitButton} onClick={onExit} type="button">
              Exit game
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
