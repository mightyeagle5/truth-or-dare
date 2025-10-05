import React, { useState, useEffect, useCallback } from 'react'
import styles from './Timer.module.css'
import dingSound from '../../sounds/ding.mp3'

interface TimerProps {
  duration: number // Duration in seconds
  onTimeUp?: () => void // Callback when timer reaches 0
  autoStart?: boolean // Whether to start automatically
}

export const Timer: React.FC<TimerProps> = ({ 
  duration, 
  onTimeUp, 
  autoStart = false 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isPaused, setIsPaused] = useState(false)

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            // Play sound when timer hits 0
            const audio = new Audio(dingSound)
            audio.play().catch(console.error)
            onTimeUp?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning, isPaused, timeLeft, onTimeUp])

  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration)
    setIsRunning(autoStart)
    setIsPaused(false)
  }, [duration, autoStart])

  const handleStart = () => {
    setIsRunning(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleReset = () => {
    setTimeLeft(duration)
    setIsRunning(false)
    setIsPaused(false)
  }

  const isFinished = timeLeft === 0
  const isLowTime = timeLeft <= 10 && timeLeft > 0

  return (
    <div className={`${styles.timer} ${isLowTime ? styles.lowTime : ''} ${isFinished ? styles.finished : ''}`}>
      <div className={styles.timerDisplay}>
        <span className={styles.timeText}>{formatTime(timeLeft)}</span>
      </div>
      
      <div className={styles.timerControls}>
        {!isRunning && !isFinished && (
          <button 
            className={styles.timerButton}
            onClick={handleStart}
            type="button"
          >
            Start
          </button>
        )}
        
        {isRunning && !isPaused && !isFinished && (
          <button 
            className={styles.timerButton}
            onClick={handlePause}
            type="button"
          >
            Pause
          </button>
        )}
        
        {isRunning && isPaused && !isFinished && (
          <button 
            className={styles.timerButton}
            onClick={handleResume}
            type="button"
          >
            Resume
          </button>
        )}
        
        <button 
          className={styles.timerButton}
          onClick={handleReset}
          type="button"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
