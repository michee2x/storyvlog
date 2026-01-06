-- Quick Diagnostic Script for Profile Creation Issues
-- Run this in Supabase SQL Editor to check the status of your setup

-- 1. Check if the trigger function exists
SELECT 
  'Function exists: ' || routine_name as status
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
UNION ALL
-- 2. Check if the trigger exists
SELECT 
  'Trigger exists: ' || trigger_name as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
UNION ALL
-- 3. Count users in auth.users
SELECT 
  'Total auth users: ' || COUNT(*)::text as status
FROM auth.users
UNION ALL
-- 4. Count profiles
SELECT 
  'Total profiles: ' || COUNT(*)::text as status
FROM public.profiles;

-- 5. Show users without profiles (these need manual fixing)
SELECT 
  'Users without profiles:' as issue,
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- If you see users without profiles, run this to create them:
-- (Uncomment and replace the values)

/*
INSERT INTO public.profiles (id, username, email, balance, created_at)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
  u.email,
  0,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
*/
