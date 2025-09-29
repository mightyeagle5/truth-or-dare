import { SupabaseChallengeService } from './supabaseService'

// Test function to verify Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    
    // Test fetching challenges
    const challenges = await SupabaseChallengeService.getAllChallenges()
    console.log(`✅ Successfully connected! Found ${challenges.length} challenges`)
    console.log('Sample challenge:', challenges[0])
    
    return {
      success: true,
      challengeCount: challenges.length,
      sampleChallenge: challenges[0]
    }
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return {
      success: false,
      error: error
    }
  }
}

// Call this function to test the connection
// testSupabaseConnection()

