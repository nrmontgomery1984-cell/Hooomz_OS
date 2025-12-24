-- Add RLS policy for projects table to allow anonymous access
-- This is needed for project creation and viewing without authentication

-- First, ensure RLS is enabled on projects table
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow anonymous read access to projects" ON projects;
DROP POLICY IF EXISTS "Allow anonymous insert access to projects" ON projects;
DROP POLICY IF EXISTS "Allow anonymous update access to projects" ON projects;

-- Create policy to allow anyone to read projects
CREATE POLICY "Allow anonymous read access to projects"
ON projects
FOR SELECT
USING (true);

-- Create policy to allow anyone to insert projects
CREATE POLICY "Allow anonymous insert access to projects"
ON projects
FOR INSERT
WITH CHECK (true);

-- Create policy to allow anyone to update projects
CREATE POLICY "Allow anonymous update access to projects"
ON projects
FOR UPDATE
USING (true)
WITH CHECK (true);
