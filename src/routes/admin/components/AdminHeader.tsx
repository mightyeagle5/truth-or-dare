import React from 'react'
import { PendingChange } from '../hooks/usePendingChanges'
import styles from '../../AdminPage.module.css'

interface AdminHeaderProps {
  pendingChanges: PendingChange[]
  showChangedItems: boolean
  setShowChangedItems: (show: boolean) => void
  undoAllChanges: () => void
  handleSaveChanges: () => void
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  pendingChanges,
  showChangedItems,
  setShowChangedItems,
  undoAllChanges,
  handleSaveChanges
}) => {
  return (
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
  )
}
