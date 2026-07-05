const https = require('https');

const PROJECT_REF = 'lydqwukaryqghovxbcqg';
const ACCESS_TOKEN = 'sbp_11b17207ebfedf8610f2a77d07aa708f66527c33';

function runSQL(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = https.request(options, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { 
          const parsed = JSON.parse(d);
          if (r.statusCode >= 400) {
            reject(new Error(`HTTP ${r.statusCode}: ${JSON.stringify(parsed)}`));
          } else {
            resolve(parsed);
          }
        } catch(e) { 
          reject(new Error(`Parse error: ${d.substring(0, 500)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Starting database migration...\n');

  const migrations = [
    {
      name: 'Add avatar_url to employees',
      sql: `ALTER TABLE employees ADD COLUMN IF NOT EXISTS avatar_url TEXT;`
    },
    {
      name: 'Create employee-avatars storage bucket',
      sql: `
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
          'employee-avatars',
          'employee-avatars',
          false,
          524288,
          ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
        )
        ON CONFLICT (id) DO UPDATE SET
          file_size_limit = EXCLUDED.file_size_limit,
          allowed_mime_types = EXCLUDED.allowed_mime_types;
      `
    },
    {
      name: 'RLS policy for employee-avatars bucket',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
            AND policyname = 'Authenticated users can manage avatars'
          ) THEN
            CREATE POLICY "Authenticated users can manage avatars"
              ON storage.objects FOR ALL TO authenticated
              USING (bucket_id = 'employee-avatars')
              WITH CHECK (bucket_id = 'employee-avatars');
          END IF;
        END $$;
      `
    },
    {
      name: 'Fix audit trigger - add denormalized employee info',
      sql: `
        CREATE OR REPLACE FUNCTION log_employee_changes()
        RETURNS TRIGGER AS $$
        DECLARE
            current_user_email TEXT;
            current_user_id UUID;
            changed_fields JSONB;
        BEGIN
            current_user_id := auth.uid();
            SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;

            IF (TG_OP = 'INSERT') THEN
                INSERT INTO activity_log (
                    employee_id, entity_type, entity_id, action,
                    user_id, user_email, new_values, details,
                    employee_no, name_en, name_ar
                ) VALUES (
                    NEW.id, 'employee', NEW.id, 'CREATE',
                    current_user_id, current_user_email,
                    to_jsonb(NEW),
                    jsonb_build_object('employee_no', NEW.employee_no, 'name_en', NEW.name_en, 'name_ar', NEW.name_ar),
                    NEW.employee_no, NEW.name_en, NEW.name_ar
                );
                RETURN NEW;
            ELSIF (TG_OP = 'UPDATE') THEN
                SELECT jsonb_object_agg(key, jsonb_build_object('old', old_val, 'new', new_val))
                INTO changed_fields
                FROM (
                    SELECT key,
                           to_jsonb(OLD) -> key AS old_val,
                           to_jsonb(NEW) -> key AS new_val
                    FROM jsonb_object_keys(to_jsonb(NEW)) AS key
                    WHERE to_jsonb(OLD) -> key IS DISTINCT FROM to_jsonb(NEW) -> key
                      AND key NOT IN ('updated_at')
                ) changes;
                
                IF changed_fields IS NULL OR changed_fields = '{}'::jsonb THEN
                    RETURN NEW;
                END IF;
                
                INSERT INTO activity_log (
                    employee_id, entity_type, entity_id, action,
                    user_id, user_email, old_values, new_values, details,
                    employee_no, name_en, name_ar
                ) VALUES (
                    NEW.id, 'employee', NEW.id, 'UPDATE',
                    current_user_id, current_user_email,
                    to_jsonb(OLD), to_jsonb(NEW),
                    jsonb_build_object(
                        'employee_no', NEW.employee_no,
                        'name_en', NEW.name_en,
                        'name_ar', NEW.name_ar,
                        'changes', changed_fields
                    ),
                    NEW.employee_no, NEW.name_en, NEW.name_ar
                );
                RETURN NEW;
            ELSIF (TG_OP = 'DELETE') THEN
                INSERT INTO activity_log (
                    employee_id, entity_type, entity_id, action,
                    user_id, user_email, old_values, details,
                    employee_no, name_en, name_ar
                ) VALUES (
                    OLD.id, 'employee', OLD.id, 'DELETE',
                    current_user_id, current_user_email,
                    to_jsonb(OLD),
                    jsonb_build_object('employee_no', OLD.employee_no, 'name_en', OLD.name_en, 'name_ar', OLD.name_ar),
                    OLD.employee_no, OLD.name_en, OLD.name_ar
                );
                RETURN OLD;
            END IF;
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    },
    {
      name: 'Recreate audit trigger',
      sql: `
        DROP TRIGGER IF EXISTS employee_audit_trigger ON employees;
        CREATE TRIGGER employee_audit_trigger
            AFTER INSERT OR UPDATE OR DELETE ON employees
            FOR EACH ROW
            EXECUTE FUNCTION log_employee_changes();
      `
    },
    {
      name: 'Add performance indexes',
      sql: `
        CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
        CREATE INDEX IF NOT EXISTS idx_employees_nationality ON employees(nationality);
        CREATE INDEX IF NOT EXISTS idx_employees_added_date ON employees(added_date);
        CREATE INDEX IF NOT EXISTS idx_employees_name_en ON employees USING gin(to_tsvector('simple', coalesce(name_en,'')));
        CREATE INDEX IF NOT EXISTS idx_activity_log_employee_no ON activity_log(employee_no);
        CREATE INDEX IF NOT EXISTS idx_employees_employee_no ON employees(employee_no);
      `
    },
    {
      name: 'Fix audit_trail_view - use denormalized columns',
      sql: `
        CREATE OR REPLACE VIEW audit_trail_view AS
        SELECT 
            al.id,
            al.timestamp,
            al.action,
            al.entity_type,
            al.user_email,
            al.user_id,
            al.employee_id,
            COALESCE(al.employee_no, e.employee_no, 'N/A') as employee_no,
            COALESCE(al.name_en, e.name_en, 'Deleted Employee') as name_en,
            COALESCE(al.name_ar, e.name_ar, 'موظف محذوف') as name_ar,
            al.details,
            al.old_values,
            al.new_values,
            al.ip_address
        FROM activity_log al
        LEFT JOIN employees e ON al.employee_id = e.id
        ORDER BY al.timestamp DESC;
        GRANT SELECT ON audit_trail_view TO authenticated;
      `
    },
    {
      name: 'Add bulk import helper function',
      sql: `
        CREATE OR REPLACE FUNCTION check_employee_exists(p_employee_no TEXT)
        RETURNS TABLE(id UUID, employee_no TEXT, name_en TEXT) AS $$
        BEGIN
            RETURN QUERY
            SELECT e.id, e.employee_no, e.name_en
            FROM employees e
            WHERE e.employee_no = p_employee_no;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        GRANT EXECUTE ON FUNCTION check_employee_exists TO authenticated;
      `
    }
  ];

  for (const migration of migrations) {
    try {
      console.log(`Running: ${migration.name}...`);
      const result = await runSQL(migration.sql);
      console.log(`  ✓ Success`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
    }
  }

  console.log('\nMigration complete!');
  
  // Verify avatar_url column was added
  try {
    const check = await runSQL(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'avatar_url'`);
    console.log('\nVerification - avatar_url column:', check);
  } catch(e) {
    console.error('Verification failed:', e.message);
  }
}

main().catch(console.error);
