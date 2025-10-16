-- ============================================================================
-- COMPLETE EMPLOYEE IMPORT - ALL EMPLOYEES
-- ============================================================================
-- This script imports ALL employees from your text file
-- Safe to run multiple times (uses WHERE NOT EXISTS)
-- ============================================================================

BEGIN;

-- Insert all employees
INSERT INTO employees (
    employee_no, name_en, name_ar, nationality,
    company_id, department_id, job_id,
    passport_no, card_expiry, emirates_id, emirates_id_expiry,
    residence_no, residence_expiry
)
SELECT '10005100000000', 'Revikumar Combibuykayil Tankan Babu Tankan', 'ریفیكومار كومبیبویكاییل تانكان بابو تانكان', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'ARCHIV_CLERK'),
    'R1129589', '2025-12-11'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10005100000000')

UNION ALL

SELECT '10001100000000', 'Sakir Nouh Muhammad Nooh', 'ساكیر نوح محمد نوح', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'STORE_HELPER'),
    'N6229814', '2025-12-22'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10001100000000')

UNION ALL

SELECT '10004000000000', 'Abubakar Siddiq Chinamula House Abdulrahman', 'ابوبكر صدیق شینایمولا ھاوس عبدالرحمن', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'N7809671', '2026-01-22'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10004000000000')

UNION ALL

SELECT '10015100000000', 'Ramshad Abdurashid Abdurashid Kizhaka Kouti', 'رامشاد عبدالرشيد عبدالرشيد كيزهاكا كوتي', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'M4981781', '2026-02-04'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10015100000000')

UNION ALL

SELECT '10011100000000', 'Ahmed Jawad Nalakam Baramba Abdul Latif', 'احمد جواد نالاكام بارامبا عبداللطیف', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'T3421760', '2026-02-27'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10011100000000')

UNION ALL

SELECT '10021100000000', 'Afzal Ali Knayorat Fakliil Ali', 'افضل على كنايورات فاكلييل على', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'ACCOUNTS'),
    (SELECT id FROM jobs WHERE code = 'ACCOUNTANT'),
    'Y8802147', '2026-03-04'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10021100000000')

UNION ALL

SELECT '10029100000000', 'Sairaj Rajendran Nair Syamala Tankapan Pray Rajendran', 'سایراج راجیندران نایر سیامالا تانكابان بیلاى راجیندران', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'MESSENGER'),
    'V4436838', '2026-09-16'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10029100000000')

UNION ALL

SELECT '10026000000000', 'Ajeesh Raveendran Raveendran Velayudhan', 'اجیش رافیندران رافیندران فیلایودان', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'STORE_HELPER'),
    'V4944093', '2026-09-19'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10026000000000')

UNION ALL

SELECT '10002000000000', 'Aneesh Viswanat Viswanathan Nair', 'انیش فیسوانات فیسواناتان نایر', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'STORE_HELPER'),
    'Y7293208', '2026-09-24'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10002000000000')

UNION ALL

SELECT '10030000000000', 'Abdul-Naseer Karat Indomay Haji Karat', 'عبدالنصیر كارات اندوماى حاجى كارات', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'FILE_CLERK'),
    'V2112862', '2026-09-25'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10030000000000')

UNION ALL

SELECT '10013100000000', 'Muzali Balaraman Balaraman', 'موزالي بالارامان بالارامان', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'SALES_MANAGER'),
    'Z4040782', '2026-10-03'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10013100000000')

UNION ALL

SELECT '10031000000000', 'Monshir Bhutia Vetyl Ayamony Bhutia Vetil', 'مونشیر بوتیا فیتیل ایامونى بوثیاء فیتیل', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'P3455487', '2026-12-10'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10031000000000')

UNION ALL

SELECT '20017100000000', 'Mohammed Hassib Mahammad Hussein', 'محمد حسيب محمد حسين', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'AK6835822', '2027-02-09'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20017100000000')

UNION ALL

SELECT '10001100000000', 'Sandeep Blue Jouda', 'سانديب بلو جودا', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'V1757046', '2027-02-19'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10001100000000')

UNION ALL

SELECT '10028100000000', 'Santip Pasupalan Blue Pasupalan', 'سانتيب باسوبالان بلو باسوبالان', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'W7790131', '2025-08-16'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10028100000000')

UNION ALL

SELECT '10028100000000', 'The two pots', 'الالفخان بافاخان', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'M5644020', '2025-10-12'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10028100000000')

UNION ALL

