import React, { useState, useRef } from 'react'
import { SupabaseChallengeService } from '../../lib/supabaseService'
import { ReactionType } from '../../types'
import styles from './ChallengeRating.module.css'

interface ChallengeRatingProps {
  challengeId: string
  isCustomGame?: boolean
  onRatingSubmitted?: (reaction: ReactionType) => void
}

export const ChallengeRating: React.FC<ChallengeRatingProps> = ({
  challengeId,
  isCustomGame = false,
  onRatingSubmitted
}) => {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const lastClickTime = useRef<number>(0)
  const DEBOUNCE_DELAY = 1000 // 1 second debounce

  // Don't show rating for custom games
  if (isCustomGame) {
    return null
  }

  const handleReaction = async (reaction: ReactionType) => {
    const now = Date.now()
    
    // Prevent spam clicking with debounce
    if (now - lastClickTime.current < DEBOUNCE_DELAY) {
      return
    }
    
    // Prevent multiple submissions
    if (hasRated || isSubmitting) {
      return
    }

    lastClickTime.current = now
    setIsSubmitting(true)
    
    try {
      await SupabaseChallengeService.submitReaction(challengeId, reaction)
      setUserReaction(reaction)
      setHasRated(true)
      onRatingSubmitted?.(reaction)
    } catch (error) {
      console.error('Failed to submit reaction:', error)
      // Reset state on error to allow retry
      setIsSubmitting(false)
    } finally {
      // Only set submitting to false if there was an error
      // If successful, keep buttons disabled
      if (hasRated) {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.ratingButtons}>
        <button
          className={`${styles.ratingButton} ${styles.thumbsUp} ${
            userReaction === 'up' ? styles.selected : ''
          }`}
          onClick={() => handleReaction('up')}
          disabled={hasRated || isSubmitting}
          type="button"
          title="Thumbs up"
          style={{ cursor: hasRated ? 'default' as const : undefined }}
        >
          👍
        </button>
        <button
          className={`${styles.ratingButton} ${styles.thumbsDown} ${
            userReaction === 'down' ? styles.selected : ''
          }`}
          onClick={() => handleReaction('down')}
          disabled={hasRated || isSubmitting}
          type="button"
          title="Thumbs down"
          style={{ cursor: hasRated ? 'default' as const : undefined }}
        >
          👎
        </button>
      </div>
      <div className={styles.messageArea}>
        <span className={styles.ratedMessage} aria-live="polite">
          {hasRated ? 'Thanks for rating!' : ''}
        </span>
      </div>
    </div>
  )
}
