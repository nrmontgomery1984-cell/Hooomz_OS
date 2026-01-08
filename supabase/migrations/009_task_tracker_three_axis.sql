-- Three-Axis Task Tracker Schema
-- Implements the quantum task assignment model:
--   Axis 1: Work Categories (trades) - who does this work?
--   Axis 2: Construction Stages - when in sequence?
--   Axis 3: Locations - where in the building?
--
-- Task templates exist in "quantum state" (unbound to location)
-- Task instances are "collapsed" to specific locations

-- =============================================================================
-- LOCATIONS TABLE (Axis 3)
-- =============================================================================
-- Hierarchical location structure: Building > Floor > Room > Zone
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES locations(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  location_type VARCHAR(50) DEFAULT 'room' CHECK (location_type IN (
    'building', 'floor', 'room', 'zone', 'system', 'exterior'
  )),
  path TEXT,  -- Hierarchical path e.g. "1st Floor.Kitchen.Island Area"

  -- Display and ordering
  display_order INTEGER DEFAULT 0,
  icon VARCHAR(50),
  color VARCHAR(20),

  -- Metadata
  square_feet DECIMAL(10, 2),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- WORK SUBCATEGORIES TABLE
-- =============================================================================
-- Subcategories within each trade for finer granularity
CREATE TABLE work_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_code VARCHAR(10) NOT NULL,  -- Parent trade code (EL, PL, etc.)
  code VARCHAR(20) NOT NULL UNIQUE,     -- e.g. EL-RO, EL-TR, PL-RO
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Phase association
  default_stage_code VARCHAR(20),  -- ST-RI, ST-FN, etc.

  -- Display
  display_order INTEGER DEFAULT 0,
  icon VARCHAR(50),
  color VARCHAR(20),

  -- Field guide linkage
  field_guide_modules TEXT[],  -- Array of module codes

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TASK TEMPLATES TABLE (Quantum State)
-- =============================================================================
-- Templates define abstract task types that can be instantiated per location
CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Three-axis categorization
  trade_code VARCHAR(10) NOT NULL,      -- Axis 1: EL, PL, DW, etc.
  phase_code VARCHAR(20),               -- Axis 2 default: ST-RO, ST-FN, etc.

  -- Template definition
  name VARCHAR(500) NOT NULL,
  description TEXT,

  -- Default values for instances
  default_hours DECIMAL(5, 2),
  materials_template JSONB,  -- Default materials list
  checklist_template JSONB,  -- Default checklist items

  -- Loop binding behavior
  loop_binding VARCHAR(50) DEFAULT 'per_room' CHECK (loop_binding IN (
    'per_room', 'per_floor', 'per_building', 'per_instance'
  )),

  -- Dependencies (template level)
  blocked_by_phases TEXT[],  -- Phases that must complete first
  blocks_phases TEXT[],      -- Phases this blocks

  -- Field guide linkage
  field_guide_modules TEXT[],

  -- Ordering
  stage_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TASK INSTANCES TABLE (Collapsed State)
-- =============================================================================
-- Concrete tasks bound to specific locations
CREATE TABLE task_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES task_templates(id) ON DELETE SET NULL,

  -- Three-axis position
  category_code VARCHAR(10) NOT NULL,        -- Axis 1: Trade
  subcategory_code VARCHAR(20),              -- Trade subcategory
  stage_code VARCHAR(20) DEFAULT 'ST-RI',    -- Axis 2: Stage
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,  -- Axis 3
  location_path TEXT,                        -- Denormalized path for display

  -- Task details (may override template)
  name VARCHAR(500) NOT NULL,
  description TEXT,

  -- Status and priority
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'blocked', 'completed', 'cancelled'
  )),
  priority INTEGER DEFAULT 2 CHECK (priority >= 1 AND priority <= 4),

  -- Assignment
  assigned_to UUID,  -- Can reference contacts or employees
  assigned_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  due_date DATE,

  -- Time tracking
  estimated_hours DECIMAL(5, 2),
  actual_hours DECIMAL(5, 2) DEFAULT 0,

  -- Materials and checklist (instance-specific, may override template)
  materials JSONB,
  checklist JSONB,

  -- Dependencies (instance-specific overrides)
  blocked_by TEXT[],  -- Task IDs that block this
  blocks TEXT[],      -- Task IDs this blocks

  -- Rework tracking
  rework_count INTEGER DEFAULT 0,
  rework_hours DECIMAL(5, 2) DEFAULT 0,

  -- Cost tracking (links back to estimate)
  estimate_line_item_id UUID,
  budgeted_amount DECIMAL(12, 2),

  -- Source tracking
  source VARCHAR(50),  -- 'manual', 'estimate', 'template', 'import'

  -- Completion
  completed_at TIMESTAMPTZ,
  completed_by UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Locations
