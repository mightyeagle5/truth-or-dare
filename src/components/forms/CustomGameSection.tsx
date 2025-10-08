import React, { useRef, useState, useEffect } from 'react'
import { PlayerList } from './PlayerList'
import { SupabaseChallengeService, ChallengeSummary } from '../../lib/supabaseService'
import type { PlayerSnapshot, Level, CustomChallenge, ItemKind, GameConfiguration } from '../../types'
import styles from './CustomGameSection.module.css'

interface CustomGameSectionProps {
  // Players
  players: PlayerSnapshot[]
  onPlayersChange: (players: PlayerSnapshot[]) => void
  
  // Custom challenges
  customChallenges: CustomChallenge[]
  setCustomChallenges: React.Dispatch<React.SetStateAction<CustomChallenge[]>>
  
  // Custom challenge form
  customChallengeForm: {
    text: string
    kind: ItemKind
    level: Level
  }
  setCustomChallengeForm: React.Dispatch<React.SetStateAction<{
    text: string
    kind: ItemKind
    level: Level
  }>>
  
  // Game challenge selector
  gameChallengeSelector: {
    kind: ItemKind
    level: Level
  }
  setGameChallengeSelector: React.Dispatch<React.SetStateAction<{
    kind: ItemKind
    level: Level
  }>>
  
  // Challenge filter and display
  challengeFilter: 'all' | 'custom' | 'game'
  setChallengeFilter: React.Dispatch<React.SetStateAction<'all' | 'custom' | 'game'>>
  
  // Game mode
  gameMode: 'random' | 'progressive'
  setGameMode: React.Dispatch<React.SetStateAction<'random' | 'progressive'>>
  
  // Game configuration
  gameConfiguration: GameConfiguration
  setGameConfiguration: React.Dispatch<React.SetStateAction<GameConfiguration>>
  
  // Actions
  onBackToHome: () => void
  onStartCustomGame: () => void
  isStarting: boolean
  canStartCustomGame: boolean
}