SELECT '10007100000000', 'Muhammad Nabhal Batamru Valabil', 'محمد نبھال باتامرو فالابیل', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'ACCOUNTS'),
    (SELECT id FROM jobs WHERE code = 'ACCOUNTANT'),
    'P4167868', '2025-12-19'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10007100000000')

UNION ALL

SELECT '10029000000000', 'Muhammad Khan Muhammad Abdan Muhammad Abdan', 'محمد خان محمد عبدان محمد عبدان', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'X9289866', '2025-12-18'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10029000000000')

UNION ALL

SELECT '10025000000000', 'Irfan Faizi Faizi Abdul Rahman Kongo', 'عرفان فایزى فایزى عبدالرحمن كونجو', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'R3214626', '2026-01-02'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10025000000000')

UNION ALL

SELECT '10021000000000', 'Naseer Vaishyamvittil Shamsuddin Shamsuddin', 'نصیر فیشیامفیتیل شمس الدین شمس الدین', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'V4947819', '2026-02-27'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10021000000000')

UNION ALL

SELECT '31619100000000', 'Rokman Rana Tilak Singh Rana', 'روكمان رانا تيلاك سينغ رانا', 'Nepal',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    '10704627', '2026-07-01'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '31619100000000')

UNION ALL

SELECT '10012100000000', 'Harikrishnan Karumatil Vellapulli Krishnakumar Aerur Korat', 'ھاریكریشنان كاروماتیل فیلیلابولى كریشناكومار ایرور كورات', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'V5211484', '2026-07-15'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10012100000000')

UNION ALL

SELECT '31615000000000', 'Sandeep Kumar Tejim', 'سانديب كرمار تيجيم', 'Nepal',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'PA1653246', '2026-10-30'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '31615000000000')

UNION ALL

SELECT '10005100000000', 'Muhammad Fayez Abu Bakr', 'محمد فایز ابوبكر', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'ACCOUNTS'),
    (SELECT id FROM jobs WHERE code = 'ACCOUNTANT'),
    'N8308013', '2026-11-05'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10005100000000')

UNION ALL

SELECT '20016100000000', 'Imran Khan Amjad Hussain', 'عمران خان امجد حسين', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'GD4134933', '2026-12-24'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20016100000000')

UNION ALL

SELECT '2102070000000', 'Sarah Ibrahim Ahmed Damhm Al-Marzouki', 'ساره ابراهيم احمد دمحم المرزوقي', 'United Arab Emirates',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'FILE_CLERK'),
    'R13G76644', '2027-02-15'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '2102070000000')

UNION ALL

SELECT '10013100000000', 'Haj Janid Bashir Ahmed Bashir Ahmed', 'هج جانيد بشير احمد بشير احمد', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'T2464520', '2027-03-11'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10013100000000')

UNION ALL

SELECT '10024000000000', 'Sharif Sobkoni Sobkoni', 'شريف سوبركوني سوبركوني', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'ARCHIV_CLERK'),
    'T6905780', '2027-07-07'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10024000000000')

UNION ALL

SELECT '10013000000000', 'Javila Vadakiel Muhammad', 'جافیلا فاداكییل محمد', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'MARKETING'),
    (SELECT id FROM jobs WHERE code = 'MARKETING_MGR'),
    'N8156535', '2025-12-17'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10013000000000')

UNION ALL

SELECT '10013000000000', 'Shamir Belatotatel Ali Koya Ali Koya', 'شمیر بیلاتوتاتیل علي كویا علي كویا', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_REP'),
    'Z3734865', '2026-01-12'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10013000000000')

UNION ALL

SELECT '10019100000000', 'Abdul Razzaq Valiyakat Tarail Mamat Abdullah Haji', 'عبدالرزاق فالیاكات تارایل مامات عبدلله حاجى', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'V1011593', '2026-02-07'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10019100000000')

UNION ALL

SELECT '31623100000000', 'Chhet Bahadur Karki Chhetri', 'شيت بهادور كاركي شيتري', 'Nepal',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'STORE_HELPER'),
    '09176822', '2026-02-19'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '31623100000000')

UNION ALL

SELECT '10001100000000', 'Sajir Milgalatsri Baramiat Sharif Milgalatsri Baramiat', 'سجیر مانجالاسیرى بارامبات شریف مانجالاسیرى بارامبات', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'STORE_HELPER'),
    'R0363652', '2026-08-08'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10001100000000')

UNION ALL

SELECT '10027100000000', 'Mohamed Mustafa Fata Brambil Booker Fata Brambil', 'محمد مصطفى فاتا برمبیل بوكر فاتا برمبیل', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'FILE_CLERK'),
    'R4139111', '2026-09-05'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10027100000000')

UNION ALL

