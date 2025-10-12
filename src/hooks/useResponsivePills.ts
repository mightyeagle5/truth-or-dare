import { useState, useEffect, useCallback } from 'react'

interface UseResponsivePillsProps {
  pillCount: number
  containerPadding?: number
  pillGap?: number
  minPillWidth?: number
  peekPercentage?: number
}

interface ResponsivePillsResult {
  pillWidth: number
  containerWidth: number
  shouldShowPeek: boolean
  totalPillsVisible: number
}

export const useResponsivePills = ({
  pillCount,
  containerPadding = 32, // 16px on each side
  pillGap = 16,
  minPillWidth = 80,
  peekPercentage = 0.1
}: UseResponsivePillsProps): ResponsivePillsResult => {
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  const calculatePillWidth = useCallback(() => {
    const availableWidth = screenWidth - containerPadding
    const totalGapWidth = (pillCount - 1) * pillGap
    const contentWidth = availableWidth - totalGapWidth
    
    // Calculate width if all pills fit
    const fullWidthPill = contentWidth / pillCount
    
    if (fullWidthPill >= minPillWidth) {
      // All pills fit comfortably
      return {
        pillWidth: fullWidthPill,
        containerWidth: availableWidth,
        shouldShowPeek: false,
        totalPillsVisible: pillCount
      }
    }
    
    // Need to show peek - calculate how many pills fit + peek
    const peekWidth = minPillWidth * peekPercentage
    const visiblePills = Math.floor((contentWidth - peekWidth) / minPillWidth)
    const adjustedPillWidth = (contentWidth - peekWidth) / visiblePills
    
    return {
      pillWidth: Math.max(adjustedPillWidth, minPillWidth),
      containerWidth: availableWidth,
      shouldShowPeek: true,
      totalPillsVisible: visiblePills + 1 // +1 for the peeked pill
    }
  }, [screenWidth, pillCount, containerPadding, pillGap, minPillWidth, peekPercentage])

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return calculatePillWidth()
}
