-- ============================================
-- Test Data: Add Employees with Expiring Documents
-- ============================================
-- This script adds test employees to verify the email reminder system
-- Run this AFTER the main migration (20250101000000_initial_schema.sql)
-- ============================================

-- First, make sure you have at least one company
INSERT INTO companies (name_en, name_ar, email, phone)
VALUES 
  ('Test Company', 'شركة اختبار', 'test@company.com', '+971501234567')
ON CONFLICT (name_en) DO NOTHING;

-- Get the company ID
DO $$
DECLARE
  test_company_id UUID;
BEGIN
  SELECT id INTO test_company_id FROM companies WHERE name_en = 'Test Company' LIMIT 1;
  
  -- Add test employees with documents expiring in 25 days (should trigger reminder)
  INSERT INTO employees (
    name_en,
    name_ar,
    email,
    phone,
    company_id,
    passport_number,
    passport_expiry,
    card_number,
    card_expiry,
    emirates_id,
    emirates_id_expiry,
    residence_number,
    residence_expiry
  ) VALUES
  (
    'Ahmed Hassan',
    'أحمد حسن',
    'ahmed.hassan@test.com',  -- ⚠️ Replace with your real email for testing
    '+971501111111',
    test_company_id,
    'P12345678',
    CURRENT_DATE + INTERVAL '25 days',  -- Expires in 25 days (will trigger reminder)
    NULL,
    NULL,
    '784-1990-1234567-1',
    NULL,
    'R12345678',
    NULL
  ),
  (
    'Sara Ali',
    'سارة علي',
    'sara.ali@test.com',  -- ⚠️ Replace with your real email for testing
    '+971502222222',
    test_company_id,
    'P87654321',
    NULL,
    'C123456',
    CURRENT_DATE + INTERVAL '15 days',  -- Expires in 15 days (will trigger reminder)
    '784-1995-7654321-2',
    CURRENT_DATE + INTERVAL '20 days',  -- Expires in 20 days (will trigger reminder)
    NULL,
    NULL
  ),
  (
    'Mohamed Khalid',
    'محمد خالد',
    'mohamed.khalid@test.com',  -- ⚠️ Replace with your real email for testing
    '+971503333333',
    test_company_id,
    'P11223344',
    CURRENT_DATE + INTERVAL '5 days',  -- Expires in 5 days (urgent!)
    'C789012',
    CURRENT_DATE + INTERVAL '8 days',
    '784-1988-1122334-3',
    CURRENT_DATE + INTERVAL '10 days',
    'R11223344',
    CURRENT_DATE + INTERVAL '12 days'
  )
  ON CONFLICT (email) DO NOTHING;
  
  -- Add an employee with expired documents (won't trigger reminder, but shows in dashboard)
  INSERT INTO employees (
    name_en,
    name_ar,
    email,
    phone,
    company_id,
    passport_number,
    passport_expiry,
    emirates_id,
    emirates_id_expiry
  ) VALUES
  (
    'Omar Mansoor',
    'عمر منصور',
    'omar.mansoor@test.com',
    '+971504444444',
    test_company_id,
    'P99887766',
    CURRENT_DATE - INTERVAL '10 days',  -- Already expired
    '784-1992-9988776-4',
    CURRENT_DATE - INTERVAL '5 days'   -- Already expired
  )
  ON CONFLICT (email) DO NOTHING;
  
END $$;

-- Verify test data was inserted
SELECT 
  name_en,
  email,
  passport_expiry,
  card_expiry,
  emirates_id_expiry,
  residence_expiry,
  CASE
    WHEN passport_expiry <= CURRENT_DATE THEN '🔴 Expired'
    WHEN passport_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN '🟡 Expiring Soon'
    ELSE '🟢 Valid'
  END as passport_status,
  CASE
    WHEN card_expiry <= CURRENT_DATE THEN '🔴 Expired'
    WHEN card_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN '🟡 Expiring Soon'
    ELSE '🟢 Valid'
  END as card_status
FROM employees
WHERE email LIKE '%@test.com'
ORDER BY name_en;

-- ============================================
-- TESTING CHECKLIST
-- ============================================
-- 
-- After adding test data:
-- 
-- 1. ✅ Deploy Edge Function:
--    supabase functions deploy send-reminders
--
-- 2. ✅ Invoke function manually:
--    supabase functions invoke send-reminders --method POST
--
-- 3. ✅ Check emails:
--    - Check the test email addresses above
--    - You should receive 7 emails total:
--      • Ahmed: 1 email (passport)
--      • Sara: 2 emails (card + Emirates ID)
--      • Mohamed: 4 emails (all documents)
--
-- 4. ✅ Check reminders table:
SELECT 
  r.id,
  e.name_en as employee_name,
  r.type as document_type,
  r.target_date as expiry_date,
  r.status,
  r.sent_at
FROM reminders r
JOIN employees e ON e.id = r.employee_id
ORDER BY r.created_at DESC;
--
-- 5. ✅ View in app:
--    Open http://localhost:5174
--    Navigate to "Reminders" page
--    You should see all sent reminders
--
-- ============================================

-- Clean up test data (if needed)
-- DELETE FROM employees WHERE email LIKE '%@test.com';
-- DELETE FROM reminders WHERE employee_id IN (SELECT id FROM employees WHERE email LIKE '%@test.com');
