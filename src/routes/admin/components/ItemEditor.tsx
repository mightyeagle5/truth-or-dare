import React from 'react'
import { Item } from '../../../types'
import { FormData, ChangeDetection } from '../utils/changeDetection'
import { PendingChange } from '../hooks/usePendingChanges'
import styles from '../../AdminPage.module.css'

interface ItemEditorProps {
  selectedItem: Item | null
  isAddingNew: boolean
  formData: FormData
  handleFormChange: (field: string, value: string) => void
  currentChanges: ChangeDetection
  handleDelete: () => void
  handleUpdate: () => void
  handleAddAsNew: () => void
  handleSave: () => void
  pendingChanges: PendingChange[]
}

export const ItemEditor: React.FC<ItemEditorProps> = ({
  selectedItem,
  isAddingNew,
  formData,
  handleFormChange,
  currentChanges,
  handleDelete,
  handleUpdate,
  handleAddAsNew,
  handleSave,
  pendingChanges
}) => {
  return (
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
                  onClick={handleAddAsNew}
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
  )
}
