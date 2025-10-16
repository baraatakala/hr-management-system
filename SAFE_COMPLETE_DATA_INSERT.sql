-- SAFE EMPLOYEE DATA IMPORT
-- Generated automatically from CSV data
-- This script will:
--   1. Create missing companies, departments, and jobs
--   2. Insert employees with conflict handling (skip duplicates)
--   3. Preserve existing data

BEGIN;

-- Step 1: Insert Companies (skip if exists)

INSERT INTO companies (code, name_en, name_ar)
VALUES ('UNIFOOD', 'Unifood Trading LLC', 'يوني فود للتجارة العامة')
ON CONFLICT (code) DO NOTHING;

INSERT INTO companies (code, name_en, name_ar)
VALUES ('REXDUBAI', 'Rex Dubai LLC', 'ركس دبي')
ON CONFLICT (code) DO NOTHING;

INSERT INTO companies (code, name_en, name_ar)
VALUES ('LIMO409', 'Limousine 409 Truck Rental', 'ليموزين 409 لتأجير الشاحنات')
ON CONFLICT (code) DO NOTHING;

INSERT INTO companies (code, name_en, name_ar)
VALUES ('LEVERAGE', 'Leverage General Trading LLC', 'ليفرج للتجارة العامة')
ON CONFLICT (code) DO NOTHING;

INSERT INTO companies (code, name_en, name_ar)
VALUES ('SQFT', 'SQFT General Warehouses', 'اس كيو اف تي للمخازن العامة')
ON CONFLICT (code) DO NOTHING;

-- Step 2: Insert Departments (skip if exists)

INSERT INTO departments (code, name_en, name_ar)
VALUES ('SALES', 'Sales Department', 'قسم المبيعات')
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (code, name_en, name_ar)
VALUES ('FINANCE', 'Finance Department', 'قسم المالية')
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (code, name_en, name_ar)
VALUES ('OPS', 'Operations Department', 'قسم العمليات')
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (code, name_en, name_ar)
VALUES ('ADMIN', 'Administration Department', 'قسم الإدارة')
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (code, name_en, name_ar)
VALUES ('IT', 'IT Department', 'قسم تكنولوجيا المعلومات')
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (code, name_en, name_ar)
VALUES ('MARKETING', 'Marketing Department', 'قسم التسويق')
ON CONFLICT (code) DO NOTHING;

-- Step 3: Insert Jobs (skip if exists)

INSERT INTO jobs (code, name_en, name_ar)
VALUES ('SALES01', 'Sales Employee', 'موظف مبيعات')
ON CONFLICT (code) DO NOTHING;

INSERT INTO jobs (code, name_en, name_ar)
VALUES ('ACCT01', 'Accountant', 'محاسب')
ON CONFLICT (code) DO NOTHING;

INSERT INTO jobs (code, name_en, name_ar)
VALUES ('LOAD01', 'Loading Worker', 'عامل الشحن والتفريغ')
ON CONFLICT (code) DO NOTHING;

INSERT INTO jobs (code, name_en, name_ar)
VALUES ('SALESREP', 'Sales Representative', 'ممثل مبيعات تجاري')
ON CONFLICT (code) DO NOTHING;

INSERT INTO jobs (code, name_en, name_ar)
VALUES ('STOREASS', 'Store Assistant', 'عامل مساعد بمتجر')
ON CONFLICT (code) DO NOTHING;

INSERT INTO jobs (code, name_en, name_ar)
VALUES ('FILECLK', 'File Clerk', 'كاتب ملفات')
ON CONFLICT (code) DO NOTHING;

INSERT INTO jobs (code, name_en, name_ar)
VALUES ('MSGR01', 'Messenger', 'مراسل')
ON CONFLICT (code) DO NOTHING;

INSERT INTO jobs (code, name_en, name_ar)
VALUES ('HTRUCKDR', 'Heavy Truck Driver', 'سائق شاحنة ثقيلة')
ON CONFLICT (code) DO NOTHING;

INSERT INTO jobs (code, name_en, name_ar)
VALUES ('LDRV01', 'Light Vehicle Driver', 'سائق مركبة خفيفة')
ON CONFLICT (code) DO NOTHING;

INSERT INTO jobs (code, name_en, name_ar)
VALUES ('ADMOFF', 'Administrative Officer', 'مسؤول إداري')
ON CONFLICT (code) DO NOTHING;

