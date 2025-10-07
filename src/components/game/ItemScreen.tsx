import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { getCurrentPlayer } from '../../store/selectors'
import { useGameStore } from '../../store'
import { ChallengeRating } from '../ui'
import { substitutePlayerNames, selectTargetPlayer } from '../../lib/playerSubstitution'
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
    completeWildCard
  } = useGameStore()

  const [timerRunning, setTimerRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(currentItem?.duration || 0)

  // Reset timer state when item changes
  useEffect(() => {
    setTimeLeft(currentItem?.duration || 0)
    setTimerRunning(false)
  }, [currentItem?.id, currentItem?.duration])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            // Play sound when timer hits 0
            const audio = new Audio(dingSound)
            audio.play().catch(console.error)
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

  const handleWildCard = () => {
    pickWildCard()
  }

  const handleSkip = () => {
    skipItem()
  }

  const handleComplete = () => {
    if (isWildCard) {
      completeWildCard()
    } else {
      completeItem()
    }
  }

  const handleTimerRestart = () => {
    setTimeLeft(currentItem.duration || 0)
    setTimerRunning(false)
  }

  const handleTimerToggle = () => {
    setTimerRunning(!timerRunning)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }


  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className={styles.container}
    >
      <div className={styles.challengeType}>
        <div className={`${styles.challengeTypeContainer} ${currentItem.kind === 'truth' ? styles.truthType : styles.dareType}`}>
          {currentItem.kind === 'truth' ? 'Truth' : 'Dare'}
        </div>
      </div>

      <div className={styles.timerSection}>
        {currentItem.is_time_based && currentItem.duration && currentItem.duration > 0 && (
          <>
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
          </>
        )}
      </div>

      <div className={styles.textSection}>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentItem.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={styles.challengeText}
          >
            {personalizedText}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className={styles.ratingSection}>
        <ChallengeRating 
          challengeId={currentItem.id}
          isCustomGame={currentGame.isCustomGame}
        />
      </div>

      <div className={styles.actions}>
        <button
          className={styles.wildCardButton}
          onClick={handleWildCard}
          type="button"
        >
          Wild card
        </button>
        
        <button
          className={styles.skipButton}
          onClick={handleSkip}
          type="button"
        >
          Skip
        </button>
        <button
          className={styles.completeButton}
          onClick={handleComplete}
          type="button"
        >
          Complete
        </button>
      </div>
    </motion.div>
  )
}
