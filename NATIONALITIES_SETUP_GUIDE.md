# 🌍 Nationalities Management - Complete Setup Guide

## ✨ What's New?

You now have a **Nationalities Management Page** just like Companies, Departments, and Jobs pages!

---

## 🎯 Features

### Same as Companies & Departments:

- ✅ **Add Nationality** button
- ✅ **Edit** existing nationalities
- ✅ **Delete** nationalities
- ✅ **Code field** (e.g., UAE, SAU, EGY)
- ✅ **Bilingual support** (English & Arabic names)
- ✅ **Card-based grid layout**
- ✅ **Real-time updates**
- ✅ **Empty state** when no data

---

## 📋 Setup Steps

### Step 1: Run the SQL Migration ⚠️ REQUIRED

**You MUST run this SQL in Supabase SQL Editor:**

1. **Open Supabase Dashboard**: https://app.supabase.com
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the content from: `CREATE_NATIONALITIES_TABLE.sql`
5. Click **Run** or press `Ctrl+Enter`

**The SQL file creates:**

- ✅ `nationalities` table
- ✅ 14 sample countries (UAE, Saudi Arabia, Egypt, etc.)
- ✅ Indexes for performance
- ✅ Row Level Security policies
- ✅ Proper permissions

### Step 2: Verify Table Creation

After running the SQL, verify it worked:

```sql
SELECT * FROM nationalities ORDER BY name_en;
```

You should see 14 nationalities including:

- 🇦🇪 United Arab Emirates
- 🇸🇦 Saudi Arabia
- 🇪🇬 Egypt
- 🇯🇴 Jordan
- 🇱🇧 Lebanon
- 🇮🇳 India
- 🇵🇰 Pakistan
- 🇵🇭 Philippines
- 🇺🇸 United States
- 🇬🇧 United Kingdom
- 🇨🇦 Canada
- 🇦🇺 Australia
- And more...

---

## 🚀 Access the Page

**URL:** http://localhost:5175/nationalities

**Or navigate from the sidebar:**

- Look for **"Nationalities" / "الجنسيات"** menu item
- Icon: 🌍 Globe icon
- Located between "Jobs" and "Reminders"

---

## 🎨 Page Layout

