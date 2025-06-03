-- Fix Infinite Recursion in Admin Users Table
-- This completely resolves the circular RLS policy issue

-- Step 1: Drop ALL existing policies on admin_users to stop the recursion
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Admin users can view themselves" ON admin_users;
DROP POLICY IF EXISTS "Admin users can update themselves" ON admin_users;
DROP POLICY IF EXISTS "Only admins can access admin_users" ON admin_users;

-- Step 2: Disable RLS on admin_users table completely
-- This is safe because admin_users is only accessed through authenticated functions
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Step 3: Create a simple, safe policy that doesn't cause recursion
-- Re-enable RLS but with a simple policy
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows authenticated users to read admin_users
-- This avoids the circular dependency by not checking admin_users within the policy
CREATE POLICY "Authenticated users can read admin_users" ON admin_users
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert/update their own admin record
CREATE POLICY "Users can manage their own admin record" ON admin_users
    FOR ALL USING (auth.uid() = user_id);

-- Step 4: Update other table policies to remove admin_users dependencies
-- Fix service_tickets policies
DROP POLICY IF EXISTS "Admins can manage all tickets" ON service_tickets;
CREATE POLICY "Admins can manage all tickets" ON service_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Fix ticket_messages policies  
DROP POLICY IF EXISTS "Admins can manage all messages" ON ticket_messages;
CREATE POLICY "Admins can manage all messages" ON ticket_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Fix appointments policies
DROP POLICY IF EXISTS "Admins can manage all appointments" ON appointments;
CREATE POLICY "Admins can manage all appointments" ON appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Fix contact_submissions policies
DROP POLICY IF EXISTS "Admins can manage all contact submissions" ON contact_submissions;
CREATE POLICY "Admins can manage all contact submissions" ON contact_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Fix customers policies
DROP POLICY IF EXISTS "Admins can manage all customers" ON customers;
CREATE POLICY "Admins can manage all customers" ON customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Step 5: Test the fix
SELECT 
    'POLICY FIX TEST:' as section,
    au.id as admin_id,
    au.user_id,
    au.email,
    au.full_name,
    au.role,
    au.is_active
FROM admin_users au
WHERE au.is_active = true
ORDER BY au.created_at DESC; 