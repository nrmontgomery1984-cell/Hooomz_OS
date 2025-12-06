-- Hooomz OS Initial Database Schema
-- This migration creates the core tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  description TEXT,
  project_type VARCHAR(100),
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'intake' CHECK (status IN (
    'intake', 'estimate', 'contract', 'production', 'invoice', 'paid', 'warranty', 'archived'
  )),
  health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  start_date DATE,
  target_completion DATE,
  actual_completion DATE,
  estimated_budget DECIMAL(12, 2),
  contract_value DECIMAL(12, 2),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Loops table (flexible nested containers)
CREATE TABLE loops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  parent_loop_id UUID REFERENCES loops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  loop_type VARCHAR(50) DEFAULT 'custom' CHECK (loop_type IN (
    'phase', 'area', 'trade', 'room', 'zone', 'custom'
  )),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'active', 'blocked', 'completed', 'cancelled'
  )),
  health_color VARCHAR(20) DEFAULT 'gray' CHECK (health_color IN ('green', 'yellow', 'red', 'gray')),
  health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  display_order INTEGER DEFAULT 0,
  is_collapsed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loop_id UUID REFERENCES loops(id) ON DELETE CASCADE NOT NULL,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'cancelled'
  )),
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 4),
  assigned_to UUID REFERENCES users(id),
  estimated_hours DECIMAL(5, 2),
  actual_hours DECIMAL(5, 2),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,
  labels TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log table (IMMUTABLE event stream)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  loop_id UUID REFERENCES loops(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id),
  actor_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- NO updated_at - events are immutable
);

-- Time entries table
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  allocated_minutes INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  loop_id UUID REFERENCES loops(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_type VARCHAR(50) CHECK (contact_type IN ('client', 'subcontractor', 'supplier', 'inspector', 'other')),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project contacts junction table
CREATE TABLE project_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  role VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, contact_id)
);

-- Daily logs table
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  weather VARCHAR(100),
  temperature INTEGER,
  crew_count INTEGER,
  work_summary TEXT,
  issues TEXT,
  self_assessment INTEGER CHECK (self_assessment >= 1 AND self_assessment <= 5),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, log_date)
);

-- Estimates table
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 4) DEFAULT 0,
  total DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  valid_until DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estimate line items table
CREATE TABLE estimate_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE NOT NULL,
  category VARCHAR(100),
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit VARCHAR(50),
  unit_price DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(12, 2) DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_organization ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_loops_project ON loops(project_id);
CREATE INDEX idx_loops_parent ON loops(parent_loop_id);
CREATE INDEX idx_tasks_loop ON tasks(loop_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_activity_project ON activity_log(project_id);
CREATE INDEX idx_activity_created ON activity_log(created_at);
CREATE INDEX idx_time_entries_task ON time_entries(task_id);
CREATE INDEX idx_time_entries_user ON time_entries(user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_organizations_timestamp BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_projects_timestamp BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_loops_timestamp BEFORE UPDATE ON loops FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tasks_timestamp BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_time_entries_timestamp BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_contacts_timestamp BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_daily_logs_timestamp BEFORE UPDATE ON daily_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_estimates_timestamp BEFORE UPDATE ON estimates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to calculate loop health score
CREATE OR REPLACE FUNCTION calculate_loop_health(loop_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  child_health DECIMAL;
  task_health DECIMAL;
  completed_tasks INTEGER;
  total_tasks INTEGER;
  child_count INTEGER;
BEGIN
  -- Get child loop health average
  SELECT COUNT(*), COALESCE(AVG(health_score), 100)
  INTO child_count, child_health
  FROM loops
  WHERE parent_loop_id = loop_uuid;

  -- Get task completion rate
  SELECT
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status != 'cancelled')
  INTO completed_tasks, total_tasks
  FROM tasks
  WHERE loop_id = loop_uuid;

  IF total_tasks > 0 THEN
    task_health := (completed_tasks::DECIMAL / total_tasks) * 100;
  ELSE
    task_health := 100;
  END IF;

  -- Return average of child health and task health
  RETURN ROUND((child_health + task_health) / 2);
END;
$$ LANGUAGE plpgsql;

-- Function to get health color from score
CREATE OR REPLACE FUNCTION get_health_color(score INTEGER)
RETURNS VARCHAR AS $$
BEGIN
  IF score >= 70 THEN
    RETURN 'green';
  ELSIF score >= 40 THEN
    RETURN 'yellow';
  ELSE
    RETURN 'red';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Activity log trigger function
CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (event_type, event_data, task_id, loop_id, project_id)
    SELECT
      'task.created',
      jsonb_build_object('title', NEW.title, 'status', NEW.status),
      NEW.id,
      NEW.loop_id,
      l.project_id
    FROM loops l WHERE l.id = NEW.loop_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO activity_log (event_type, event_data, task_id, loop_id, project_id)
      SELECT
        CASE WHEN NEW.status = 'completed' THEN 'task.completed' ELSE 'task.status_changed' END,
        jsonb_build_object('title', NEW.title, 'old_status', OLD.status, 'new_status', NEW.status),
        NEW.id,
        NEW.loop_id,
        l.project_id
      FROM loops l WHERE l.id = NEW.loop_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_task_activity
AFTER INSERT OR UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION log_task_changes();

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_line_items ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be created based on your auth setup
-- Example policy for projects (adjust based on your auth implementation):
-- CREATE POLICY "Users can view their organization's projects" ON projects
--   FOR SELECT USING (organization_id IN (
--     SELECT organization_id FROM users WHERE id = auth.uid()
--   ));
