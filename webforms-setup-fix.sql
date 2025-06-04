-- Quick fix for Web Forms setup - Run this if you get policy conflicts
-- This handles the case where policies already exist

-- First, drop all existing policies for web_form_submissions
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing policies on web_form_submissions table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'web_form_submissions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON web_form_submissions';
    END LOOP;
END $$;

-- Now create the policies fresh
CREATE POLICY "Allow anonymous inserts" ON web_form_submissions
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON web_form_submissions
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Admins can manage all web form submissions" ON web_form_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Ensure RLS is enabled
ALTER TABLE web_form_submissions ENABLE ROW LEVEL SECURITY; 