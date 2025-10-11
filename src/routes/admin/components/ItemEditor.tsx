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
  handleRestore: () => void
  handleUpdate: () => void
  handleAddAsNew: () => void
  handleSave: () => void
  handleCancel: () => void
  pendingChanges: PendingChange[]
}

export const ItemEditor: React.FC<ItemEditorProps> = ({
  selectedItem,
  isAddingNew,
  formData,
  handleFormChange,
  currentChanges,
  handleDelete,
  handleRestore,
  handleUpdate,
  handleAddAsNew,
  handleSave,
  handleCancel,
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
                {selectedItem?.is_deleted ? (
                  <button 
                    className={styles.restoreBtn}
                    onClick={handleRestore}
                  >
                    Restore
                  </button>
                ) : (
                  <button 
                    className={styles.deleteBtn}
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                )}
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
              <>
                <button 
                  className={styles.saveBtn}
                  onClick={handleSave}
                >
                  Save
                </button>
                <button 
                  className={styles.cancelBtn}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </>
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

        <div className={styles.formGroup}>
          <label>Duration (seconds):</label>
          <input 
            type="number"
            min="0"
            value={formData.duration}
            onChange={(e) => handleFormChange('duration', e.target.value)}
            placeholder="Leave empty for non-time-based challenges"
          />
          {formData.duration && parseInt(formData.duration) > 0 && (
            <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
              ✓ This will be marked as a time-based challenge ({formData.duration}s)
            </small>
          )}
        </div>
      </div>
    </div>
  )
}
