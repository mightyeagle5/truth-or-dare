import React from 'react'
import { Header } from './Header'
import styles from './PageLayout.module.css'

interface PageLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  showGameInfo?: boolean
  onExit?: () => void
  hideHeader?: boolean
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  children,
  showGameInfo = false,
  onExit,
  hideHeader = false
}) => {
  return (
    <div className={styles.container}>
      {!hideHeader && (
        <Header 
          title={title}
          subtitle={subtitle}
          showGameInfo={showGameInfo}
          onExit={onExit}
        />
      )}
      
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
