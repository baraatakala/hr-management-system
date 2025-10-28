-- Enhance activity_log table with more detailed tracking
ALTER TABLE activity_log 
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS entity_id UUID,
ADD COLUMN IF NOT EXISTS old_values JSONB,
ADD COLUMN IF NOT EXISTS new_values JSONB;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_email ON activity_log(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_type ON activity_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_id ON activity_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);

-- Create function to automatically log changes
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
            OLD.id,
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

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS employee_audit_trigger ON employees;

-- Create trigger for automatic audit logging
CREATE TRIGGER employee_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION log_employee_changes();

-- Create view for easier audit querying
CREATE OR REPLACE VIEW audit_trail_view AS
SELECT 
    al.id,
    al.timestamp,
    al.action,
    al.entity_type,
    al.user_email,
    al.user_id,
    al.employee_id,
    e.employee_no,
    e.name_en,
    e.name_ar,
    al.details,
    al.old_values,
    al.new_values,
    al.ip_address
FROM activity_log al
LEFT JOIN employees e ON al.employee_id = e.id
ORDER BY al.timestamp DESC;

-- Grant access to authenticated users
GRANT SELECT ON audit_trail_view TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE activity_log IS 'Comprehensive audit trail for all employee-related changes with full history tracking';
COMMENT ON VIEW audit_trail_view IS 'User-friendly view of audit trail with employee information joined';
