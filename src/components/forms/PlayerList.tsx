import React from 'react'
import { MIN_PLAYERS } from '../../lib/constants'
import { GenderRadio } from './GenderRadio'
import type { PlayerSnapshot } from '../../types'
import styles from './PlayerList.module.css'

interface PlayerListProps {
  players: PlayerSnapshot[]
  onPlayersChange: (players: PlayerSnapshot[]) => void
  disabled?: boolean
}

export const PlayerList: React.FC<PlayerListProps> = ({ 
  players, 
  onPlayersChange, 
  disabled = false 
}) => {
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Players</h3>
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
        ))}
      </div>
    </div>
  )
}
