import React from 'react'
import type { PlayerSnapshot, PlayerPreferences } from '../../types'
import { PREFERENCE_CATEGORIES } from '../../lib/preferences'
import styles from './PlayerPreferencesModal.module.css'

interface PlayerPreferencesModalProps {
  player: PlayerSnapshot
  isOpen: boolean
  onClose: () => void
  onSave: (preferences: PlayerPreferences) => void
}

export const PlayerPreferencesModal: React.FC<PlayerPreferencesModalProps> = ({
  player,
  isOpen,
  onClose,
  onSave
}) => {
  const [preferences, setPreferences] = React.useState<PlayerPreferences>(
    player.preferences || {}
  )

  React.useEffect(() => {
    // Initialize with player's current preferences or defaults (all true)
    const initialPreferences: PlayerPreferences = {}
    PREFERENCE_CATEGORIES.forEach(category => {
      initialPreferences[category.key] = player.preferences?.[category.key] ?? true
    })
    setPreferences(initialPreferences)
  }, [player.preferences, isOpen])

  const handleToggle = (categoryKey: string) => {
    setPreferences(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }))
  }

  const handleSave = () => {
    onSave(preferences)
    onClose()
  }

  const handleCancel = () => {
    // Reset to original preferences
    const resetPreferences: PlayerPreferences = {}
    PREFERENCE_CATEGORIES.forEach(category => {
      resetPreferences[category.key] = player.preferences?.[category.key] ?? true
    })
    setPreferences(resetPreferences)
    onClose()
  }

  if (!isOpen) return null

  const getPlayerDisplayName = (): string => {
    return player.name?.trim() || 'Player'
  }

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {getPlayerDisplayName()}'s Preferences
          </h2>
          <button
            className={styles.closeButton}
            onClick={handleCancel}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.subtitle}>
            Would you be interested in challenges related to:
          </p>

          <div className={styles.categoriesList}>
            {PREFERENCE_CATEGORIES.map(category => (
              <div key={category.key} className={styles.categoryRow}>
                <label className={styles.categoryLabel}>
                  {category.label}
                </label>
                <button
                  className={`${styles.toggle} ${
                    preferences[category.key] ? styles.toggleOn : styles.toggleOff
                  }`}
                  onClick={() => handleToggle(category.key)}
                  type="button"
                  role="switch"
                  aria-checked={preferences[category.key]}
                >
                  <span className={styles.toggleSlider} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
