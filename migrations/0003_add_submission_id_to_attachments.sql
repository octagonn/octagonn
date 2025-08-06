ALTER TABLE public.ticket_attachments
ADD COLUMN submission_id UUID REFERENCES public.contact_submissions(id) ON DELETE SET NULL;
