import React, { useState } from 'react'
import { IoSettingsOutline, IoWarning, IoCheckmarkCircle } from 'react-icons/io5'
import { BiSolidErrorAlt } from 'react-icons/bi'
import { MIN_PLAYERS } from '../../lib/constants'
import { GenderRadio } from './GenderRadio'
import { PlayerPreferencesModal } from './PlayerPreferencesModal'
import { PREFERENCE_CATEGORIES } from '../../lib/preferences'
import type { PlayerSnapshot, PlayerPreferences } from '../../types'
import styles from './PlayerList.module.css'

interface PlayerListProps {
  players: PlayerSnapshot[]
  onPlayersChange: (players: PlayerSnapshot[]) => void
  disabled?: boolean
  hidePreferences?: boolean // Hide the preferences config button
}

export const PlayerList: React.FC<PlayerListProps> = ({ 
  players, 
  onPlayersChange, 
  disabled = false,
  hidePreferences = false
}) => {
  const [modalOpenForPlayer, setModalOpenForPlayer] = useState<string | null>(null)

  /* Keeping addPlayer logic for future use when enabling more than two players again.
     const addPlayer = () => {
       if (players.length >= MAX_PLAYERS) return
       const newPlayer: PlayerSnapshot = { id: createPlayerId(), name: '', gender: 'male' }
       onPlayersChange([...players, newPlayer])
     }
  */

  const removePlayer = (playerId: string) => {
    if (players.length <= MIN_PLAYERS) return
    
    onPlayersChange(players.filter(p => p.id !== playerId))
  }

  const updatePlayer = (playerId: string, updates: Partial<PlayerSnapshot>) => {
    onPlayersChange(players.map(p => 
      p.id === playerId ? { ...p, ...updates } : p
    ))
  }

  const openPreferences = (playerId: string) => {
    setModalOpenForPlayer(playerId)
  }

  const closePreferences = () => {
    setModalOpenForPlayer(null)
  }

  const savePreferences = (playerId: string, preferences: PlayerPreferences) => {
    updatePlayer(playerId, { preferences })
  }

  const getPreferenceStatus = (player: PlayerSnapshot): 'none' | 'some' | 'all' => {
    if (!player.preferences) return 'none'
    
    const totalCategories = PREFERENCE_CATEGORIES.length
    const selectedCount = PREFERENCE_CATEGORIES.filter(
      category => player.preferences?.[category.key] !== undefined
    ).length
    
    if (selectedCount === 0) return 'none'
    if (selectedCount === totalCategories) return 'all'
    return 'some'
  }

  const getStatusIcon = (status: 'none' | 'some' | 'all') => {
    switch (status) {
      case 'none':
        return <BiSolidErrorAlt className={styles.statusIconRed} />
      case 'some':
        return <IoWarning className={styles.statusIconYellow} />
      case 'all':
        return <IoCheckmarkCircle className={styles.statusIconGreen} />
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* Hiding players count while game is limited to two players. Keeping markup for future use. */}
        {/* Intentionally hiding the "+ Add Player" button for now to limit the game to two players.
            The add player logic and UI are kept for future re-enablement. */}
      </div>
      
      <div className={styles.players}>
        {players.map((player, index) => (
          <div key={player.id} className={styles.playerRow}>
            <div className={styles.playerInfo}>
              <input
                type="text"
                value={player.name}
                onChange={(e) => updatePlayer(player.id, { name: e.target.value })}
                disabled={disabled}
                className={styles.nameInput}
                placeholder={`Player ${index + 1} name`}
              />
              <GenderRadio
                value={player.gender}
                onChange={(gender) => updatePlayer(player.id, { gender })}
                disabled={disabled}
              />
            </div>
            
            <div className={styles.actions}>
              {!hidePreferences && (
                <div className={styles.configButtonWrapper}>
                  <button
                    className={styles.configButton}
                    onClick={() => openPreferences(player.id)}
                    disabled={disabled}
                    type="button"
                    aria-label={`Configure preferences for ${player.name || `Player ${index + 1}`}`}
                  >
                    <IoSettingsOutline />
                  </button>
                  <span className={styles.statusIcon}>
                    {getStatusIcon(getPreferenceStatus(player))}
                  </span>
                </div>
              )}
              
              {players.length > MIN_PLAYERS && (
                <button
                  className={styles.deleteButton}
                  onClick={() => removePlayer(player.id)}
                  disabled={disabled}
                  type="button"
                  aria-label={`Remove ${player.name}`}
                >
                  ×
                </button>
              )}
            </div>

            {!hidePreferences && (
              <PlayerPreferencesModal
                player={player}
                isOpen={modalOpenForPlayer === player.id}
                onClose={closePreferences}
                onSave={(preferences) => savePreferences(player.id, preferences)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