SELECT '10027100000000', 'Sharon Kirubashan Uyikushthan Shanil Ayukukan', 'شارون كربشان اوييكوشتان شانيل ايوكوكان', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'FILE_CLERK'),
    'U2390394', '2026-09-16'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10027100000000')

UNION ALL

SELECT '10026000000000', 'Krishna Kumar Madambat Balakrishnan Baikat', 'كریشنا كومار مادامبات بالاكریشنان بایكات', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'T5324324', '2027-01-17'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10026000000000')

UNION ALL

SELECT '10015100000000', 'Sandeep Birosilishery Sivadasan', 'سانديب بيروسيليشيرى سيفاداسان', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'N1548078', '2027-03-13'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10015100000000')

UNION ALL

SELECT '10025100000000', 'Muhammad Muzammil Kutiyil Sulaiman Suleiman Kotiel Sheria Muhammad', 'محمد مزمل كوتییل سلیمان سلیمان كوتییل شیریا محمد', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'N1962001', '2026-01-27'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10025100000000')

UNION ALL

SELECT '10027100000000', 'Vishnu Mambra Vigyan Mambra', 'فیشنو مامبرا فیجایان مامبرا', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'P1430098', '2026-02-11'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10027100000000')

UNION ALL

SELECT '20016000000000', 'Ziaur Rahman Foulad Khan', 'ضياء الرحمان فولاد خان', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'NT9152682', '2026-05-15'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20016000000000')

UNION ALL

SELECT '10028100000000', 'Shah Hamid Sarfudin Sarfodine', 'شاه الحمید سارفودین سارفودین', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'P6441632', '2026-07-16'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10028100000000')

UNION ALL

SELECT '10018000000000', 'Sabine Mambata Baburaj Baburaj', 'سابین مامباتا بابوراج بابوراج', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'R1844137', '2026-08-08'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10018000000000')

UNION ALL

SELECT '10003100000000', 'Yawer Hussain Anwar Hussain', 'ياور حسين انور حسين', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'STORE_HELPER'),
    'P4046288', '2026-09-10'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10003100000000')

UNION ALL

SELECT '10017100000000', 'Shajan Sami Ravindran Sami', 'شاجان سامي رافيندران سامي', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'U0829668', '2026-10-10'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10017100000000')

UNION ALL

SELECT '10020100000000', 'Habib Allah Mouton Bufadinkizil Abdullah Mutari Musaliari Valabilil', 'حبیب لله موتون بوفاذینكیزیل عبدلله موتارى موسالیارى فالابیل', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'X9282438', '2026-12-16'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10020100000000')

UNION ALL

SELECT '20017000000000', 'Adnan Mahdi Abed Hussein', 'عدنان مهدى عابد حسين', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'AK0170053', '2027-01-29'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20017000000000')

UNION ALL

SELECT '20021000000000', 'Mohammed Salman Mohammed Ali Khan', 'محمد سلمان محمد على خان', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'FA5754633', '2027-02-07'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20021000000000')

UNION ALL

SELECT '10021100000000', 'Haj Shamil Kalamoolatil Akbar Katil Falikat', 'هج شامل كالامولاتيل اكبر كاتيل فاليكات', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'S8936061', '2027-03-11'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10021100000000')

UNION ALL

SELECT '30320100000000', 'Muhammad Nimnas Imam', 'محمد نیمناس امام', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'N9420240', '2026-09-19'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '30320100000000')

UNION ALL

SELECT '10011100000000', 'Muhammad Safwan Unin Kuti', 'محمد صفوان اونین كوتى', 'India',
    (SELECT id FROM companies WHERE code = 'UNIFOOD'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'STORE_HELPER'),
    'N9611945', '2025-09-20'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10011100000000')

UNION ALL

SELECT '10061000000000', 'Chandran Tiru Vampadi Konhapa Tiro fanbade', 'شندران تیرو فامبادى كونھابا تیرو فانبادى', 'India',
    (SELECT id FROM companies WHERE code = 'REXDUBAI'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'KIOSK_SALES'),
    'X9271301', '2025-12-21'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10061000000000')

UNION ALL

SELECT '413048000000', 'Amani Adnan Al-Baytar', 'اماني عدنان البیطار', 'Australia',
    (SELECT id FROM companies WHERE code = 'REXDUBAI'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'ARCHIV_CLERK'),
    'N00408358', '2026-01-01'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '413048000000')

UNION ALL

