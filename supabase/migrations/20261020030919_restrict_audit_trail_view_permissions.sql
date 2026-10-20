-- The audit-trail view contains employee names, email addresses, and change history.
-- Keep it available only to authenticated users, and make it read-only for clients.
REVOKE ALL PRIVILEGES ON TABLE public.audit_trail_view FROM anon;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
ON TABLE public.audit_trail_view FROM authenticated;

GRANT SELECT ON TABLE public.audit_trail_view TO authenticated;
