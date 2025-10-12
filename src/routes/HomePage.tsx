import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageLayout } from '../components/layout'
import { PlayerList, PreviousGamesPicker } from '../components/forms'
import { useGameStore, useHistoryStore, useDevStore } from '../store'
import { useGameSetup } from '../hooks/useGameSetup'
import styles from './HomePage.module.css'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { startGame, clearGame } = useGameStore()
  const { gameHistory, removeGameFromHistory } = useHistoryStore()
  // const { isDevMode, disableGameSaving, setDisableGameSaving } = useDevStore()
  
  const [isStarting, setIsStarting] = useState(false)
  
  // Regular game setup
  const {
    players,
    setPlayers,
    selectedLevel,
    selectedPriorGames,
    setSelectedPriorGames,
    canStartGame,
    gameConfiguration,
    setGameConfiguration
  } = useGameSetup()
  
  // Clear game state when returning to homepage
  useEffect(() => {
    clearGame()
  }, [clearGame])
  
  const handleStartGame = async () => {
    // Level is defaulted to 'soft' and UI is hidden, but logic remains for later use.
    if (!selectedLevel || !canStartGame) return
    
    setIsStarting(true)
    try {
      const gameId = await startGame(players, selectedLevel, selectedPriorGames, gameConfiguration)
      if (gameId) {
        navigate(`/game/${gameId}`)
      }
    } catch (error) {
      console.error('Failed to start game:', error)
    } finally {
      setIsStarting(false)
    }
  }
  
  const handleStartCustomGame = () => {
    navigate('/create-custom-game')
  }
  
  return (
    <PageLayout hideHeader title="" subtitle="">
      <div className={styles.container}>
        {import.meta.env.DEV && (
          <Link to="/admin/edit-challenges" className={styles.fixedAdminLink}>Admin</Link>
        )}
        <div className={styles.content}>
          <div className={styles.sections}>
            <div className={styles.homeTitle}>Truth or Dare</div>
            <PlayerList
              players={players}
              onPlayersChange={setPlayers}
            />
            {/* Actions moved below players and above previous games. */}
            <div className={styles.actionsInline}>
              <button
                className={styles.customGameButton}
                onClick={handleStartCustomGame}
                disabled={isStarting}
                type="button"
              >
                Create Custom Game
              </button>
              <button
                className={styles.startButton}
                onClick={handleStartGame}
                disabled={!canStartGame || isStarting}
                type="button"
              >
                {isStarting ? 'Starting...' : 'Start Game'}
              </button>
            </div>
            
            {/* Level selector hidden for now. Leaving logic/state in place for future use. */}
            
            <div className={styles.configSection}>
              <h3 className={styles.sectionTitle}>Game configuration</h3>
              
              {/* Game Configuration Options */}
              <div className={styles.gameConfigOptions}>
                <div className={styles.configRow}>
                  <div className={styles.configLabel}>
                    <span className={styles.configTitle}>Enable Wild Card</span>
                    <span className={styles.configSubtitle}>Allow players to pick a random challenge</span>
                  </div>
                  <label className={styles.configToggle}>
                    <input
                      type="checkbox"
                      checked={gameConfiguration.wildCardEnabled}
                      onChange={(e) => setGameConfiguration(prev => ({ ...prev, wildCardEnabled: e.target.checked }))}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>

                <div className={styles.configRow}>
                  <div className={styles.configLabel}>
                    <span className={styles.configTitle}>Enable Skip</span>
                    <span className={styles.configSubtitle}>Allow players to skip challenges</span>
                  </div>
                  <label className={styles.configToggle}>
                    <input
                      type="checkbox"
                      checked={gameConfiguration.skipEnabled}
                      onChange={(e) => setGameConfiguration(prev => ({ ...prev, skipEnabled: e.target.checked }))}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>

                <div className={styles.configRow}>
                  <div className={styles.configLabel}>
                    <span className={styles.configTitle}>Consecutive Same Type Limit</span>
                        <span className={styles.configSubtitle}>Limit how many consecutive challenges of the same type player can choose</span>
                  </div>
                  <div className={styles.configControls}>
                    {gameConfiguration.consecutiveLimit !== null && (
                      <select
                        className={styles.consecutiveSelect}
                        value={gameConfiguration.consecutiveLimit}
                        onChange={(e) => setGameConfiguration(prev => ({ 
                          ...prev, 
                          consecutiveLimit: parseInt(e.target.value) 
                        }))}
                      >
                        <option value={1}>1 challenge</option>
                        <option value={2}>2 challenges</option>
                        <option value={3}>3 challenges</option>
                        <option value={4}>4 challenges</option>
                        <option value={5}>5 challenges</option>
                      </select>
                    )}
                    <label className={styles.configToggle}>
                      <input
                        type="checkbox"
                        checked={gameConfiguration.consecutiveLimit !== null}
                        onChange={(e) => setGameConfiguration(prev => ({ 
                          ...prev, 
                          consecutiveLimit: e.target.checked ? 2 : null 
                        }))}
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Previous Games temporarily disabled */}
              {false && (
                <PreviousGamesPicker
                  gameHistory={gameHistory}
                  selectedGameIds={selectedPriorGames}
                  onSelectionChange={setSelectedPriorGames}
                  onRemoveGame={removeGameFromHistory}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