SELECT '10010000000000', 'Jamalu Kulotumparambil Abdo Kulotumparambil Abdo', 'جمالو كولوتومبارامبیل عبدو كولوتومبارامبیل عبدو', 'India',
    (SELECT id FROM companies WHERE code = 'REXDUBAI'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'S9776856', '2026-12-31'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10010000000000')

UNION ALL

SELECT '10020100000000', 'Muhammad Sharif Abdul Wahid Muhammad Sharif', 'محمد شریف عبدالوحید محمد شریف', 'India',
    (SELECT id FROM companies WHERE code = 'REXDUBAI'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'MESSENGER'),
    'Y1057381', '2027-03-10'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10020100000000')

UNION ALL

SELECT '30115100000000', 'Mohammed Jalal Ahmed Mohammed Najm Al-Huda', 'محمد جلال احمد محمد نجم الھدى', 'Bangladesh',
    (SELECT id FROM companies WHERE code = 'REXDUBAI'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'EG0953040', '2027-02-02'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '30115100000000')

UNION ALL

SELECT '930107000000', 'Atef Othman Mohammed Omar', 'عاطف عثمان محمد عمر', 'Sudan',
    (SELECT id FROM companies WHERE code = 'REXDUBAI'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'TRANSLATOR'),
    'P07911649', '2027-06-07'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '930107000000')

UNION ALL

SELECT '30216100000000', 'Souda Mohammed Abbad', 'سوده محمد عباد', 'ايران',
    (SELECT id FROM companies WHERE code = 'REXDUBAI'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'KIOSK_SALES'),
    'U97721079', '2027-07-02'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '30216100000000')

UNION ALL

SELECT '30223100000000', 'Ashraf Mukhtar is real', 'اشرف مختار حقیقى', 'Iran',
    (SELECT id FROM companies WHERE code = 'REXDUBAI'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'FILE_CLERK'),
    'Z97570536', '2027-07-19'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '30223100000000')

UNION ALL

SELECT '406106000000', 'Muhammad Abdel Razzaq Ahmed Takala', 'محمد عبدالرزاق احمد تقاله', 'Syria',
    (SELECT id FROM companies WHERE code = 'REXDUBAI'),
    (SELECT id FROM departments WHERE code = 'MARKETING'),
    (SELECT id FROM jobs WHERE code = 'MARKETING_SPEC'),
    'N013455866', '2027-08-25'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '406106000000')

UNION ALL

SELECT '10001000000000', 'Nanha Ahmed Habib Ahmed', 'نانھى احمد حبیب احمد', 'الھند',
    (SELECT id FROM companies WHERE code = 'REXDUBAI'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'W5313997', '2027-11-02'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10001000000000')

UNION ALL

SELECT '221050000000', 'Joanna Amir Sheikh Suleiman', 'جوانا امیر شیخ سلیمان', 'Lebanon',
    (SELECT id FROM companies WHERE code = 'MINTART'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'LR2411715', '2025-10-13'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '221050000000')

UNION ALL

SELECT '31101000000000', 'Abdul-Mateen Abdul-Wakil', 'عبدالمتین عبدالوكیل', 'Afghanistan',
    (SELECT id FROM companies WHERE code = 'MINTART'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'P05627043', '2026-04-28'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '31101000000000')

UNION ALL

SELECT '40603100000000', 'Proscovia Namucca', 'بروسكوفیا ناموكا', 'Uganda',
    (SELECT id FROM companies WHERE code = 'MINTART'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'B1534251', '2027-01-19'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '40603100000000')

UNION ALL

SELECT '31603100000000', 'Rajendra Karke Bir Bahadur Karke', 'راجیندرا كاركى بیر بھادور كاركى', 'Nepal',
    (SELECT id FROM companies WHERE code = 'MINTART'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'FILE_CLERK'),
    '12616902', '2027-04-30'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '31603100000000')

UNION ALL

SELECT '10025000000000', 'Prakash Kanamkot Chandran', 'براكاش كانامكوت شاندران', 'الھند',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'HEAVY_DRIVER'),
    'M2306152', '2025-08-01'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10025000000000')

UNION ALL

SELECT '10015000000000', 'Abdul Latif Anshuti Konica Valabel', 'عبداللطیف انشوتى كونیكا فالابیل', 'الھند',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'ACCOUNTS'),
    (SELECT id FROM jobs WHERE code = 'ACCOUNTANT'),
    'T8483811', '2025-09-20'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10015000000000')

UNION ALL

SELECT '10013000000000', 'Anshlachiri Partan Navin Kumar', 'انشلاشیرى بارتان نفین كومار', 'الھند',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'M6582814', '2025-09-22'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10013000000000')

UNION ALL

