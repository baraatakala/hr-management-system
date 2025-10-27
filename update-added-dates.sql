-- Update all employees' added_date to 2025-10-16
-- This is for existing employees since we just added this feature

UPDATE employees 
SET added_date = '2025-10-16'
WHERE added_date IS NULL OR added_date = CURRENT_DATE;

-- Verify the changes
SELECT id, employee_no, name_en, added_date, is_active 
FROM employees 
ORDER BY employee_no;
