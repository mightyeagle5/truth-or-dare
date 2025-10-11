import { useState, useEffect } from 'react'
import { Item, Level, ItemKind, Gender } from '../../../types'
import { detectChanges, FormData, ChangeDetection } from '../utils/changeDetection'

export const useAdminForm = (selectedItem: Item | null, isAddingNew: boolean) => {
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [currentChanges, setCurrentChanges] = useState<ChangeDetection>({ hasChanges: false, changes: [] })
  
  // Form states for editing/adding
  const [formData, setFormData] = useState<FormData>({
    level: 'soft' as Exclude<Level, 'Progressive' | 'Custom'>,
    kind: 'truth' as ItemKind,
    text: '',
    gender_for: '',
    gender_target: '',
    tags: '',
    duration: ''
  })

  // Initialize form data when editing
  useEffect(() => {
    if (selectedItem && !isAddingNew) {
      setEditingItem(selectedItem)
      const newFormData: FormData = {
        level: selectedItem.level,
        kind: selectedItem.kind,
        text: selectedItem.text,
        gender_for: selectedItem.gender_for.join(', '),
        gender_target: selectedItem.gender_target.join(', '),
        tags: selectedItem.tags.join(', '),
        duration: selectedItem.duration ? selectedItem.duration.toString() : ''
      }
      setFormData(newFormData)
      // Reset change detection when selecting a new item
      setCurrentChanges({ hasChanges: false, changes: [] })
    }
  }, [selectedItem, isAddingNew])

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Detect changes when editing an existing item
    if (editingItem && !isAddingNew) {
      const newFormData = { ...formData, [field]: value }
      const changeDetection = detectChanges(editingItem, newFormData)
      setCurrentChanges(changeDetection)
    }
  }

  const resetForm = () => {
    setFormData({
      level: 'soft' as Exclude<Level, 'Progressive' | 'Custom'>,
      kind: 'truth',
      text: '',
      gender_for: '',
      gender_target: '',
      tags: '',
      duration: ''
    })
    setEditingItem(null)
    setCurrentChanges({ hasChanges: false, changes: [] })
  }

  const createItemFromFormData = (): Item => {
    const duration = formData.duration.trim() === '' ? 0 : parseInt(formData.duration, 10)
    const isTimeBased = duration > 0
    
    return {
      id: editingItem?.id || '',
      level: formData.level,
      kind: formData.kind,
      text: formData.text,
      gender_for: formData.gender_for.split(',').map(g => g.trim() as Gender).filter(g => g.length > 0),
      gender_target: formData.gender_target.split(',').map(g => g.trim() as Gender).filter(g => g.length > 0),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      is_time_based: isTimeBased,
      duration: duration
    }
  }

  return {
    formData,
    setFormData,
    editingItem,
    setEditingItem,
    currentChanges,
    setCurrentChanges,
    handleFormChange,
    resetForm,
    createItemFromFormData
  }
}
