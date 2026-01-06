# How to Fix the Profile Creation Error

## The Problem
You're getting a "new row violates row-level security policy" error because the app was trying to manually create profile records from the client side, which Supabase's security policies block.

## The Solution
Use a **database trigger** that automatically creates profiles when users sign up. This runs on the server side and bypasses RLS restrictions.

---

## Step 1: Run the SQL Script in Supabase

1. **Open your Supabase Dashboard** at https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `supabase_profile_trigger.sql` in your project root
6. **Copy the entire contents** of that file
7. **Paste it** into the SQL Editor
8. Click **Run** (or press Ctrl+Enter)

You should see a success message: "Success. No rows returned"

## Step 2: Test the Signup Flow

The code has already been updated. Now test it:

1. Run your app: `npm start`
2. Navigate to the signup screen
3. Enter a username, email, and password
4. Click "Sign Up"
5. You should see "Account created! Please sign in." with **no errors**

## Step 3: Verify the Profile Was Created

1. Go to your Supabase Dashboard
2. Click **Table Editor** in the left sidebar
3. Select the **profiles** table
4. You should see your new user's profile with:
   - Their user ID
   - The username you entered
   - Their email
   - Balance set to 0

---

## What Changed?

### Database (via SQL script)
- Created a trigger function that automatically inserts a profile when a user signs up
- Set up RLS policies so users can view and update their own profiles
- The trigger runs with elevated permissions, so it bypasses RLS

### App Code (signup.tsx)
- Removed manual profile insertion code
- Now passes username in the signup metadata
- The database trigger reads this metadata and creates the profile automatically

---

## Troubleshooting

**If you still get an error:**
1. Make sure you ran the SQL script successfully
2. Check that your `profiles` table has these columns: `id`, `username`, `email`, `balance`, `created_at`
3. Try signing up with a different email address (in case the previous attempt partially succeeded)

**If the username is missing:**
- The trigger will use the part before @ in the email as a fallback username
- Make sure you're entering a username in the signup form
