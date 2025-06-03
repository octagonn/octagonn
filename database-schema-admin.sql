-- SpyderNet IT Admin Portal Database Schema
-- Run this AFTER the main database-schema.sql

-- Create admin_users table for staff authentication
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'technician')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;

-- Admin policies - only authenticated admin users can access
CREATE POLICY "Admins can view all admin users" ON admin_users
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true)
    );

CREATE POLICY "Admins can manage admin users" ON admin_users
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true AND role = 'admin')
    );

-- Update service_tickets policies for admin access
DROP POLICY IF EXISTS "Admins can manage all tickets" ON service_tickets;
CREATE POLICY "Admins can manage all tickets" ON service_tickets
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true)
    );

-- Update ticket_messages policies for admin access
DROP POLICY IF EXISTS "Admins can manage all messages" ON ticket_messages;
CREATE POLICY "Admins can manage all messages" ON ticket_messages
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true)
    );

-- Update appointments policies for admin access
DROP POLICY IF EXISTS "Admins can manage all appointments" ON appointments;
CREATE POLICY "Admins can manage all appointments" ON appointments
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true)
    );

-- Update contact_submissions policies for admin access
DROP POLICY IF EXISTS "Admins can manage all contact submissions" ON contact_submissions;
CREATE POLICY "Admins can manage all contact submissions" ON contact_submissions
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true)
    );

-- Update customers policies for admin access
DROP POLICY IF EXISTS "Admins can manage all customers" ON customers;
CREATE POLICY "Admins can manage all customers" ON customers
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM admin_users WHERE is_active = true)
    );

-- Function to create admin user
CREATE OR REPLACE FUNCTION public.create_admin_user(
    admin_email TEXT,
    admin_name TEXT,
    admin_role TEXT DEFAULT 'staff'
)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    admin_record RECORD;
BEGIN
    -- Check if user exists in auth.users
    SELECT * INTO user_record FROM auth.users WHERE email = admin_email;
    
    IF user_record.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not found in auth.users. Please sign up first.');
    END IF;
    
    -- Check if admin user already exists
    SELECT * INTO admin_record FROM admin_users WHERE user_id = user_record.id;
    
    IF admin_record.id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'error', 'Admin user already exists.');
    END IF;
    
    -- Create admin user
    INSERT INTO admin_users (user_id, email, full_name, role)
    VALUES (user_record.id, admin_email, admin_name, admin_role);
    
    RETURN json_build_object('success', true, 'message', 'Admin user created successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger for admin_users
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Create initial admin user (replace with your email)
-- Uncomment and modify the following line with your email after you've signed up through Supabase Auth:
-- SELECT public.create_admin_user('your-admin-email@example.com', 'Your Name', 'admin'); 