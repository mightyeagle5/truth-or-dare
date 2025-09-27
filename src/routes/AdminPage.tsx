import React, { useState, useEffect } from 'react'
import { useGameStore } from '../store'
import { Item, Level, ItemKind, Gender } from '../types'
import { createId } from '../lib/ids'
import styles from './AdminPage.module.css'

interface PendingChange {
  type: 'add' | 'update' | 'delete'
  item: Item
  originalItem?: Item // For updates, store the original
}

const AdminPage: React.FC = () => {
  const { items } = useGameStore()
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  
  // Filter states
  const [levelFilter, setLevelFilter] = useState<Level | 'all'>('all')
  const [kindFilter, setKindFilter] = useState<ItemKind | 'all'>('all')
  
  // Form states for editing/adding
  const [formData, setFormData] = useState({
    level: 'soft' as Level,
    kind: 'truth' as ItemKind,
    text: '',
    gender_for: '',
    gender_target: '',
    tags: ''
  })

  // Filter items based on current filters
  useEffect(() => {
    let filtered = items
    
    if (levelFilter !== 'all') {
      filtered = filtered.filter(item => item.level === levelFilter)
    }
    
    if (kindFilter !== 'all') {
      filtered = filtered.filter(item => item.kind === kindFilter)
    }
    
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
      console.log('Initializing form data:', newFormData)
      setFormData(newFormData)
    }
  }, [selectedItem, isAddingNew])

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setSelectedItem(null)
    setEditingItem(null)
    setIsAddingNew(true)
    setFormData({
      level: 'soft',
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
      setPendingChanges(prev => [...prev, change])
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
        originalItem: editingItem
      }
      setPendingChanges(prev => [...prev, change])
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
      setPendingChanges(prev => [...prev, change])
      setIsAddingNew(false)
      setSelectedItem(null)
      setEditingItem(null)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveChanges = () => {
    setShowSaveDialog(true)
  }

  const confirmSaveChanges = () => {
    // TODO: Implement actual save functionality when database is added
    console.log('Saving changes:', pendingChanges)
    alert('Changes saved! (This will be implemented when database is added)')
    setPendingChanges([])
    setShowSaveDialog(false)
  }

  const cancelSaveChanges = () => {
    setShowSaveDialog(false)
  }

  const removePendingChange = (index: number) => {
    setPendingChanges(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>Admin - Edit Challenges</h1>
            <p className={styles.devNotice}>Development Mode Only</p>
          </div>
          {pendingChanges.length > 0 && (
            <div className={styles.pendingChanges}>
              <div className={styles.pendingChangesHeader}>
                <span className={styles.pendingCount}>{pendingChanges.length} pending changes</span>
                <button 
                  className={styles.saveChangesBtn}
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </button>
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
              {filteredItems.map(item => (
                <div 
                  key={item.id}
                  className={`${styles.listItem} ${selectedItem?.id === item.id ? styles.selected : ''}`}
                  onClick={() => handleItemSelect(item)}
                >
                  <div className={styles.itemHeader}>
                    <span className={styles.itemLevel}>{item.level}</span>
                    <span className={styles.itemKind}>{item.kind}</span>
                  </div>
                  <div className={styles.itemText}>
                    {item.text.length > 100 ? `${item.text.substring(0, 100)}...` : item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          {selectedItem || isAddingNew ? (
            <div className={styles.editor}>
              <div className={styles.editorHeader}>
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

      {/* Pending Changes List */}
      {pendingChanges.length > 0 && (
        <div className={styles.pendingChangesList}>
          <h3>Pending Changes</h3>
          <div className={styles.changesList}>
            {pendingChanges.map((change, index) => (
              <div key={index} className={styles.changeItem}>
                <div className={styles.changeType}>
                  <span className={`${styles.changeBadge} ${styles[change.type]}`}>
                    {change.type.toUpperCase()}
                  </span>
                  <span className={styles.changeText}>
                    {change.type === 'add' && `Add new challenge: "${change.item.text.substring(0, 50)}..."`}
                    {change.type === 'update' && `Update challenge: "${change.item.text.substring(0, 50)}..."`}
                    {change.type === 'delete' && `Delete challenge: "${change.item.text.substring(0, 50)}..."`}
                  </span>
                </div>
                <button 
                  className={styles.removeChangeBtn}
                  onClick={() => removePendingChange(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage
