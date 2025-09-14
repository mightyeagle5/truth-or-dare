import React from 'react'
import { PlayerList } from './PlayerList'
import { LevelSelector } from './LevelSelector'
import { PreviousGamesPicker } from './PreviousGamesPicker'
import type { PlayerSnapshot, Level, GameHistoryEntry } from '../../types'

interface GameSetupFormProps {
  players: PlayerSnapshot[]
  onPlayersChange: (players: PlayerSnapshot[]) => void
  selectedLevel: Level | null
  onLevelChange: (level: Level | null) => void
  selectedPriorGames: string[]
  onPriorGamesChange: (gameIds: string[]) => void
  gameHistory: GameHistoryEntry[]
  onRemoveGame: (gameId: string) => void
}

export const GameSetupForm: React.FC<GameSetupFormProps> = ({
  players,
  onPlayersChange,
  selectedLevel,
  onLevelChange,
  selectedPriorGames,
  onPriorGamesChange,
  gameHistory,
  onRemoveGame
}) => {
  return (
    <>
      <PlayerList
        players={players}
        onPlayersChange={onPlayersChange}
      />
      
      <LevelSelector
        selectedLevel={selectedLevel}
        onLevelChange={onLevelChange}
      />
      
      <PreviousGamesPicker
        gameHistory={gameHistory}
        selectedGameIds={selectedPriorGames}
        onSelectionChange={onPriorGamesChange}
        onRemoveGame={(gameId) => {
          // Remove from local state and call store method
          onPriorGamesChange(selectedPriorGames.filter(id => id !== gameId))
          onRemoveGame(gameId)
        }}
      />
    </>
  )
}
