import { useState } from 'react'
import { Item } from '../../../types'
import { SupabaseChallengeService } from '../../../lib/supabaseService'

export interface PendingChange {
  type: 'add' | 'update' | 'delete'
  item: Item
  originalItem?: Item // For updates, store the original
  changes?: string[] // List of what fields were changed
}

export const usePendingChanges = () => {
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const addPendingChange = (change: PendingChange) => {
    setPendingChanges(prev => {
      const existingIndex = prev.findIndex(p => p.item.id === change.item.id)
      if (existingIndex >= 0) {
        // Replace existing change and move to top
        const newChanges = [...prev]
        newChanges[existingIndex] = change
        // Move to top
        const [movedChange] = newChanges.splice(existingIndex, 1)
        return [movedChange, ...newChanges]
      } else {
        // Add new change to top
        return [change, ...prev]
      }
    })
  }

  const undoChange = (index: number) => {
    setPendingChanges(prev => prev.filter((_, i) => i !== index))
  }

  const undoAllChanges = () => {
    setPendingChanges([])
  }

  const handleSaveChanges = () => {
    setShowSaveDialog(true)
  }

  const cancelSaveChanges = () => {
    setShowSaveDialog(false)
  }

  const confirmSaveChanges = async (itemCacheRef: React.MutableRefObject<Record<string, Item[]>>, loadingCacheRef: React.MutableRefObject<Record<string, boolean>>, levelFilter: string, kindFilter: string, setFilteredItems: (items: Item[]) => void) => {
    try {
      setIsSaving(true)
      console.log('Saving changes to Supabase:', pendingChanges)
      
      let successCount = 0
      let errorCount = 0
      
      // Process each change
      for (const change of pendingChanges) {
        try {
          switch (change.type) {
            case 'add':
              await SupabaseChallengeService.createChallenge({
                level: change.item.level,
                kind: change.item.kind,
                text: change.item.text,
                gender_for: change.item.gender_for,
                gender_target: change.item.gender_target,
                tags: change.item.tags
              })
              console.log(`✅ Created challenge: ${change.item.text.substring(0, 50)}...`)
              break
            case 'update':
              await SupabaseChallengeService.updateChallenge(change.item.id, {
                level: change.item.level,
                kind: change.item.kind,
                text: change.item.text,
                gender_for: change.item.gender_for,
                gender_target: change.item.gender_target,
                tags: change.item.tags
              })
              console.log(`✅ Updated challenge: ${change.item.text.substring(0, 50)}...`)
              break
            case 'delete':
              await SupabaseChallengeService.deleteChallenge(change.item.id)
              console.log(`✅ Deleted challenge: ${change.item.text.substring(0, 50)}...`)
              break
          }
          successCount++
        } catch (changeError) {
          console.error(`❌ Failed to ${change.type} challenge:`, changeError)
          errorCount++
        }
      }
      
      // Invalidate cache for affected level/kind combinations
      const affectedCombinations = new Set<string>()
      for (const change of pendingChanges) {
        // Add current level/kind combination
        affectedCombinations.add(`${change.item.level}-${change.item.kind}`)
        
        // If it's an update that changed level or kind, also invalidate the original
        if (change.type === 'update' && change.originalItem) {
          if (change.item.level !== change.originalItem.level || change.item.kind !== change.originalItem.kind) {
            affectedCombinations.add(`${change.originalItem.level}-${change.originalItem.kind}`)
          }
        }
      }
      
      // Clear cache for affected combinations
      affectedCombinations.forEach(combo => {
        delete itemCacheRef.current[combo]
        delete loadingCacheRef.current[combo]
      })
      
      // Reload current filter if it was affected
      const currentCombo = `${levelFilter}-${kindFilter}`
      if (affectedCombinations.has(currentCombo)) {
        const items = await SupabaseChallengeService.getChallengesByLevelAndKind(levelFilter as any, kindFilter as any)
        itemCacheRef.current[currentCombo] = items
        setFilteredItems(items)
      }
      
      if (errorCount === 0) {
        alert(`✅ All changes saved successfully! (${successCount} operations)`)
      } else {
        alert(`⚠️ ${successCount} changes saved, ${errorCount} failed. Check console for details.`)
      }
      
      setPendingChanges([])
      setShowSaveDialog(false)
    } catch (error) {
      console.error('Failed to save changes:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    pendingChanges,
    setPendingChanges,
    showSaveDialog,
    isSaving,
    addPendingChange,
    undoChange,
    undoAllChanges,
    handleSaveChanges,
    cancelSaveChanges,
    confirmSaveChanges
  }
}
