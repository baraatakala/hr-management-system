-- Create a trigger function to cascade nationality name updates to employees
-- When a nationality name_en is updated, update all employee records with the old name

CREATE OR REPLACE FUNCTION cascade_nationality_name_update()
RETURNS TRIGGER AS $$
BEGIN
    -- If the name_en changed, update all employees with the old nationality name
    IF OLD.name_en IS DISTINCT FROM NEW.name_en THEN
        UPDATE employees
        SET nationality = NEW.name_en
        WHERE nationality = OLD.name_en;
        
        RAISE NOTICE 'Updated employees from nationality % to %', OLD.name_en, NEW.name_en;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on nationalities table
DROP TRIGGER IF EXISTS trigger_cascade_nationality_update ON nationalities;
CREATE TRIGGER trigger_cascade_nationality_update
    AFTER UPDATE ON nationalities
    FOR EACH ROW
    EXECUTE FUNCTION cascade_nationality_name_update();

-- Add comment
COMMENT ON FUNCTION cascade_nationality_name_update() IS 'Automatically updates employee nationality field when nationality name_en is changed';
