-- ============================================
-- Test Data: Add Employee with Expiring Documents
-- ============================================
-- This will add a test employee with documents expiring soon
-- You should receive 3 emails (passport, card, Emirates ID)
-- ============================================

-- First, create a test company (if it doesn't exist)
INSERT INTO companies (code, name_en, name_ar)
SELECT 'TEST-001', 'Test Company', 'شركة اختبار'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE code = 'TEST-001');

-- Add test employee with YOUR email
DO $$
DECLARE
  test_company_id UUID;
  test_dept_id UUID;
  test_job_id UUID;
BEGIN
  -- Get the company ID
  SELECT id INTO test_company_id FROM companies WHERE code = 'TEST-001' LIMIT 1;
  SELECT id INTO test_dept_id FROM departments LIMIT 1;
  SELECT id INTO test_job_id FROM jobs LIMIT 1;
  
  -- Add or update test employee with documents expiring in 20 days
  IF NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = 'EMP-TEST-001') THEN
    INSERT INTO employees (
      employee_no,
      name_en,
      name_ar,
      nationality,
      email,
      phone,
      company_id,
      department_id,
      job_id,
      passport_expiry,
      card_expiry,
      emirates_id_expiry
    ) VALUES
    (
      'EMP-TEST-001',
      'Baraa Atakala',
      'براء عطاالله',
      'Jordanian',
      'baraatakala2004@gmail.com',  -- YOUR EMAIL - You'll receive test emails here
      '+971501234567',
      test_company_id,
      test_dept_id,
      test_job_id,
      CURRENT_DATE + INTERVAL '20 days',  -- Passport expires in 20 days
      CURRENT_DATE + INTERVAL '15 days',  -- Card expires in 15 days
      CURRENT_DATE + INTERVAL '25 days'   -- Emirates ID expires in 25 days
    );
  ELSE
    -- Update existing employee
    UPDATE employees 
    SET 
      passport_expiry = CURRENT_DATE + INTERVAL '20 days',
      card_expiry = CURRENT_DATE + INTERVAL '15 days',
      emirates_id_expiry = CURRENT_DATE + INTERVAL '25 days'
    WHERE employee_no = 'EMP-TEST-001';
  END IF;
  
END $$;

-- Verify the data was inserted
SELECT 
  name_en,
  email,
  passport_expiry,
  card_expiry,
  emirates_id_expiry,
  CASE
    WHEN passport_expiry <= CURRENT_DATE THEN '🔴 Expired'
    WHEN passport_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN '🟡 Expiring Soon (will send email)'
    ELSE '🟢 Valid'
  END as passport_status,
  CASE
    WHEN card_expiry <= CURRENT_DATE THEN '🔴 Expired'
    WHEN card_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN '🟡 Expiring Soon (will send email)'
    ELSE '🟢 Valid'
  END as card_status,
  CASE
    WHEN emirates_id_expiry <= CURRENT_DATE THEN '🔴 Expired'
    WHEN emirates_id_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN '🟡 Expiring Soon (will send email)'
    ELSE '🟢 Valid'
  END as emirates_id_status
FROM employees
WHERE email = 'baraatakala2004@gmail.com';
