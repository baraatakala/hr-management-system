import csv
import re
from decimal import Decimal

# Read the CSV data
csv_file = "give me sql to run.txt"

# Mappings for data normalization
company_mapping = {
    "يوني فود للتجارة العامة ش ذ م م": ("UNIFOOD", "Unifood Trading LLC", "يوني فود للتجارة العامة"),
    "ركس دبي (ش.ذ.م.م)": ("REXDUBAI", "Rex Dubai LLC", "ركس دبي"),
    "ليموزين 409 لتاجير الشاحنات": ("LIMO409", "Limousine 409 Truck Rental", "ليموزين 409 لتأجير الشاحنات"),
    "ليفرج للتجارة العامة ش ذ م م": ("LEVERAGE", "Leverage General Trading LLC", "ليفرج للتجارة العامة"),
    "اس كيو اف تي للمخازن العامة": ("SQFT", "SQFT General Warehouses", "اس كيو اف تي للمخازن العامة"),
}

# Job title mapping (Arabic to English with codes)
job_mapping = {
    "موظف مبيعات": ("SALES01", "Sales Employee", "موظف مبيعات"),
    "محاسب": ("ACCT01", "Accountant", "محاسب"),
    "عامل الشحن والتفريغ": ("LOAD01", "Loading Worker", "عامل الشحن والتفريغ"),
    "ممثل مبيعات تجاري": ("SALESREP", "Sales Representative", "ممثل مبيعات تجاري"),
    "عامل مساعد بمتجر": ("STOREASS", "Store Assistant", "عامل مساعد بمتجر"),
    "كاتب ملفات": ("FILECLK", "File Clerk", "كاتب ملفات"),
    "مراسل": ("MSGR01", "Messenger", "مراسل"),
    "سائق شاحنة ثقیلة": ("HTRUCKDR", "Heavy Truck Driver", "سائق شاحنة ثقيلة"),
    "سائق مركبة خفيفة": ("LDRV01", "Light Vehicle Driver", "سائق مركبة خفيفة"),
    "مسؤول إداري": ("ADMOFF", "Administrative Officer", "مسؤول إداري"),
    "مھندس كومبیوتر": ("COMPENG", "Computer Engineer", "مهندس كمبيوتر"),
    "مدير التسويق": ("MKTMGR", "Marketing Manager", "مدير التسويق"),
    "أخصائي تسويق": ("MKTSPC", "Marketing Specialist", "أخصائي تسويق"),
}

# Department mapping (infer from job titles)
dept_mapping = {
    "SALES01": ("SALES", "Sales Department", "قسم المبيعات"),
    "SALESREP": ("SALES", "Sales Department", "قسم المبيعات"),
    "ACCT01": ("FINANCE", "Finance Department", "قسم المالية"),
    "LOAD01": ("OPS", "Operations Department", "قسم العمليات"),
    "STOREASS": ("OPS", "Operations Department", "قسم العمليات"),
    "FILECLK": ("ADMIN", "Administration Department", "قسم الإدارة"),
    "MSGR01": ("ADMIN", "Administration Department", "قسم الإدارة"),
    "HTRUCKDR": ("OPS", "Operations Department", "قسم العمليات"),
    "LDRV01": ("OPS", "Operations Department", "قسم العمليات"),
    "ADMOFF": ("ADMIN", "Administration Department", "قسم الإدارة"),
    "COMPENG": ("IT", "IT Department", "قسم تكنولوجيا المعلومات"),
    "MKTMGR": ("MARKETING", "Marketing Department", "قسم التسويق"),
    "MKTSPC": ("MARKETING", "Marketing Department", "قسم التسويق"),
}

# Nationality mapping
nationality_mapping = {
    "الهند": "India",
    "باكستان": "Pakistan",
    "إيران": "Iran",
}

def convert_employee_no(value):
    """Convert scientific notation to proper employee number"""
    if 'E+' in value or 'e+' in value:
        # Convert scientific notation to decimal
        decimal_value = Decimal(value)
        # Format as integer string
        return str(int(decimal_value))
    return value.replace('.', '').strip()

def escape_sql_string(value):
    """Escape single quotes for SQL"""
    if value is None:
        return 'NULL'
    return value.replace("'", "''")

# Read and parse CSV
employees = []
with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if not row['Employee No'] or row['Employee No'].strip() == '':
            continue
        
        employees.append({
            'employee_no': convert_employee_no(row['Employee No']),
            'name_ar': row['Name (Arabic)'].strip(),
            'name_en': row['Name (English)'].strip(),
            'department_ar': row['Department'].strip(),
            'job_ar': row['Job Title'].strip(),
            'company_ar': row['Company'].strip(),
            'nationality_ar': row['Nationality'].strip(),
            'passport_no': row['Passport No'].strip(),
            'card_no': row['Card No'].strip(),
            'card_expiry': row['Card Expiry'].strip(),
        })

# Generate SQL
sql_output = []

# Header
sql_output.append("-- SAFE EMPLOYEE DATA IMPORT")
sql_output.append("-- Generated automatically from CSV data")
sql_output.append("-- This script will:")
sql_output.append("--   1. Create missing companies, departments, and jobs")
sql_output.append("--   2. Insert employees with conflict handling (skip duplicates)")
sql_output.append("--   3. Preserve existing data")
sql_output.append("")
sql_output.append("BEGIN;")
sql_output.append("")

