import React from 'react'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import type { PlayerSnapshot, PlayerPreferences } from '../../types'
import { PREFERENCE_CATEGORIES } from '../../lib/preferences'
import { savePlayerPreferences, resetPlayerPreferences } from '../../lib/playerStorage'
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
  const [savedPreferences, setSavedPreferences] = React.useState<PlayerPreferences>({})

  React.useEffect(() => {
    // Initialize with player's current preferences
    // undefined means not set yet (default to true), false means No, true means Yes
    const initialPreferences: PlayerPreferences = {}
    PREFERENCE_CATEGORIES.forEach(category => {
      initialPreferences[category.key] = player.preferences?.[category.key]
    })
    setPreferences(initialPreferences)
    // Track what was saved before opening the modal
    setSavedPreferences({ ...initialPreferences })
  }, [player.preferences, isOpen])

  const handleSelection = (categoryKey: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [categoryKey]: value
    }))
  }

  const handleSave = () => {
    // Only save explicitly selected categories (not undefined)
    const finalPreferences: PlayerPreferences = {}
    PREFERENCE_CATEGORIES.forEach(category => {
      // Only include if explicitly set (true or false, not undefined)
      if (preferences[category.key] !== undefined) {
        finalPreferences[category.key] = preferences[category.key]
      }
    })
    
    savePlayerPreferences(player.id, finalPreferences)
    onSave(finalPreferences)
    onClose()
  }

  const handleReset = () => {
    const resetPreferences: PlayerPreferences = {}
    PREFERENCE_CATEGORIES.forEach(category => {
      resetPreferences[category.key] = undefined
    })
    setPreferences(resetPreferences)
    setSavedPreferences({})
    resetPlayerPreferences(player.id)
  }

  const handleCancel = () => {
    // Reset to original preferences (what was saved before opening modal)
    setPreferences({ ...savedPreferences })
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
            {PREFERENCE_CATEGORIES.map(category => {
              const value = preferences[category.key]
              // Only show "Already selected" if it was saved BEFORE opening this modal
              const wasPreviouslySaved = savedPreferences[category.key] !== undefined
              
              return (
                <div key={category.key} className={styles.categoryRow}>
                  <label className={styles.categoryLabel}>
                    {category.label}
                  </label>
                  
                  {wasPreviouslySaved ? (
                    <div className={styles.alreadySelected}>
                      <IoMdCheckmarkCircleOutline className={styles.checkIcon} />
                      <span>Already selected</span>
                    </div>
                  ) : (
                    <div className={styles.pillGroup}>
                      <button
                        className={`${styles.pillButton} ${styles.pillNo} ${
                          value === false ? styles.pillSelected : ''
                        }`}
                        onClick={() => handleSelection(category.key, false)}
                        type="button"
                      >
                        No
                      </button>
                      <button
                        className={`${styles.pillButton} ${styles.pillYes} ${
                          value === true ? styles.pillSelected : ''
                        }`}
                        onClick={() => handleSelection(category.key, true)}
                        type="button"
                      >
                        Yes
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
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
          {Object.values(savedPreferences).some(val => val !== undefined) && (
            <button
              className={styles.resetButton}
              onClick={handleReset}
              type="button"
            >
              Reset
            </button>
          )}
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
