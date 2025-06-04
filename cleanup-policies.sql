-- Comprehensive Policy Cleanup Script
-- Run this FIRST, then run the complete-database-schema.sql
-- This ensures no policy conflicts when creating the new schema

-- Disable RLS temporarily to avoid conflicts
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS service_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ticket_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS appointment_cancellation_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contact_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_users DISABLE ROW LEVEL SECURITY;

-- Drop all policies on customers table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'customers') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON customers';
    END LOOP;
END $$;

-- Drop all policies on service_tickets table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'service_tickets') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON service_tickets';
    END LOOP;
END $$;

-- Drop all policies on ticket_messages table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'ticket_messages') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON ticket_messages';
    END LOOP;
END $$;

-- Drop all policies on appointments table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'appointments') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON appointments';
    END LOOP;
END $$;

-- Drop all policies on appointment_cancellation_requests table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'appointment_cancellation_requests') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON appointment_cancellation_requests';
    END LOOP;
END $$;

-- Drop all policies on contact_submissions table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'contact_submissions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON contact_submissions';
    END LOOP;
END $$;

-- Drop all policies on admin_users table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'admin_users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON admin_users';
    END LOOP;
END $$;

-- Show completion message
SELECT 'All policies have been dropped. You can now run complete-database-schema.sql safely.' AS status; 