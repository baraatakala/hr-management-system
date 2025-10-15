-- Create nationalities table
CREATE TABLE nationalities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample nationalities
INSERT INTO nationalities (code, name_en, name_ar) VALUES
    ('UAE', 'United Arab Emirates', 'الإمارات العربية المتحدة'),
    ('SAU', 'Saudi Arabia', 'المملكة العربية السعودية'),
    ('EGY', 'Egypt', 'مصر'),
    ('JOR', 'Jordan', 'الأردن'),
    ('LBN', 'Lebanon', 'لبنان'),
    ('SYR', 'Syria', 'سوريا'),
    ('PAL', 'Palestine', 'فلسطين'),
    ('IND', 'India', 'الهند'),
    ('PAK', 'Pakistan', 'باكستان'),
    ('PHI', 'Philippines', 'الفلبين'),
    ('USA', 'United States', 'الولايات المتحدة'),
    ('GBR', 'United Kingdom', 'المملكة المتحدة'),
    ('CAN', 'Canada', 'كندا'),
    ('AUS', 'Australia', 'أستراليا');

-- Create index
CREATE INDEX idx_nationalities_code ON nationalities(code);

-- Enable Row Level Security
ALTER TABLE nationalities ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow all for authenticated users" ON nationalities FOR ALL TO authenticated USING (true);

-- Add comment
COMMENT ON TABLE nationalities IS 'Stores nationality/country data for employee management';
