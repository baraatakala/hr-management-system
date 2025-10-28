-- Fix: Allow employee_id to be NULL in activity_log for DELETE operations
-- This allows audit logging when employees are deleted

-- Make employee_id nullable
ALTER TABLE activity_log ALTER COLUMN employee_id DROP NOT NULL;

-- Update the audit trigger to fire BEFORE DELETE instead of AFTER
-- This ensures the audit log is created before the employee is removed

DROP TRIGGER IF EXISTS employee_audit_trigger ON employees;

CREATE TRIGGER employee_audit_trigger
    BEFORE DELETE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION log_employee_changes();

-- Also keep the INSERT and UPDATE triggers as AFTER
CREATE TRIGGER employee_audit_trigger_after
    AFTER INSERT OR UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION log_employee_changes();

-- Update the function to handle BEFORE DELETE properly
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
            entity_type,
            entity_id,
            action,
            user_id,
            user_email,
            new_values,
            details
        ) VALUES (
            NEW.id,
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
        -- Store the audit log BEFORE the employee is deleted
        -- employee_id can be NULL since the employee will be deleted
        INSERT INTO activity_log (
            employee_id,
            entity_type,
            entity_id,
            action,
            user_id,
            user_email,
            old_values,
            details
        ) VALUES (
            NULL,  -- Set to NULL since employee will be deleted
            'employee',
            OLD.id,  -- Keep entity_id for reference
            'DELETE',
            current_user_id,
            current_user_email,
            to_jsonb(OLD),
            jsonb_build_object(
                'employee_no', OLD.employee_no,
                'name_en', OLD.name_en,
                'name_ar', OLD.name_ar,
                'deleted_id', OLD.id
            )
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON COLUMN activity_log.employee_id IS 'Employee ID - NULL for deleted employees, entity_id stores the reference';
