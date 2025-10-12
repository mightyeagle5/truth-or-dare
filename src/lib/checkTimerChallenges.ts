import { SupabaseChallengeService } from './supabaseService'

/**
 * Debug utility to check for timer-based challenges in the database
 */
export const checkTimerChallenges = async () => {
  try {
    console.log('🔍 Checking for timer-based challenges...')
    
    const challenges = await SupabaseChallengeService.getAllChallenges()
    
    const timerChallenges = challenges.filter(c => c.is_time_based && c.duration && c.duration > 0)
    
    console.log(`📊 Total challenges: ${challenges.length}`)
    console.log(`⏱️  Timer-based challenges: ${timerChallenges.length}`)
    
    if (timerChallenges.length > 0) {
      console.log('✅ Found timer challenges:')
      timerChallenges.forEach(c => {
        console.log(`  - [${c.level}/${c.kind}] ${c.text.substring(0, 60)}... (${c.duration}s)`)
      })
    } else {
      console.warn('⚠️ No timer-based challenges found in database!')
      console.log('💡 To add timer challenges:')
      console.log('   1. Go to Admin Panel')
      console.log('   2. Edit a challenge')
      console.log('   3. Set a duration (e.g., 60 seconds)')
      console.log('   4. Click Update')
    }
    
    // Check if any challenges have duration but is_time_based is false
    const inconsistent = challenges.filter(c => !c.is_time_based && c.duration && c.duration > 0)
    if (inconsistent.length > 0) {
      console.warn('⚠️ Found challenges with duration but is_time_based=false:')
      inconsistent.forEach(c => {
        console.log(`  - [${c.level}/${c.kind}] ${c.text.substring(0, 60)}... (duration: ${c.duration})`)
      })
    }
    
    return {
      total: challenges.length,
      timerChallenges: timerChallenges.length,
      samples: timerChallenges.slice(0, 3)
    }
  } catch (error) {
    console.error('❌ Error checking timer challenges:', error)
    return null
  }
}

// Auto-run on import in development
if (import.meta.env.DEV) {
  console.log('🚀 Running timer challenge check...')
  checkTimerChallenges()
}

