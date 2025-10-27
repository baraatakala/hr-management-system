-- Add status field to employees table
ALTER TABLE employees 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';

-- Add check constraint for status values
ALTER TABLE employees 
ADD CONSTRAINT chk_employees_status CHECK (status IN ('active', 'inactive'));

-- Change added_at to added_date
ALTER TABLE employees 
RENAME COLUMN added_at TO added_date;

-- Change added_date data type to DATE (since it's for hiring date)
ALTER TABLE employees 
ALTER COLUMN added_date TYPE DATE USING added_date::DATE;

-- Remove default value from added_date to make it manually editable
ALTER TABLE employees 
ALTER COLUMN added_date DROP DEFAULT;

-- Create index for status for better filtering performance
CREATE INDEX idx_employees_status ON employees(status);

-- Update activity log to track status changes
CREATE OR REPLACE FUNCTION log_employee_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO activity_log (employee_id, action, details)
        VALUES (
            NEW.id,
            'status_change',
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'changed_at', CURRENT_TIMESTAMP
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status changes
CREATE TRIGGER employee_status_change
    AFTER UPDATE OF status ON employees
    FOR EACH ROW
    EXECUTE FUNCTION log_employee_status_change();

-- Add comment for status field
COMMENT ON COLUMN employees.status IS 'Employee status: active or inactive. Used to track if employee has left, retired, etc.';

-- Add comment for added_date field
COMMENT ON COLUMN employees.added_date IS 'The date when the employee was added/hired, can be edited manually';

-- Backfill existing records with default status
UPDATE employees 
SET status = 'active' 
WHERE status IS NULL;

-- Backfill any NULL added_date values with the record creation timestamp
UPDATE employees 
SET added_date = updated_at::DATE
WHERE added_date IS NULL;
