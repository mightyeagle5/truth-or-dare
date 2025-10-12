import { useState, useRef } from 'react'
import gameQuestions from '../data/game_questions.json'
import type { Level, CustomChallenge, ItemKind } from '../types'

export const useCustomGame = () => {
  const [customChallenges, setCustomChallenges] = useState<CustomChallenge[]>([])
  const [customChallengeForm, setCustomChallengeForm] = useState({
    text: '',
    kind: 'truth' as ItemKind,
    level: 'soft' as Level
  })
  const [gameChallengeSelector, setGameChallengeSelector] = useState({
    kind: 'truth' as ItemKind,
    level: 'soft' as Level
  })
  const [challengeFilter, setChallengeFilter] = useState<'all' | 'custom' | 'game'>('all')
  const [gameMode, setGameMode] = useState<'random' | 'progressive'>('random')
  const [showAllChallenges, setShowAllChallenges] = useState(false)
  const challengesListRef = useRef<HTMLDivElement>(null)

  // Helper functions
  const getAvailableGameChallenges = (kind: ItemKind, level: Level) => {
    const allChallenges = gameQuestions.filter((item: any) => item.kind === kind && item.level === level)
    const addedOriginalIds = customChallenges
      .filter(challenge => !challenge.isCustom && challenge.kind === kind && challenge.level === level)
      .map(challenge => challenge.originalId)
    return allChallenges.filter((challenge: any) => !addedOriginalIds.includes(challenge.id))
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

  const addGameChallenges = () => {
    const availableChallenges = getAvailableGameChallenges(gameChallengeSelector.kind, gameChallengeSelector.level)
    
    const newChallenges: CustomChallenge[] = availableChallenges.map((challenge: any) => ({
      id: `game-${challenge.id}-${Date.now()}`,
      text: challenge.text,
      kind: challenge.kind as ItemKind,
      level: challenge.level as Level,
      isCustom: false,
      originalId: challenge.id,
      gender_for: challenge.gender_for || ['female', 'male'],
      gender_target: challenge.gender_target || ['female', 'male'],
      tags: challenge.tags || []
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

  const clearAllChallenges = () => {
    setCustomChallenges([])
    setChallengeFilter('all')
  }

  const togglePreviewMode = () => {
    setShowAllChallenges(prev => !prev)
  }

  const updateChallenges = (challenges: CustomChallenge[]) => {
    setCustomChallenges(challenges)
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

  return {
    // State
    customChallenges,
    customChallengeForm,
    gameChallengeSelector,
    challengeFilter,
    gameMode,
    showAllChallenges,
    challengesListRef,
    
    // Setters
    setCustomChallenges,
    setCustomChallengeForm,
    setGameChallengeSelector,
    setChallengeFilter,
    setGameMode,
    setShowAllChallenges,
    
    // Computed
    filteredChallenges,
    displayChallenges,
    shouldShowPreviewToggle,
    isGameModeDisabled,
    getAvailableChallengeCount: (kind: ItemKind, level: Level) => getAvailableGameChallenges(kind, level).length,
    getAvailableGameChallenges,
    
    // Actions
    addCustomChallenge,
    addGameChallenges,
    removeChallenge,
    clearAllChallenges,
    togglePreviewMode,
    updateChallenges,
    scrollToTop
  }
}