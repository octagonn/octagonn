-- Migration to add staff_id to ticket_messages table

ALTER TABLE public.ticket_messages
ADD COLUMN staff_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL;

-- Backfill existing staff messages with a staff_id if possible
-- This is a placeholder, you might need to adjust based on your data
-- For example, linking by staff_name if it's unique and reliable
DO $$
DECLARE
    staff_rec RECORD;
BEGIN
    FOR staff_rec IN SELECT id, full_name FROM admin_users
    LOOP
        UPDATE ticket_messages
        SET staff_id = staff_rec.id
        WHERE is_from_staff = true AND staff_name = staff_rec.full_name AND staff_id IS NULL;
    END LOOP;
END $$;
