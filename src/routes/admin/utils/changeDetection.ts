import { Item, Level, ItemKind } from '../../../types'

export interface ChangeDetection {
  hasChanges: boolean
  changes: string[]
}

export interface FormData {
  level: Exclude<Level, 'Progressive' | 'Custom'>
  kind: ItemKind
  text: string
  gender_for: string
  gender_target: string
  tags: string
}

/**
 * Detect changes between original item and current form data
 */
export const detectChanges = (originalItem: Item, currentFormData: FormData): ChangeDetection => {
  const changes: string[] = []
  
  if (originalItem.level !== currentFormData.level) changes.push('Level')
  if (originalItem.kind !== currentFormData.kind) changes.push('Kind')
  if (originalItem.text !== currentFormData.text) changes.push('Text')
  
  const currentGenderFor = currentFormData.gender_for.split(',').map(g => g.trim()).filter(g => g.length > 0)
  const currentGenderTarget = currentFormData.gender_target.split(',').map(g => g.trim()).filter(g => g.length > 0)
  const currentTags = currentFormData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
  
  if (JSON.stringify(originalItem.gender_for.sort()) !== JSON.stringify(currentGenderFor.sort())) {
    changes.push('Gender For')
  }
  if (JSON.stringify(originalItem.gender_target.sort()) !== JSON.stringify(currentGenderTarget.sort())) {
    changes.push('Gender Target')
  }
  if (JSON.stringify(originalItem.tags.sort()) !== JSON.stringify(currentTags.sort())) {
    changes.push('Tags')
  }
  
  return {
    hasChanges: changes.length > 0,
    changes
  }
}
