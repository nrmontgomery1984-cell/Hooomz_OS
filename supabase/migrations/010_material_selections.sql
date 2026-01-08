-- Material Selections Schema
-- Tracks material selections for projects (fixtures, finishes, appliances, etc.)

CREATE TABLE material_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,

  -- Categorization
  category_code VARCHAR(10) NOT NULL,  -- PL, EL, FL, TL, CB, CT, FC, HW, AP, PT
  subcategory_code VARCHAR(20),
  trade_code VARCHAR(10),  -- Links to trade responsible for installation
  room_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  phase_code VARCHAR(20),

  -- Item details
  item_name VARCHAR(500) NOT NULL,
  description TEXT,
  manufacturer VARCHAR(255),
  model_number VARCHAR(255),
  color VARCHAR(100),
  finish VARCHAR(100),

  -- Quantity and pricing
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_of_measurement VARCHAR(50) DEFAULT 'each',
  cost_per_unit DECIMAL(12, 2),
  allowance_amount DECIMAL(12, 2),

  -- Sourcing
  supplier_url TEXT,
  lead_time_days INTEGER,

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'selected', 'ordered', 'shipped', 'delivered', 'installed'
  )),

  -- Additional info
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_selections_project ON material_selections(project_id);
CREATE INDEX idx_selections_category ON material_selections(project_id, category_code);
CREATE INDEX idx_selections_status ON material_selections(project_id, status);
CREATE INDEX idx_selections_room ON material_selections(room_id) WHERE room_id IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER update_selections_timestamp
  BEFORE UPDATE ON material_selections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE material_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "selections_select" ON material_selections FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "selections_insert" ON material_selections FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "selections_update" ON material_selections FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "selections_delete" ON material_selections FOR DELETE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.organization_id = p.organization_id
      WHERE u.id = auth.uid()
    )
  );

-- Activity logging for selection changes
CREATE OR REPLACE FUNCTION log_selection_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (
      event_type,
      event_data,
      project_id
    ) VALUES (
      'selection.created',
      jsonb_build_object(
        'item_name', NEW.item_name,
        'category', NEW.category_code,
        'status', NEW.status
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
        'selection.status_changed',
        jsonb_build_object(
          'item_name', NEW.item_name,
          'old_status', OLD.status,
          'new_status', NEW.status
        ),
        NEW.project_id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_selection_activity
  AFTER INSERT OR UPDATE ON material_selections
  FOR EACH ROW EXECUTE FUNCTION log_selection_changes();
