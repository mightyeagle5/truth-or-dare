import { useState, useRef, useEffect } from 'react'
import { createChallengeId } from '../lib/ids'
import type { CustomChallenge, ItemKind, Level } from '../types'
import gameQuestions from '../data/game_questions.json'

export const useCustomGame = () => {
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

  // Filter challenges based on current filter
  const filteredChallenges = customChallenges.filter(challenge => {
    if (challengeFilter === 'all') return true
    if (challengeFilter === 'custom') return challenge.source === 'custom'
    if (challengeFilter === 'game') return challenge.source === 'game'
    return true
  })

  // Get available game challenges that haven't been added yet
  const getAvailableGameChallenges = () => {
    const addedGameIds = customChallenges
      .filter(c => c.source === 'game')
      .map(c => c.id)
    
    return gameQuestions.filter(item => !addedGameIds.includes(item.id))
  }

  // Get count of available challenges by kind and level
  const getAvailableChallengeCount = (kind: ItemKind, level: Level) => {
    const available = getAvailableGameChallenges()
    return available.filter(item => item.kind === kind && item.level === level).length
  }

  // Add custom challenge
  const addCustomChallenge = () => {
    if (!customChallengeForm.text.trim()) return

    const newChallenge: CustomChallenge = {
      id: createChallengeId(),
      text: customChallengeForm.text.trim(),
      kind: customChallengeForm.kind,
      level: customChallengeForm.level,
      source: 'custom'
    }

    setCustomChallenges(prev => [newChallenge, ...prev])
    setCustomChallengeForm(prev => ({ ...prev, text: '' }))
    
    // Reset filter to 'all' and scroll to top when new item is added
    setChallengeFilter('all')
    if (challengesListRef.current) {
      challengesListRef.current.scrollTop = 0
    }
  }

  // Add game challenges
  const addGameChallenges = () => {
    const available = getAvailableGameChallenges()
    const matching = available.filter(item => 
      item.kind === gameChallengeSelector.kind && 
      item.level === gameChallengeSelector.level
    )

    const newChallenges: CustomChallenge[] = matching.map(item => ({
      id: item.id,
      text: item.text,
      kind: item.kind,
      level: item.level,
      source: 'game'
    }))

    setCustomChallenges(prev => [...newChallenges, ...prev])
    
    // Reset filter to 'all' and scroll to top when new items are added
    setChallengeFilter('all')
    if (challengesListRef.current) {
      challengesListRef.current.scrollTop = 0
    }
  }

  // Remove challenge
  const removeChallenge = (challengeId: string) => {
    setCustomChallenges(prev => prev.filter(c => c.id !== challengeId))
  }

  // Clear all challenges
  const clearAllChallenges = () => {
    setCustomChallenges([])
  }

  // Update challenges (for file operations)
  const updateChallenges = (newChallenges: CustomChallenge[]) => {
    setCustomChallenges(newChallenges)
  }

  // Toggle preview mode
  const togglePreviewMode = () => {
    setShowAllChallenges(prev => !prev)
  }

  return {
    // State
    customChallenges,
    customChallengeForm,
    gameChallengeSelector,
    challengeFilter,
    gameMode,
    showAllChallenges,
    challengesListRef,
    filteredChallenges,
    
    // Actions
    setCustomChallengeForm,
    setGameChallengeSelector,
    setChallengeFilter,
    setGameMode,
    addCustomChallenge,
    addGameChallenges,
    removeChallenge,
    clearAllChallenges,
    togglePreviewMode,
    updateChallenges,
    
    // Computed values
    getAvailableChallengeCount,
    getAvailableGameChallenges
  }
}
