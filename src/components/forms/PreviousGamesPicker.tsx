import React, { useState } from 'react'
import { IoChevronDownOutline } from 'react-icons/io5'
import { formatGameDate } from '../../lib/dates'
import type { GameHistoryEntry } from '../../types'
import styles from './PreviousGamesPicker.module.css'

interface PreviousGamesPickerProps {
  gameHistory: GameHistoryEntry[]
  selectedGameIds: string[]
  onSelectionChange: (gameIds: string[]) => void
  onRemoveGame: (gameId: string) => void
  disabled?: boolean
  isDevMode?: boolean
  disableGameSaving?: boolean
  onDisableGameSavingChange?: (disable: boolean) => void
}

export const PreviousGamesPicker: React.FC<PreviousGamesPickerProps> = ({
  gameHistory,
  selectedGameIds,
  onSelectionChange,
  onRemoveGame,
  disabled = false,
  isDevMode = false,
  disableGameSaving = false,
  onDisableGameSavingChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleGameToggle = (gameId: string) => {
    const newSelection = selectedGameIds.includes(gameId)
      ? selectedGameIds.filter(id => id !== gameId)
      : [...selectedGameIds, gameId]
    
    onSelectionChange(newSelection)
  }

  const handleDeleteSelected = () => {
    selectedGameIds.forEach(gameId => onRemoveGame(gameId))
    onSelectionChange([])
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div
          className={styles.header}
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          aria-controls="previous-games-content"
          onClick={() => setIsOpen(prev => !prev)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsOpen(prev => !prev)
            }
          }}
        >
          <div className={styles.titleSection}>
            <div className={styles.titleRow}>
              <h3 className={styles.title}>Previous Games</h3>
              {false && isDevMode && onDisableGameSavingChange && (
                // Hiding the "Disable saving" dev toggle for now. Logic retained for later use.
                <label
                  className={styles.devCheckbox}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={disableGameSaving}
                    onChange={(e) => onDisableGameSavingChange(e.target.checked)}
                  />
                  <span>Disable saving</span>
                </label>
              )}
            </div>
          </div>
          <div className={styles.headerActions}>
            {isOpen && selectedGameIds.length > 0 && (
              <button
                className={styles.deleteSelectedButton}
                onClick={(e) => { e.stopPropagation(); handleDeleteSelected() }}
                disabled={disabled}
                type="button"
              >
                Delete Selected ({selectedGameIds.length})
              </button>
            )}
            <IoChevronDownOutline
              aria-hidden="true"
              className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
            />
          </div>
        </div>
      
        <div
          className={`${styles.content} ${isOpen ? styles.contentOpen : ''}`}
          aria-hidden={!isOpen}
        >
          <p className={styles.subtitle}>Select games to skip already completed challenges (custom games not included)</p>
          {gameHistory.length === 0 ? (
            <p id="previous-games-content" className={styles.empty}>No previous games</p>
          ) : (
            <div id="previous-games-content" className={styles.gamesList}>
              {gameHistory.map((game) => (
                <label key={game.id} className={styles.gameItem}>
                  <input
                    type="checkbox"
                    checked={selectedGameIds.includes(game.id)}
                    onChange={() => handleGameToggle(game.id)}
                    disabled={disabled}
                    className={styles.checkbox}
                  />
                  <div className={styles.gameInfo}>
                    <span className={styles.gameId}>{game.id}</span>
                    <span className={styles.gameDate}>
                      {formatGameDate(game.createdAt)}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
