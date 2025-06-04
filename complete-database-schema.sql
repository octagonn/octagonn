-- SpyderNet IT Complete Database Schema
-- Run this complete script in your Supabase SQL Editor
-- This replaces all other SQL files and includes everything needed for the system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CUSTOMER PORTAL TABLES
-- ============================================================================

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create service_tickets table (only staff can create)
CREATE TABLE IF NOT EXISTS service_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_by_staff BOOLEAN DEFAULT true,
    staff_notes TEXT, -- Internal notes only staff can see
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create ticket_messages table for customer-staff communication
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES service_tickets(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_from_staff BOOLEAN DEFAULT false,
    is_internal BOOLEAN DEFAULT false, -- Internal staff messages customers cannot see
    staff_name TEXT, -- Name of staff member who sent the message
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES service_tickets(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_by_staff BOOLEAN DEFAULT true, -- Track if appointment was created by staff
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create appointment_cancellation_requests table for customer cancellation requests
CREATE TABLE IF NOT EXISTS appointment_cancellation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    reason TEXT, -- Customer's reason for cancellation
    status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected')),
    staff_response TEXT, -- Staff response/notes when processing the request
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create contact_submissions table for regular contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    is_from_customer BOOLEAN DEFAULT false,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    processed BOOLEAN DEFAULT false,
    ticket_id UUID REFERENCES service_tickets(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- ADMIN PORTAL TABLES
-- ============================================================================

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

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON service_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON service_tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_customer_id ON ticket_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointment_cancellation_requests_customer_id ON appointment_cancellation_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointment_cancellation_requests_status ON appointment_cancellation_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- ============================================================================
-- ROW LEVEL SECURITY SETUP
-- ============================================================================

-- Enable Row Level Security on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_cancellation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own customer data" ON customers;
DROP POLICY IF EXISTS "Users can update own customer data" ON customers;
DROP POLICY IF EXISTS "Users can insert own customer data" ON customers;
DROP POLICY IF EXISTS "Admins can manage all customers" ON customers;

DROP POLICY IF EXISTS "Users can view own tickets" ON service_tickets;
DROP POLICY IF EXISTS "Admins can manage all tickets" ON service_tickets;

DROP POLICY IF EXISTS "Users can view own ticket messages" ON ticket_messages;
DROP POLICY IF EXISTS "Users can create messages on own tickets" ON ticket_messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON ticket_messages;

DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can manage all appointments" ON appointments;

DROP POLICY IF EXISTS "Users can view own appointment cancellation requests" ON appointment_cancellation_requests;
DROP POLICY IF EXISTS "Users can create appointment cancellation requests" ON appointment_cancellation_requests;
DROP POLICY IF EXISTS "Users can update own appointment cancellation requests" ON appointment_cancellation_requests;
DROP POLICY IF EXISTS "Admins can manage all appointment cancellation requests" ON appointment_cancellation_requests;

DROP POLICY IF EXISTS "Users can create contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Users can view own contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can manage all contact submissions" ON contact_submissions;

DROP POLICY IF EXISTS "Authenticated users can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Users can manage their own admin record" ON admin_users;

-- ============================================================================
-- CUSTOMER RLS POLICIES
-- ============================================================================

-- Customers table policies
CREATE POLICY "Users can view own customer data" ON customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own customer data" ON customers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customer data" ON customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service tickets policies (READ ONLY for customers)
CREATE POLICY "Users can view own tickets" ON service_tickets
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        )
    );

-- Ticket messages policies
CREATE POLICY "Users can view own ticket messages" ON ticket_messages
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        ) AND is_internal = false  -- Customers cannot see internal staff messages
    );

CREATE POLICY "Users can create messages on own tickets" ON ticket_messages
    FOR INSERT WITH CHECK (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        ) AND is_from_staff = false AND is_internal = false
    );

-- Appointments policies (READ ONLY for customers)
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        )
    );

-- Appointment cancellation requests policies
CREATE POLICY "Users can view own appointment cancellation requests" ON appointment_cancellation_requests
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create appointment cancellation requests" ON appointment_cancellation_requests
    FOR INSERT WITH CHECK (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own appointment cancellation requests" ON appointment_cancellation_requests
    FOR UPDATE USING (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        ) AND status = 'requested' -- Only allow updates to requested requests
    );

-- Contact submissions policies
CREATE POLICY "Users can create contact submissions" ON contact_submissions
    FOR INSERT WITH CHECK (true); -- Anyone can submit contact forms

CREATE POLICY "Users can view own contact submissions" ON contact_submissions
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        ) OR customer_id IS NULL
    );

-- ============================================================================
-- ADMIN RLS POLICIES
-- ============================================================================

-- Admin users policies (simple to avoid recursion)
CREATE POLICY "Authenticated users can read admin_users" ON admin_users
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own admin record" ON admin_users
    FOR ALL USING (auth.uid() = user_id);

