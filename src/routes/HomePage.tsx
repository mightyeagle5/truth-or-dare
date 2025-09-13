import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPlayerId } from '../lib/ids'
import { Header } from '../components/Header'
import { PlayerList } from '../components/PlayerList'
import { LevelSelector } from '../components/LevelSelector'
import { PreviousGamesPicker } from '../components/PreviousGamesPicker'
import { useGameStore } from '../store/gameStore'
import gameQuestions from '../data/game_questions.json'
import type { PlayerSnapshot, Level, CustomChallenge, ItemKind } from '../types'
import styles from './HomePage.module.css'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { startGame, startCustomGame, gameHistory, loadGameHistory, removeGameFromHistory } = useGameStore()
  
  const [players, setPlayers] = useState<PlayerSnapshot[]>([
    { id: createPlayerId(), name: '', gender: 'male' },
    { id: createPlayerId(), name: '', gender: 'female' }
  ])
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [selectedPriorGames, setSelectedPriorGames] = useState<string[]>([])
  const [isStarting, setIsStarting] = useState(false)
  const [showCustomGame, setShowCustomGame] = useState(false)
  
  // Custom game state
  const [customChallenges, setCustomChallenges] = useState<CustomChallenge[]>([])
  const [customChallengeForm, setCustomChallengeForm] = useState({
    text: '',
    kind: 'truth' as ItemKind,
    level: 'Soft' as Level
  })
  const [gameChallengeSelector, setGameChallengeSelector] = useState({
    kind: 'truth' as ItemKind,
    level: 'Soft' as Level
  })
  const [challengeFilter, setChallengeFilter] = useState<'all' | 'custom' | 'game'>('all')
  const [gameMode, setGameMode] = useState<'random' | 'progressive'>('random')
  const [showAllChallenges, setShowAllChallenges] = useState(false)
  const challengesListRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadGameHistory()
  }, [loadGameHistory])

  const handleStartGame = async () => {
    if (!selectedLevel || players.length < 2) return
    
    // Validate player names
    const validPlayers = players.filter(p => p.name.trim().length > 0)
    if (validPlayers.length < 2) return
    
    setIsStarting(true)
    
    try {
      const gameId = startGame(validPlayers, selectedLevel, selectedPriorGames)
      navigate(`/game/${gameId}`)
    } catch (error) {
      console.error('Failed to start game:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const canStartGame = selectedLevel && players.length >= 2 && players.every(p => p.name.trim().length > 0)
  const canStartCustomGame = customChallenges.length > 0 && players.length >= 2 && players.every(p => p.name.trim().length > 0)

  const handleStartCustomGame = async () => {
    if (!canStartCustomGame) return
    
    // Validate player names
    const validPlayers = players.filter(p => p.name.trim().length > 0)
    if (validPlayers.length < 2) return
    
    setIsStarting(true)
    
    try {
      const gameId = startCustomGame(validPlayers, customChallenges, gameMode)
      navigate(`/game/${gameId}`)
    } catch (error) {
      console.error('Failed to start custom game:', error)
    } finally {
      setIsStarting(false)
    }
  }

  // Helper functions for custom challenges
  const getAvailableGameChallenges = (kind: ItemKind, level: Level) => {
    const allChallenges = gameQuestions.filter(item => item.kind === kind && item.level === level)
    const addedOriginalIds = customChallenges
      .filter(challenge => !challenge.isCustom && challenge.kind === kind && challenge.level === level)
      .map(challenge => challenge.originalId)
    return allChallenges.filter(challenge => !addedOriginalIds.includes(challenge.id))
  }

  const addCustomChallenge = () => {
    if (!customChallengeForm.text.trim()) return
    
    const newChallenge: CustomChallenge = {
      id: `custom-${Date.now()}`,
      text: customChallengeForm.text.trim(),
      kind: customChallengeForm.kind,
      level: customChallengeForm.level,
      isCustom: true
    }
    
    setCustomChallenges(prev => [newChallenge, ...prev])
    setCustomChallengeForm(prev => ({ ...prev, text: '' })) // Keep kind and level
    setChallengeFilter('all')
    scrollToTop()
  }

  const addGameChallenges = () => {
    const availableChallenges = getAvailableGameChallenges(gameChallengeSelector.kind, gameChallengeSelector.level)
    
    const newChallenges: CustomChallenge[] = availableChallenges.map(challenge => ({
      id: `game-${challenge.id}-${Date.now()}`,
      text: challenge.text,
      kind: challenge.kind as ItemKind,
      level: challenge.level as Level,
      isCustom: false,
      originalId: challenge.id
    }))
    
    setCustomChallenges(prev => [...newChallenges, ...prev])
    setChallengeFilter('all')
    scrollToTop()
  }

  const scrollToTop = () => {
    if (challengesListRef.current) {
      challengesListRef.current.scrollTop = 0
    }
  }

  const removeChallenge = (challengeId: string) => {
    setCustomChallenges(prev => prev.filter(challenge => challenge.id !== challengeId))
  }

  // Filter challenges based on selected filter
  const filteredChallenges = customChallenges.filter(challenge => {
    if (challengeFilter === 'all') return true
    if (challengeFilter === 'custom') return challenge.isCustom
    if (challengeFilter === 'game') return !challenge.isCustom
    return true
  })

  // Apply preview mode (show only top 5 if not showing all)
  const displayChallenges = showAllChallenges ? filteredChallenges : filteredChallenges.slice(0, 5)
  
  // Check if preview toggle should be visible (only if more than 5 challenges after filtering)
  const shouldShowPreviewToggle = filteredChallenges.length > 5

  // Check if game mode selection should be disabled
  const isGameModeDisabled = () => {
    if (customChallenges.length === 0) return true
    
    const uniqueLevels = new Set(customChallenges.map(challenge => challenge.level))
    return uniqueLevels.size <= 1
  }

  // File upload and download functions
  const handleUploadChallenges = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const uploadedChallenges = JSON.parse(content)
        
        // Validate the format
        if (!Array.isArray(uploadedChallenges)) {
          alert('Invalid file format. Please upload a JSON array of challenges.')
          return
        }

        // Convert uploaded items to CustomChallenge format
        const newChallenges: CustomChallenge[] = uploadedChallenges.map((item: any) => ({
          id: createPlayerId(), // Generate new ID
          text: item.text || '',
          kind: item.kind || 'truth',
          level: item.level || 'Soft',
          isCustom: true
        })).filter(challenge => challenge.text.trim().length > 0)

        if (newChallenges.length === 0) {
          alert('No valid challenges found in the uploaded file.')
          return
        }

        // Add new challenges to the top of the list
        setCustomChallenges(prev => [...newChallenges, ...prev])
        setChallengeFilter('all')
        scrollToTop()
        
        alert(`Successfully uploaded ${newChallenges.length} challenges!`)
      } catch (error) {
        alert('Error reading file. Please make sure it\'s a valid JSON file.')
      }
    }
    reader.readAsText(file)
    
    // Reset the input
    event.target.value = ''
  }

  const handleDownloadChallenges = () => {
    if (customChallenges.length === 0) return

    // Convert custom challenges to the standard Item format
    const challengesToDownload = customChallenges.map(challenge => ({
      id: challenge.id,
      text: challenge.text,
      kind: challenge.kind,
      level: challenge.level
    }))

    const dataStr = JSON.stringify(challengesToDownload, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'custom-challenges.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.container}>
      <Header 
        title="Truth or Dare" 
        subtitle="The sexy version" 
      />
      
      <main className={styles.main}>
        {showCustomGame ? (
          <div className={styles.customGameContainer}>
            <div className={styles.customGameTemplate}>
              <div className={styles.customGameHeader}>
                <h2>Create Custom Game</h2>
                <p>Design your own Truth or Dare experience</p>
              </div>
              
              <div className={styles.customGameContent}>
                {/* Players Section */}
                <div className={styles.playersSection}>
                  <PlayerList
                    players={players}
                    onPlayersChange={setPlayers}
                  />
                </div>

                {/* Add Custom Challenge */}
                <div className={styles.addCustomSection}>
                  <div className={styles.sectionHeader}>
                    <h3>Add Custom Challenge</h3>
                    <button
                      className={styles.uploadButton}
                      onClick={handleUploadChallenges}
                      type="button"
                    >
                      Upload Challenges
                    </button>
                  </div>
                  <div className={styles.customChallengeForm}>
                    <div className={styles.challengeInputRow}>
                      <textarea
                        className={styles.challengeTextarea}
                        placeholder="Enter your custom truth or dare..."
                        value={customChallengeForm.text}
                        onChange={(e) => setCustomChallengeForm(prev => ({ ...prev, text: e.target.value }))}
                      />
                      <div className={styles.challengeControls}>
                        <select
                          className={styles.challengeSelect}
                          value={customChallengeForm.kind}
                          onChange={(e) => setCustomChallengeForm(prev => ({ ...prev, kind: e.target.value as ItemKind }))}
                        >
                          <option value="truth">Truth</option>
                          <option value="dare">Dare</option>
                        </select>
                        <select
                          className={styles.challengeSelect}
                          value={customChallengeForm.level}
                          onChange={(e) => setCustomChallengeForm(prev => ({ ...prev, level: e.target.value as Level }))}
                        >
                          <option value="Soft">Soft</option>
                          <option value="Mild">Mild</option>
                          <option value="Hot">Hot</option>
                          <option value="Spicy">Spicy</option>
                          <option value="Kinky">Kinky</option>
                        </select>
                        <button
                          className={styles.addCustomButton}
                          onClick={addCustomChallenge}
                          disabled={!customChallengeForm.text.trim()}
                        >
                          Add Custom
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add from Game */}
                <div className={styles.addGameSection}>
                  <h3>Add from Original Game</h3>
                  <div className={styles.gameChallengeSelector}>
                    <div className={styles.challengeOptions}>
                      <select
                        className={styles.challengeSelect}
                        value={gameChallengeSelector.kind}
                        onChange={(e) => setGameChallengeSelector(prev => ({ ...prev, kind: e.target.value as ItemKind }))}
                      >
                        <option value="truth">Truth</option>
                        <option value="dare">Dare</option>
                      </select>
                      <select
                        className={styles.challengeSelect}
                        value={gameChallengeSelector.level}
                        onChange={(e) => setGameChallengeSelector(prev => ({ ...prev, level: e.target.value as Level }))}
                      >
                        <option value="Soft">Soft</option>
                        <option value="Mild">Mild</option>
                        <option value="Hot">Hot</option>
                        <option value="Spicy">Spicy</option>
                        <option value="Kinky">Kinky</option>
                      </select>
                      <button
                        className={styles.addGameButton}
                        onClick={addGameChallenges}
                        disabled={getAvailableGameChallenges(gameChallengeSelector.kind, gameChallengeSelector.level).length === 0}
                      >
                        Add All ({getAvailableGameChallenges(gameChallengeSelector.kind, gameChallengeSelector.level).length} available)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Challenges List */}
                <div className={styles.challengesSection}>
                  <div className={styles.challengesHeader}>
                    <div className={styles.sectionHeader}>
                      <h3>Your Challenges ({customChallenges.length})</h3>
                      <button
                        className={styles.downloadButton}
                        onClick={handleDownloadChallenges}
                        disabled={customChallenges.length === 0}
                        type="button"
                      >
                        Download Challenges
                      </button>
                    </div>
                    <div className={styles.challengeFilter}>
                      <div className={styles.filterButtons}>
                        <button
                          className={`${styles.filterButton} ${challengeFilter === 'all' ? styles.active : ''}`}
                          onClick={() => setChallengeFilter('all')}
                        >
                          All
                        </button>
                        <button
                          className={`${styles.filterButton} ${challengeFilter === 'custom' ? styles.active : ''}`}
                          onClick={() => setChallengeFilter('custom')}
                        >
                          Custom
                        </button>
                        <button
                          className={`${styles.filterButton} ${challengeFilter === 'game' ? styles.active : ''}`}
                          onClick={() => setChallengeFilter('game')}
                        >
                          Game
                        </button>
                      </div>
                      {shouldShowPreviewToggle && (
                        <button
                          className={`${styles.previewToggle} ${showAllChallenges ? styles.active : ''}`}
                          onClick={() => setShowAllChallenges(!showAllChallenges)}
                        >
                          {showAllChallenges ? 'Show Preview' : 'Show All'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className={`${styles.challengesList} ${showAllChallenges ? styles.showAllMode : ''}`} ref={challengesListRef}>
                    {filteredChallenges.length === 0 ? (
                      <p className={styles.emptyMessage}>
                        {challengeFilter === 'all' 
                          ? 'No challenges added yet. Add some custom challenges or select from the original game!'
                          : `No ${challengeFilter} challenges found.`
                        }
                      </p>
                    ) : (
                      displayChallenges.map((challenge) => (
                        <div key={challenge.id} className={styles.challengeItem}>
                          <div className={styles.challengeInfo}>
                            <div className={styles.challengeHeader}>
                              <span className={`${styles.challengeType} ${styles[challenge.kind]}`}>
                                {challenge.kind === 'truth' ? 'Truth' : 'Dare'}
                              </span>
                              <span className={`${styles.challengeLevel} ${styles[challenge.level.toLowerCase()]}`}>
                                {challenge.level}
                              </span>
                              <span className={`${styles.challengeSource} ${challenge.isCustom ? styles.custom : styles.game}`}>
                                {challenge.isCustom ? 'Custom' : 'Game'}
                              </span>
                            </div>
                            <p className={styles.challengeText}>{challenge.text}</p>
                          </div>
                          <button
                            className={styles.removeButton}
                            onClick={() => removeChallenge(challenge.id)}
                            title="Remove challenge"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Game Mode Selection */}
                <div className={styles.gameModeSection}>
                  <h3>Game Mode</h3>
                  <div className={styles.gameModeOptions}>
                    <label className={styles.gameModeOption}>
                      <input
                        type="radio"
                        name="gameMode"
                        value="random"
                        checked={gameMode === 'random'}
                        onChange={(e) => setGameMode(e.target.value as 'random' | 'progressive')}
                        disabled={isGameModeDisabled()}
                      />
                      <span className={styles.gameModeLabel}>
                        <strong>Random</strong>
                        <small>Challenges appear in random order</small>
                      </span>
                    </label>
                    <label className={styles.gameModeOption}>
                      <input
                        type="radio"
                        name="gameMode"
                        value="progressive"
                        checked={gameMode === 'progressive'}
                        onChange={(e) => setGameMode(e.target.value as 'random' | 'progressive')}
                        disabled={isGameModeDisabled()}
                      />
                      <span className={styles.gameModeLabel}>
                        <strong>Progressive</strong>
                        <small>Start with easier levels and progress to harder ones</small>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.actions}>
              <button
                className={styles.backButton}
                onClick={() => setShowCustomGame(false)}
                type="button"
              >
                Back to Home
              </button>
              <button
                className={styles.startButton}
                onClick={handleStartCustomGame}
                disabled={!canStartCustomGame || isStarting}
                type="button"
              >
                {isStarting ? 'Starting...' : 'Start Game'}
              </button>
            </div>
            
            {/* Hidden file input for uploads */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.sections}>
              <PlayerList
                players={players}
                onPlayersChange={setPlayers}
              />
              
              <LevelSelector
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
              />
              
              <PreviousGamesPicker
                gameHistory={gameHistory}
                selectedGameIds={selectedPriorGames}
                onSelectionChange={setSelectedPriorGames}
                onRemoveGame={(gameId) => {
                  // Remove from local state and call store method
                  setSelectedPriorGames(prev => prev.filter(id => id !== gameId))
                  removeGameFromHistory(gameId)
                }}
              />
            </div>
            
            <div className={styles.actions}>
              <button
                className={styles.customGameButton}
                onClick={() => setShowCustomGame(true)}
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
          </div>
        )}
      </main>
    </div>
  )
}
