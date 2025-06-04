-- Migration script to add ticket numbering to existing service_tickets table
-- Run this in your Supabase SQL Editor

-- Step 1: Add ticket_number column if it doesn't exist
DO $$ 
BEGIN
    -- Check if ticket_number column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_tickets' AND column_name = 'ticket_number') THEN
        -- Create a sequence for ticket numbers
        CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;
        
        -- Add the ticket_number column
        ALTER TABLE service_tickets ADD COLUMN ticket_number INTEGER UNIQUE;
        
        -- Populate existing records with sequential numbers based on creation order
        WITH numbered_tickets AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) as seq_num
            FROM service_tickets
            WHERE ticket_number IS NULL
        )
        UPDATE service_tickets 
        SET ticket_number = numbered_tickets.seq_num
        FROM numbered_tickets
        WHERE service_tickets.id = numbered_tickets.id;
        
        -- Set the sequence to the next available number
        PERFORM setval('ticket_number_seq', COALESCE((SELECT MAX(ticket_number) FROM service_tickets), 0) + 1, false);
        
        -- Set default for new records
        ALTER TABLE service_tickets ALTER COLUMN ticket_number SET DEFAULT nextval('ticket_number_seq');
        
        -- Make it NOT NULL
        ALTER TABLE service_tickets ALTER COLUMN ticket_number SET NOT NULL;
        
        RAISE NOTICE 'Successfully added ticket_number column and populated existing records';
    ELSE
        RAISE NOTICE 'ticket_number column already exists';
    END IF;
END $$;

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_service_tickets_ticket_number ON service_tickets(ticket_number);

-- Step 3: Create a function to ensure ticket numbers are always assigned
CREATE OR REPLACE FUNCTION ensure_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    -- If ticket_number is not set, assign the next value
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := nextval('ticket_number_seq');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to automatically assign ticket numbers
DROP TRIGGER IF EXISTS trigger_ensure_ticket_number ON service_tickets;
CREATE TRIGGER trigger_ensure_ticket_number
    BEFORE INSERT ON service_tickets
    FOR EACH ROW
    EXECUTE FUNCTION ensure_ticket_number();

-- Verification: Show current ticket numbers
SELECT ticket_number, title, created_at 
FROM service_tickets 
ORDER BY ticket_number 
LIMIT 10; 