SELECT '10010000000000', 'Padingarayil Shahu Padingarayil Moidoty', 'بادینجاراییل شاھو بادینجاراییل مویدوتى', 'India',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'N5183532', '2025-10-07'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10010000000000')

UNION ALL

SELECT '10003000000000', 'Muhammad Yassin Kasma Abdul Qadir', 'محمد یاسین كاسما عبدالقادر', 'الھند',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'ACCOUNTS'),
    (SELECT id FROM jobs WHERE code = 'ASST_ACCOUNTANT'),
    'V7723433', '2025-10-14'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10003000000000')

UNION ALL

SELECT '20001000000000', 'Muhammad Aslam Hashem Hussein', 'محمد اسلم ھاشم حسین', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'AN1803144', '2025-10-16'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20001000000000')

UNION ALL

SELECT '20001000000000', 'Muhammad Asghar Hashim Hussein', 'محمد اصغر ھاشم حسین', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'AE1821274', '2025-12-17'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20001000000000')

UNION ALL

SELECT '10015000000000', 'Rashid Valiakat', 'رشید فالیاكات', 'الھند',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'ADMIN_OFFICER'),
    'M1350603', '2026-02-10'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10015000000000')

UNION ALL

SELECT '10010100000000', 'Muhammad Qasim Konhosan Markarakat', 'محمد قاسم كونھوسان ماركاراكات', 'الھند',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'V3351481', '2026-03-03'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10010100000000')

UNION ALL

SELECT '401018000000', 'Firas Abdul Jalil Naway', 'فراس عبدالجلیل نواى', 'سوریا',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'PURCHASER'),
    'N00076317', '2026-04-10'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '401018000000')

UNION ALL

SELECT '20007000000000', 'Ali Akbar ghulam Akbar', 'على اكبر غلام اكبر', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'MESSENGER'),
    'XJ1339781', '2026-05-04'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20007000000000')

UNION ALL

SELECT '10010100000000', 'Manoj Kumar Kumbala Vettel Konhambu Tataran Vittel', 'مانوج كومار كومبالا فیتیل كونھامبو تاتاران فیتیل', 'الھند',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'X9002951', '2026-05-28'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10010100000000')

UNION ALL

SELECT '10013100000000', 'Balakrishnan Caromatil Badinharitil Balan Caromatil', 'بالاكریشنان كاروماتیل بادینھاریتیل بالان كاروماتیل', 'India',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'V2035992', '2026-05-28'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10013100000000')

UNION ALL

SELECT '10014100000000', 'Tarail Kunhimon Santosh Tarail Kunhimon', 'تارایل كونھیمون سانتوش تارایل كونھیمون', 'India',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'C1374314', '2026-08-10'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10014100000000')

UNION ALL

SELECT '10031100000000', 'Bramond Manufactil Villa Yudhan Manyidathil', 'براموند مانییداتیل فیلا یودھان مانییداتھیل', 'الھند',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'S2009031', '2026-08-13'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10031100000000')

UNION ALL

SELECT '20020100000000', 'Muhammad Rafiq Aman, may God protect him', 'محمد رفیق امان لله', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'BF9560573', '2026-08-21'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20020100000000')

UNION ALL

SELECT '20006100000000', 'Muhammad Ashraf Hashem Hussein', 'محمد اشرف ھاشم حسین', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'DD1848223', '2026-08-23'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20006100000000')

UNION ALL

SELECT '10015100000000', 'Omar Tharayil Muhammad Firaw Compalatarayal', 'عمر ثارایل محمد فیراو كومبالاتارایل', 'India',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'P0100665', '2026-09-18'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10015100000000')

UNION ALL

SELECT '30221000000000', 'Hassan Gholam Rafiei', 'حسن غلام رفیعى', 'Iran',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'A97045014', '2026-10-10'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '30221000000000')

UNION ALL

SELECT '10015100000000', 'Jazeel Bolambalavan Mustafa Bolambalavan', 'جزیل بولامبالافان مصطفى بولامبالافان', 'الھند',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'X727844', '2027-02-08'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10015100000000')

UNION ALL

SELECT '10001000000000', 'Nasir Perovaziporat Moydoni TechPatail', 'نصیر بیروفازیبورات مویدونى تیكیباتایل', 'الھند',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'S3052386', '2027-03-17'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10001000000000')

UNION ALL

SELECT '20001000000000', 'Muhammad Shahzad Muhammad Aslam', 'محمد شھزاد محمد اسلم', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'QG5153152', '2027-04-03'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20001000000000')

UNION ALL

