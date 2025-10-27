-- ========================================
-- ADD EMPLOYEE STATUS FIELDS
-- Run this in Supabase SQL Editor
-- ========================================

-- 1. Add added_date column (for when employee joined the company)
ALTER TABLE employees 
ADD COLUMN added_date DATE;

-- 2. Add is_active column (to mark active/inactive employees)
ALTER TABLE employees 
ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;

-- 3. Update existing employees to have added_date as today
UPDATE employees 
SET added_date = CURRENT_DATE 
WHERE added_date IS NULL;

-- 4. Update existing employees to be active by default
UPDATE employees 
SET is_active = true 
WHERE is_active IS NULL;

-- 5. Create indexes for better performance
CREATE INDEX idx_employees_is_active ON employees(is_active);
CREATE INDEX idx_employees_added_date ON employees(added_date);

-- 6. Add comments for documentation
COMMENT ON COLUMN employees.added_date IS 'Date when the employee was added/joined the company';
COMMENT ON COLUMN employees.is_active IS 'Whether the employee is currently active (true) or inactive (false). Inactive employees are not deleted but marked as no longer working';

-- 7. Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'employees' 
AND column_name IN ('added_date', 'is_active');
