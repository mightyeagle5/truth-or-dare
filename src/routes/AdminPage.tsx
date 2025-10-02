import React, { useState, useCallback } from 'react'
import { Item } from '../types'
import { createId } from '../lib/ids'
import { useAdminFilters, useAdminForm, usePendingChanges } from './admin'
import { AdminHeader, FilterSidebar, ItemEditor, ChangedItemsView, SaveConfirmationDialog } from './admin/components'
import { PendingChange } from './admin/hooks/usePendingChanges'
import styles from './AdminPage.module.css'

const AdminPage: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [showChangedItems, setShowChangedItems] = useState(false)
  
  // Custom hooks
  const {
    filteredItems,
    isLoading,
    levelFilter,
    kindFilter,
    setLevelFilter,
    setKindFilter,
    itemCacheRef,
    loadingCacheRef
  } = useAdminFilters()

  const {
    formData,
    editingItem,
    currentChanges,
    handleFormChange,
    resetForm,
    createItemFromFormData
  } = useAdminForm(selectedItem, isAddingNew)

  const {
    pendingChanges,
    showSaveDialog,
    isSaving,
    addPendingChange,
    undoChange,
    undoAllChanges,
    handleSaveChanges,
    cancelSaveChanges,
    confirmSaveChanges
  } = usePendingChanges()

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
        // The form will be updated by the useAdminForm hook
      }
    }
  }

  const handleAddNew = () => {
    setSelectedItem(null)
    setIsAddingNew(true)
    resetForm()
  }

  const handleDelete = () => {
    if (selectedItem) {
      const change: PendingChange = {
        type: 'delete',
        item: selectedItem
      }
      addPendingChange(change)
      setSelectedItem(null)
    }
  }

  const handleUpdate = () => {
    if (editingItem) {
      const updatedItem = createItemFromFormData()
      
      const change: PendingChange = {
        type: 'update',
        item: updatedItem,
        originalItem: editingItem,
        changes: currentChanges.changes
      }
      
      addPendingChange(change)
    }
  }

  const handleSave = () => {
    if (isAddingNew) {
      const newItem = createItemFromFormData()
      newItem.id = createId()
      
      const change: PendingChange = {
        type: 'add',
        item: newItem
      }
      addPendingChange(change)
      setIsAddingNew(false)
      setSelectedItem(null)
    }
  }

  const handleAddAsNew = () => {
    // Create a new item from current form data
    const newItem = createItemFromFormData()
    newItem.id = createId()
    
    const change: PendingChange = {
      type: 'add',
      item: newItem
    }
    addPendingChange(change)
    
    // Reset form to start fresh
    resetForm()
    setSelectedItem(null)
    setIsAddingNew(false)
  }


  const handleConfirmSaveChanges = useCallback(async () => {
    await confirmSaveChanges(itemCacheRef, loadingCacheRef, levelFilter, kindFilter, () => {
      // This would be handled by the useAdminFilters hook
    })
  }, [confirmSaveChanges, itemCacheRef, loadingCacheRef, levelFilter, kindFilter])

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
      <AdminHeader
        pendingChanges={pendingChanges}
        showChangedItems={showChangedItems}
        setShowChangedItems={setShowChangedItems}
        undoAllChanges={undoAllChanges}
        handleSaveChanges={handleSaveChanges}
      />

      <div className={styles.content}>
        <FilterSidebar
          levelFilter={levelFilter}
          kindFilter={kindFilter}
          setLevelFilter={setLevelFilter}
          setKindFilter={setKindFilter}
          filteredItems={filteredItems}
          selectedItem={selectedItem}
          handleItemSelect={handleItemSelect}
          handleAddNew={handleAddNew}
          pendingChanges={pendingChanges}
        />

        <div className={styles.mainContent}>
          {showChangedItems && pendingChanges.length > 0 ? (
            <ChangedItemsView
              pendingChanges={pendingChanges}
              undoChange={undoChange}
              setShowChangedItems={setShowChangedItems}
            />
          ) : selectedItem || isAddingNew ? (
            <ItemEditor
              selectedItem={selectedItem}
              isAddingNew={isAddingNew}
              formData={formData}
              handleFormChange={handleFormChange}
              currentChanges={currentChanges}
              handleDelete={handleDelete}
              handleUpdate={handleUpdate}
              handleAddAsNew={handleAddAsNew}
              handleSave={handleSave}
              pendingChanges={pendingChanges}
            />
          ) : (
            <div className={styles.placeholder}>
              <h2>Select a Challenge</h2>
              <p>Choose a challenge from the list to edit, or click "Add as New" to create a new one.</p>
            </div>
          )}
        </div>
      </div>

      <SaveConfirmationDialog
        showSaveDialog={showSaveDialog}
        pendingChanges={pendingChanges}
        isSaving={isSaving}
        cancelSaveChanges={cancelSaveChanges}
        confirmSaveChanges={handleConfirmSaveChanges}
      />
    </div>
  )
}

export default AdminPage