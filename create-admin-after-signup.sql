-- Convert Existing User to Admin
-- Run this AFTER the user has signed up normally through the website

-- First, let's see what users exist
SELECT 
    id as user_id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- Convert your user to admin (replace the email with your actual email)
SELECT public.create_admin_user(
    'octavio.albuquerque09@gmail.com',  -- Your email
    'Octavio Albuquerque',              -- Your full name  
    'admin'                             -- Role
);

-- Verify the admin user was created
SELECT 
    au.id as admin_id,
    au.user_id,
    au.email,
    au.full_name,
    au.role,
    au.created_at,
    u.email as auth_email,
    u.email_confirmed_at
FROM public.admin_users au
JOIN auth.users u ON au.user_id = u.id
ORDER BY au.created_at DESC; 