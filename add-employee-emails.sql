-- ============================================
-- Add Email Addresses to Employees
-- ============================================
-- This will add test email addresses to employees
-- so they can receive expiry reminders
-- ============================================

-- Update Baraa Atakala (already has email from test)
UPDATE employees 
SET email = 'baraatakala2004@gmail.com'
WHERE employee_no = 'EMP-TEST-001';

-- Update Mohammed Hassib (card expires 28/10/2025)
UPDATE employees 
SET email = 'baraatakala2004@gmail.com'
WHERE name_en = 'Mohammed Hassib Mahammad Hussein';

-- Update dfgvdfv (card expires 01/11/2025)
UPDATE employees 
SET email = 'baraatakala2004@gmail.com'
WHERE name_en = 'dfgvdfv';

-- Update gffdg (if they need emails too)
UPDATE employees 
SET email = 'baraatakala2004@gmail.com'
WHERE name_en = 'gffdg';

-- Verify the updates
SELECT 
  name_en,
  employee_no,
  email,
  card_expiry,
  emirates_id_expiry,
  CASE 
    WHEN card_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN 'Card expiring soon!'
    WHEN emirates_id_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN 'Emirates ID expiring soon!'
    ELSE 'OK'
  END as status
FROM employees
WHERE email IS NOT NULL
ORDER BY card_expiry, emirates_id_expiry;