-- Admin access to all customer data
CREATE POLICY "Admins can manage all customers" ON customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Admin access to all tickets
CREATE POLICY "Admins can manage all tickets" ON service_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Admin access to all messages
CREATE POLICY "Admins can manage all messages" ON ticket_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Admin access to all appointments
CREATE POLICY "Admins can manage all appointments" ON appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Admin access to all appointment cancellation requests
CREATE POLICY "Admins can manage all appointment cancellation requests" ON appointment_cancellation_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Admin access to all contact submissions
CREATE POLICY "Admins can manage all contact submissions" ON contact_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically create customer record when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.customers (user_id, email, full_name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email)
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to automatically create customer record
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Triggers to automatically update updated_at timestamps
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_tickets_updated_at ON service_tickets;
CREATE TRIGGER update_service_tickets_updated_at BEFORE UPDATE ON service_tickets
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointment_cancellation_requests_updated_at ON appointment_cancellation_requests;
CREATE TRIGGER update_appointment_cancellation_requests_updated_at BEFORE UPDATE ON appointment_cancellation_requests
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- Ensure created_by_staff column exists (add if missing)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_tickets' AND column_name = 'created_by_staff'
    ) THEN
        ALTER TABLE service_tickets ADD COLUMN created_by_staff BOOLEAN DEFAULT true;
    END IF;
END $$;

-- The database is now fully configured and ready to use!
-- 
-- Next steps:
-- 1. Create your first admin user by running:
--    SELECT public.create_admin_user('your-email@example.com', 'Your Name', 'admin');
-- 
-- 2. Test the system by creating user accounts through the website
-- 
-- 3. Access the admin dashboard with your admin credentials 

-- ============================================================================
-- WEB FORMS FEATURE - ADDITIONAL TABLES AND UPDATES
-- ============================================================================

-- Create web_form_submissions table for direct form submissions (replaces FormSubmit)
CREATE TABLE IF NOT EXISTS web_form_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_type VARCHAR(100) NOT NULL DEFAULT 'Contact Form',
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    subject VARCHAR(500),
    message TEXT,
    processed BOOLEAN DEFAULT FALSE,
    ticket_id UUID REFERENCES service_tickets(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add anonymous customer support columns to service_tickets table
DO $$ 
BEGIN
    -- Add anonymous_customer column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_tickets' AND column_name = 'anonymous_customer'
    ) THEN
        ALTER TABLE service_tickets ADD COLUMN anonymous_customer BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add anonymous_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_tickets' AND column_name = 'anonymous_name'
    ) THEN
        ALTER TABLE service_tickets ADD COLUMN anonymous_name VARCHAR(255);
    END IF;
    
    -- Add anonymous_email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_tickets' AND column_name = 'anonymous_email'
    ) THEN
        ALTER TABLE service_tickets ADD COLUMN anonymous_email VARCHAR(255);
    END IF;
END $$;

-- Create indexes for performance on web_form_submissions table
CREATE INDEX IF NOT EXISTS idx_web_form_submissions_processed ON web_form_submissions(processed);
CREATE INDEX IF NOT EXISTS idx_web_form_submissions_form_type ON web_form_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_web_form_submissions_email ON web_form_submissions(email);
CREATE INDEX IF NOT EXISTS idx_web_form_submissions_created_at ON web_form_submissions(created_at);

-- Create indexes for anonymous customer support
CREATE INDEX IF NOT EXISTS idx_service_tickets_anonymous_customer ON service_tickets(anonymous_customer);
CREATE INDEX IF NOT EXISTS idx_service_tickets_anonymous_email ON service_tickets(anonymous_email);

-- Enable Row Level Security on web_form_submissions table
ALTER TABLE web_form_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for web_form_submissions to avoid conflicts (using DO block for safety)
DO $$ 
BEGIN
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Allow anonymous inserts" ON web_form_submissions;
    DROP POLICY IF EXISTS "Allow authenticated reads" ON web_form_submissions;
    DROP POLICY IF EXISTS "Allow authenticated updates" ON web_form_submissions;
    DROP POLICY IF EXISTS "Allow authenticated deletes" ON web_form_submissions;
    DROP POLICY IF EXISTS "Admins can manage all web form submissions" ON web_form_submissions;
EXCEPTION
    WHEN undefined_object THEN
        NULL; -- Policy doesn't exist, continue
END $$;

-- RLS Policies for web_form_submissions table

-- Allow anonymous users to submit forms (website visitors)
CREATE POLICY "Allow anonymous inserts" ON web_form_submissions
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow authenticated users to read all submissions (admin dashboard)
CREATE POLICY "Allow authenticated reads" ON web_form_submissions
    FOR SELECT TO authenticated
    USING (true);

-- Allow admin users full access to web form submissions
CREATE POLICY "Admins can manage all web form submissions" ON web_form_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Trigger to automatically update updated_at timestamp for web_form_submissions
-- (Note: web_form_submissions doesn't have updated_at column, but we can add it for consistency)
DO $$ 
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'web_form_submissions' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE web_form_submissions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
    END IF;
END $$;

-- Create trigger for web_form_submissions updated_at
DROP TRIGGER IF EXISTS update_web_form_submissions_updated_at ON web_form_submissions;
CREATE TRIGGER update_web_form_submissions_updated_at BEFORE UPDATE ON web_form_submissions
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ============================================================================
-- WEB FORMS FEATURE SETUP COMPLETE
-- ============================================================================

-- Web Forms feature is now ready!
-- 
-- Features added:
-- 1. web_form_submissions table for direct form submissions
-- 2. Anonymous customer support in service_tickets table
-- 3. Proper RLS policies for security
-- 4. Performance indexes
-- 5. Updated triggers for timestamp management
--
-- Usage:
-- - Website forms can submit directly to web_form_submissions table
-- - Admin dashboard can view, filter, and convert web forms to tickets
-- - Tickets can be created for anonymous users (no customer account required)
-- - Full CRUD operations available for admin users
-- - Bulk operations and search functionality included 