# Step 1: Insert Companies
sql_output.append("-- Step 1: Insert Companies (skip if exists)")
sql_output.append("")
for company_ar, (code, name_en, name_ar) in company_mapping.items():
    sql_output.append(f"INSERT INTO companies (code, name_en, name_ar)")
    sql_output.append(f"VALUES ('{code}', '{escape_sql_string(name_en)}', '{escape_sql_string(name_ar)}')")
    sql_output.append(f"ON CONFLICT (code) DO NOTHING;")
    sql_output.append("")

# Step 2: Insert Departments
sql_output.append("-- Step 2: Insert Departments (skip if exists)")
sql_output.append("")
unique_depts = {}
for job_code, dept_info in dept_mapping.items():
    dept_code, dept_en, dept_ar = dept_info
    unique_depts[dept_code] = (dept_code, dept_en, dept_ar)

for dept_code, (code, name_en, name_ar) in unique_depts.items():
    sql_output.append(f"INSERT INTO departments (code, name_en, name_ar)")
    sql_output.append(f"VALUES ('{code}', '{escape_sql_string(name_en)}', '{escape_sql_string(name_ar)}')")
    sql_output.append(f"ON CONFLICT (code) DO NOTHING;")
    sql_output.append("")

# Step 3: Insert Jobs
sql_output.append("-- Step 3: Insert Jobs (skip if exists)")
sql_output.append("")
for job_ar, (code, name_en, name_ar) in job_mapping.items():
    sql_output.append(f"INSERT INTO jobs (code, name_en, name_ar)")
    sql_output.append(f"VALUES ('{code}', '{escape_sql_string(name_en)}', '{escape_sql_string(name_ar)}')")
    sql_output.append(f"ON CONFLICT (code) DO NOTHING;")
    sql_output.append("")

# Step 4: Insert Employees
sql_output.append("-- Step 4: Insert Employees (skip if employee_no exists)")
sql_output.append("")

for emp in employees:
    # Get company code
    company_code = company_mapping.get(emp['company_ar'], (None, None, None))[0]
    if not company_code:
        print(f"WARNING: Unknown company: {emp['company_ar']}")
        continue
    
    # Get job code
    job_code = job_mapping.get(emp['job_ar'], (None, None, None))[0]
    if not job_code:
        print(f"WARNING: Unknown job: {emp['job_ar']}")
        continue
    
    # Get department code from job
    dept_code = dept_mapping.get(job_code, (None, None, None))[0]
    if not dept_code:
        dept_code = "OPS"  # Default to operations
    
    # Get nationality
    nationality = nationality_mapping.get(emp['nationality_ar'], emp['nationality_ar'])
    
    # Format card expiry date
    card_expiry = f"'{emp['card_expiry']}'" if emp['card_expiry'] else 'NULL'
    
    sql_output.append(f"INSERT INTO employees (")
    sql_output.append(f"  employee_no, name_en, name_ar, nationality,")
    sql_output.append(f"  company_id, department_id, job_id,")
    sql_output.append(f"  passport_no, card_no, card_expiry")
    sql_output.append(f")")
    sql_output.append(f"VALUES (")
    sql_output.append(f"  '{emp['employee_no']}',")
    sql_output.append(f"  '{escape_sql_string(emp['name_en'])}',")
    sql_output.append(f"  '{escape_sql_string(emp['name_ar'])}',")
    sql_output.append(f"  '{escape_sql_string(nationality)}',")
    sql_output.append(f"  (SELECT id FROM companies WHERE code = '{company_code}'),")
    sql_output.append(f"  (SELECT id FROM departments WHERE code = '{dept_code}'),")
    sql_output.append(f"  (SELECT id FROM jobs WHERE code = '{job_code}'),")
    sql_output.append(f"  '{escape_sql_string(emp['passport_no'])}',")
    sql_output.append(f"  '{escape_sql_string(emp['card_no'])}',")
    sql_output.append(f"  {card_expiry}")
    sql_output.append(f")")
    sql_output.append(f"ON CONFLICT (employee_no) DO NOTHING;")
    sql_output.append("")

# Footer
sql_output.append("COMMIT;")
sql_output.append("")
sql_output.append("-- Verification Queries")
sql_output.append("SELECT COUNT(*) as total_companies FROM companies;")
sql_output.append("SELECT COUNT(*) as total_departments FROM departments;")
sql_output.append("SELECT COUNT(*) as total_jobs FROM jobs;")
sql_output.append("SELECT COUNT(*) as total_employees FROM employees;")
sql_output.append("")
sql_output.append("-- View inserted employees")
sql_output.append("SELECT e.employee_no, e.name_en, c.name_en as company, d.name_en as department, j.name_en as job")
sql_output.append("FROM employees e")
sql_output.append("JOIN companies c ON e.company_id = c.id")
sql_output.append("JOIN departments d ON e.department_id = d.id")
sql_output.append("JOIN jobs j ON e.job_id = j.id")
sql_output.append("ORDER BY e.employee_no;")

# Write to file
output_file = "SAFE_COMPLETE_DATA_INSERT.sql"
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_output))

print(f"✅ SQL file generated: {output_file}")
print(f"✅ Total employees to insert: {len(employees)}")
print(f"✅ Total companies: {len(company_mapping)}")
print(f"✅ Total departments: {len(unique_depts)}")
print(f"✅ Total jobs: {len(job_mapping)}")
print("\nℹ️  This SQL is SAFE to run multiple times - it will skip duplicates!")
