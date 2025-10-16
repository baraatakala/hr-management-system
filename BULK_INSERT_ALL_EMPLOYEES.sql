-- ============================================================================
-- BULK INSERT EMPLOYEES FROM CSV - AUTO-GENERATED
-- ============================================================================
-- Generated on: 2025-10-16 04:17:52
-- Total Employees: 0
-- ============================================================================

-- Step 1: Insert Companies
-- ============================================================================

-- Step 2: Insert Departments
-- ============================================================================

-- Step 3: Insert Jobs
-- ============================================================================

-- Step 4: Insert Nationalities
-- ============================================================================

-- Step 5: Insert Employees
-- ============================================================================
WITH company_refs AS (
    SELECT id, name_ar FROM companies
),
dept_refs AS (
    SELECT id, name_ar FROM departments
),
job_refs AS (
    SELECT id, name_ar FROM jobs
)
INSERT INTO employees (
    employee_no, 
    name_ar, 
    name_en, 
    nationality, 
    company_id, 
    department_id, 
    job_id,
    passport_no,
    card_expiry,
    emirates_id,
    emirates_id_expiry,
    residence_no,
    residence_expiry
)
SELECT 
    emp_data.employee_no,
    emp_data.name_ar,
    emp_data.name_en,
    emp_data.nationality,
    c.id,
    d.id,
    j.id,
    emp_data.passport_no,
    emp_data.card_expiry::DATE,
    emp_data.emirates_id,
    emp_data.emirates_id_expiry::DATE,
    emp_data.residence_no,
    emp_data.residence_expiry::DATE
FROM (VALUES

) AS emp_data(employee_no, name_ar, name_en, nationality, company_ar, dept_ar, job_ar, passport_no, card_expiry, emirates_id, emirates_id_expiry, residence_no, residence_expiry)
LEFT JOIN company_refs c ON c.name_ar = emp_data.company_ar
LEFT JOIN dept_refs d ON d.name_ar = emp_data.dept_ar
LEFT JOIN job_refs j ON j.name_ar = emp_data.job_ar
WHERE emp_data.name_en IS NOT NULL
ON CONFLICT (employee_no) DO NOTHING;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check total counts
SELECT 
    'Companies' as table_name, COUNT(*) as count FROM companies
UNION ALL
SELECT 'Departments', COUNT(*) FROM departments
UNION ALL
SELECT 'Jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'Nationalities', COUNT(*) FROM nationalities
UNION ALL
SELECT 'Employees', COUNT(*) FROM employees;

-- Check employees by company
SELECT 
    c.name_en, 
    COUNT(e.id) as employee_count
FROM companies c
LEFT JOIN employees e ON e.company_id = c.id
GROUP BY c.name_en
ORDER BY employee_count DESC;

-- ============================================================================
-- DONE! All 0 employees have been imported.
-- ============================================================================
