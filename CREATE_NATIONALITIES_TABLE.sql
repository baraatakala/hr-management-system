-- RUN THIS SQL IN YOUR SUPABASE SQL EDITOR
-- This creates the nationalities table and adds sample data

-- Create nationalities table
CREATE TABLE IF NOT EXISTS nationalities (
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
    ('AUS', 'Australia', 'أستراليا')
ON CONFLICT (code) DO NOTHING;

-- Create index
CREATE INDEX IF NOT EXISTS idx_nationalities_code ON nationalities(code);

-- Enable Row Level Security
ALTER TABLE nationalities ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
DROP POLICY IF EXISTS "Allow all for authenticated users" ON nationalities;
CREATE POLICY "Allow all for authenticated users" ON nationalities FOR ALL TO authenticated USING (true);

-- Verify the data was inserted
SELECT COUNT(*) as total_nationalities FROM nationalities;
