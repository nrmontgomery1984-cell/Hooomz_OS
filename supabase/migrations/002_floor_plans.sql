-- Floor Plans Schema Migration
-- Adds interactive floor plan system with SVG-based elements linked to loops

-- Floor Plans table
CREATE TABLE floor_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,                    -- "Main Floor", "Second Floor", "Basement"
  svg_viewbox VARCHAR(50) DEFAULT '0 0 1000 800', -- SVG coordinate system
  background_image_url TEXT,                      -- External URL for blueprint/photo underlay
  width_feet DECIMAL(10,2),                       -- Real-world dimensions for scale
  height_feet DECIMAL(10,2),
  floor_number INTEGER DEFAULT 1,                 -- For multi-story sorting
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Floor Plan Elements table
CREATE TABLE floor_plan_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  floor_plan_id UUID NOT NULL REFERENCES floor_plans(id) ON DELETE CASCADE,
  loop_id UUID REFERENCES loops(id) ON DELETE SET NULL,  -- Links to loop system

  -- Element identification
  element_type VARCHAR(50) NOT NULL CHECK (element_type IN (
    'wall', 'window', 'door', 'beam', 'zone', 'fixture', 'outlet', 'switch', 'hvac', 'custom'
  )),
  label VARCHAR(255),                            -- "North Wall - Kitchen", "Main Beam B1"
  trade_category VARCHAR(50) CHECK (trade_category IN (
    'framing', 'electrical', 'plumbing', 'hvac', 'drywall', 'insulation',
    'roofing', 'flooring', 'trim', 'paint', 'general'
  )),

  -- SVG geometry (store the actual path/shape data)
  svg_type VARCHAR(20) NOT NULL CHECK (svg_type IN ('path', 'rect', 'line', 'circle', 'polygon')),
  svg_data JSONB NOT NULL,                       -- Geometry data based on svg_type

  -- Visual properties
  stroke_width DECIMAL(5,2) DEFAULT 4,
  default_color VARCHAR(20) DEFAULT '#666666',
  z_index INTEGER DEFAULT 0,                     -- Layering order

  -- Metadata
  notes TEXT,
  specs JSONB,                                   -- {"length": "12ft", "material": "2x6 SPF"}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add floor_plan_element_id to activity_log for spatial tracking
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS
  floor_plan_element_id UUID REFERENCES floor_plan_elements(id) ON DELETE SET NULL;

ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS
  interaction_source VARCHAR(50) CHECK (interaction_source IN (
    'list', 'floorplan', 'calendar', 'voice', 'api', 'mobile'
  ));

-- Indexes for performance
CREATE INDEX idx_floor_plans_project ON floor_plans(project_id);
CREATE INDEX idx_floor_plans_active ON floor_plans(project_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_elements_floor_plan ON floor_plan_elements(floor_plan_id);
CREATE INDEX idx_elements_loop ON floor_plan_elements(loop_id) WHERE loop_id IS NOT NULL;
CREATE INDEX idx_elements_trade ON floor_plan_elements(trade_category) WHERE trade_category IS NOT NULL;
CREATE INDEX idx_elements_type ON floor_plan_elements(element_type);

-- RLS Policies (assuming org-based access through projects)
ALTER TABLE floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plan_elements ENABLE ROW LEVEL SECURITY;

-- Floor plans inherit project access
CREATE POLICY "floor_plans_select" ON floor_plans FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "floor_plans_insert" ON floor_plans FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "floor_plans_update" ON floor_plans FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "floor_plans_delete" ON floor_plans FOR DELETE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid() AND u.role IN ('owner', 'admin')
    )
  );

-- Floor plan elements inherit floor plan access
CREATE POLICY "elements_select" ON floor_plan_elements FOR SELECT
  USING (
    floor_plan_id IN (
      SELECT fp.id FROM floor_plans fp
      JOIN projects p ON p.id = fp.project_id
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "elements_insert" ON floor_plan_elements FOR INSERT
  WITH CHECK (
    floor_plan_id IN (
      SELECT fp.id FROM floor_plans fp
      JOIN projects p ON p.id = fp.project_id
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "elements_update" ON floor_plan_elements FOR UPDATE
  USING (
    floor_plan_id IN (
      SELECT fp.id FROM floor_plans fp
      JOIN projects p ON p.id = fp.project_id
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "elements_delete" ON floor_plan_elements FOR DELETE
  USING (
    floor_plan_id IN (
      SELECT fp.id FROM floor_plans fp
      JOIN projects p ON p.id = fp.project_id
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_floor_plan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER floor_plans_updated_at
  BEFORE UPDATE ON floor_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_floor_plan_updated_at();

CREATE TRIGGER floor_plan_elements_updated_at
  BEFORE UPDATE ON floor_plan_elements
  FOR EACH ROW
  EXECUTE FUNCTION update_floor_plan_updated_at();

-- Activity log trigger for floor plan changes
CREATE OR REPLACE FUNCTION log_floor_plan_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (
      project_id,
      user_id,
      action,
      entity_type,
      entity_id,
      event_data,
      interaction_source
    )
    SELECT
      fp.project_id,
      NEW.created_by,
      'created',
      'floor_plan',
      NEW.id,
      jsonb_build_object('name', NEW.name, 'floor_number', NEW.floor_number),
      'api'
    FROM floor_plans fp WHERE fp.id = NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_log (
      project_id,
      user_id,
      action,
      entity_type,
      entity_id,
      event_data,
      interaction_source
    )
    SELECT
      fp.project_id,
      auth.uid(),
      'updated',
      'floor_plan',
      NEW.id,
      jsonb_build_object(
        'name', NEW.name,
        'changes', jsonb_build_object(
          'old_name', OLD.name,
          'new_name', NEW.name
        )
      ),
      'api'
    FROM floor_plans fp WHERE fp.id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER floor_plan_activity_log
  AFTER INSERT OR UPDATE ON floor_plans
  FOR EACH ROW
  EXECUTE FUNCTION log_floor_plan_activity();

-- Activity log trigger for element changes
CREATE OR REPLACE FUNCTION log_element_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (
      project_id,
      loop_id,
      floor_plan_element_id,
      action,
      entity_type,
      entity_id,
      event_data,
      interaction_source
    )
    SELECT
      fp.project_id,
      NEW.loop_id,
      NEW.id,
      'created',
      'floor_plan_element',
      NEW.id,
      jsonb_build_object(
        'label', NEW.label,
        'element_type', NEW.element_type,
        'trade_category', NEW.trade_category
      ),
      'floorplan'
    FROM floor_plans fp WHERE fp.id = NEW.floor_plan_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.loop_id IS DISTINCT FROM OLD.loop_id THEN
    -- Log when element is linked/unlinked to a loop
    INSERT INTO activity_log (
      project_id,
      loop_id,
      floor_plan_element_id,
      action,
      entity_type,
      entity_id,
      event_data,
      interaction_source
    )
    SELECT
      fp.project_id,
      COALESCE(NEW.loop_id, OLD.loop_id),
      NEW.id,
      CASE WHEN NEW.loop_id IS NULL THEN 'unlinked' ELSE 'linked' END,
      'floor_plan_element',
      NEW.id,
      jsonb_build_object(
        'label', NEW.label,
        'old_loop_id', OLD.loop_id,
        'new_loop_id', NEW.loop_id
      ),
      'floorplan'
    FROM floor_plans fp WHERE fp.id = NEW.floor_plan_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER element_activity_log
  AFTER INSERT OR UPDATE ON floor_plan_elements
  FOR EACH ROW
  EXECUTE FUNCTION log_element_activity();
