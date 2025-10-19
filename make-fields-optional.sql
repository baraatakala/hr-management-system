-- Run this SQL in your Supabase SQL Editor to make company, department, and job optional
-- This allows you to save employees without selecting these fields

ALTER TABLE employees 
ALTER COLUMN company_id DROP NOT NULL;

ALTER TABLE employees 
ALTER COLUMN department_id DROP NOT NULL;

ALTER TABLE employees 
ALTER COLUMN job_id DROP NOT NULL;

-- Verify the changes
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'employees' 
AND column_name IN ('company_id', 'department_id', 'job_id');
