-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create departments table
CREATE TABLE departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create employees table
CREATE TABLE employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_no VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    passport_no VARCHAR(50),
    passport_expiry DATE,
    card_no VARCHAR(50),
    card_expiry DATE,
    emirates_id VARCHAR(50),
    emirates_id_expiry DATE,
    residence_no VARCHAR(50),
    residence_expiry DATE,
    email VARCHAR(255),
    phone VARCHAR(50),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_log table
CREATE TABLE activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id)
);

-- Create reminders table
CREATE TABLE reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'passport', 'card', 'emirates_id', 'residence'
    target_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_job ON employees(job_id);
CREATE INDEX idx_employees_card_expiry ON employees(card_expiry);
CREATE INDEX idx_employees_passport_expiry ON employees(passport_expiry);
CREATE INDEX idx_employees_emirates_id_expiry ON employees(emirates_id_expiry);
CREATE INDEX idx_employees_residence_expiry ON employees(residence_expiry);
CREATE INDEX idx_activity_log_employee ON activity_log(employee_id);
CREATE INDEX idx_activity_log_timestamp ON activity_log(timestamp DESC);
CREATE INDEX idx_reminders_employee ON reminders(employee_id);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_target_date ON reminders(target_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for employees table
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO companies (code, name_en, name_ar) VALUES
    ('COMP001', 'HR Group Main', 'مجموعة الموارد البشرية الرئيسية'),
    ('COMP002', 'HR Group Branch A', 'مجموعة الموارد البشرية - الفرع أ'),
    ('COMP003', 'HR Group Branch B', 'مجموعة الموارد البشرية - الفرع ب');

INSERT INTO departments (code, name_en, name_ar) VALUES
    ('DEPT001', 'Human Resources', 'الموارد البشرية'),
    ('DEPT002', 'Finance', 'المالية'),
    ('DEPT003', 'IT', 'تكنولوجيا المعلومات'),
    ('DEPT004', 'Operations', 'العمليات');

INSERT INTO jobs (code, name_en, name_ar) VALUES
    ('JOB001', 'Manager', 'مدير'),
    ('JOB002', 'Senior Specialist', 'أخصائي أول'),
    ('JOB003', 'Specialist', 'أخصائي'),
    ('JOB004', 'Assistant', 'مساعد');

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow all for authenticated users" ON companies FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON departments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON jobs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON employees FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON activity_log FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON reminders FOR ALL TO authenticated USING (true);