INSERT INTO jobs (code, name_en, name_ar)
VALUES ('COMPENG', 'Computer Engineer', 'مهندس كمبيوتر')
ON CONFLICT (code) DO NOTHING;

INSERT INTO jobs (code, name_en, name_ar)
VALUES ('MKTMGR', 'Marketing Manager', 'مدير التسويق')
ON CONFLICT (code) DO NOTHING;

INSERT INTO jobs (code, name_en, name_ar)
VALUES ('MKTSPC', 'Marketing Specialist', 'أخصائي تسويق')
ON CONFLICT (code) DO NOTHING;

-- Step 4: Insert Employees (skip if employee_no exists)

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10028100000000',
  'The two pots',
  'الالفخان بافاخان',
  'India',
  (SELECT id FROM companies WHERE code = 'UNIFOOD'),
  (SELECT id FROM departments WHERE code = 'SALES'),
  (SELECT id FROM jobs WHERE code = 'SALES01'),
  'M5644020',
  '110894290',
  '2025-10-12'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10005100000000',
  'Muhammad Fayez Abu Bakr',
  'محمد فایز ابوبكر',
  'India',
  (SELECT id FROM companies WHERE code = 'UNIFOOD'),
  (SELECT id FROM departments WHERE code = 'FINANCE'),
  (SELECT id FROM jobs WHERE code = 'ACCT01'),
  'N8308013',
  '121557949',
  '2026-11-05'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10013100000000',
  'Haj Janid Bashir Ahmed Bashir Ahmed',
  'هج جانيد بشير احمد بشير احمد',
  'India',
  (SELECT id FROM companies WHERE code = 'UNIFOOD'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LOAD01'),
  'T2464520',
  '126668867',
  '2027-03-11'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10013000000000',
  'Shamir Belatotatel Ali Koya Ali Koya',
  'شمیر بیلاتوتاتیل علي كویا علي كویا',
  'India',
  (SELECT id FROM companies WHERE code = 'UNIFOOD'),
  (SELECT id FROM departments WHERE code = 'SALES'),
  (SELECT id FROM jobs WHERE code = 'SALESREP'),
  'Z3734865',
  '112668847',
  '2026-01-12'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10001100000000',
  'Sajir Milgalatsri Baramiat Sharif Milgalatsri Baramiat',
  'سجیر مانجالاسیرى بارامبات شریف مانجالاسیرى بارامبات',
  'India',
  (SELECT id FROM companies WHERE code = 'UNIFOOD'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'STOREASS'),
  'R0363652',
  '118901022',
  '2026-08-08'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10027100000000',
  'Sharon Kirubashan Uyikushthan Shanil Ayukukan',
  'شارون كربشان اوييكوشتان شانيل ايوكوكان',
  'India',
  (SELECT id FROM companies WHERE code = 'UNIFOOD'),
  (SELECT id FROM departments WHERE code = 'ADMIN'),
  (SELECT id FROM jobs WHERE code = 'FILECLK'),
  'U2390394',
  '119758197',
  '2026-09-16'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10026000000000',
  'Krishna Kumar Madambat Balakrishnan Baikat',
  'كریشنا كومار مادامبات بالاكریشنان بایكات',
  'India',
  (SELECT id FROM companies WHERE code = 'UNIFOOD'),
  (SELECT id FROM departments WHERE code = 'SALES'),
  (SELECT id FROM jobs WHERE code = 'SALES01'),
  'T5324324',
  '123638733',
  '2027-01-17'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10015100000000',
  'Sandeep Birosilishery Sivadasan',
  'سانديب بيروسيليشيرى سيفاداسان',
  'India',
  (SELECT id FROM companies WHERE code = 'UNIFOOD'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LOAD01'),
  'N1548078',
  '124105376',
  '2027-03-13'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10027100000000',
  'Vishnu Mambra Vigyan Mambra',
  'فیشنو مامبرا فیجایان مامبرا',
  'India',
  (SELECT id FROM companies WHERE code = 'UNIFOOD'),
  (SELECT id FROM departments WHERE code = 'SALES'),
  (SELECT id FROM jobs WHERE code = 'SALES01'),
  'P1430098',
  '112266824',
  '2026-02-11'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10028100000000',
  'Shah Hamid Sarfudin Sarfodine',
  'شاه الحمید سارفودین سارفودین',
  'India',
  (SELECT id FROM companies WHERE code = 'UNIFOOD'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LOAD01'),
  'P6441632',
  '116190696',
  '2026-07-16'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10021100000000',
  'Haj Shamil Kalamoolatil Akbar Katil Falikat',
  'هج شامل كالامولاتيل اكبر كاتيل فاليكات',
  'India',
  (SELECT id FROM companies WHERE code = 'UNIFOOD'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LOAD01'),
  'S8936061',
  '126048984',
  '2027-03-11'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10011100000000',
  'Muhammad Safwan Unin Kuti',
  'محمد صفوان اونین كوتى',
  'India',
  (SELECT id FROM companies WHERE code = 'UNIFOOD'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'STOREASS'),
  'N9611945',
  '110243956',
  '2025-09-20'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10020100000000',
  'Muhammad Sharif Abdul Wahid Muhammad Sharif',
  'محمد شریف عبدالوحید محمد شریف',
  'India',
  (SELECT id FROM companies WHERE code = 'REXDUBAI'),
  (SELECT id FROM departments WHERE code = 'ADMIN'),
  (SELECT id FROM jobs WHERE code = 'MSGR01'),
  'Y1057381',
  '125551408',
  '2027-03-10'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10025000000000',
  'Prakash Kanamkot Chandran',
  'براكاش كانامكوت شاندران',
  'India',
  (SELECT id FROM companies WHERE code = 'LIMO409'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'HTRUCKDR'),
  'M2306152',
  '107850986',
  '2025-08-01'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10013000000000',
  'Anshlachiri Partan Navin Kumar',
  'انشلاشیرى بارتان نفین كومار',
  'India',
  (SELECT id FROM companies WHERE code = 'LIMO409'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LDRV01'),
  'M6582814',
  '125778636',
  '2025-09-22'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10010000000000',
  'Padingarayil Shahu Padingarayil Moidoty',
  'بادینجاراییل شاھو بادینجاراییل مویدوتى',
  'India',
  (SELECT id FROM companies WHERE code = 'LIMO409'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LDRV01'),
  'N5183532',
  '110395510',
  '2025-10-07'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '20001000000000',
  'Muhammad Asghar Hashim Hussein',
  'محمد اصغر ھاشم حسین',
  'Pakistan',
  (SELECT id FROM companies WHERE code = 'LIMO409'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LDRV01'),
  'AE1821274',
  '111862979',
  '2025-12-17'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10015000000000',
  'Rashid Valiakat',
  'رشید فالیاكات',
  'India',
  (SELECT id FROM companies WHERE code = 'LIMO409'),
  (SELECT id FROM departments WHERE code = 'ADMIN'),
  (SELECT id FROM jobs WHERE code = 'ADMOFF'),
  'M1350603',
  '112095253',
  '2026-02-10'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10010100000000',
  'Manoj Kumar Kumbala Vettel Konhambu Tataran Vittel',
  'مانوج كومار كومبالا فیتیل كونھامبو تاتاران فیتیل',
  'India',
  (SELECT id FROM companies WHERE code = 'LIMO409'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LDRV01'),
  'X9002951',
  '115254832',
  '2026-05-28'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10013100000000',
  'Balakrishnan Caromatil Badinharitil Balan Caromatil',
  'بالاكریشنان كاروماتیل بادینھاریتیل بالان كاروماتیل',
  'India',
  (SELECT id FROM companies WHERE code = 'LIMO409'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LDRV01'),
  'V2035992',
  '116393993',
  '2026-05-28'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10015100000000',
  'Omar Tharayil Muhammad Firaw Compalatarayal',
  'عمر ثارایل محمد فیراو كومبالاتارایل',
  'India',
  (SELECT id FROM companies WHERE code = 'LIMO409'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LDRV01'),
  'P0100665',
  '119466298',
  '2026-09-18'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10015100000000',
  'Jazeel Bolambalavan Mustafa Bolambalavan',
  'جزیل بولامبالافان مصطفى بولامبالافان',
  'India',
  (SELECT id FROM companies WHERE code = 'LIMO409'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LDRV01'),
  'X727844',
  '122644781',
  '2027-02-08'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10001000000000',
  'Nasir Perovaziporat Moydoni TechPatail',
  'نصیر بیروفازیبورات مویدونى تیكیباتایل',
  'India',
  (SELECT id FROM companies WHERE code = 'LIMO409'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LDRV01'),
  'S3052386',
  '124325219',
  '2027-03-17'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '20001000000000',
  'Muhammad Shahzad Muhammad Aslam',
  'محمد شھزاد محمد اسلم',
  'Pakistan',
  (SELECT id FROM companies WHERE code = 'LIMO409'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LDRV01'),
  'QG5153152',
  '125738817',
  '2027-04-03'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10029100000000',
  'Muhammad Akram Muhammad Aslam',
  'محمد اكرم محمد اسلم',
  'India',
  (SELECT id FROM companies WHERE code = 'LEVERAGE'),
  (SELECT id FROM departments WHERE code = 'IT'),
  (SELECT id FROM jobs WHERE code = 'COMPENG'),
  'N7972096',
  '115143558',
  '2026-06-23'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10001100000000',
  'Syed Hussein Taher Syed Muhammad Pure',
  'سید حسین طاھر سید محمد طاھر',
  'India',
  (SELECT id FROM companies WHERE code = 'LEVERAGE'),
  (SELECT id FROM departments WHERE code = 'MARKETING'),
  (SELECT id FROM jobs WHERE code = 'MKTMGR'),
  'Z3280056',
  '116867650',
  '2026-08-05'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '20001000000000',
  'Muhammad Riaz Qurban Hussein',
  'محمد ریاض قربان حسین',
  'Pakistan',
  (SELECT id FROM companies WHERE code = 'SQFT'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LOAD01'),
  'AJ9914484',
  '113692438',
  '2026-03-21'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '20020100000000',
  'God bless Muhammad Sharif',
  'لله بخش محمد شریف',
  'Pakistan',
  (SELECT id FROM companies WHERE code = 'SQFT'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LOAD01'),
  'DP3349452',
  '113688711',
  '2026-03-27'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '30223100000000',
  'Muhammad Farouk Ahmed Namur',
  'محمد فاروق احمد نامور',
  'Iran',
  (SELECT id FROM companies WHERE code = 'SQFT'),
  (SELECT id FROM departments WHERE code = 'MARKETING'),
  (SELECT id FROM jobs WHERE code = 'MKTSPC'),
  'A97015284',
  '113404744',
  '2026-04-02'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10014100000000',
  'Abdullah Sufyan Muhammad Shams Al-Din',
  'عبدلله سفیان محمد شمس الدین',
  'India',
  (SELECT id FROM companies WHERE code = 'SQFT'),
  (SELECT id FROM departments WHERE code = 'SALES'),
  (SELECT id FROM jobs WHERE code = 'SALES01'),
  'N4909305',
  '120622830',
  '2026-10-31'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10016100000000',
  'Samir Jaws Sheikh Jaws Amin Sheikh',
  'سامیر جاوس شیخ جاوس امين شیخ',
  'India',
  (SELECT id FROM companies WHERE code = 'SQFT'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LOAD01'),
  'W5311278',
  '120701425',
  '2026-11-18'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10020100000000',
  'Muhammad Hanif Jawas Sheikh Jawas Amin Sheikh',
  'محمد حنیف جاوس شیخ جاوس امین شیخ',
  'India',
  (SELECT id FROM companies WHERE code = 'SQFT'),
  (SELECT id FROM departments WHERE code = 'ADMIN'),
  (SELECT id FROM jobs WHERE code = 'MSGR01'),
  'Y1988584',
  '121825532',
  '2027-01-13'
)
ON CONFLICT (employee_no) DO NOTHING;

INSERT INTO employees (
  employee_no, name_en, name_ar, nationality,
  company_id, department_id, job_id,
  passport_no, card_no, card_expiry
)
VALUES (
  '10001100000000',
  'Check Farid Muhammad Ansari My supporters',
  'یك فرید محمد انصارى انصارى',
  'India',
  (SELECT id FROM companies WHERE code = 'SQFT'),
  (SELECT id FROM departments WHERE code = 'OPS'),
  (SELECT id FROM jobs WHERE code = 'LOAD01'),
  'T2197937',
  '124895027',
  '2027-04-07'
)
ON CONFLICT (employee_no) DO NOTHING;

COMMIT;

-- Verification Queries
SELECT COUNT(*) as total_companies FROM companies;
SELECT COUNT(*) as total_departments FROM departments;
SELECT COUNT(*) as total_jobs FROM jobs;
SELECT COUNT(*) as total_employees FROM employees;

-- View inserted employees
SELECT e.employee_no, e.name_en, c.name_en as company, d.name_en as department, j.name_en as job
FROM employees e
JOIN companies c ON e.company_id = c.id
JOIN departments d ON e.department_id = d.id
JOIN jobs j ON e.job_id = j.id
ORDER BY e.employee_no;