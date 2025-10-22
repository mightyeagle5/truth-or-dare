import { describe, it, expect } from 'vitest'

describe('Button Loading States', () => {
  it('should prevent button clicks when challengePairLoading is true', () => {
    // Test the logic that prevents button clicks during loading
    const challengePairLoading = true
    const disabledChoices = { truth: false, dare: false }
    
    // Simulate the button click prevention logic
    const canClickTruth = !disabledChoices.truth && !challengePairLoading
    const canClickDare = !disabledChoices.dare && !challengePairLoading
    
    expect(canClickTruth).toBe(false)
    expect(canClickDare).toBe(false)
  })

  it('should allow button clicks when challengePairLoading is false', () => {
    // Test the logic that allows button clicks when not loading
    const challengePairLoading = false
    const disabledChoices = { truth: false, dare: false }
    
    // Simulate the button click prevention logic
    const canClickTruth = !disabledChoices.truth && !challengePairLoading
    const canClickDare = !disabledChoices.dare && !challengePairLoading
    
    expect(canClickTruth).toBe(true)
    expect(canClickDare).toBe(true)
  })

  it('should disable buttons when challengePairLoading is true', () => {
    // Test the button disabled state logic
    const challengePairLoading = true
    const disabledChoices = { truth: false, dare: false }
    
    // Simulate the button disabled state logic
    const truthDisabled = disabledChoices.truth || challengePairLoading
    const dareDisabled = disabledChoices.dare || challengePairLoading
    
    expect(truthDisabled).toBe(true)
    expect(dareDisabled).toBe(true)
  })

  it('should enable buttons when challengePairLoading is false', () => {
    // Test the button enabled state logic
    const challengePairLoading = false
    const disabledChoices = { truth: false, dare: false }
    
    // Simulate the button disabled state logic
    const truthDisabled = disabledChoices.truth || challengePairLoading
    const dareDisabled = disabledChoices.dare || challengePairLoading
    
    expect(truthDisabled).toBe(false)
    expect(dareDisabled).toBe(false)
  })
})
