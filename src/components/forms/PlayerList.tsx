import React from 'react'
import { GENDER_COLORS, GENDER_ICONS, MAX_PLAYERS, MIN_PLAYERS } from '../../lib/constants'
import { createPlayerId } from '../../lib/ids'
import { GenderRadio } from './GenderRadio'
import { IconButton } from '../ui/IconButton'
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
  const addPlayer = () => {
    if (players.length >= MAX_PLAYERS) return
    
    const newPlayer: PlayerSnapshot = {
      id: createPlayerId(),
      name: '',
      gender: 'male'
    }
    
    onPlayersChange([...players, newPlayer])
  }

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
        <div className={styles.count}>
          {players.length} / {MAX_PLAYERS} players
        </div>
        <button
          className={styles.addButton}
          onClick={addPlayer}
          disabled={disabled || players.length >= MAX_PLAYERS}
          type="button"
        >
          + Add Player
        </button>
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
