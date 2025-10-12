# Timer Feature Diagnosis

## Current Situation
You mentioned:
- ✅ The `is_time_based` and `duration` columns already exist in the database
- ✅ The timer was working before deploying to GitHub Pages
- ❌ The timer is not showing up now (presumably on GitHub Pages)

## Most Likely Cause
**The database probably doesn't have any challenges with timer fields actually set.**

Even though the columns exist, if no challenges have:
- `is_time_based = true` 
- `duration > 0`

Then the timer will never show because the condition to display it won't be met.

## How to Diagnose

### Step 1: Check Your Local Environment
1. Open the app locally (run `npm run dev`)
2. Open the browser console (F12 or Cmd+Option+I)
3. Look for these logs:

```
🔍 Checking for timer-based challenges...
📊 Total challenges: X
⏱️  Timer-based challenges: Y
```

If `Y = 0`, that's your problem! No challenges have timers set.

### Step 2: Check on GitHub Pages
1. Visit your deployed site: https://mightyeagle5.github.io/truth-or-dare/
2. Open browser console
3. Look for the same logs

The counts should match. If they don't, there might be a caching issue.

### Step 3: When Playing a Game
When you select a challenge, you'll see logs like:

```
🔍 Timer challenge loaded: {
  id: "xxx",
  text: "...",
  is_time_based: true,
  duration: 60
}
```

And when the item screen renders:

```
🎮 ItemScreen - Current item: {
  id: "xxx",
  text: "...",
  is_time_based: true,
  duration: 60,
  shouldShowTimer: true
}
```

If `shouldShowTimer: false`, the timer won't appear.

## How to Fix

### Option 1: Add Timer to Existing Challenges (Recommended)
1. Go to Admin Panel: `/admin/edit-challenges`
2. Select a challenge you want to be timed
3. Scroll to the "Duration (seconds)" field
4. Enter a duration (e.g., `60` for 1 minute, `120` for 2 minutes)
5. Click "Update"
6. You should see: "✓ This will be marked as a time-based challenge (60s)"

The admin UI already handles setting `is_time_based = true` automatically when you set a duration > 0.

### Option 2: Bulk Update via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Table Editor → challenges
3. Find challenges you want to make time-based
4. Edit each row:
   - Set `is_time_based` to `true`
   - Set `duration` to the number of seconds (e.g., `60`)
5. Save changes

### Option 3: SQL Bulk Update
If you want to make all "dare" challenges in a certain level timed, you could run:

```sql
UPDATE challenges 
SET is_time_based = true, 
    duration = 60  -- 60 seconds
WHERE kind = 'dare' 
  AND level = 'spicy'
  AND is_deleted = false;
```

## Verify the Fix

1. After adding/updating challenges with timers
2. Start a new game
3. Play until you get one of the timed challenges
4. You should see the timer appear with play/pause buttons
5. The timer should show the format: `MM:SS` (e.g., `01:00` for 60 seconds)

## Code References

The timer display logic is in `src/components/game/ItemScreen.tsx` (lines 118-142):

```typescript
{currentItem.is_time_based && currentItem.duration && currentItem.duration > 0 && (
  <>
    <div className={styles.timer}>
      {formatTime(timeLeft)}
    </div>
    <div className={styles.timerControls}>
      {/* Play/Pause/Restart buttons */}
    </div>
  </>
)}
```

All three conditions must be true for the timer to show:
1. `currentItem.is_time_based === true`
2. `currentItem.duration` exists (not null/undefined)
3. `currentItem.duration > 0`

## Debug Tools Added

I've added several debugging tools to help diagnose this:

1. **`checkTimerChallenges()` utility** - Runs on app start, logs timer challenge count
2. **Load logging** - Logs whenever a timer challenge is loaded from database
3. **Display logging** - Logs in ItemScreen what the timer state is

These logs will help you identify exactly where the issue is.

## Next Steps

1. **Check the console logs** to see how many timer challenges exist
2. **If count is 0**: Add duration to some challenges via Admin Panel
3. **If count > 0 but timer not showing**: Check the ItemScreen logs to see what values it's receiving
4. **If it works locally but not on GitHub Pages**: Might be a caching issue - do a hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

Let me know what the logs show and we can narrow down the issue further!

