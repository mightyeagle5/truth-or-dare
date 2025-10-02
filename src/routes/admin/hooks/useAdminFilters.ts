import { useState, useEffect, useRef } from 'react'
import { Item, Level, ItemKind } from '../../../types'
import { SupabaseChallengeService } from '../../../lib/supabaseService'

export const useAdminFilters = () => {
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState<Level>('soft')
  const [kindFilter, setKindFilter] = useState<ItemKind>('truth')
  
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
        
        // Fetch only the specific level and kind
        const items = await SupabaseChallengeService.getChallengesByLevelAndKind(levelFilter, kindFilter)
        
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

  return {
    filteredItems,
    isLoading,
    levelFilter,
    kindFilter,
    setLevelFilter,
    setKindFilter,
    itemCacheRef,
    loadingCacheRef
  }
}
