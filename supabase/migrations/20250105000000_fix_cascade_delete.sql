-- Migration to fix CASCADE DELETE issue
-- This allows deleting reference data without deleting employee records

-- Step 1: Drop existing foreign key constraints with CASCADE DELETE
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_company_id_fkey;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_department_id_fkey;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_job_id_fkey;

-- Step 2: Remove NOT NULL constraints to allow NULL values
ALTER TABLE employees ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN department_id DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN job_id DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN nationality DROP NOT NULL;

-- Step 3: Re-add foreign key constraints with SET NULL instead of CASCADE DELETE
ALTER TABLE employees 
    ADD CONSTRAINT employees_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES companies(id) 
    ON DELETE SET NULL;

ALTER TABLE employees 
    ADD CONSTRAINT employees_department_id_fkey 
    FOREIGN KEY (department_id) 
    REFERENCES departments(id) 
    ON DELETE SET NULL;

ALTER TABLE employees 
    ADD CONSTRAINT employees_job_id_fkey 
    FOREIGN KEY (job_id) 
    REFERENCES jobs(id) 
    ON DELETE SET NULL;

-- Note: nationality is a string field, not a foreign key
-- We've removed NOT NULL constraint to allow clearing it when a nationality is deleted
