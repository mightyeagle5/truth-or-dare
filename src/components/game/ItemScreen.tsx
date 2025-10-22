import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { getCurrentPlayer } from '../../store/selectors'
import { useGameStore } from '../../store'
import { ChallengeRating } from '../ui'
import { substitutePlayerNames, selectTargetPlayer } from '../../lib/playerSubstitution'
import { isWildCardAvailable } from '../../lib/items'
import { getPriorGameItems } from '../../store/storage'
import dingSound from '../../sounds/ding.mp3'
import styles from './ItemScreen.module.css'

export const ItemScreen: React.FC = () => {
  const { 
    currentGame, 
    currentItem, 
    isWildCard,
    pickWildCard, 
    skipItem, 
    completeItem,
    completeWildCard,
    items,
    challengePairLoading
  } = useGameStore()

  const [timerRunning, setTimerRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(currentItem?.duration || 0)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  // Initialize audio element once
  useEffect(() => {
    audioRef.current = new Audio(dingSound)
    // Preload the audio
    audioRef.current.load()
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Reset timer state when item changes
  useEffect(() => {
    setTimeLeft(currentItem?.duration || 0)
    setTimerRunning(false)
  }, [currentItem?.id])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            // Play sound when timer hits 0
            if (audioRef.current) {
              audioRef.current.currentTime = 0
              audioRef.current.play().catch(err => {
                console.error('Failed to play timer sound:', err)
              })
            }
            setTimerRunning(false)
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning, timeLeft])

  if (!currentGame || !currentItem) return null

  const currentPlayer = getCurrentPlayer(currentGame)
  
  if (!currentPlayer) return null
  
  // Select target player for the challenge
  const targetPlayer = selectTargetPlayer(currentPlayer, currentGame.players, currentItem.gender_target || [])
  
  // Substitute player names in the challenge text
  const personalizedText = substitutePlayerNames(currentItem.text, currentPlayer, targetPlayer)

  // Check if wild card is available (only for custom games)
  const priorGameItems = currentGame.respectPriorGames ? getPriorGameItems(currentGame.priorGameIds) : []
  const wildCardAvailable = currentGame.isCustomGame 
    ? isWildCardAvailable(items, currentGame.usedItems, priorGameItems)
    : true // For regular games, assume wild card is always available

  const handleWildCard = () => {
    if (!challengePairLoading) {
      pickWildCard()
    }
  }

  const handleSkip = () => {
    if (!challengePairLoading) {
      skipItem()
    }
  }

  const handleComplete = () => {
    if (!challengePairLoading) {
      if (isWildCard) {
        completeWildCard()
      } else {
        completeItem()
      }
    }
  }

  const handleTimerRestart = () => {
    setTimeLeft(currentItem.duration || 0)
    setTimerRunning(false)
  }

  const handleTimerToggle = () => {
    // On first interaction with timer, attempt to play and pause audio to "unlock" it on mobile
    if (!timerRunning && audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current?.pause()
        if (audioRef.current) {
          audioRef.current.currentTime = 0
        }
      }).catch(() => {
        // Ignore errors on unlock attempt
      })
    }
    setTimerRunning(!timerRunning)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }


  return (
    <div className={styles.container}>
      <div className={styles.challengeType}>
        <div className={`${styles.challengeTypeContainer} ${currentItem.kind === 'truth' ? styles.truthType : styles.dareType}`}>
          {currentItem.kind === 'truth' ? 'Truth' : 'Dare'}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {currentItem.is_time_based && currentItem.duration && currentItem.duration > 0 && (
            <div className={styles.timerSection}>
              <div className={styles.timer}>
                {formatTime(timeLeft)}
              </div>
              <div className={styles.timerControls}>
                <button 
                  className={styles.timerButton}
                  onClick={handleTimerRestart}
                  type="button"
                >
                  <Icon icon="solar:restart-bold" />
                </button>
                <button 
                  className={styles.timerButton}
                  onClick={handleTimerToggle}
                  type="button"
                >
                  <Icon icon={timerRunning ? "solar:pause-bold" : "solar:play-bold"} />
                </button>
              </div>
            </div>
          )}

          <div className={styles.textSection}>
            <p className={styles.challengeText}>
              {personalizedText}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className={styles.ratingSection}>
        <ChallengeRating 
          challengeId={currentItem.id}
          isCustomGame={currentGame.isCustomGame}
        />
      </div>

      <div className={styles.actions}>
        {currentGame.gameConfiguration.wildCardEnabled && (
          <button
            className={`${styles.wildCardButton} ${!wildCardAvailable || challengePairLoading ? styles.disabled : ''}`}
            onClick={handleWildCard}
            disabled={!wildCardAvailable || challengePairLoading}
            type="button"
          >
            Wild card
          </button>
        )}
        
        {currentGame.gameConfiguration.skipEnabled && (
          <button
            className={`${styles.skipButton} ${challengePairLoading ? styles.disabled : ''}`}
            onClick={handleSkip}
            disabled={challengePairLoading}
            type="button"
          >
            Skip
          </button>
        )}
        
        <button
          className={`${styles.completeButton} ${challengePairLoading ? styles.disabled : ''}`}
          onClick={handleComplete}
          disabled={challengePairLoading}
          type="button"
        >
          Complete
        </button>
      </div>
    </div>
  )
}
