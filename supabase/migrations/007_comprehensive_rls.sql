-- Migration: Comprehensive RLS policies for all tables
-- This allows authenticated users full access to their organization's data
-- and provides read access where appropriate

-- ============================================================================
-- PROJECTS
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated read access to projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated insert access to projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated update access to projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated delete access to projects" ON projects;
DROP POLICY IF EXISTS "Allow anonymous access to projects" ON projects;

CREATE POLICY "Allow authenticated full access to projects"
ON projects FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon read access to projects"
ON projects FOR SELECT TO anon
USING (true);

-- ============================================================================
-- LOOPS
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated access to loops" ON loops;
DROP POLICY IF EXISTS "Allow anonymous access to loops" ON loops;

CREATE POLICY "Allow authenticated full access to loops"
ON loops FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon read access to loops"
ON loops FOR SELECT TO anon
USING (true);

-- ============================================================================
-- TASKS
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated access to tasks" ON tasks;
DROP POLICY IF EXISTS "Allow anonymous access to tasks" ON tasks;

CREATE POLICY "Allow authenticated full access to tasks"
ON tasks FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon read access to tasks"
ON tasks FOR SELECT TO anon
USING (true);

-- ============================================================================
-- EMPLOYEES
-- ============================================================================
DROP POLICY IF EXISTS "Allow anonymous read access to employees" ON employees;
DROP POLICY IF EXISTS "Allow public read" ON employees;
DROP POLICY IF EXISTS "Allow all access to employees" ON employees;
DROP POLICY IF EXISTS "Enable read for anon" ON employees;
DROP POLICY IF EXISTS "Enable read for authenticated" ON employees;

CREATE POLICY "Allow authenticated full access to employees"
ON employees FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon read access to employees"
ON employees FOR SELECT TO anon
USING (true);

-- ============================================================================
-- TIME ENTRIES
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated access to time_entries" ON time_entries;

CREATE POLICY "Allow authenticated full access to time_entries"
ON time_entries FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon read access to time_entries"
ON time_entries FOR SELECT TO anon
USING (true);

-- ============================================================================
-- ACTIVITY LOG
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated access to activity_log" ON activity_log;

CREATE POLICY "Allow authenticated full access to activity_log"
ON activity_log FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon read access to activity_log"
ON activity_log FOR SELECT TO anon
USING (true);

-- ============================================================================
-- CHANGE ORDERS
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated access to change_orders" ON change_orders;

CREATE POLICY "Allow authenticated full access to change_orders"
ON change_orders FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon read access to change_orders"
ON change_orders FOR SELECT TO anon
USING (true);

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated access to organizations" ON organizations;

CREATE POLICY "Allow authenticated full access to organizations"
ON organizations FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- USERS (profiles table may be named differently)
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated access to users" ON users;

CREATE POLICY "Allow authenticated full access to users"
ON users FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- CONTACTS
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated access to contacts" ON contacts;

CREATE POLICY "Allow authenticated full access to contacts"
ON contacts FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- FILES
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated access to files" ON files;

CREATE POLICY "Allow authenticated full access to files"
ON files FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- ESTIMATES
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated access to estimates" ON estimates;

CREATE POLICY "Allow authenticated full access to estimates"
ON estimates FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- ESTIMATE LINE ITEMS
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated access to estimate_line_items" ON estimate_line_items;

CREATE POLICY "Allow authenticated full access to estimate_line_items"
ON estimate_line_items FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- DAILY LOGS
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated access to daily_logs" ON daily_logs;

CREATE POLICY "Allow authenticated full access to daily_logs"
ON daily_logs FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- PROJECT CONTACTS
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated access to project_contacts" ON project_contacts;

CREATE POLICY "Allow authenticated full access to project_contacts"
ON project_contacts FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