```
┌─────────────────────────────────────────────────────┐
│ Nationalities                    [Add Nationality]  │
│ 14 nationalities                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│ │ United Arab  │  │ Saudi Arabia │  │ Egypt      ││
│ │ Emirates     │  │ المملكة...   │  │ مصر        ││
│ │ UAE          │  │ SAU          │  │ EGY        ││
│ │         [✏️][🗑️]│  │         [✏️][🗑️]│  │      [✏️][🗑️]││
│ └──────────────┘  └──────────────┘  └────────────┘│
│                                                     │
│ ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│ │ Jordan       │  │ Lebanon      │  │ India      ││
│ │ الأردن       │  │ لبنان        │  │ الهند      ││
│ │ JOR          │  │ LBN          │  │ IND        ││
│ │         [✏️][🗑️]│  │         [✏️][🗑️]│  │      [✏️][🗑️]││
│ └──────────────┘  └──────────────┘  └────────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 How to Use

### Add New Nationality

1. Click **"Add Nationality"** button (top right)
2. Fill in the form:
   - **Code**: 3-letter country code (e.g., `FRA` for France)
   - **English Name**: Full country name in English
   - **Arabic Name**: Full country name in Arabic
3. Click **"Save"**
4. The new nationality appears instantly!

**Example:**

```
Code: FRA
English Name: France
Arabic Name: فرنسا
```

### Edit Nationality

1. Find the nationality card
2. Click the **✏️ Edit** button
3. Modify any field:
   - Code
   - English name
   - Arabic name
4. Click **"Save"**
5. Changes apply immediately!

### Delete Nationality

1. Find the nationality card
2. Click the **🗑️ Delete** button (red)
3. Confirm deletion in the popup
4. Nationality removed permanently!

⚠️ **Warning:** Cannot delete if employees are using this nationality!

---

## 📱 Responsive Design

### Desktop View

- **3 columns** grid layout
- Cards with hover effects
- Edit/Delete buttons visible

### Tablet View

- **2 columns** grid layout
- Touch-friendly buttons
- Optimized spacing

### Mobile View

- **1 column** layout
- Stacked cards
- Large touch targets

---

## 🌐 Multi-Language Support

### English Mode:

- Page Title: "Nationalities"
- Count: "14 nationalities"
- Button: "Add Nationality"
- Fields: "Code", "English Name", "Arabic Name"

### Arabic Mode (العربية):

- Page Title: "الجنسيات"
- Count: "١٤ جنسية"
- Button: "إضافة جنسية"
- Fields: "الرمز", "الاسم بالإنجليزية", "الاسم بالعربية"

---

## 🔗 Integration Points

### 1. Employee Page Filter

The nationality filter on the Employee page will now show:

- All nationalities from this table
- Sorted alphabetically
- Bilingual display

### 2. Dashboard Charts

The nationality distribution chart will use:

- Data from this table
- Proper country names
- Accurate statistics

### 3. Employee Creation

When adding/editing employees:

- Nationality dropdown populated from this table
- Searchable/filterable
- Bilingual options

---

## 📊 Database Structure

### Table: `nationalities`

| Column       | Type         | Description                          |
| ------------ | ------------ | ------------------------------------ |
| `id`         | UUID         | Primary key (auto-generated)         |
| `code`       | VARCHAR(50)  | Unique country code (UAE, SAU, etc.) |
| `name_en`    | VARCHAR(255) | English country name                 |
| `name_ar`    | VARCHAR(255) | Arabic country name                  |
| `created_at` | TIMESTAMP    | When record was created              |

### Indexes:

- Primary key on `id`
- Unique constraint on `code`
- Index on `code` for fast lookups

### Security:

- ✅ Row Level Security enabled
- ✅ Authenticated users can read/write
- ✅ Audit trail via `created_at`

---

## 🎯 Common Use Cases

### 1. Add Your Country

**Problem:** Your country is not in the list
**Solution:**

1. Click "Add Nationality"
2. Enter country code (e.g., `DEU` for Germany)
3. Enter English name: "Germany"
4. Enter Arabic name: "ألمانيا"
5. Save!

### 2. Fix Typo in Country Name

**Problem:** Country name has a spelling error
**Solution:**

1. Find the country card
2. Click Edit button
3. Fix the spelling
4. Save changes

### 3. Remove Unused Country

**Problem:** Country was added by mistake
**Solution:**

1. Find the country card
2. Click Delete button (red)
3. Confirm deletion
4. Record removed

### 4. Bulk Add Countries

**Problem:** Need to add many countries at once
**Solution:**

1. Use SQL in Supabase:

```sql
INSERT INTO nationalities (code, name_en, name_ar) VALUES
    ('FRA', 'France', 'فرنسا'),
    ('DEU', 'Germany', 'ألمانيا'),
    ('ITA', 'Italy', 'إيطاليا'),
    ('ESP', 'Spain', 'إسبانيا');
```

2. Refresh the page
3. All countries appear!

---

## 🔍 Search & Filter (Future Enhancement)

### Planned Features:

- 🔜 Search by country name (English/Arabic)
- 🔜 Filter by region (Middle East, Asia, Europe, etc.)
- 🔜 Sort by code, name, or date added
- 🔜 Export to Excel
- 🔜 Import from CSV

---

## 🐛 Troubleshooting

### Issue: "Cannot find nationalities table"

**Solution:** Run the SQL migration file first!

```
File: CREATE_NATIONALITIES_TABLE.sql
Location: Project root folder
```

### Issue: "No nationalities showing"

**Solution:**

1. Check Supabase connection
2. Verify table has data:

```sql
SELECT COUNT(*) FROM nationalities;
```

3. Check browser console for errors

### Issue: "Cannot add nationality - code already exists"

**Solution:**

- Country codes must be unique
- Change the code to something else
- Example: Instead of `UAE`, use `ARE` (ISO code)

### Issue: "Delete button doesn't work"

**Solution:**

- Make sure no employees use this nationality
- Check database constraints
- Try deleting from SQL Editor:

```sql
DELETE FROM nationalities WHERE code = 'XYZ';
```

### Issue: "Arabic text showing as ???"

**Solution:**

- Use proper Arabic font
- Copy-paste from Google Translate
- Ensure database supports UTF-8

---

## 📈 Statistics & Analytics

### View Nationality Usage:

```sql
SELECT
    n.code,
    n.name_en,
    n.name_ar,
    COUNT(e.id) as employee_count
