import { useRef } from 'react'
import { createPlayerId } from '../lib/ids'
import type { CustomChallenge } from '../types'

export const useFileOperations = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadChallenges = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    onChallengesUpdate: (challenges: CustomChallenge[]) => void,
    onFilterChange: (filter: 'all' | 'custom' | 'game') => void,
    onScrollToTop: () => void
  ) => {
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
          level: item.level || 'Soft',
          isCustom: true
        })).filter(challenge => challenge.text.trim().length > 0)

        if (newChallenges.length === 0) {
          alert('No valid challenges found in the uploaded file.')
          return
        }

        // Add new challenges to the top of the list
        onChallengesUpdate(newChallenges)
        onFilterChange('all')
        onScrollToTop()
        
        alert(`Successfully uploaded ${newChallenges.length} challenges!`)
      } catch (error) {
        alert('Error reading file. Please make sure it\'s a valid JSON file.')
      }
    }
    reader.readAsText(file)
    
    // Reset the input
    event.target.value = ''
  }

  const handleDownloadChallenges = (customChallenges: CustomChallenge[]) => {
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

  return {
    fileInputRef,
    handleUploadChallenges,
    handleFileChange,
    handleDownloadChallenges
  }
}