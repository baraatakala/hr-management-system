-- Make company_id, department_id, and job_id nullable in employees table
-- This allows employees to be created without these fields if needed

ALTER TABLE employees 
ALTER COLUMN company_id DROP NOT NULL;

ALTER TABLE employees 
ALTER COLUMN department_id DROP NOT NULL;

ALTER TABLE employees 
ALTER COLUMN job_id DROP NOT NULL;

-- Update any existing data that might have issues (optional)
-- This ensures the migration can run even if there's existing data