FROM nationalities n
LEFT JOIN employees e ON e.nationality = n.name_en
GROUP BY n.id, n.code, n.name_en, n.name_ar
ORDER BY employee_count DESC;
```

### Find Unused Nationalities:

```sql
SELECT * FROM nationalities n
WHERE NOT EXISTS (
    SELECT 1 FROM employees e
    WHERE e.nationality = n.name_en
);
```

### Most Common Nationalities:

```sql
SELECT
    nationality,
    COUNT(*) as count
FROM employees
GROUP BY nationality
ORDER BY count DESC
LIMIT 10;
```

---

## 🔐 Security & Permissions

### Who Can Access?

- ✅ **Authenticated users** - Full access
- ❌ **Unauthenticated users** - No access
- ✅ **Admin users** - Full CRUD operations
- ✅ **HR users** - Full CRUD operations

### Row Level Security (RLS):

```sql
-- Current policy: Allow all for authenticated users
CREATE POLICY "Allow all for authenticated users"
ON nationalities
FOR ALL
TO authenticated
USING (true);
```

### Future: Role-Based Access

```sql
-- Admin only: Add/Edit/Delete
-- HR users: Add/Edit
-- Regular users: View only
```

---

## 🎉 What's Completed

### Frontend:

- ✅ NationalitiesPage.tsx created
- ✅ Route added to App.tsx
- ✅ Menu item added to Layout
- ✅ Database types updated
- ✅ Full CRUD operations
- ✅ Bilingual support
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states

### Backend:

- ✅ Database migration SQL
- ✅ Table schema defined
- ✅ Sample data inserted
- ✅ Indexes created
- ✅ RLS policies set
- ✅ Type definitions updated

### Documentation:

- ✅ Setup guide created
- ✅ SQL migration file ready
- ✅ Troubleshooting guide
- ✅ Usage examples
- ✅ Common use cases

---

## 🚦 Quick Start Checklist

- [ ] **Step 1:** Open Supabase SQL Editor
- [ ] **Step 2:** Run `CREATE_NATIONALITIES_TABLE.sql`
- [ ] **Step 3:** Verify 14 countries created
- [ ] **Step 4:** Visit http://localhost:5175/nationalities
- [ ] **Step 5:** Test adding a new nationality
- [ ] **Step 6:** Test editing a nationality
- [ ] **Step 7:** Test deleting a nationality
- [ ] **Step 8:** Switch to Arabic and verify bilingual support
- [ ] **Step 9:** Check mobile responsive view
- [ ] **Step 10:** 🎉 Start using the feature!

---

## 📞 Support

### If you need help:

1. Check the troubleshooting section above
2. Verify SQL migration ran successfully
3. Check browser console for errors
4. Check Supabase logs
5. Verify authentication is working

### Common SQL Commands:

```sql
-- View all nationalities
SELECT * FROM nationalities ORDER BY name_en;

-- Count records
SELECT COUNT(*) FROM nationalities;

-- Delete all (caution!)
DELETE FROM nationalities;

-- Re-insert sample data
-- (Use the INSERT statements from CREATE_NATIONALITIES_TABLE.sql)
```

---

## 🎨 Customization Ideas

### Add More Fields:

- Region (Middle East, Asia, Europe, etc.)
- ISO 2-letter code (AE, SA, EG)
- ISO 3-letter code (ARE, SAU, EGY)
- Country flag emoji
- Phone code (+971, +966, etc.)
- Currency code (AED, SAR, EGP)

### Visual Enhancements:

- Country flag icons
- Color coding by region
- Interactive map view
- List view option
- Drag-and-drop sorting

### Advanced Features:

- Search functionality
- Excel import/export
- Bulk operations
- Version history
- Audit trail

---

## ✅ Success!

Your HR Management System now has:

1. ✅ **Dashboard** - Analytics & charts
2. ✅ **Employees** - Full employee management with 8 filters
3. ✅ **Companies** - Add/edit/delete companies
4. ✅ **Departments** - Add/edit/delete departments
5. ✅ **Jobs** - Add/edit/delete job titles
6. ✅ **Nationalities** - Add/edit/delete nationalities (NEW!)
7. ✅ **Reminders** - Email reminders with delete options

**All pages have:**

- ✅ Bilingual support (English/Arabic)
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Real-time updates
- ✅ CRUD operations
- ✅ Beautiful UI

---

**Test it now at:** http://localhost:5175/nationalities

_Version: 1.0.0 | Created: October 16, 2025_
