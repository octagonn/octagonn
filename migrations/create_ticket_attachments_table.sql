-- Migration to create the ticket_attachments table

CREATE TABLE IF NOT EXISTS public.ticket_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.service_tickets(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.ticket_messages(id) ON DELETE CASCADE, -- Optional: link to a specific message
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- The path in Supabase Storage
    file_type TEXT,
    file_size BIGINT,
    uploaded_by_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    uploaded_by_staff_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON public.ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_message_id ON public.ticket_attachments(message_id);

-- Enable Row Level Security
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow customers to view attachments on their own tickets
CREATE POLICY "Customers can view attachments on their own tickets"
ON public.ticket_attachments
FOR SELECT
USING (
    uploaded_by_customer_id IN (
        SELECT id FROM customers WHERE user_id = auth.uid()
    )
);

-- Allow customers to insert attachments for their own tickets
CREATE POLICY "Customers can insert attachments for their own tickets"
ON public.ticket_attachments
FOR INSERT
WITH CHECK (
    uploaded_by_customer_id IN (
        SELECT id FROM customers WHERE user_id = auth.uid()
    )
);

-- Allow admins to manage all attachments
CREATE POLICY "Admins can manage all attachments"
ON public.ticket_attachments
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() AND is_active = true
    )
);
