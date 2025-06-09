-- Migration script to add missing customer fields
-- Run this in your Supabase SQL Editor to add the missing columns to existing customers table

-- Add new columns if they don't exist
DO $$ 
BEGIN
    -- Add first_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'first_name') THEN
        ALTER TABLE customers ADD COLUMN first_name TEXT;
    END IF;
    
    -- Add last_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'last_name') THEN
        ALTER TABLE customers ADD COLUMN last_name TEXT;
    END IF;
    
    -- Add city column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'city') THEN
        ALTER TABLE customers ADD COLUMN city TEXT;
    END IF;
    
    -- Add state column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'state') THEN
        ALTER TABLE customers ADD COLUMN state TEXT;
    END IF;
    
    -- Add zip column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'zip') THEN
        ALTER TABLE customers ADD COLUMN zip TEXT;
    END IF;
    
    -- Add country column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'country') THEN
        ALTER TABLE customers ADD COLUMN country TEXT DEFAULT 'US';
    END IF;
    
    -- Add company column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'company') THEN
        ALTER TABLE customers ADD COLUMN company TEXT;
    END IF;
    
    -- Add status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'status') THEN
        ALTER TABLE customers ADD COLUMN status TEXT DEFAULT 'active';
        -- Add constraint for status values
        ALTER TABLE customers ADD CONSTRAINT customers_status_check CHECK (status IN ('active', 'inactive', 'suspended'));
    END IF;
    
    -- Add notes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'notes') THEN
        ALTER TABLE customers ADD COLUMN notes TEXT;
    END IF;
    
    -- Add last_contact column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'last_contact') THEN
        ALTER TABLE customers ADD COLUMN last_contact TIMESTAMP WITH TIME ZONE;
    END IF;
    
END $$;

-- Update existing records to populate first_name and last_name from full_name where possible
UPDATE customers 
SET 
    first_name = CASE 
        WHEN full_name IS NOT NULL AND split_part(full_name, ' ', 1) != '' 
        THEN split_part(full_name, ' ', 1) 
        ELSE NULL 
    END,
    last_name = CASE 
        WHEN full_name IS NOT NULL AND split_part(full_name, ' ', 2) != '' 
        THEN substring(full_name from position(' ' in full_name) + 1)
        ELSE NULL 
    END
WHERE first_name IS NULL AND last_name IS NULL AND full_name IS NOT NULL;

-- Set default status for existing records
UPDATE customers SET status = 'active' WHERE status IS NULL;

-- Set default country for existing records
UPDATE customers SET country = 'US' WHERE country IS NULL; 