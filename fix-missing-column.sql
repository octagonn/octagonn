-- Fix for missing created_by_staff column in service_tickets table
-- Run this in your Supabase SQL Editor if you're still getting the column error

-- Check if the column exists and add it if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_tickets' AND column_name = 'created_by_staff'
    ) THEN
        ALTER TABLE service_tickets ADD COLUMN created_by_staff BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added created_by_staff column to service_tickets table';
    ELSE
        RAISE NOTICE 'created_by_staff column already exists in service_tickets table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'service_tickets' 
AND column_name = 'created_by_staff'; 