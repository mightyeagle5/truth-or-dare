import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './Toast.module.css'

interface ToastProps {
  message: string | null
  onClose: () => void
  duration?: number
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [message, duration, onClose])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={styles.toast}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.content}>
            <span className={styles.message}>{message}</span>
            <button
              className={styles.closeButton}
              onClick={onClose}
              type="button"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

