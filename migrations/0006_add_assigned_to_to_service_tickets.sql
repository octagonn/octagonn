ALTER TABLE service_tickets
ADD COLUMN assigned_to UUID REFERENCES admin_users(id) ON DELETE SET NULL;

COMMENT ON COLUMN service_tickets.assigned_to IS 'ID of the staff member assigned to this ticket.';
