import React from 'react'
import { PendingChange } from '../hooks/usePendingChanges'
import styles from '../../AdminPage.module.css'

interface SaveConfirmationDialogProps {
  showSaveDialog: boolean
  pendingChanges: PendingChange[]
  isSaving: boolean
  cancelSaveChanges: () => void
  confirmSaveChanges: () => void
}

export const SaveConfirmationDialog: React.FC<SaveConfirmationDialogProps> = ({
  showSaveDialog,
  pendingChanges,
  isSaving,
  cancelSaveChanges,
  confirmSaveChanges
}) => {
  if (!showSaveDialog) return null

  return (
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
  )
}
