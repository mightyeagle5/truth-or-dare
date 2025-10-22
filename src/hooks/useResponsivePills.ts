import { useState, useEffect, useCallback } from 'react'

interface UseResponsivePillsProps {
  pillCount: number
  containerPadding?: number
  pillGap?: number
  minPillWidth?: number
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
  minPillWidth = 80
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
    
    // Find how many pills can fit at minimum width
    // Formula: visiblePills * minPillWidth + (visiblePills - 1) * pillGap <= contentWidth
    let visiblePills = Math.floor((contentWidth + pillGap) / (minPillWidth + pillGap))
    if (visiblePills >= pillCount) {
      visiblePills = pillCount
    }
    
    // If we can fit all pills at minimum width, use that
    if (visiblePills === pillCount) {
      return {
        pillWidth: minPillWidth,
        containerWidth: availableWidth,
        shouldShowPeek: false,
        totalPillsVisible: pillCount
      }
    }
    
    // Calculate width so that the last visible pill is half-visible
    // We want to show (visiblePills - 0.5) pills worth of content
    const targetVisiblePills = visiblePills - 0.5
    const totalGapsForVisible = (visiblePills - 1) * pillGap
    const adjustedPillWidth = (contentWidth - totalGapsForVisible) / targetVisiblePills
    
    // Debug logging
    console.log('Responsive Pills Debug:', {
      screenWidth,
      availableWidth,
      contentWidth,
      visiblePills,
      targetVisiblePills,
      totalGapsForVisible,
      adjustedPillWidth,
      minPillWidth
    })
    
    return {
      pillWidth: adjustedPillWidth,
      containerWidth: availableWidth,
      shouldShowPeek: true,
      totalPillsVisible: visiblePills
    }
  }, [screenWidth, pillCount, containerPadding, pillGap, minPillWidth])

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return calculatePillWidth()
}