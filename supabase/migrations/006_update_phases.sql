-- Migration: Update project phases to new model
-- New phases: intake, discovery, pricing, estimate, quote, contract, active, complete, maintained, cancelled

-- First, migrate existing phase values to new names
UPDATE projects SET phase = 'estimate' WHERE phase = 'estimating';
UPDATE projects SET phase = 'quote' WHERE phase = 'quoted';
UPDATE projects SET phase = 'contract' WHERE phase = 'contracted';
UPDATE projects SET phase = 'active' WHERE phase = 'punch_list';
UPDATE projects SET phase = 'active' WHERE phase = 'production';

-- Add new columns needed for phase workflow
ALTER TABLE projects ADD COLUMN IF NOT EXISTS phase_group VARCHAR(50);

-- Update phase_group based on phase
UPDATE projects SET phase_group = 'sales' WHERE phase IN ('intake', 'discovery', 'pricing');
UPDATE projects SET phase_group = 'pre_contract' WHERE phase IN ('estimate', 'quote', 'contract');
UPDATE projects SET phase_group = 'production' WHERE phase = 'active';
UPDATE projects SET phase_group = 'closed' WHERE phase IN ('complete', 'cancelled');
UPDATE projects SET phase_group = 'warranty' WHERE phase = 'maintained';

-- Add columns for phase transition tracking
ALTER TABLE projects ADD COLUMN IF NOT EXISTS quote_sent_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS quote_accepted_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_signed_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deposit_received_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_start TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_completion TIMESTAMPTZ;

-- Add contract_value if not exists
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_value NUMERIC;

-- Update loops table to support new trade codes
ALTER TABLE loops ADD COLUMN IF NOT EXISTS category_code VARCHAR(10);
ALTER TABLE loops ADD COLUMN IF NOT EXISTS source VARCHAR(50);
ALTER TABLE loops ADD COLUMN IF NOT EXISTS task_count INTEGER DEFAULT 0;
ALTER TABLE loops ADD COLUMN IF NOT EXISTS budgeted_amount NUMERIC;

-- Update tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category_code VARCHAR(10);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subcategory_code VARCHAR(20);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source VARCHAR(50);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS budgeted_amount NUMERIC;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS quantity NUMERIC;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS unit VARCHAR(50);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS scope_item_id VARCHAR(100);

-- Create change_orders table
CREATE TABLE IF NOT EXISTS change_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  loop_id UUID REFERENCES loops(id) ON DELETE SET NULL,
  change_order_type VARCHAR(50) NOT NULL CHECK (change_order_type IN ('customer', 'contractor', 'no_cost')),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'declined')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  declined_reason TEXT,
  declined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on change_orders
CREATE INDEX IF NOT EXISTS idx_change_orders_project ON change_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON change_orders(status);

-- Enable RLS on change_orders
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;

-- Trigger for change_orders updated_at
DROP TRIGGER IF EXISTS update_change_orders_timestamp ON change_orders;
CREATE TRIGGER update_change_orders_timestamp
  BEFORE UPDATE ON change_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update employees table if it exists (add missing columns)
-- Note: employees table may already exist from initial schema
ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'labourer';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create index on employees role (if not exists)
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);

-- Enable RLS on employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Trigger for employees updated_at
DROP TRIGGER IF EXISTS update_employees_timestamp ON employees;
CREATE TRIGGER update_employees_timestamp
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