SELECT '10062000000000', 'Bhuvanjal Prabhakaran Bhuvattingal Raman', 'بوفاتینجال برابھاكاران بوفاتینجال رامان', 'الھند',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'W3243862', '2027-08-11'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10062000000000')

UNION ALL

SELECT '10016000000000', 'Sunil Kumar Analiparambil Flow', 'سونیل كومار انالیبارامبیل فلو', 'India',
    (SELECT id FROM companies WHERE code = 'LIMO409'),
    (SELECT id FROM departments WHERE code = 'DRIVERS'),
    (SELECT id FROM jobs WHERE code = 'LIGHT_DRIVER'),
    'V7746334', '2027-08-29'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10016000000000')

UNION ALL

SELECT '20004100000000', 'Amber Iqbal Javed Iqbal', 'عمبر اقبال جاوید اقبال', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'LEVERAGE'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'FILE_CLERK'),
    'PF1334702', '2025-11-07'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20004100000000')

UNION ALL

SELECT '10029100000000', 'Muhammad Akram Muhammad Aslam', 'محمد اكرم محمد اسلم', 'India',
    (SELECT id FROM companies WHERE code = 'LEVERAGE'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'COMP_ENGINEER'),
    'N7972096', '2026-06-23'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10029100000000')

UNION ALL

SELECT '10001100000000', 'Syed Hussein Taher Syed Muhammad Pure', 'سید حسین طاھر سید محمد طاھر', 'الھند',
    (SELECT id FROM companies WHERE code = 'LEVERAGE'),
    (SELECT id FROM departments WHERE code = 'MARKETING'),
    (SELECT id FROM jobs WHERE code = 'MARKETING_MGR'),
    'Z3280056', '2026-08-05'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10001100000000')

UNION ALL

SELECT '231079000000', 'Ali Hassan Darwish', 'على حسن درویش', 'Lebanon',
    (SELECT id FROM companies WHERE code = 'LEVERAGE'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'LR1590829', '2026-11-09'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '231079000000')

UNION ALL

SELECT '20027000000000', 'ایروم اقبال محمد دانش سلام بخارى', 'ایروم اقبال محمد دانش سلام بخارى', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'LEVERAGE'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'SALES_MANAGER'),
    'FB1331353', '2027-04-03'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20027000000000')

UNION ALL

SELECT '405108000000', 'Astronomy of Nouri Bejo', 'فلك نورى بیجو', 'Syria',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'SECRETARY'),
    'N013939266', '2025-11-01'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '405108000000')

UNION ALL

SELECT '51917100000000', 'Sila Zaman', 'سیلا زمان', 'Turkey',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'MARKETING_MGR'),
    'U26166870', '2025-12-14'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '51917100000000')

UNION ALL

SELECT '10031100000000', 'Manoj Kumar Palathanam Madhavan Nair Thanakappan Nair', 'مانوج كومار بلاتھانام مادھافان نایر تھانكابان نایر', 'الھند',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'FILE_CLERK'),
    'V1000612', '2026-10-22'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10031100000000')

UNION ALL

SELECT '20001000000000', 'Muhammad Riaz Qurban Hussein', 'محمد ریاض قربان حسین', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'AJ9914484', '2026-03-21'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20001000000000')

UNION ALL

SELECT '20020100000000', 'God bless Muhammad Sharif', 'لله بخش محمد شریف', 'Pakistan',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'DP3349452', '2026-03-27'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '20020100000000')

UNION ALL

SELECT '30223100000000', 'Muhammad Farouk Ahmed Namur', 'محمد فاروق احمد نامور', 'Iran',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'MARKETING'),
    (SELECT id FROM jobs WHERE code = 'MARKETING_SPEC'),
    'A97015284', '2026-04-02'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '30223100000000')

UNION ALL

SELECT '30411000000000', 'Marivic Gael Aguilar', 'ماریفیك جایل اجویلار', 'Philippines',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'COMM_ASST'),
    'P6035007C', '2026-05-17'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '30411000000000')

UNION ALL

SELECT '10023100000000', 'Salah Iqbal Fairfire', 'صلاح اقبال فیرفیرى', 'الھند',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'ACCOUNTS'),
    (SELECT id FROM jobs WHERE code = 'ACCOUNTANT'),
    'P9057652', '2026-08-15'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10023100000000')

UNION ALL

SELECT '10016100000000', 'Jassim Ahmed Jamal Mohammed Jamal Mohammed', 'جاسم احمد جمال محمد جمال محمد', 'India',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'STOREKEEPER'),
    'P8781545', '2026-10-01'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10016100000000')

UNION ALL

