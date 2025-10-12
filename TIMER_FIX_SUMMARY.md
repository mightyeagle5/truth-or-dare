# Timer Fix Summary

## Issue
The timer feature doesn't show up even when challenges have `duration` set and `is_time_based = true`.

## Root Cause
The database schema is missing the `is_time_based` and `duration` columns. While the TypeScript code and admin UI are already set up to handle these fields, the actual database table doesn't have these columns.

### How the Timer Works
1. In `ItemScreen.tsx` (lines 119-142), the timer is displayed when:
   - `currentItem.is_time_based` is `true`
   - `currentItem.duration` exists
   - `currentItem.duration > 0`

2. The `SupabaseChallengeService.convertDbRowToItem()` method tries to read these fields from the database:
   ```typescript
   is_time_based: row.is_time_based || false,
   duration: row.duration || 0
   ```

3. Since the columns don't exist in the database, they come back as `undefined`, which means:
   - `is_time_based` defaults to `false`
   - `duration` defaults to `0`

4. The timer component's condition is never met, so it never displays.

## Solution
Add the missing columns to the `challenges` table in Supabase.

### Files Changed
1. **`migrations/add_timer_fields.sql`** (NEW) - Migration to add the columns to existing databases
2. **`supabase-schema.sql`** (UPDATED) - Updated base schema for fresh database setups

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `migrations/add_timer_fields.sql`
4. Paste and run the SQL migration
5. Verify the columns were added by checking the table structure

### Option 2: Using Supabase CLI
If you have the Supabase CLI set up:
```bash
# Make sure you're connected to your project
supabase link

# Apply the migration
psql $DATABASE_URL < migrations/add_timer_fields.sql
```

## Verification
After applying the migration:

1. Go to the Admin Panel in your app
2. Edit any challenge and add a duration (e.g., 60 seconds)
3. Start a game and select that challenge
4. The timer should now appear on the item screen

## Admin UI
The admin UI already supports editing timer fields:
- There's a "Duration (seconds)" field in the item editor
- When a duration > 0 is entered, it automatically marks the challenge as time-based
- The UI shows a confirmation message: "✓ This will be marked as a time-based challenge (Xs)"

## Code References
- **Timer Component**: `src/components/ui/Timer.tsx`
- **Timer Display Logic**: `src/components/game/ItemScreen.tsx` (lines 118-142)
- **Data Conversion**: `src/lib/supabaseService.ts` (lines 13-28, 42-44)
- **Admin Form Logic**: `src/routes/admin/hooks/useAdminForm.ts` (lines 68-81)
- **Type Definitions**: `src/types/index.ts` (lines 93-94)

