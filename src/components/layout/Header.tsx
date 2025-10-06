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
        
        <div className={styles.actions}>
          {import.meta.env.DEV && (
            <Link to="/admin/edit-challenges" className={styles.adminLink}>
              Admin
            </Link>
          )}
          {/* Exit button removed from header per new design */}
        </div>
      </div>
    </header>
  )
}
