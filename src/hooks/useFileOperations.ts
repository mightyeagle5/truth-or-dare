import { useRef } from 'react'
import type { CustomChallenge } from '../types'

export const useFileOperations = (
  customChallenges: CustomChallenge[],
  onChallengesUpdate: (challenges: CustomChallenge[]) => void
) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadChallenges = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const uploadedChallenges = JSON.parse(content)
        
        // Validate the format
        if (!Array.isArray(uploadedChallenges)) {
          throw new Error('Invalid file format: expected an array of challenges')
        }
        
        const validChallenges = uploadedChallenges.filter(challenge => 
          challenge.id && 
          challenge.text && 
          challenge.kind && 
          challenge.level
        )
        
        if (validChallenges.length === 0) {
          throw new Error('No valid challenges found in file')
        }
        
        // Convert to CustomChallenge format
        const newChallenges: CustomChallenge[] = validChallenges.map(challenge => ({
          id: challenge.id,
          text: challenge.text,
          kind: challenge.kind,
          level: challenge.level,
          source: 'custom' as const
        }))
        
        // Add to existing challenges
        onChallengesUpdate([...newChallenges, ...customChallenges])
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
      } catch (error) {
        console.error('Error uploading challenges:', error)
        alert('Error uploading challenges. Please check the file format.')
      }
    }
    
    reader.readAsText(file)
  }

  const handleDownloadChallenges = () => {
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
