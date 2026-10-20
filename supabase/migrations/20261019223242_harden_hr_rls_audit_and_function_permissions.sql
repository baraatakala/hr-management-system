-- Do not allow anonymous browser clients to read or modify HR data.
-- Keep existing CRUD behavior for ordinary signed-in users, while making audit
-- history read-only from the browser so clients cannot forge or erase audit rows.
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nationalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.activity_log;
CREATE POLICY "Authenticated non-anonymous users can read activity log"
ON public.activity_log FOR SELECT TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.companies;
CREATE POLICY "Allow non-anonymous authenticated CRUD" ON public.companies
FOR ALL TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
)
WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.departments;
CREATE POLICY "Allow non-anonymous authenticated CRUD" ON public.departments
FOR ALL TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
)
WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.employees;
CREATE POLICY "Allow non-anonymous authenticated CRUD" ON public.employees
FOR ALL TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
)
WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.jobs;
CREATE POLICY "Allow non-anonymous authenticated CRUD" ON public.jobs
FOR ALL TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
)
WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.nationalities;
CREATE POLICY "Allow non-anonymous authenticated CRUD" ON public.nationalities
FOR ALL TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
)
WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.reminders;
CREATE POLICY "Allow non-anonymous authenticated CRUD" ON public.reminders
FOR ALL TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
)
WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
);

REVOKE ALL PRIVILEGES ON TABLE
  public.activity_log, public.companies, public.departments, public.employees,
  public.jobs, public.nationalities, public.reminders
FROM anon;

REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE
  public.companies, public.departments, public.employees, public.jobs,
  public.nationalities, public.reminders
FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.companies, public.departments, public.employees, public.jobs,
  public.nationalities, public.reminders
TO authenticated;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
ON TABLE public.activity_log FROM authenticated;
GRANT SELECT ON TABLE public.activity_log TO authenticated;

-- Prefer invoker rights for this lookup; don't bypass employee-table RLS.
DO $$
BEGIN
  IF to_regprocedure('public.check_employee_exists(text)') IS NOT NULL THEN
    ALTER FUNCTION public.check_employee_exists(text) SECURITY INVOKER;
  END IF;
END
$$;

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'employee-avatars'
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
CREATE POLICY "Authenticated users can update avatars" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'employee-avatars'
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
)
WITH CHECK (
  bucket_id = 'employee-avatars'
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;
CREATE POLICY "Authenticated users can delete avatars" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'employee-avatars'
  AND COALESCE((SELECT (auth.jwt() ->> 'is_anonymous')), 'false') <> 'true'
);

-- Avatars remain publicly readable by design; upload/change/delete require sign-in.
DROP POLICY IF EXISTS "Authenticated users can view avatars" ON storage.objects;
