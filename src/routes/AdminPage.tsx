import React, { useState, useEffect } from 'react'
import { useGameStore } from '../store'
import { Item, Level, ItemKind, Gender } from '../types'
import { createId } from '../lib/ids'
import { SupabaseChallengeService } from '../lib/supabaseService'
import styles from './AdminPage.module.css'

interface PendingChange {
  type: 'add' | 'update' | 'delete'
  item: Item
  originalItem?: Item // For updates, store the original
  changes?: string[] // List of what fields were changed
}

interface ChangeDetection {
  hasChanges: boolean
  changes: string[]
}

const AdminPage: React.FC = () => {
  const { items, loadItems } = useGameStore()
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [currentChanges, setCurrentChanges] = useState<ChangeDetection>({ hasChanges: false, changes: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showChangedItems, setShowChangedItems] = useState(false)
  
  // Filter states
  const [levelFilter, setLevelFilter] = useState<Level | 'all'>('all')
  const [kindFilter, setKindFilter] = useState<ItemKind | 'all'>('all')
  
  // Form states for editing/adding
  const [formData, setFormData] = useState({
    level: 'soft' as Exclude<Level, 'Progressive' | 'Custom'>,
    kind: 'truth' as ItemKind,
    text: '',
    gender_for: '',
    gender_target: '',
    tags: ''
  })

  // Load items from Supabase on mount
  useEffect(() => {
    const loadItemsFromSupabase = async () => {
      try {
        setIsLoading(true)
        await loadItems()
      } catch (error) {
        console.error('Failed to load items:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadItemsFromSupabase()
  }, [loadItems])

  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  // Filter items based on current filters
  useEffect(() => {
    let filtered = items
    
    if (levelFilter !== 'all') {
      filtered = filtered.filter(item => item.level === levelFilter)
    }
    
    if (kindFilter !== 'all') {
      filtered = filtered.filter(item => item.kind === kindFilter)
    }
    
    // Sort by updated_at descending (newest first)
    filtered.sort((a, b) => {
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0
      return dateB - dateA
    })
    
    setFilteredItems(filtered)
  }, [items, levelFilter, kindFilter])

  // Initialize form data when editing
  useEffect(() => {
    if (selectedItem && !isAddingNew) {
      setEditingItem(selectedItem)
      const newFormData = {
        level: selectedItem.level,
        kind: selectedItem.kind,
        text: selectedItem.text,
        gender_for: selectedItem.gender_for.join(', '),
        gender_target: selectedItem.gender_target.join(', '),
        tags: selectedItem.tags.join(', ')
      }
      setFormData(newFormData)
      // Reset change detection when selecting a new item
      setCurrentChanges({ hasChanges: false, changes: [] })
    }
  }, [selectedItem, isAddingNew])

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item)
    setIsAddingNew(false)
    
    // Check if this item has pending changes
    const pendingChange = pendingChanges.find(p => p.item.id === item.id)
    if (pendingChange) {
      // If it's a delete, don't allow selection
      if (pendingChange.type === 'delete') {
        return
      }
      // If it's an update, load the pending changes
      if (pendingChange.type === 'update') {
        setFormData({
          level: pendingChange.item.level,
          kind: pendingChange.item.kind,
          text: pendingChange.item.text,
          gender_for: pendingChange.item.gender_for.join(', '),
          gender_target: pendingChange.item.gender_target.join(', '),
          tags: pendingChange.item.tags.join(', ')
        })
        setEditingItem(pendingChange.item)
        setCurrentChanges({ hasChanges: false, changes: [] })
      }
    }
  }

  const handleAddNew = () => {
    setSelectedItem(null)
    setEditingItem(null)
    setIsAddingNew(true)
    setFormData({
      level: 'soft' as Exclude<Level, 'Progressive' | 'Custom'>,
      kind: 'truth',
      text: '',
      gender_for: '',
      gender_target: '',
      tags: ''
    })
  }

  const handleDelete = () => {
    if (selectedItem) {
      const change: PendingChange = {
        type: 'delete',
        item: selectedItem
      }
      setPendingChanges(prev => [change, ...prev])
      setSelectedItem(null)
      setEditingItem(null)
    }
  }

  const handleUpdate = () => {
    if (editingItem) {
      const updatedItem: Item = {
        ...editingItem,
        level: formData.level,
        kind: formData.kind,
        text: formData.text,
        gender_for: formData.gender_for.split(',').map(g => g.trim() as Gender).filter(g => g.length > 0),
        gender_target: formData.gender_target.split(',').map(g => g.trim() as Gender).filter(g => g.length > 0),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      }
      
      const change: PendingChange = {
        type: 'update',
        item: updatedItem,
        originalItem: editingItem,
        changes: currentChanges.changes
      }
      
      // Check if this item already has pending changes
      setPendingChanges(prev => {
        const existingIndex = prev.findIndex(p => p.item.id === editingItem.id)
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
      
      // Reset current changes after adding to pending
      setCurrentChanges({ hasChanges: false, changes: [] })
    }
  }

  const handleSave = () => {
    if (isAddingNew) {
      const newItem: Item = {
        id: createId(),
        level: formData.level,
        kind: formData.kind,
        text: formData.text,
        gender_for: formData.gender_for.split(',').map(g => g.trim() as Gender).filter(g => g.length > 0),
        gender_target: formData.gender_target.split(',').map(g => g.trim() as Gender).filter(g => g.length > 0),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      }
      
      const change: PendingChange = {
        type: 'add',
        item: newItem
      }
      setPendingChanges(prev => [change, ...prev])
      setIsAddingNew(false)
      setSelectedItem(null)
      setEditingItem(null)
    }
  }

  // Function to detect changes in the current form
  const detectChanges = (originalItem: Item, currentFormData: typeof formData): ChangeDetection => {
    const changes: string[] = []
    
    if (originalItem.level !== currentFormData.level) changes.push('Level')
    if (originalItem.kind !== currentFormData.kind) changes.push('Kind')
    if (originalItem.text !== currentFormData.text) changes.push('Text')
    
    const currentGenderFor = currentFormData.gender_for.split(',').map(g => g.trim()).filter(g => g.length > 0)
    const currentGenderTarget = currentFormData.gender_target.split(',').map(g => g.trim()).filter(g => g.length > 0)
    const currentTags = currentFormData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    
    if (JSON.stringify(originalItem.gender_for.sort()) !== JSON.stringify(currentGenderFor.sort())) {
      changes.push('Gender For')
    }
    if (JSON.stringify(originalItem.gender_target.sort()) !== JSON.stringify(currentGenderTarget.sort())) {
      changes.push('Gender Target')
    }
    if (JSON.stringify(originalItem.tags.sort()) !== JSON.stringify(currentTags.sort())) {
      changes.push('Tags')
    }
    
    return {
      hasChanges: changes.length > 0,
      changes
    }
  }

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

  const loadItemsFromSupabase = async () => {
    try {
      await loadItems()
    } catch (error) {
      console.error('Failed to reload items:', error)
    }
  }

  const handleSaveChanges = () => {
    setShowSaveDialog(true)
  }

  const confirmSaveChanges = async () => {
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
      
      // Reload items from Supabase
      await loadItemsFromSupabase()
      
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

  const cancelSaveChanges = () => {
    setShowSaveDialog(false)
  }

  const undoAllChanges = () => {
    setPendingChanges([])
    setCurrentChanges({ hasChanges: false, changes: [] })
  }

  const undoChange = (index: number) => {
    // Remove the change from pending changes (this undoes the change)
    setPendingChanges(prev => prev.filter((_, i) => i !== index))
  }




  if (isLoading) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1>Admin - Edit Challenges</h1>
              <p className={styles.devNotice}>Development Mode Only</p>
            </div>
          </div>
        </div>
        <div className={styles.loading}>
          <p>Loading challenges from database...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>Admin - Edit Challenges</h1>
            <p className={styles.devNotice}>Development Mode Only</p>
          </div>
          <div className={styles.headerActions}>
          </div>
          {pendingChanges.length > 0 && (
            <div className={styles.pendingChanges}>
              <div className={styles.pendingChangesHeader}>
                <span className={styles.pendingCount}>{pendingChanges.length} pending changes</span>
                <div className={styles.pendingActions}>
                  <button 
                    className={styles.viewChangesBtn}
                    onClick={() => setShowChangedItems(!showChangedItems)}
                  >
                    {showChangedItems ? 'Hide Changes' : 'View Changes'}
                  </button>
                  <button 
                    className={styles.undoAllBtn}
                    onClick={undoAllChanges}
                  >
                    Undo All
                  </button>
                  <button 
                    className={styles.saveChangesBtn}
                    onClick={handleSaveChanges}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.filters}>
            <h3>Filters</h3>
            
            <div className={styles.filterGroup}>
              <label>Level:</label>
              <select 
                value={levelFilter} 
                onChange={(e) => setLevelFilter(e.target.value as Level | 'all')}
              >
                <option value="all">All Levels</option>
                <option value="soft">Soft</option>
                <option value="mild">Mild</option>
                <option value="hot">Hot</option>
                <option value="spicy">Spicy</option>
                <option value="kinky">Kinky</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Kind:</label>
              <select 
                value={kindFilter} 
                onChange={(e) => setKindFilter(e.target.value as ItemKind | 'all')}
              >
                <option value="all">All Kinds</option>
                <option value="truth">Truth</option>
                <option value="dare">Dare</option>
              </select>
            </div>
          </div>

          <div className={styles.itemList}>
            <div className={styles.itemListHeader}>
              <h3>Challenges ({filteredItems.length})</h3>
              <button className={styles.addNewBtn} onClick={handleAddNew}>
                Add New
              </button>
            </div>
            <div className={styles.listContainer}>
              {filteredItems.map(item => {
                const pendingChange = pendingChanges.find(p => p.item.id === item.id)
                const isDeleted = pendingChange?.type === 'delete'
                const hasPendingChanges = pendingChange && pendingChange.type !== 'delete'
                
                return (
                  <div 
                    key={item.id}
                    className={`${styles.listItem} ${selectedItem?.id === item.id ? styles.selected : ''} ${isDeleted ? styles.deleted : ''} ${hasPendingChanges ? styles.pending : ''}`}
                    onClick={() => handleItemSelect(item)}
                  >
                    <div className={styles.itemHeader}>
                      <div className={styles.itemHeaderLeft}>
                        <span className={styles.itemLevel}>{item.level}</span>
                        <span className={styles.itemKind}>{item.kind}</span>
                      </div>
                      <div className={styles.itemHeaderRight}>
                        {isDeleted && <span className={styles.deletedBadge}>deleted</span>}
                        {hasPendingChanges && <span className={styles.pendingBadge}>pending</span>}
                      </div>
                    </div>
                    <div className={styles.itemText}>
                      {item.text.length > 100 ? `${item.text.substring(0, 100)}...` : item.text}
                    </div>
                    <div className={styles.itemTimestamp}>
                      Updated: {formatDate(item.updated_at)}
                    </div>
                    {hasPendingChanges && (
                      <div className={styles.pendingInfo}>
                        Changes not saved: {pendingChange.changes?.join(', ')}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          {showChangedItems && pendingChanges.length > 0 ? (
            <div className={styles.changedItemsView}>
              <div className={styles.changedItemsHeader}>
                <h2>Changed Items ({pendingChanges.length})</h2>
                <button 
                  className={styles.closeChangedItemsBtn}
                  onClick={() => setShowChangedItems(false)}
                >
                  Close
                </button>
              </div>
              <div className={styles.changedItemsList}>
                {pendingChanges.map((change, index) => (
                  <div key={index} className={styles.changedItem}>
                    <div className={styles.changedItemHeader}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemLevel}>{change.item.level}</span>
                        <span className={styles.itemKind}>{change.item.kind}</span>
                        <span className={`${styles.changeTypeBadge} ${styles[change.type]}`}>
                          {change.type.toUpperCase()}
                        </span>
                      </div>
                      <div className={styles.changedItemActions}>
                        <button 
                          className={styles.undoBtn}
                          onClick={() => undoChange(index)}
                        >
                          Undo
                        </button>
                      </div>
                    </div>
                    <div className={styles.itemText}>
                      {change.item.text.length > 100 ? `${change.item.text.substring(0, 100)}...` : change.item.text}
                    </div>
                    {change.changes && change.changes.length > 0 && (
                      <div className={styles.changedFields}>
                        Changed: {change.changes.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : selectedItem || isAddingNew ? (
            <div className={styles.editor}>
              <div className={styles.editorHeader}>
                <div className={styles.editorHeaderTop}>
                  <h2>{isAddingNew ? 'Add New Challenge' : 'Edit Challenge'}</h2>
                  <div className={styles.actionButtons}>
                    {!isAddingNew && (
                      <>
                        <button 
                          className={styles.deleteBtn}
                          onClick={handleDelete}
                        >
                          Delete
                        </button>
                        <button 
                          className={styles.updateBtn}
                          onClick={handleUpdate}
                          disabled={!currentChanges.hasChanges}
                        >
                          Update
                        </button>
                        <button 
                          className={styles.addAsNewBtn}
                          onClick={handleAddNew}
                        >
                          Add as New
                        </button>
                      </>
                    )}
                    {isAddingNew && (
                      <button 
                        className={styles.saveBtn}
                        onClick={handleSave}
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>
                {selectedItem && pendingChanges.find(p => p.item.id === selectedItem.id && p.type === 'update') && (
                  <div className={styles.pendingNotification}>
                    <span className={styles.pendingIcon}>⚠️</span>
                    <span>This item has unsaved changes. You are viewing the modified version.</span>
                  </div>
                )}
              </div>

              <div className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Level:</label>
                    <select 
                      value={formData.level}
                      onChange={(e) => handleFormChange('level', e.target.value)}
                    >
                      <option value="soft">Soft</option>
                      <option value="mild">Mild</option>
                      <option value="hot">Hot</option>
                      <option value="spicy">Spicy</option>
                      <option value="kinky">Kinky</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Kind:</label>
                    <select 
                      value={formData.kind}
                      onChange={(e) => handleFormChange('kind', e.target.value)}
                    >
                      <option value="truth">Truth</option>
                      <option value="dare">Dare</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Text:</label>
                  <textarea 
                    value={formData.text}
                    onChange={(e) => handleFormChange('text', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Gender For (comma separated):</label>
                    <input 
                      type="text"
                      value={formData.gender_for}
                      onChange={(e) => handleFormChange('gender_for', e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Gender Target (comma separated):</label>
                    <input 
                      type="text"
                      value={formData.gender_target}
                      onChange={(e) => handleFormChange('gender_target', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Tags (comma separated):</label>
                  <input 
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleFormChange('tags', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.placeholder}>
              <h2>Select a Challenge</h2>
              <p>Choose a challenge from the list to edit, or click "Add as New" to create a new one.</p>
            </div>
          )}
        </div>
      </div>


      {/* Save Confirmation Dialog */}
      {showSaveDialog && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <h3>Confirm Save Changes</h3>
            <p>Are you sure you want to save {pendingChanges.length} changes?</p>
            <div className={styles.dialogActions}>
              <button 
                className={styles.cancelBtn}
                onClick={cancelSaveChanges}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmBtn}
                onClick={confirmSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage
