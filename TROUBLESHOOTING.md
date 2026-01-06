# Email Confirmation & Profile Creation Issues - Solutions

## Issue 1: "Email not confirmed" Error

### What's Happening
Supabase is configured to require email verification before users can log in. This is a security feature but can be disabled for development.

### Solution Options

#### Option A: Disable Email Confirmation (Recommended for Development)

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Providers** → **Email**
3. Scroll down to **"Confirm email"**
4. **Toggle it OFF** (disable)
5. Click **Save**

Now users can sign up and log in immediately without email verification.

#### Option B: Keep Email Confirmation Enabled

If you want to keep email confirmation:
- Users must check their email and click the confirmation link before logging in
- You'll need to configure email templates in Supabase
- For testing, you can manually confirm users in the dashboard:
  1. Go to **Authentication** → **Users**
  2. Find the user
  3. Click the three dots → **Confirm email**

---

## Issue 2: Profile Not Appearing in Database

### Possible Causes

1. **Trigger didn't fire** - The user might not have been created in `auth.users`
2. **Timing issue** - You checked too quickly before the trigger executed
3. **Error in trigger** - The trigger function encountered an error

### How to Check

#### Step 1: Check if User Exists in Auth
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Look for the email you signed up with
3. If the user is there, the signup worked

#### Step 2: Check Profiles Table
1. Go to **Table Editor** → **profiles**
2. Look for a row with the user's ID
3. If it's missing, the trigger didn't fire

#### Step 3: Check for Trigger Errors
1. Go to **Database** → **Functions**
2. Look for `handle_new_user`
3. If it's not there, the SQL script didn't run correctly

### Fix: Re-run the Trigger Manually

If the profile is missing but the user exists, you can create the profile manually:

1. Go to **SQL Editor**
2. Run this query (replace with your user's email):

\`\`\`sql
-- Get the user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Manually create the profile (use the ID from above)
INSERT INTO public.profiles (id, username, email, balance, created_at)
VALUES (
  'user-id-from-above',
  'desired-username',
  'your-email@example.com',
  0,
  NOW()
);
\`\`\`

---

## Testing the Full Flow

After disabling email confirmation:

1. **Delete the test user** (if it exists):
   - Dashboard → Authentication → Users → Find user → Delete

2. **Sign up again** with a new email

3. **Immediately check**:
   - Authentication → Users (should see the new user)
   - Table Editor → profiles (should see the profile)

4. **Try logging in** - should work without email confirmation

---

## If Problems Persist

### Check the Trigger Function

Run this in SQL Editor to verify the trigger exists:

\`\`\`sql
-- Check if function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Check if trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
\`\`\`

Both should return a row. If not, re-run `supabase_profile_trigger.sql`.

### Enable Trigger Logging

To debug the trigger, you can add logging:

\`\`\`sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'Creating profile for user: %', NEW.id;
  
  INSERT INTO public.profiles (id, username, email, balance, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    0,
    NOW()
  );
  
  RAISE NOTICE 'Profile created successfully';
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error creating profile: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
\`\`\`

Then check logs in Dashboard → Logs → Postgres Logs.