SELECT '10014100000000', 'Abdullah Sufyan Muhammad Shams Al-Din', 'عبدلله سفیان محمد شمس الدین', 'الھند',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'N4909305', '2026-10-31'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10014100000000')

UNION ALL

SELECT '10022100000000', 'Deepak Kumar Lahori Ram', 'دیباك كومار لاھورى رام', 'India',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'C1642696', '2026-10-31'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10022100000000')

UNION ALL

SELECT '30230100000000', 'Nasir Aziz Allahu Akili', 'ناصر عزیز لله عقیلى', 'Iran',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'GENERAL_MGR'),
    '196903974', '2026-11-06'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '30230100000000')

UNION ALL

SELECT '10018100000000', 'Muhammad Riyas Abdul Hakim Abdul Hakim', 'محمد ریاس عبدالحكیم عبدالحكیم', 'الھند',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'SALES'),
    (SELECT id FROM jobs WHERE code = 'SALES_STAFF'),
    'Z2653453', '2026-11-09'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10018100000000')

UNION ALL

SELECT '10016100000000', 'Samir Jaws Sheikh Jaws Amin Sheikh', 'سامیر جاوس شیخ جاوس امین شیخ', 'الھند',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'W5311278', '2026-11-18'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10016100000000')

UNION ALL

SELECT '30423000000000', 'Now the Ajao Pimentil', 'الان الاجاو بیمینتیل', 'Philippines',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'P7337982B', '2026-11-18'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '30423000000000')

UNION ALL

SELECT '10020100000000', 'Muhammad Hanif Jawas Sheikh Jawas Amin Sheikh', 'محمد حنیف جاوس شیخ جاوس امین شیخ', 'الھند',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'ADMIN'),
    (SELECT id FROM jobs WHERE code = 'MESSENGER'),
    'Y1988584', '2027-01-13'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10020100000000')

UNION ALL

SELECT '10001100000000', 'Check Farid Muhammad Ansari My supporters', 'یك فرید محمد انصارى انصارى', 'India',
    (SELECT id FROM companies WHERE code = 'SQFT'),
    (SELECT id FROM departments WHERE code = 'WAREHOUSE'),
    (SELECT id FROM jobs WHERE code = 'LOADER'),
    'T2197937', '2027-04-07'::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '10001100000000')

UNION ALL

SELECT '1', 'INOKA UKWATTA LIYANAGE', 'انوكا اوكواتا لياناجى', 'Sri Lanka',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'N8390271', NULL::date, NULL::varchar, NULL::date, '101/2020/7/4990', '2020-03-16'::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '1')

UNION ALL

SELECT '2', 'MYLENE ANI BUCO', 'ميلين عانى بوكو', 'Philippines',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'P7104572C', NULL::date, '784-199078033000', NULL::date, '101/2025/7/73685', NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '2')

UNION ALL

SELECT '3', 'Arlyn Palioto Aban', 'ارلين باليوتو ابان', 'Philippines',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'P8045754A', NULL::date, '784-1986-4741025', '2025-06-12'::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '3')

UNION ALL

SELECT '33', 'JAINUL ABDEEN MOHD MAHMOOD', 'جاينول عابدين محمد محمود', 'الھند',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'S1310248', NULL::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '33')

UNION ALL

SELECT '333', 'Jennifer Reyes Ronquillo', 'جينيفر ريس رونقويلو', 'Philippines',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'EC3399598', NULL::date, '784-1987-7414046-5', '2024-12-13'::date, '201/2015/7132269', NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '333')

UNION ALL

SELECT '3333', 'Ma Remina Bernadas Antiquiera', 'ما ريمينا بيرناداس انتيكورا', 'Philippines',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'EB7934664', NULL::date, NULL::varchar, NULL::date, '201/2014/7131997', '2019-05-13'::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '3333')

UNION ALL

SELECT '4', 'ALEWUYA HASSEN SEID', 'العويوه حسن سيد', 'Ethiopia',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'EP7858776', NULL::date, NULL::varchar, NULL::date, '201/0724169222', NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '4')

UNION ALL

SELECT '44', 'KUSTINAH BT KROMOTARUNA BUDI', 'كوستينه بي تي كروموتارونا بودي', 'Indonesia',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'C5061626', NULL::date, '784-1962-7438505-1', '2027-03-07'::date, '201/2009/7/22709', '2021-03-07'::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '44')

UNION ALL

SELECT '444', 'MESERET DEGEFA BEDADA', 'ميسريتى ديجافا بيدادا', 'Ethiopia',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'EP6284507', NULL::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '444')

UNION ALL

