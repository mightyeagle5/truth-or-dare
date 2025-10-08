import type { PreferenceCategory, PlayerPreferences } from '../types'

export interface PreferenceCategoryInfo {
  key: PreferenceCategory
  label: string
  tagMapping?: string[] // Tags associated with this category (to be filled later)
}

export const PREFERENCE_CATEGORIES: PreferenceCategoryInfo[] = [
  { key: 'role_playing', label: 'Role playing', tagMapping: [] },
  { key: 'temperature', label: 'Temperature', tagMapping: [] },
  { key: 'food', label: 'Food', tagMapping: [] },
  { key: 'naughty_accessories', label: 'Naughty accessories', tagMapping: [] },
  { key: 'photos_videos_audio', label: 'Photos/Videos/Audio', tagMapping: [] },
  { key: 'adult_videos', label: 'Adult videos', tagMapping: [] },
  { key: 'oral', label: 'Oral', tagMapping: [] },
  { key: 'domination', label: 'Domination', tagMapping: [] },
  { key: 'submission', label: 'Submission', tagMapping: [] },
  { key: 'butt_stuff', label: 'Butt stuff', tagMapping: [] },
  { key: 'bondage', label: 'Bondage', tagMapping: [] },
  { key: 'other_people', label: 'Other people', tagMapping: [] },
  { key: 'past_relationships', label: 'Past relationships', tagMapping: [] },
  { key: 'alcohol', label: 'Alcohol', tagMapping: [] },
  { key: 'public', label: 'Public', tagMapping: [] },
  { key: 'facial', label: 'Facial', tagMapping: [] }
]

// Get default preferences (all enabled by default)
export const getDefaultPreferences = (): PlayerPreferences => {
  const preferences: PlayerPreferences = {}
  PREFERENCE_CATEGORIES.forEach(category => {
    preferences[category.key] = true
  })
  return preferences
}

// Get excluded tags based on player preferences
export const getExcludedTagsFromPreferences = (preferences?: PlayerPreferences): string[] => {
  if (!preferences) return []
  
  const excludedTags: string[] = []
  
  PREFERENCE_CATEGORIES.forEach(category => {
    // If preference is false (disabled), add its tags to excluded list
    if (preferences[category.key] === false && category.tagMapping) {
      excludedTags.push(...category.tagMapping)
    }
  })
  
  return excludedTags
}
