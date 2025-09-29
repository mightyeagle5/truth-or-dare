# Supabase Setup for Truth or Dare Admin Panel

This guide will help you set up Supabase for the admin panel to enable database operations.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `truth-or-dare-admin`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
6. Click "Create new project"

## 2. Set Up the Database Schema

1. Go to your project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL to create the challenges table

## 3. Configure Environment Variables

1. In your project dashboard, go to Settings > API
2. Copy your Project URL and anon/public key
3. Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Import Existing Data (Optional)

If you want to import your existing `game_questions.json` data:

1. Use the admin panel's CSV download feature
2. Convert the CSV to SQL INSERT statements
3. Run the SQL in the Supabase SQL Editor

## 5. Test the Connection

1. Start your development server: `npm run dev`
2. Navigate to `/admin/edit-challenges`
3. The admin panel should now connect to Supabase
4. Try creating, updating, or deleting challenges

## 6. Database Operations

The admin panel now supports:

- **Create**: Add new challenges to the database
- **Read**: Load challenges from the database
- **Update**: Modify existing challenges
- **Delete**: Remove challenges from the database
- **Batch Operations**: Handle multiple changes at once

## 7. Security Considerations

- The current setup allows all operations (no authentication required)
- For production, consider implementing:
  - Row Level Security (RLS) policies
  - User authentication
  - Admin-only access controls

## 8. Troubleshooting

### Common Issues:

1. **Connection Error**: Check your environment variables
2. **Permission Denied**: Verify your RLS policies
3. **Schema Mismatch**: Ensure your database schema matches the TypeScript types

### Debug Steps:

1. Check browser console for errors
2. Verify Supabase project is active
3. Test database connection in Supabase dashboard
4. Check network tab for failed requests

## 9. Next Steps

- Set up authentication for admin access
- Implement data validation
- Add backup/restore functionality
- Set up monitoring and logging

