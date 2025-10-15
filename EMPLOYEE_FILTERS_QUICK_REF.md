# Employee Page - Quick Reference Card

## 🎯 Filter Options

```
┌─────────────────────────────────────────────────────────────────┐
│ Filters & Control                    [Hide] [Clear All] [⊞] [≡] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ 🔍 Quick Search                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Start typing to search automatically...                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ Nationality        Company           Job              Department │
│ ┌────────────┐    ┌────────────┐    ┌────────────┐  ┌─────────┐│
│ │جميع الجنسيات│    │جميع الشركات│    │جميع الوظائف│  │جميع...  ││
│ └────────────┘    └────────────┘    └────────────┘  └─────────┘│
│                                                                   │
│ Passport Status   Card Status    Emirates ID      Residence     │
│ ┌────────────┐    ┌────────────┐    ┌────────────┐  ┌─────────┐│
│ │ All Status │    │ All Status │    │ All Status │  │All Status││
│ └────────────┘    └────────────┘    └────────────┘  └─────────┘│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 View Modes

### Grid View (⊞)
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ John Smith  │  │ Ahmed Ali   │  │ Maria Lee   │
│ #EMP001     │  │ #EMP002     │  │ #EMP003     │
│             │  │             │  │             │
│ Company: X  │  │ Company: Y  │  │ Company: X  │
│ Dept: IT    │  │ Dept: HR    │  │ Dept: Sales │
│             │  │             │  │             │
│ 📅 Passport │  │ 📅 Passport │  │ 📅 Passport │
│ 🟢 Valid    │  │ 🟡 30 days  │  │ 🔴 Expired  │
│             │  │             │  │             │
│  ✏️  🗑️     │  │  ✏️  🗑️     │  │  ✏️  🗑️     │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Table View (≡)
```
┌────────┬──────────┬───────────┬─────────┬──────────┬─────────┐
│ Emp No │   Name   │ Nationality│ Company │  Dept   │ Actions │
├────────┼──────────┼───────────┼─────────┼──────────┼─────────┤
│ EMP001 │John Smith│    USA    │Tech Corp│   IT     │  ✏️ 🗑️  │
│ EMP002 │Ahmed Ali │    UAE    │ HR Plus │   HR     │  ✏️ 🗑️  │
│ EMP003 │Maria Lee │   China   │Tech Corp│  Sales   │  ✏️ 🗑️  │
└────────┴──────────┴───────────┴─────────┴──────────┴─────────┘
```

## 🎨 Status Color Guide

| Color | Status | Days Remaining |
|-------|--------|---------------|
| 🟢 Green | Valid | 30+ days |
| 🟡 Yellow | Expiring Soon | ≤ 30 days |
| 🔴 Red | Expired | Past due |
| ⚫ Gray | No Date | N/A |

## 🔄 Common Workflows

### 1️⃣ Find Expiring Documents
```
1. Select status filter: "Expiring Soon"
2. View results in grid or table
3. Click Edit to update
```

### 2️⃣ Department Report
```
1. Select Department filter
2. Select Company (optional)
3. Click "Export Excel"
4. Open downloaded file
```

### 3️⃣ Quick Employee Search
```
1. Type employee number/name/passport
2. Results appear instantly
3. Click Edit to modify
```

### 4️⃣ Multi-Filter Search
```
1. Select Nationality: "Indian"
2. Select Company: "Tech Corp"
3. Select Status: "Valid"
4. View filtered results
```

## 📥 Export Excel Features

**What Gets Exported:**
- ✅ All filtered employees (not hidden ones)
- ✅ Complete employee information
- ✅ Formatted dates (DD/MM/YYYY)
- ✅ Company/Department/Job names
- ✅ All document numbers and expiries

**File Naming:**
```
Employees_2025-10-16.xlsx
```

**Excel Columns:**
1. Employee No
2. Name (English)
3. Name (Arabic)
4. Nationality
5. Company
6. Department
7. Job
8. Passport No
9. Passport Expiry
10. Card No
11. Card Expiry
12. Emirates ID
13. Emirates ID Expiry
14. Residence No
15. Residence Expiry
16. Email
17. Phone

## 🎯 Filter Combination Examples

### Example 1: Expired Passports in Tech Department
```
Department: Tech
Passport Status: Expired
Result: All tech employees with expired passports
```

### Example 2: Indian Employees in Sales
```
Nationality: Indian
Department: Sales
Result: All Indian employees in sales department
```

### Example 3: Expiring Emirates IDs at Company X
```
Company: Company X
Emirates ID Status: Expiring Soon
Result: Company X employees with IDs expiring in 30 days
```

## ⌨️ Keyboard Shortcuts (Planned)

| Key | Action |
|-----|--------|
| Ctrl + F | Focus search |
| Ctrl + E | Export Excel |
| Ctrl + N | Add new employee |
| Esc | Clear search |

## 📱 Mobile Tips

1. Use Search for quick finding
2. Grid view works better on mobile
3. Swipe table horizontally
4. Collapse filters when not needed
5. Use status filters to reduce scrolling

## 🔧 Button Reference

| Button | Action |
|--------|--------|
| ➕ Add Employee | Open new employee form |
| ⬇️ Export Excel | Download filtered data |
| ⊞ Grid View | Switch to card layout |
| ≡ Table View | Switch to table layout |
| ✏️ Edit | Modify employee details |
| 🗑️ Delete | Remove employee |
| ✖️ Clear All | Reset all filters |
| Hide/Show Filters | Toggle filter panel |

## 💾 Data Handling

**Auto-Save**: No - Click Save in dialog  
**Real-time Updates**: Yes  
**Offline Mode**: No - Requires connection  
**Backup**: Automatic via Supabase  

## 🔒 Permissions Required

- **View Employees**: All logged-in users
- **Add Employee**: Admin/HR only
- **Edit Employee**: Admin/HR only
- **Delete Employee**: Admin only
- **Export Excel**: All logged-in users

---

**Print this page for quick reference at your desk!**
