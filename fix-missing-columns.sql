-- Comprehensive fix for missing columns in service_tickets and ticket_messages tables
-- Run this in your Supabase SQL Editor to ensure all required columns exist

-- Add missing columns to service_tickets table if they don't exist
DO $$ 
BEGIN
    RAISE NOTICE 'Checking service_tickets table...';
    
    -- Check and add created_by_staff column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_tickets' AND column_name = 'created_by_staff'
    ) THEN
        ALTER TABLE service_tickets ADD COLUMN created_by_staff BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added created_by_staff column to service_tickets table';
    ELSE
        RAISE NOTICE 'created_by_staff column already exists in service_tickets table';
    END IF;
    
    -- Check and add staff_notes column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_tickets' AND column_name = 'staff_notes'
    ) THEN
        ALTER TABLE service_tickets ADD COLUMN staff_notes TEXT;
        RAISE NOTICE 'Added staff_notes column to service_tickets table';
    ELSE
        RAISE NOTICE 'staff_notes column already exists in service_tickets table';
    END IF;
    
    -- Check and add completed_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'service_tickets' AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE service_tickets ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added completed_at column to service_tickets table';
    ELSE
        RAISE NOTICE 'completed_at column already exists in service_tickets table';
    END IF;
    
    -- Ensure priority column has correct check constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'CHECK' 
        AND tc.table_name = 'service_tickets' 
        AND tc.constraint_name LIKE '%priority%'
    ) THEN
        ALTER TABLE service_tickets ADD CONSTRAINT service_tickets_priority_check 
        CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
        RAISE NOTICE 'Added priority check constraint to service_tickets table';
    ELSE
        RAISE NOTICE 'Priority check constraint already exists';
    END IF;
    
    -- Ensure status column has correct check constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'CHECK' 
        AND tc.table_name = 'service_tickets' 
        AND tc.constraint_name LIKE '%status%'
    ) THEN
        ALTER TABLE service_tickets ADD CONSTRAINT service_tickets_status_check 
        CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled'));
        RAISE NOTICE 'Added status check constraint to service_tickets table';
    ELSE
        RAISE NOTICE 'Status check constraint already exists';
    END IF;
    
    RAISE NOTICE 'Checking ticket_messages table...';
    
    -- Check and add staff_name column to ticket_messages
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ticket_messages' AND column_name = 'staff_name'
    ) THEN
        ALTER TABLE ticket_messages ADD COLUMN staff_name TEXT;
        RAISE NOTICE 'Added staff_name column to ticket_messages table';
    ELSE
        RAISE NOTICE 'staff_name column already exists in ticket_messages table';
    END IF;
    
    -- Check and add is_from_staff column to ticket_messages
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ticket_messages' AND column_name = 'is_from_staff'
    ) THEN
        ALTER TABLE ticket_messages ADD COLUMN is_from_staff BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_from_staff column to ticket_messages table';
    ELSE
        RAISE NOTICE 'is_from_staff column already exists in ticket_messages table';
    END IF;
    
    -- Check and add is_internal column to ticket_messages
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ticket_messages' AND column_name = 'is_internal'
    ) THEN
        ALTER TABLE ticket_messages ADD COLUMN is_internal BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_internal column to ticket_messages table';
    ELSE
        RAISE NOTICE 'is_internal column already exists in ticket_messages table';
    END IF;
    
END $$;

-- Verify all columns are present in service_tickets
SELECT 'service_tickets Table - Column Check Results:' AS info;
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'service_tickets' 
ORDER BY ordinal_position;

-- Verify all columns are present in ticket_messages
SELECT 'ticket_messages Table - Column Check Results:' AS info;
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ticket_messages' 
ORDER BY ordinal_position;

-- Show success message
SELECT 'All required columns have been added to both tables. You can now create tickets and send messages!' AS status; 