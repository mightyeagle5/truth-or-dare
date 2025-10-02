import React from 'react'
import { PendingChange } from '../hooks/usePendingChanges'
import styles from '../../AdminPage.module.css'

interface ChangedItemsViewProps {
  pendingChanges: PendingChange[]
  undoChange: (index: number) => void
  setShowChangedItems: (show: boolean) => void
}

export const ChangedItemsView: React.FC<ChangedItemsViewProps> = ({
  pendingChanges,
  undoChange,
  setShowChangedItems
}) => {
  return (
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
  )
}
