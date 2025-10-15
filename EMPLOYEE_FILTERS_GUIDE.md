# Employee Page - Advanced Filters & Features Guide

## 🎉 New Features Added

Your Employee page now includes comprehensive filtering, viewing options, and export capabilities!

### ✨ Key Features

#### 1. **Quick Search** 🔍
- Search across multiple fields simultaneously:
  - Employee Name (English & Arabic)
  - Employee Number
  - Passport Number
  - Emirates ID
  - Residence Number
- Real-time search as you type
- No need to press Enter

#### 2. **Advanced Filters** 🎯

##### **Nationality Filter**
- Filter employees by nationality
- Shows "جميع الجنسيات / All Nationalities" option
- Dynamically populated from existing employee data

##### **Company Filter**
- Filter by company
- Shows "جميع الشركات / All Companies"
- Displays company names in both Arabic and English

##### **Job Filter**
- Filter by job position
- Shows "جميع الوظائف / All Jobs"
- Multi-language support

##### **Department Filter**
- Filter by department
- Shows "جميع الأقسام / All Departments"
- Multi-language support

##### **Document Status Filters**
All document filters have 4 options:
- **All Status**: Show all employees
- **Valid**: Documents expiring in 30+ days (Green)
- **Expiring Soon**: Documents expiring within 30 days (Yellow)
- **Expired**: Past expiration date (Red)

Available for:
- ✈️ Passport Status
- 💳 Card Status
- 🆔 Emirates ID Status
- 🏠 Residence Status

#### 3. **View Modes** 👁️

##### **Grid View** (Default)
- Card-based layout
- 3 columns on large screens
- 2 columns on medium screens
- 1 column on small screens
- Shows key information in an easy-to-read card format

##### **Table View**
- Comprehensive tabular layout
- All employee information in one view
- Horizontal scrolling on small screens
- Perfect for detailed analysis
- Columns include:
  - Employee No
  - Name
  - Nationality
  - Company
  - Department
  - Job
  - Passport (Number & Expiry)
  - Card Expiry
  - Emirates ID (Number & Expiry)
  - Residence (Number & Expiry)
  - Actions (Edit/Delete buttons)

#### 4. **Export to Excel** 📊
- One-click export to Excel
- Exports filtered data (respects current filters)
- Filename includes current date: `Employees_YYYY-MM-DD.xlsx`
- Includes all employee fields:
  - Basic Information
  - Document Numbers
  - Expiry Dates
  - Contact Information
- Auto-sized columns for readability
- Formatted dates (DD/MM/YYYY)

#### 5. **Filter Controls** 🎛️

##### **Show/Hide Filters**
- Toggle button to collapse/expand filter panel
- Saves screen space when not filtering

##### **Clear All Filters**
- One-click to reset all filters
- Returns to showing all employees
- Clears search term and all dropdowns

##### **Active Filter Count**
- Shows total filtered results
- Example: "45 employees (filtered from 120)"
- Updates in real-time

## 🎨 Color-Coded Status System

### Document Expiry Colors:
- 🟢 **Green**: Valid (30+ days remaining)
- 🟡 **Yellow**: Expiring Soon (≤30 days)
- 🔴 **Red**: Expired (past expiration date)
- ⚫ **Gray**: No date recorded

## 📱 Responsive Design

All features work seamlessly across devices:
- **Desktop**: Full filter panel, multi-column grid
- **Tablet**: Adjusted grid layout
- **Mobile**: Single column, scrollable table

## 🔧 How to Use

### Basic Filtering:
1. Type in the Quick Search box for instant results
2. Select filters from dropdown menus
3. Combine multiple filters for precise results
4. All filters work together (AND logic)

### Viewing Data:
1. Click the Grid icon (⊞) for card view
2. Click the List icon (≡) for table view
3. Toggle anytime while keeping your filters active

### Exporting Data:
1. Apply desired filters (or export all)
2. Click "Export Excel" button
3. File downloads automatically with current date
4. Open in Excel, Google Sheets, or any spreadsheet app

### Managing Filters:
1. Click "Clear All" to reset everything
2. Click "Hide Filters" to save screen space
3. Individual filters can be reset to "All"

## 🚀 Performance

- **Efficient Filtering**: Uses React useMemo for optimized performance
- **Real-time Updates**: Filters apply instantly
- **Large Datasets**: Handles hundreds of employees smoothly
- **Smart Caching**: React Query manages data efficiently

## 🌍 Multi-Language Support

- All filters support Arabic and English
- View switches based on language preference
- Excel exports use current language setting
- Bilingual filter labels

## 💡 Tips & Tricks

1. **Quick Status Check**: Use status filters to find expiring documents
2. **Department Reports**: Filter by department, then export to Excel
3. **Multi-Criteria Search**: Combine nationality + company + status filters
4. **Batch Operations**: Use table view for quick editing of multiple employees
5. **Document Tracking**: Set card status to "Expiring Soon" to prepare renewals

## 🔮 Future Enhancements (Coming Soon)

- Bulk edit functionality
- Saved filter presets
- Advanced date range filters
- PDF export option
- Column sorting in table view
- Column visibility toggle

## 📋 Technical Details

### Libraries Used:
- **xlsx**: Excel file generation
- **dayjs**: Date formatting and calculations
- **React Query**: Data fetching and caching
- **Zustand**: State management
- **Tailwind CSS**: Responsive styling

### File Modified:
- `src/pages/EmployeesPage.tsx` (completely enhanced)

### New Dependencies:
- `xlsx` - For Excel export functionality

## 🐛 Troubleshooting

**Excel not downloading?**
- Check browser download settings
- Ensure pop-ups aren't blocked

**Filters not working?**
- Clear all filters and try again
- Refresh the page if data seems stale

**Table view too wide?**
- Scroll horizontally on mobile
- Use grid view for better mobile experience

**Colors not showing correctly?**
- Check that expiry dates are entered correctly
- Ensure dates are in the future for valid documents

---

## 📞 Support

For issues or feature requests, please contact the development team.

**Version**: 2.0.0  
**Last Updated**: October 2025  
**Status**: ✅ Production Ready