CREATE INDEX idx_locations_project ON locations(project_id);
CREATE INDEX idx_locations_parent ON locations(parent_id);
CREATE INDEX idx_locations_type ON locations(project_id, location_type);

-- Work subcategories
CREATE INDEX idx_subcategories_category ON work_subcategories(category_code);

-- Task templates
CREATE INDEX idx_templates_project ON task_templates(project_id);
CREATE INDEX idx_templates_trade ON task_templates(trade_code);
CREATE INDEX idx_templates_phase ON task_templates(phase_code);

-- Task instances
CREATE INDEX idx_instances_project ON task_instances(project_id);
CREATE INDEX idx_instances_category ON task_instances(project_id, category_code);
CREATE INDEX idx_instances_stage ON task_instances(project_id, stage_code);
CREATE INDEX idx_instances_location ON task_instances(location_id);
CREATE INDEX idx_instances_status ON task_instances(project_id, status);
CREATE INDEX idx_instances_assigned ON task_instances(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_instances_due ON task_instances(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_instances_template ON task_instances(template_id) WHERE template_id IS NOT NULL;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update timestamps
CREATE TRIGGER update_locations_timestamp
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subcategories_timestamp
  BEFORE UPDATE ON work_subcategories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_templates_timestamp
  BEFORE UPDATE ON task_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_instances_timestamp
  BEFORE UPDATE ON task_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ACTIVITY LOGGING FOR TASK INSTANCES
-- =============================================================================

CREATE OR REPLACE FUNCTION log_task_instance_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (
      event_type,
      event_data,
      project_id
    ) VALUES (
      'task_instance.created',
      jsonb_build_object(
        'name', NEW.name,
        'category', NEW.category_code,
        'stage', NEW.stage_code,
        'location_path', NEW.location_path
      ),
      NEW.project_id
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO activity_log (
        event_type,
        event_data,
        project_id
      ) VALUES (
        CASE
          WHEN NEW.status = 'completed' THEN 'task_instance.completed'
          WHEN NEW.status = 'in_progress' THEN 'task_instance.started'
          ELSE 'task_instance.status_changed'
        END,
        jsonb_build_object(
          'name', NEW.name,
          'old_status', OLD.status,
          'new_status', NEW.status,
          'location_path', NEW.location_path
        ),
        NEW.project_id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_task_instance_activity
  AFTER INSERT OR UPDATE ON task_instances
  FOR EACH ROW EXECUTE FUNCTION log_task_instance_changes();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_instances ENABLE ROW LEVEL SECURITY;

-- Locations RLS (project-scoped)
CREATE POLICY "locations_select" ON locations FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "locations_insert" ON locations FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "locations_update" ON locations FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "locations_delete" ON locations FOR DELETE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

-- Work subcategories RLS (public read, admin write)
CREATE POLICY "subcategories_select" ON work_subcategories FOR SELECT
  USING (true);  -- All authenticated users can read

CREATE POLICY "subcategories_insert" ON work_subcategories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Task templates RLS (project-scoped or global)
CREATE POLICY "templates_select" ON task_templates FOR SELECT
  USING (
    project_id IS NULL  -- Global templates readable by all
    OR project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "templates_insert" ON task_templates FOR INSERT
  WITH CHECK (
    project_id IS NULL AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "templates_update" ON task_templates FOR UPDATE
  USING (
    project_id IS NULL AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "templates_delete" ON task_templates FOR DELETE
  USING (
    project_id IS NULL AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

-- Task instances RLS (project-scoped)
CREATE POLICY "instances_select" ON task_instances FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "instances_insert" ON task_instances FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "instances_update" ON task_instances FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "instances_delete" ON task_instances FOR DELETE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

-- =============================================================================
-- SEED DATA: Work Subcategories
-- =============================================================================
-- Populate common subcategories for each trade

INSERT INTO work_subcategories (category_code, code, name, default_stage_code, display_order) VALUES
  -- Electrical
  ('EL', 'EL-RO', 'Electrical Rough-In', 'ST-RI', 1),
  ('EL', 'EL-TR', 'Electrical Trim/Finish', 'ST-FX', 2),
  ('EL', 'EL-SV', 'Electrical Service/Panel', 'ST-RI', 3),

  -- Plumbing
  ('PL', 'PL-RO', 'Plumbing Rough-In', 'ST-RI', 1),
  ('PL', 'PL-TR', 'Plumbing Trim/Finish', 'ST-FX', 2),
  ('PL', 'PL-WH', 'Water Heater', 'ST-RI', 3),

  -- HVAC
  ('HV', 'HV-RO', 'HVAC Rough-In', 'ST-RI', 1),
  ('HV', 'HV-TR', 'HVAC Trim/Finish', 'ST-FX', 2),
  ('HV', 'HV-EQ', 'HVAC Equipment', 'ST-RI', 3),

  -- Drywall
  ('DW', 'DW-HG', 'Drywall Hanging', 'ST-FN', 1),
  ('DW', 'DW-FN', 'Drywall Finishing/Taping', 'ST-FN', 2),

  -- Framing
  ('FS', 'FS-EX', 'Exterior Framing', 'ST-FR', 1),
  ('FS', 'FS-RF', 'Roof Framing', 'ST-FR', 2),
  ('FI', 'FI-WL', 'Interior Wall Framing', 'ST-FR', 1),
  ('FI', 'FI-BK', 'Blocking/Backing', 'ST-FR', 2),

  -- Flooring
  ('FL', 'FL-PR', 'Floor Prep', 'ST-FN', 1),
  ('FL', 'FL-HD', 'Hardwood', 'ST-FN', 2),
  ('FL', 'FL-LV', 'LVP/Laminate', 'ST-FN', 3),
  ('FL', 'FL-CP', 'Carpet', 'ST-FN', 4),

  -- Tile
  ('TL', 'TL-FL', 'Floor Tile', 'ST-FN', 1),
  ('TL', 'TL-WL', 'Wall Tile', 'ST-FN', 2),
  ('TL', 'TL-SH', 'Shower Tile', 'ST-FN', 3),
  ('TL', 'TL-BS', 'Backsplash', 'ST-FN', 4),

  -- Painting
  ('PT', 'PT-PR', 'Prime', 'ST-FN', 1),
  ('PT', 'PT-WL', 'Wall Paint', 'ST-FN', 2),
  ('PT', 'PT-TR', 'Trim Paint', 'ST-FN', 3),
  ('PT', 'PT-CB', 'Cabinet Paint', 'ST-FN', 4),

  -- Finish Carpentry
  ('FC', 'FC-BS', 'Baseboard', 'ST-FN', 1),
  ('FC', 'FC-CS', 'Casing/Trim', 'ST-FN', 2),
  ('FC', 'FC-CR', 'Crown Molding', 'ST-FN', 3),
  ('FC', 'FC-DR', 'Interior Doors', 'ST-FN', 4),

  -- Cabinetry
  ('CM', 'CM-BS', 'Base Cabinets', 'ST-FN', 1),
  ('CM', 'CM-WL', 'Wall Cabinets', 'ST-FN', 2),
  ('CM', 'CM-VN', 'Vanities', 'ST-FN', 3),

  -- Demo
  ('DM', 'DM-IN', 'Interior Demo', 'ST-DM', 1),
  ('DM', 'DM-EX', 'Exterior Demo', 'ST-DM', 2),
  ('DM', 'DM-HO', 'Haul Off', 'ST-DM', 3),

  -- Insulation
  ('IA', 'IA-BT', 'Batt Insulation', 'ST-IN', 1),
  ('IA', 'IA-SP', 'Spray Foam', 'ST-IN', 2),
  ('IA', 'IA-BL', 'Blown-In', 'ST-IN', 3)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get location path by building from parent chain
CREATE OR REPLACE FUNCTION get_location_path(loc_id UUID)
RETURNS TEXT AS $$
DECLARE
  result TEXT := '';
  current_loc RECORD;
BEGIN
  SELECT * INTO current_loc FROM locations WHERE id = loc_id;

  IF current_loc IS NULL THEN
    RETURN NULL;
  END IF;

  result := current_loc.name;

  WHILE current_loc.parent_id IS NOT NULL LOOP
    SELECT * INTO current_loc FROM locations WHERE id = current_loc.parent_id;
    result := current_loc.name || '.' || result;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Auto-update location_path on task_instances
CREATE OR REPLACE FUNCTION update_instance_location_path()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_id IS NOT NULL THEN
    NEW.location_path := get_location_path(NEW.location_id);
  ELSE
    NEW.location_path := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_location_path
  BEFORE INSERT OR UPDATE OF location_id ON task_instances
  FOR EACH ROW EXECUTE FUNCTION update_instance_location_path();
