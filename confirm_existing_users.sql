-- This script confirms all existing unconfirmed users
-- Run this in Supabase SQL Editor

-- Confirm ALL unconfirmed users (useful for development)
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Or confirm a specific user by email (replace with your email)
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW(),
--     confirmed_at = NOW()
-- WHERE email = 'your-email@example.com';

-- Check the results
SELECT 
  email, 
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC;
