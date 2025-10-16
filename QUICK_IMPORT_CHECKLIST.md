# ✅ Quick Import Checklist

## Before Running SQL

- [x] ✅ Ran `20250101000000_initial_schema.sql` (tables created)
- [x] ✅ Ran `CREATE_NATIONALITIES_TABLE.sql` (nationalities added)
- [ ] 🔲 Logged into Supabase Dashboard
- [ ] 🔲 Opened SQL Editor

## Import Steps

1. [ ] 🔲 Open `SAFE_COMPLETE_DATA_INSERT.sql` in VS Code
2. [ ] 🔲 Select All (Ctrl+A)
3. [ ] 🔲 Copy (Ctrl+C)
4. [ ] 🔲 Go to Supabase SQL Editor
5. [ ] 🔲 Create New Query
6. [ ] 🔲 Paste SQL (Ctrl+V)
7. [ ] 🔲 Click **Run** button (or F5)
8. [ ] 🔲 Wait for "Success" message

## Verify Import

Run these queries in Supabase SQL Editor:

```sql
-- Should show 8+ companies
SELECT COUNT(*) FROM companies;

-- Should show 10+ departments  
SELECT COUNT(*) FROM departments;

-- Should show 17+ jobs
SELECT COUNT(*) FROM jobs;

-- Should show 33+ employees
SELECT COUNT(*) FROM employees;

-- View all employees with details
SELECT 
  e.employee_no,
  e.name_en,
  e.name_ar,
  c.name_en as company,
  d.name_en as department,
  j.name_en as job,
  e.nationality,
  e.card_expiry
FROM employees e
JOIN companies c ON e.company_id = c.id
JOIN departments d ON e.department_id = d.id
JOIN jobs j ON e.job_id = j.id
ORDER BY e.employee_no;
```

## Test in Application

- [ ] 🔲 Refresh application (Ctrl+F5)
- [ ] 🔲 Navigate to Employees page
- [ ] 🔲 Verify 33+ employees visible
- [ ] 🔲 Test company filter (Unifood, Rex Dubai, etc.)
- [ ] 🔲 Test department filter
- [ ] 🔲 Test job filter
- [ ] 🔲 Test nationality filter
- [ ] 🔲 Check Dashboard statistics updated
- [ ] 🔲 Verify card expiry warnings showing

## If Something Goes Wrong

**Rollback:** The SQL uses transactions, so if there's an error, nothing is saved.

**Re-run:** It's 100% safe to run the SQL multiple times. It will skip duplicates.

**Check:** Use verification queries above to see what was inserted.

---

## 🎉 Expected Result

After successful import, you should have:
- **5 new companies** (Unifood, Rex Dubai, Limousine 409, Leverage, SQFT)
- **6 new departments** (Sales, Finance, Ops, Admin, IT, Marketing)
- **13 new jobs** (various positions)
- **33 new employees** (with full details including card expiry dates)

## 📊 Quick Stats

| Item | Count |
|------|-------|
| Companies | 8+ |
| Departments | 10+ |
| Jobs | 17+ |
| Employees | 33+ |
| Nationalities | 14+ |

---

**⏱️ Estimated Time:** 2-3 minutes total

**🔒 Safety Level:** 100% Safe (can run multiple times)

**✅ Ready to Run?** Open Supabase SQL Editor and paste the SQL!
