-- Drop the view first to allow column modifications
DROP VIEW IF EXISTS audit_trail_view;

-- CRITICAL FIX: Remove CASCADE DELETE on employee_id to preserve audit trail
-- This prevents audit logs from being deleted when employees are deleted
ALTER TABLE activity_log
DROP CONSTRAINT IF EXISTS activity_log_employee_id_fkey;

ALTER TABLE activity_log
ADD CONSTRAINT activity_log_employee_id_fkey
FOREIGN KEY (employee_id)
REFERENCES employees(id)
ON DELETE SET NULL;

-- Add columns to store employee information directly in audit log
-- This prevents "Deleted Employee" showing up in audit trail after bulk imports/deletes
ALTER TABLE activity_log 
ADD COLUMN IF NOT EXISTS employee_no VARCHAR(50),
ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_log_employee_no ON activity_log(employee_no);

-- Update the trigger function to store employee info directly
CREATE OR REPLACE FUNCTION log_employee_changes()
RETURNS TRIGGER AS $$
DECLARE
    current_user_email TEXT;
    current_user_id UUID;
BEGIN
    -- Get current user info
    current_user_id := auth.uid();
    SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO activity_log (
            employee_id,
            employee_no,
            name_en,
            name_ar,
            entity_type,
            entity_id,
            action,
            user_id,
            user_email,
            new_values,
            details
        ) VALUES (
            NEW.id,
            NEW.employee_no,
            NEW.name_en,
            NEW.name_ar,
            'employee',
            NEW.id,
            'CREATE',
            current_user_id,
            current_user_email,
            to_jsonb(NEW),
            jsonb_build_object(
                'employee_no', NEW.employee_no,
                'name_en', NEW.name_en,
                'name_ar', NEW.name_ar
            )
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO activity_log (
            employee_id,
            employee_no,
            name_en,
            name_ar,
            entity_type,
            entity_id,
            action,
            user_id,
            user_email,
            old_values,
            new_values,
            details
        ) VALUES (
            NEW.id,
            NEW.employee_no,
            NEW.name_en,
            NEW.name_ar,
            'employee',
            NEW.id,
            'UPDATE',
            current_user_id,
            current_user_email,
            to_jsonb(OLD),
            to_jsonb(NEW),
            jsonb_build_object(
                'employee_no', NEW.employee_no,
                'name_en', NEW.name_en,
                'name_ar', NEW.name_ar,
                'changes', (
                    SELECT jsonb_object_agg(key, jsonb_build_object('old', old_val, 'new', new_val))
                    FROM (
                        SELECT key, 
                               to_jsonb(OLD) -> key AS old_val,
                               to_jsonb(NEW) -> key AS new_val
                        FROM jsonb_object_keys(to_jsonb(NEW)) AS key
                        WHERE to_jsonb(OLD) -> key IS DISTINCT FROM to_jsonb(NEW) -> key
                    ) changes
                )
            )
        );
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO activity_log (
            employee_id,
            employee_no,
            name_en,
            name_ar,
            entity_type,
            entity_id,
            action,
            user_id,
            user_email,
            old_values,
            details
        ) VALUES (
            OLD.id,
            OLD.employee_no,
            OLD.name_en,
            OLD.name_ar,
            'employee',
            OLD.id,
            'DELETE',
            current_user_id,
            current_user_email,
            to_jsonb(OLD),
            jsonb_build_object(
                'employee_no', OLD.employee_no,
                'name_en', OLD.name_en,
                'name_ar', OLD.name_ar
            )
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the view to use stored employee info instead of joining
CREATE OR REPLACE VIEW audit_trail_view AS
SELECT 
    al.id,
    al.timestamp,
    al.action,
    al.entity_type,
    al.user_email,
    al.user_id,
    al.employee_id,
    COALESCE(al.employee_no, 'N/A') as employee_no,
    COALESCE(al.name_en, 'Deleted Employee') as name_en,
    COALESCE(al.name_ar, 'موظف محذوف') as name_ar,
    al.details,
    al.old_values,
    al.new_values,
    al.ip_address
FROM activity_log al
ORDER BY al.timestamp DESC;

-- Backfill existing records with employee info from details JSONB
UPDATE activity_log
SET 
    employee_no = (details->>'employee_no')::VARCHAR(50),
    name_en = (details->>'name_en')::VARCHAR(255),
    name_ar = (details->>'name_ar')::VARCHAR(255)
WHERE employee_no IS NULL 
  AND details IS NOT NULL
  AND details->>'employee_no' IS NOT NULL;

-- Add comment
COMMENT ON COLUMN activity_log.employee_no IS 'Employee number stored directly to preserve data after deletion';
COMMENT ON COLUMN activity_log.name_en IS 'Employee English name stored directly to preserve data after deletion';
COMMENT ON COLUMN activity_log.name_ar IS 'Employee Arabic name stored directly to preserve data after deletion';
