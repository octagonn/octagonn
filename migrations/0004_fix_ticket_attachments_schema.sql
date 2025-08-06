-- Make sure the ticket_attachments table has the columns needed by the application
ALTER TABLE public.ticket_attachments
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

ALTER TABLE public.ticket_attachments
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Remove the column that was added by mistake in the code but not the schema
-- This will not fail if the column doesn't exist, but is good practice for cleanup.
ALTER TABLE public.ticket_attachments
DROP COLUMN IF EXISTS uploaded_by_customer_id;