SELECT '4444', 'Samin Bt Neman Bulus', 'سامين بت نعمان بولوس', 'Indonesia',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'C7695621', NULL::date, '784-1971-5385281-5', '2022-02-17'::date, '201/2013/7221406', '2024-02-17'::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '4444')

UNION ALL

SELECT '44444', 'SUMIYATI BT DAMAN CASMITA', 'سومياتى بت دامان كاسميتا', 'Indonesia',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    NULL::varchar, NULL::date, '784-1986-604-7105-7', NULL::date, '201/2021/7567736', '2024-01-19'::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '44444')

UNION ALL

SELECT '5', 'RAMYALATHA SILVA LATHTHUHANDIGE', 'راميااتنهت سيلفا لاثثو هانديجي', 'Sri Lanka',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'N5903780', NULL::date, '784-1962-4187036-7', NULL::date, '201/2005/7002687', '2019-08-14'::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '5')

UNION ALL

SELECT '6', 'CHARISSE PULGAN GRANDE', 'شاريسى بولجان جراندى', 'Philippines',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'P1302554C', NULL::date, '784-1994-8786141-3', NULL::date, '101/2023/7/6872', '2025-04-26'::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '6')

UNION ALL

SELECT '66', 'Fanose Abiti Salilew', 'فانوس ابيتى ساليليو', 'Ethiopia',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'EP8059404', NULL::date, '784-1990-2470479-5', '2026-08-11'::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '66')

UNION ALL

SELECT '7', 'Sukaisih Basiran Kurdi', 'سوكا يسيح بباسيران كوردى', 'Indonesia',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'A8794899', NULL::date, NULL::varchar, NULL::date, '201/2014/7217100', '2017-06-24'::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '7')

UNION ALL

SELECT '8', 'Mary Jean Amaro Al Tarijos', 'مارى جين امارو ال تاريجوس', 'Philippines',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'P4761469C', NULL::date, '784-1985-2779199-4', '2026-02-21'::date, '201/2022/7/152003', '2026-02-21'::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '8')

UNION ALL

SELECT '88', 'Reynalyn Lopena Bendicio', 'رينالين لوبنا بنديكيو', 'Philippines',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'P1446758B', NULL::date, '784-1984-9805857-1', '2026-12-18'::date, '20120187478939', NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '88')

UNION ALL

SELECT '9', 'Lelit Dagoc Tirariray', 'ليليت داجوك تير ابرارى', 'Philippines',
    (SELECT id FROM companies WHERE code = 'MAIDS'),
    (SELECT id FROM departments WHERE code = 'HOUSEKEEPING'),
    (SELECT id FROM jobs WHERE code = 'MAID'),
    'P5773149A', NULL::date, '784-1990-09982830-5', NULL::date, '101/2024/7/206152', '2027-03-18'::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '9')

UNION ALL

SELECT '232134324', 'الفنااانا', 'الفنان', 'France',
    (SELECT id FROM companies WHERE code = 'HONDA'),
    (SELECT id FROM departments WHERE code = 'ACCOUNTS'),
    (SELECT id FROM jobs WHERE code = 'ACCOUNTANT'),
    NULL::varchar, NULL::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '232134324')

UNION ALL

SELECT '5464520000000000', 'Khaled Ahmad Takala', 'خالد أحمد تقالة', 'Syria',
    (SELECT id FROM companies WHERE code = 'MEB'),
    (SELECT id FROM departments WHERE code = 'ACCOUNTS'),
    (SELECT id FROM jobs WHERE code = 'ACCOUNTANT'),
    NULL::varchar, NULL::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '5464520000000000')

UNION ALL

SELECT '7643450000000', 'asmaa khaled Takala', 'اسماء تقالة', 'Lebanon',
    (SELECT id FROM companies WHERE code = 'AVANTGARD'),
    (SELECT id FROM departments WHERE code = 'MARKETING'),
    (SELECT id FROM jobs WHERE code = 'MARKETING_MGR'),
    '24352352345', NULL::date, NULL::varchar, NULL::date, NULL::varchar, NULL::date
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_no = '7643450000000');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count by company
SELECT 
    c.name_en as company,
    COUNT(e.id) as employee_count
FROM companies c
LEFT JOIN employees e ON e.company_id = c.id
GROUP BY c.name_en
ORDER BY employee_count DESC;

-- Count by nationality
SELECT 
    nationality,
    COUNT(*) as count
FROM employees
GROUP BY nationality
ORDER BY count DESC;

-- Total employees
SELECT 'Total Employees Imported' as metric, COUNT(*) as count FROM employees;

COMMIT;

-- ============================================================================
-- SUCCESS! All employees imported safely.
-- ============================================================================
