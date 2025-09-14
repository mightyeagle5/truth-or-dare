import React from 'react'
import { formatGameDate } from '../../lib/dates'
import type { GameHistoryEntry } from '../../types'
import styles from './PreviousGamesPicker.module.css'

interface PreviousGamesPickerProps {
  gameHistory: GameHistoryEntry[]
  selectedGameIds: string[]
  onSelectionChange: (gameIds: string[]) => void
  onRemoveGame: (gameId: string) => void
  disabled?: boolean
}

export const PreviousGamesPicker: React.FC<PreviousGamesPickerProps> = ({
  gameHistory,
  selectedGameIds,
  onSelectionChange,
  onRemoveGame,
  disabled = false
}) => {
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
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>Previous Games</h3>
          <p className={styles.subtitle}>Select games to skip already completed challenges (custom games not included)</p>
        </div>
        {selectedGameIds.length > 0 && (
          <button
            className={styles.deleteSelectedButton}
            onClick={handleDeleteSelected}
            disabled={disabled}
            type="button"
          >
            Delete Selected ({selectedGameIds.length})
          </button>
        )}
      </div>
      
      {gameHistory.length === 0 ? (
        <p className={styles.empty}>No previous games</p>
      ) : (
        <div className={styles.gamesList}>
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
  )
}
