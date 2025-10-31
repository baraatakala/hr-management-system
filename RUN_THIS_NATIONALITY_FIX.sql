-- ========================================
-- RUN THIS SQL IN YOUR SUPABASE SQL EDITOR
-- ========================================
-- This creates a database trigger that automatically updates
-- all employee records when a nationality name is changed

-- Step 1: Create the trigger function
CREATE OR REPLACE FUNCTION cascade_nationality_name_update()
RETURNS TRIGGER AS $$
BEGIN
    -- If the name_en changed, update all employees with the old nationality name
    IF OLD.name_en IS DISTINCT FROM NEW.name_en THEN
        UPDATE employees
        SET nationality = NEW.name_en
        WHERE nationality = OLD.name_en;
        
        RAISE NOTICE 'Updated employees from nationality "%" to "%"', OLD.name_en, NEW.name_en;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create the trigger on nationalities table
DROP TRIGGER IF EXISTS trigger_cascade_nationality_update ON nationalities;
CREATE TRIGGER trigger_cascade_nationality_update
    AFTER UPDATE ON nationalities
    FOR EACH ROW
    EXECUTE FUNCTION cascade_nationality_name_update();

-- Step 3: Verify the trigger was created
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table, 
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_cascade_nationality_update';

-- Expected output: You should see one row showing the trigger details

-- ========================================
-- HOW IT WORKS:
-- ========================================
-- 1. When you edit a nationality name in the Nationalities page
-- 2. The trigger automatically finds all employees with the old name
-- 3. Updates their nationality field to the new name
-- 4. Both frontend cache and database stay in sync

-- ========================================
-- TESTING:
-- ========================================
-- After running this SQL:
-- 1. Go to Nationalities page
-- 2. Edit "Lebanon" to "Lebanese"
-- 3. Check Employees page - all records should show "Lebanese"
-- 4. Filter by "Lebanese" - should find all records

COMMENT ON FUNCTION cascade_nationality_name_update() IS 'Automatically updates employee nationality field when nationality name_en is changed in nationalities table';