export const CustomGameSection: React.FC<CustomGameSectionProps> = ({
  players,
  onPlayersChange,
  customChallenges,
  setCustomChallenges,
  customChallengeForm,
  setCustomChallengeForm,
  gameChallengeSelector,
  setGameChallengeSelector,
  challengeFilter,
  setChallengeFilter,
  gameMode,
  setGameMode,
  gameConfiguration,
  setGameConfiguration,
  onBackToHome,
  onStartCustomGame,
  isStarting,
  canStartCustomGame
}) => {
  const challengesListRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State for challenges summary
  const [challengesSummary, setChallengesSummary] = useState<ChallengeSummary[]>([])
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [loadingChallenges, setLoadingChallenges] = useState(false)

  // Load challenges summary on component mount
  useEffect(() => {
    const loadChallengesSummary = async () => {
      setLoadingSummary(true)
      try {
        const summary = await SupabaseChallengeService.getChallengesSummary()
        setChallengesSummary(summary)
      } catch (error) {
        console.error('Failed to load challenges summary:', error)
      } finally {
        setLoadingSummary(false)
      }
    }
    
    loadChallengesSummary()
  }, [])

  // Helper functions for custom challenges
  const getAvailableCount = (kind: ItemKind, level: Level) => {
    const summary = challengesSummary.find(s => s.level === level && s.kind === kind)
    if (!summary) return 0
    
    const addedCount = customChallenges
      .filter(challenge => !challenge.isCustom && challenge.kind === kind && challenge.level === level)
      .length
    
    return Math.max(0, summary.total - addedCount)
  }

  const addCustomChallenge = () => {
    if (!customChallengeForm.text.trim()) return
    
    const newChallenge: CustomChallenge = {
      id: `custom-${Date.now()}`,
      text: customChallengeForm.text.trim(),
      kind: customChallengeForm.kind,
      level: customChallengeForm.level,
      isCustom: true,
      gender_for: ['female', 'male'], // Default to all genders
      gender_target: ['female', 'male'], // Default to all genders
      tags: [] // Default to no tags
    }
    
    setCustomChallenges(prev => [newChallenge, ...prev])
    setCustomChallengeForm(prev => ({ ...prev, text: '' })) // Keep kind and level
    setChallengeFilter('all')
    scrollToTop()
  }

  const addGameChallenges = async () => {
    if (loadingChallenges) return
    
    setLoadingChallenges(true)
    try {
      const challenges = await SupabaseChallengeService.getChallengesByLevelAndKind(
        gameChallengeSelector.level,
        gameChallengeSelector.kind
      )
      
      // Filter out already added challenges
      const addedOriginalIds = customChallenges
        .filter(challenge => !challenge.isCustom && challenge.kind === gameChallengeSelector.kind && challenge.level === gameChallengeSelector.level)
        .map(challenge => challenge.originalId)
      
      const availableChallenges = challenges.filter(challenge => !addedOriginalIds.includes(challenge.id))
      
      const newChallenges: CustomChallenge[] = availableChallenges.map(challenge => ({
        id: `game-${challenge.id}-${Date.now()}`,
        text: challenge.text,
        kind: challenge.kind,
        level: challenge.level,
        isCustom: false,
        originalId: challenge.id,
        gender_for: challenge.gender_for || ['female', 'male'],
        gender_target: challenge.gender_target || ['female', 'male'],
        tags: challenge.tags || []
      }))
      
      setCustomChallenges(prev => [...newChallenges, ...prev])
      setChallengeFilter('all')
      scrollToTop()
    } catch (error) {
      console.error('Failed to load challenges:', error)
    } finally {
      setLoadingChallenges(false)
    }
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

  // Show all filtered challenges
  const displayChallenges = filteredChallenges

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
          id: `custom-${Date.now()}-${Math.random()}`,
          text: item.text || '',
          kind: item.kind || 'truth',
          level: item.level || 'soft',
          isCustom: true,
          gender_for: item.gender_for || ['female', 'male'],
          gender_target: item.gender_target || ['female', 'male'],
          tags: item.tags || []
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
    <div className={styles.customGameContainer}>
      <div className={styles.customGameTemplate}>
        <div className={styles.customGameHeaderAlt}>Custom Truth or Dare</div>
        
        <div className={styles.customGameContent}>
          {/* Players Section */}
          <div className={styles.playersSection}>
            <PlayerList
              players={players}
              onPlayersChange={onPlayersChange}
              hidePreferences={true}
            />
          </div>

          {/* Add sections container with divider */}
          <div className={styles.addSectionsContainer}>
            <div className={styles.addSectionsGrid}>
              {/* Add Custom Challenge */}
              <div className={styles.addCustomSection}>
                <div className={styles.sectionHeaderSimple}>
                  <h3>Add Custom Challenge</h3>
                </div>
                <div className={styles.customChallengeForm}>
                  <textarea
                    className={styles.challengeTextarea}
                    placeholder="Use {active_player} for current player's name and {other_player} for the other player's name to personalize experience"
                    value={customChallengeForm.text}
                    onChange={(e) => setCustomChallengeForm(prev => ({ ...prev, text: e.target.value }))}
                  />
                  <div className={styles.challengeControlsGrid}>
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
                      <option value="soft">Soft</option>
                      <option value="mild">Mild</option>
                      <option value="hot">Hot</option>
                      <option value="spicy">Spicy</option>
                      <option value="kinky">Kinky</option>
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

              {/* Add from Original Game (top-right) */}
              <div className={styles.addGameSection}>
                <div className={styles.sectionHeaderSimple}><h3>Add from Original Game</h3></div>
                <div className={styles.gameChallengeSelectorColumn}>
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
                    <option value="soft">Soft</option>
                    <option value="mild">Mild</option>
                    <option value="hot">Hot</option>
                    <option value="spicy">Spicy</option>
                    <option value="kinky">Kinky</option>
                  </select>
                  <button
                    className={styles.addGameButton}
                    onClick={addGameChallenges}
                    disabled={getAvailableCount(gameChallengeSelector.kind, gameChallengeSelector.level) === 0 || loadingChallenges}
                  >
                    {loadingChallenges 
                      ? 'Loading...' 
                      : `Add All (${getAvailableCount(gameChallengeSelector.kind, gameChallengeSelector.level)} available)`
                    }
                  </button>
                </div>
              </div>

              {/* Upload Challenges (right column) */}
              <div className={styles.uploadSection}>
                <div className={styles.sectionHeaderSimple}><h3>Upload Challenges</h3></div>
                <button
                  className={styles.uploadButton}
                  onClick={handleUploadChallenges}
                  type="button"
                >
                  Upload Challenges
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
              </div>
            </div>
            <div className={styles.challengesList} ref={challengesListRef}>
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

          {/* Game Configuration */}
          <div className={styles.gameConfigSection}>
            <h3>Game Configuration</h3>
            
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
                  <strong>By level</strong>
                  <small>User can change the level at any time during the game</small>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.actions}>
        <button
          className={styles.backButton}
          onClick={onBackToHome}
          type="button"
        >
          Back to Home
        </button>
        <button
          className={styles.startButton}
          onClick={onStartCustomGame}
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
  )
}
