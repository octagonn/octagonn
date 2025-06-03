-- Delete All Users Script
-- This will completely reset all user data in your Supabase database

-- First, disable RLS temporarily to avoid policy conflicts
ALTER TABLE IF EXISTS public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.service_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_submissions DISABLE ROW LEVEL SECURITY;

-- Delete from custom tables first (to avoid foreign key conflicts)
DELETE FROM public.contact_submissions;
DELETE FROM public.service_tickets;
DELETE FROM public.customers;
DELETE FROM public.admin_users;

-- Delete from Supabase auth tables
-- Note: You need to be very careful with auth schema operations
DELETE FROM auth.identities;
DELETE FROM auth.sessions;
DELETE FROM auth.users;

-- Re-enable RLS
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Reset sequences (check if they exist first)
DO $$
BEGIN
    -- Reset customers sequence if it exists
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename LIKE '%customers%id%') THEN
        EXECUTE 'SELECT setval(''' || 
                (SELECT schemaname||'.'||sequencename FROM pg_sequences WHERE schemaname = 'public' AND sequencename LIKE '%customers%id%' LIMIT 1) || 
                ''', 1, false)';
    END IF;
    
    -- Reset service_tickets sequence if it exists  
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename LIKE '%service_tickets%id%') THEN
        EXECUTE 'SELECT setval(''' || 
                (SELECT schemaname||'.'||sequencename FROM pg_sequences WHERE schemaname = 'public' AND sequencename LIKE '%service_tickets%id%' LIMIT 1) || 
                ''', 1, false)';
    END IF;
    
    -- Reset contact_submissions sequence if it exists
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename LIKE '%contact_submissions%id%') THEN
        EXECUTE 'SELECT setval(''' || 
                (SELECT schemaname||'.'||sequencename FROM pg_sequences WHERE schemaname = 'public' AND sequencename LIKE '%contact_submissions%id%' LIMIT 1) || 
                ''', 1, false)';
    END IF;
END $$;

-- Confirm deletion
SELECT 
    'auth.users' as table_name, 
    COUNT(*) as remaining_records 
FROM auth.users
UNION ALL
SELECT 
    'public.admin_users' as table_name, 
    COUNT(*) as remaining_records 
FROM public.admin_users
UNION ALL
SELECT 
    'public.customers' as table_name, 
    COUNT(*) as remaining_records 
FROM public.customers
UNION ALL
SELECT 
    'public.service_tickets' as table_name, 
    COUNT(*) as remaining_records 
FROM public.service_tickets
UNION ALL
SELECT 
    'public.contact_submissions' as table_name, 
    COUNT(*) as remaining_records 
FROM public.contact_submissions; 