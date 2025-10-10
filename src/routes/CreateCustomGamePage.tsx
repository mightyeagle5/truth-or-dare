import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/layout'
import { CustomGameSection } from '../components/forms/CustomGameSection'
import { useGameStore } from '../store'
import { useGameSetup } from '../hooks/useGameSetup'
import { useCustomGame } from '../hooks/useCustomGame'
import { useTheme } from '../hooks/useTheme'

export const CreateCustomGamePage: React.FC = () => {
  const navigate = useNavigate()
  const { startCustomGame, clearGame } = useGameStore()
  const [isStarting, setIsStarting] = useState(false)
  
  // Initialize theme
  useTheme()
  
  // Regular game setup (for players and game configuration)
  const {
    players,
    setPlayers,
    gameConfiguration,
    setGameConfiguration
  } = useGameSetup()
  
  // Custom game setup
  const customGameProps = useCustomGame()
  
  // Clear game state when component mounts
  useEffect(() => {
    clearGame()
  }, [clearGame])
  
  const handleStartCustomGame = async () => {
    setIsStarting(true)
    try {
      const gameId = startCustomGame(
        players, 
        customGameProps.customChallenges, 
        customGameProps.gameMode, 
        gameConfiguration
      )
      navigate(`/game/${gameId}`)
    } catch (error) {
      console.error('Failed to start custom game:', error)
    } finally {
      setIsStarting(false)
    }
  }
  
  const handleBackToHome = () => {
    navigate('/')
  }
  
  return (
    <PageLayout hideHeader title="" subtitle="">
      <CustomGameSection
        players={players}
        onPlayersChange={setPlayers}
        customChallenges={customGameProps.customChallenges}
        setCustomChallenges={customGameProps.setCustomChallenges}
        customChallengeForm={customGameProps.customChallengeForm}
        setCustomChallengeForm={customGameProps.setCustomChallengeForm}
        gameChallengeSelector={customGameProps.gameChallengeSelector}
        setGameChallengeSelector={customGameProps.setGameChallengeSelector}
        challengeFilter={customGameProps.challengeFilter}
        setChallengeFilter={customGameProps.setChallengeFilter}
        gameMode={customGameProps.gameMode}
        setGameMode={customGameProps.setGameMode}
        gameConfiguration={gameConfiguration}
        setGameConfiguration={setGameConfiguration}
        onBackToHome={handleBackToHome}
        onStartCustomGame={handleStartCustomGame}
        isStarting={isStarting}
        canStartCustomGame={customGameProps.customChallenges.length > 0}
      />
    </PageLayout>
  )
}
