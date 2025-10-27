-- Add added_date and is_active fields to employees table
-- This allows tracking when employee was added and if they are currently active

-- Add added_date column (for when employee joined the company)
ALTER TABLE employees 
ADD COLUMN added_date DATE;

-- Add is_active column (to mark active/inactive employees)
ALTER TABLE employees 
ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;

-- Update existing employees to have added_date as today if null
UPDATE employees 
SET added_date = CURRENT_DATE 
WHERE added_date IS NULL;

-- Update existing employees to be active by default
UPDATE employees 
SET is_active = true 
WHERE is_active IS NULL;

-- Create index for filtering by active status (performance optimization)
CREATE INDEX idx_employees_is_active ON employees(is_active);

-- Create index for added_date
CREATE INDEX idx_employees_added_date ON employees(added_date);

-- Add comments for documentation
COMMENT ON COLUMN employees.added_date IS 'Date when the employee was added/joined the company';
COMMENT ON COLUMN employees.is_active IS 'Whether the employee is currently active (true) or inactive (false). Inactive employees are not deleted but marked as no longer working';
