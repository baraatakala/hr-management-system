import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      // Common
      "app.title": "HR Management System",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.add": "Add",
      "common.search": "Search",
      "common.filter": "Filter",
      "common.export": "Export",
      "common.import": "Import",
      "common.loading": "Loading...",
      "common.noData": "No data available",
      "common.confirm": "Confirm",
      "common.yes": "Yes",
      "common.no": "No",
      
      // Auth
      "auth.login": "Login",
      "auth.logout": "Logout",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.signIn": "Sign In",
      "auth.signUp": "Sign Up",
      "auth.forgotPassword": "Forgot Password?",
      
      // Navigation
      "nav.dashboard": "Dashboard",
      "nav.employees": "Employees",
      "nav.companies": "Companies",
      "nav.departments": "Departments",
      "nav.jobs": "Jobs",
      "nav.reminders": "Email Reminders",
      "nav.settings": "Settings",
      
      // Dashboard
      "dashboard.title": "Dashboard",
      "dashboard.totalEmployees": "Total Employees",
      "dashboard.missingPassports": "Missing Passports",
      "dashboard.expiredCards": "Expired Cards",
      "dashboard.expiringDocuments": "Expiring Soon",
      "dashboard.recentActivity": "Recent Activity",
      
      // Employees
      "employees.title": "Employees",
      "employees.addEmployee": "Add Employee",
      "employees.editEmployee": "Edit Employee",
      "employees.employeeNo": "Employee No",
      "employees.nameEn": "Name (English)",
      "employees.nameAr": "Name (Arabic)",
      "employees.nationality": "Nationality",
      "employees.company": "Company",
      "employees.department": "Department",
      "employees.job": "Job Title",
      "employees.passportNo": "Passport No",
      "employees.passportExpiry": "Passport Expiry",
      "employees.cardNo": "Card No",
      "employees.cardExpiry": "Card Expiry",
      "employees.emiratesId": "Emirates ID",
      "employees.emiratesIdExpiry": "Emirates ID Expiry",
      "employees.residenceNo": "Residence No",
      "employees.residenceExpiry": "Residence Expiry",
      "employees.email": "Email",
      "employees.phone": "Phone",
      "employees.deleteConfirm": "Are you sure you want to delete this employee?",
      
      // Companies
      "companies.title": "Companies",
      "companies.addCompany": "Add Company",
      "companies.code": "Code",
      "companies.nameEn": "Name (English)",
      "companies.nameAr": "Name (Arabic)",
      
      // Departments
      "departments.title": "Departments",
      "departments.addDepartment": "Add Department",
      
      // Jobs
      "jobs.title": "Job Titles",
      "jobs.addJob": "Add Job Title",
      
      // Reminders
      "reminders.title": "Email Reminders",
      "reminders.employee": "Employee",
      "reminders.type": "Type",
      "reminders.targetDate": "Target Date",
      "reminders.status": "Status",
      "reminders.sentAt": "Sent At",
      "reminders.pending": "Pending",
      "reminders.sent": "Sent",
      "reminders.failed": "Failed",
      
      // Settings
      "settings.title": "Settings",
      "settings.language": "Language",
      "settings.theme": "Theme",
      "settings.light": "Light",
      "settings.dark": "Dark",
    }
  },
  ar: {
    translation: {
      // Common
      "app.title": "نظام إدارة الموارد البشرية",
      "common.save": "حفظ",
      "common.cancel": "إلغاء",
      "common.delete": "حذف",
      "common.edit": "تعديل",
      "common.add": "إضافة",
      "common.search": "بحث",
      "common.filter": "تصفية",
      "common.export": "تصدير",
      "common.import": "استيراد",
      "common.loading": "جاري التحميل...",
      "common.noData": "لا توجد بيانات",
      "common.confirm": "تأكيد",
      "common.yes": "نعم",
      "common.no": "لا",
      
      // Auth
      "auth.login": "تسجيل الدخول",
      "auth.logout": "تسجيل الخروج",
      "auth.email": "البريد الإلكتروني",
      "auth.password": "كلمة المرور",
      "auth.signIn": "تسجيل الدخول",
      "auth.signUp": "إنشاء حساب",
      "auth.forgotPassword": "نسيت كلمة المرور؟",
      
      // Navigation
      "nav.dashboard": "لوحة التحكم",
      "nav.employees": "الموظفين",
      "nav.companies": "الشركات",
      "nav.departments": "الأقسام",
      "nav.jobs": "المسميات الوظيفية",
      "nav.reminders": "تذكيرات البريد الإلكتروني",
      "nav.settings": "الإعدادات",
      
      // Dashboard
      "dashboard.title": "لوحة التحكم",
      "dashboard.totalEmployees": "إجمالي الموظفين",
      "dashboard.missingPassports": "جوازات السفر المفقودة",
      "dashboard.expiredCards": "البطاقات منتهية الصلاحية",
      "dashboard.expiringDocuments": "منتهية قريباً",
      "dashboard.recentActivity": "النشاط الأخير",
      
      // Employees
      "employees.title": "الموظفين",
      "employees.addEmployee": "إضافة موظف",
      "employees.editEmployee": "تعديل موظف",
      "employees.employeeNo": "رقم الموظف",
      "employees.nameEn": "الاسم (إنجليزي)",
      "employees.nameAr": "الاسم (عربي)",
      "employees.nationality": "الجنسية",
      "employees.company": "الشركة",
      "employees.department": "القسم",
      "employees.job": "المسمى الوظيفي",
      "employees.passportNo": "رقم جواز السفر",
      "employees.passportExpiry": "انتهاء جواز السفر",
      "employees.cardNo": "رقم البطاقة",
      "employees.cardExpiry": "انتهاء البطاقة",
      "employees.emiratesId": "الهوية الإماراتية",
      "employees.emiratesIdExpiry": "انتهاء الهوية الإماراتية",
      "employees.residenceNo": "رقم الإقامة",
      "employees.residenceExpiry": "انتهاء الإقامة",
      "employees.email": "البريد الإلكتروني",
      "employees.phone": "الهاتف",
      "employees.deleteConfirm": "هل أنت متأكد من حذف هذا الموظف؟",
      
      // Companies
      "companies.title": "الشركات",
      "companies.addCompany": "إضافة شركة",
      "companies.code": "الرمز",
      "companies.nameEn": "الاسم (إنجليزي)",
      "companies.nameAr": "الاسم (عربي)",
      
      // Departments
      "departments.title": "الأقسام",
      "departments.addDepartment": "إضافة قسم",
      
      // Jobs
      "jobs.title": "المسميات الوظيفية",
      "jobs.addJob": "إضافة مسمى وظيفي",
      
      // Reminders
      "reminders.title": "تذكيرات البريد الإلكتروني",
      "reminders.employee": "الموظف",
      "reminders.type": "النوع",
      "reminders.targetDate": "تاريخ الهدف",
      "reminders.status": "الحالة",
      "reminders.sentAt": "أرسلت في",
      "reminders.pending": "قيد الانتظار",
      "reminders.sent": "تم الإرسال",
      "reminders.failed": "فشل",
      
      // Settings
      "settings.title": "الإعدادات",
      "settings.language": "اللغة",
      "settings.theme": "المظهر",
      "settings.light": "فاتح",
      "settings.dark": "داكن",
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
