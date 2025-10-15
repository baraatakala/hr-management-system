-- ============================================
-- Verify Email Reminders Were Sent
-- ============================================
-- Run this to see all sent reminders
-- ============================================

-- Show all sent reminders
SELECT 
  r.id,
  e.name_en as employee_name,
  e.email,
  r.type as document_type,
  r.target_date as expiry_date,
  r.status,
  r.sent_at,
  (r.target_date - CURRENT_DATE) as days_until_expiry
FROM reminders r
JOIN employees e ON r.employee_id = e.id
ORDER BY r.sent_at DESC;

-- Count of sent reminders by type
SELECT 
  type as document_type,
  COUNT(*) as total_sent,
  COUNT(DISTINCT employee_id) as unique_employees
FROM reminders
WHERE status = 'sent'
GROUP BY type;

-- Optional: Clear all reminders to test again
-- UNCOMMENT the line below to clear reminders and test again
-- DELETE FROM reminders;
