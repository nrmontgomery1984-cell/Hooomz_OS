-- Add RLS policy for employees table to allow anonymous read access
-- This is needed for the Team page to load employees without authentication

-- First, ensure RLS is enabled on employees table
ALTER TABLE IF EXISTS employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow anonymous read access to employees" ON employees;

-- Create policy to allow anyone to read employees
CREATE POLICY "Allow anonymous read access to employees"
ON employees
FOR SELECT
USING (true);

-- Also allow authenticated users to read/write
DROP POLICY IF EXISTS "Allow authenticated users full access to employees" ON employees;

CREATE POLICY "Allow authenticated users full access to employees"
ON employees
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
