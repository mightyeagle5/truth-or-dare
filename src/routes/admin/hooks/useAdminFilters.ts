import { useState, useEffect, useRef } from 'react'
import { Item, Level, ItemKind } from '../../../types'
import { SupabaseChallengeService } from '../../../lib/supabaseService'

export const useAdminFilters = () => {
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState<Level>('soft')
  const [kindFilter, setKindFilter] = useState<ItemKind>('truth')
  const [hideDeleted, setHideDeleted] = useState(false)
  
  // Cache for fetched items by level/kind combination (using refs to avoid re-renders)
  const itemCacheRef = useRef<Record<string, Item[]>>({})
  const loadingCacheRef = useRef<Record<string, boolean>>({})

  // Load items for current filter combination
  useEffect(() => {
    let isMounted = true
    
    const loadItemsForFilter = async () => {
      const cacheKey = `${levelFilter}-${kindFilter}`
      
      // If already cached, use cached data
      if (itemCacheRef.current[cacheKey]) {
        if (isMounted) {
          setFilteredItems(itemCacheRef.current[cacheKey])
          setIsLoading(false)
        }
        return
      }
      
      // If already loading this combination, don't start another request
      if (loadingCacheRef.current[cacheKey]) {
        // Still need to ensure loading state is set to false if we have cached data
        if (itemCacheRef.current[cacheKey]) {
          if (isMounted) {
            setFilteredItems(itemCacheRef.current[cacheKey])
            setIsLoading(false)
          }
        }
        return
      }
      
      try {
        loadingCacheRef.current[cacheKey] = true
        
        // Fetch only the specific level and kind (includes deleted for admin)
        const items = await SupabaseChallengeService.getChallengesByLevelAndKindForAdmin(levelFilter, kindFilter)
        
        // Sort items by updated_at descending (newest first)
        const sortedItems = [...items].sort((a, b) => {
          const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0
          const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0
          return dateB - dateA
        })
        
        // Cache the results
        itemCacheRef.current[cacheKey] = sortedItems
        
        if (isMounted) {
          setFilteredItems(sortedItems)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to load items:', error)
        if (isMounted) {
          setIsLoading(false)
        }
      } finally {
        loadingCacheRef.current[cacheKey] = false
      }
    }
    
    loadItemsForFilter()
    
    return () => {
      isMounted = false
      // Reset loading state for this combination
      const currentCacheKey = `${levelFilter}-${kindFilter}`
      loadingCacheRef.current[currentCacheKey] = false
    }
  }, [levelFilter, kindFilter])

  // Apply hideDeleted filter to cached items
  useEffect(() => {
    const cacheKey = `${levelFilter}-${kindFilter}`
    const cachedItems = itemCacheRef.current[cacheKey]
    
    if (cachedItems) {
      const filtered = hideDeleted 
        ? cachedItems.filter(item => !item.is_deleted)
        : cachedItems
      setFilteredItems(filtered)
    }
  }, [hideDeleted, levelFilter, kindFilter])

  // Function to refresh the current filter
  const refreshCurrentFilter = async () => {
    const cacheKey = `${levelFilter}-${kindFilter}`
    try {
      const items = await SupabaseChallengeService.getChallengesByLevelAndKindForAdmin(levelFilter, kindFilter)
      
      // Sort items by updated_at descending (newest first)
      const sortedItems = [...items].sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0
        return dateB - dateA
      })
      
      // Cache the results
      itemCacheRef.current[cacheKey] = sortedItems
      
      // Apply hideDeleted filter
      const filtered = hideDeleted 
        ? sortedItems.filter(item => !item.is_deleted)
        : sortedItems
      setFilteredItems(filtered)
    } catch (error) {
      console.error('Failed to refresh filter:', error)
    }
  }

  return {
    filteredItems,
    isLoading,
    levelFilter,
    kindFilter,
    hideDeleted,
    setLevelFilter,
    setKindFilter,
    setHideDeleted,
    refreshCurrentFilter,
    itemCacheRef,
    loadingCacheRef
  }
}
