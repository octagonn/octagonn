-- Debug Admin Authentication
-- Run this to see what's happening with your admin user

-- 1. Check auth.users
SELECT 
    'AUTH USERS:' as section,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Check admin_users table
SELECT 
    'ADMIN USERS:' as section,
    id,
    user_id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM public.admin_users 
ORDER BY created_at DESC;

-- 3. Check if admin_users has RLS enabled
SELECT 
    'RLS STATUS:' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'admin_users';

-- 4. Check RLS policies on admin_users
SELECT 
    'ADMIN POLICIES:' as section,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'admin_users';

-- 5. Test the join that AdminAuth.verifyAdminStatus would do
-- This simulates what happens when you try to login
SELECT 
    'ADMIN VERIFICATION TEST:' as section,
    au.id as admin_id,
    au.user_id,
    au.email,
    au.full_name,
    au.role,
    au.is_active,
    u.email as auth_email
FROM public.admin_users au
JOIN auth.users u ON au.user_id = u.id
WHERE au.is_active = true
ORDER BY au.created_at DESC; 