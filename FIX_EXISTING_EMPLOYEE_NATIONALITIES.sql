-- ========================================
-- ONE-TIME FIX FOR EXISTING DATA
-- ========================================
-- Run this AFTER you've run the RUN_THIS_NATIONALITY_FIX.sql
-- This will fix any employees that currently have old nationality names

-- Step 1: Check which employees have nationality names that don't exist in nationalities table
SELECT DISTINCT e.nationality as employee_nationality
FROM employees e
WHERE NOT EXISTS (
    SELECT 1 FROM nationalities n 
    WHERE n.name_en = e.nationality
)
ORDER BY e.nationality;

-- This will show you all the "broken" nationality names like "lebano" that need fixing

-- Step 2: Manual fix - Update specific old names to new names
-- EXAMPLE: If you had "lebano" and want to change it to "Lebanon"
-- Uncomment and modify these lines as needed:

-- UPDATE employees 
-- SET nationality = 'Lebanon' 
-- WHERE nationality = 'lebano';

-- UPDATE employees 
-- SET nationality = 'Egypt' 
-- WHERE nationality = 'egyp';

-- Add more UPDATE statements here for each old nationality name you find

-- Step 3: Verify all employees now have valid nationalities
SELECT 
    COUNT(*) as total_employees,
    COUNT(DISTINCT nationality) as unique_nationalities
FROM employees;

SELECT 
    e.nationality,
    COUNT(*) as employee_count,
    CASE 
        WHEN EXISTS (SELECT 1 FROM nationalities n WHERE n.name_en = e.nationality) 
        THEN '✓ Valid'
        ELSE '✗ INVALID - Needs fixing'
    END as status
FROM employees e
GROUP BY e.nationality
ORDER BY status, e.nationality;
