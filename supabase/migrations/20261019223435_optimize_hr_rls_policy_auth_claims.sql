-- Cache auth claim lookups per statement rather than re-running them per row.
-- This keeps the non-anonymous access checks but avoids RLS init-plan warnings.
DROP POLICY IF EXISTS "Authenticated non-anonymous users can read activity log" ON public.activity_log;
CREATE POLICY "Authenticated non-anonymous users can read activity log"
ON public.activity_log FOR SELECT TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Allow non-anonymous authenticated CRUD" ON public.companies;
CREATE POLICY "Allow non-anonymous authenticated CRUD" ON public.companies
FOR ALL TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
)
WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Allow non-anonymous authenticated CRUD" ON public.departments;
CREATE POLICY "Allow non-anonymous authenticated CRUD" ON public.departments
FOR ALL TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
)
WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Allow non-anonymous authenticated CRUD" ON public.employees;
CREATE POLICY "Allow non-anonymous authenticated CRUD" ON public.employees
FOR ALL TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
)
WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Allow non-anonymous authenticated CRUD" ON public.jobs;
CREATE POLICY "Allow non-anonymous authenticated CRUD" ON public.jobs
FOR ALL TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
)
WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Allow non-anonymous authenticated CRUD" ON public.nationalities;
CREATE POLICY "Allow non-anonymous authenticated CRUD" ON public.nationalities
FOR ALL TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
)
WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Allow non-anonymous authenticated CRUD" ON public.reminders;
CREATE POLICY "Allow non-anonymous authenticated CRUD" ON public.reminders
FOR ALL TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
)
WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'employee-avatars'
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
CREATE POLICY "Authenticated users can update avatars" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'employee-avatars'
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
)
WITH CHECK (
  bucket_id = 'employee-avatars'
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
);

DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;
CREATE POLICY "Authenticated users can delete avatars" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'employee-avatars'
  AND COALESCE(((SELECT auth.jwt()) ->> 'is_anonymous'), 'false') <> 'true'
);
