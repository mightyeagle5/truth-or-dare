import React from 'react'
import { Item, Level, ItemKind } from '../../../types'
import { PendingChange } from '../hooks/usePendingChanges'
import { formatDate } from '../utils/adminUtils'
import styles from '../../AdminPage.module.css'

interface FilterSidebarProps {
  levelFilter: Level
  kindFilter: ItemKind
  hideDeleted: boolean
  setLevelFilter: (level: Level) => void
  setKindFilter: (kind: ItemKind) => void
  setHideDeleted: (hide: boolean) => void
  filteredItems: Item[]
  selectedItem: Item | null
  handleItemSelect: (item: Item) => void
  handleAddNew: () => void
  pendingChanges: PendingChange[]
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  levelFilter,
  kindFilter,
  hideDeleted,
  setLevelFilter,
  setKindFilter,
  setHideDeleted,
  filteredItems,
  selectedItem,
  handleItemSelect,
  handleAddNew,
  pendingChanges
}) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.filters}>
        <h3>Filters</h3>
        
        <div className={styles.filterGroup}>
          <label>Level:</label>
          <select 
            value={levelFilter} 
            onChange={(e) => setLevelFilter(e.target.value as Level)}
          >
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
            onChange={(e) => setKindFilter(e.target.value as ItemKind)}
          >
            <option value="truth">Truth</option>
            <option value="dare">Dare</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>
            <input 
              type="checkbox" 
              checked={hideDeleted}
              onChange={(e) => setHideDeleted(e.target.checked)}
            />
            Do not show deleted
          </label>
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
              const isDeleted = pendingChange?.type === 'delete' || item.is_deleted
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
                  {item.is_deleted && item.deleted_at ? `Deleted: ${formatDate(item.deleted_at)}` : `Updated: ${formatDate(item.updated_at)}`}
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
  )
}
