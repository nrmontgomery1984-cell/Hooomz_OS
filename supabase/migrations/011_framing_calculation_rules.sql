-- Framing Calculation Rules Table
-- Stores organization-specific default values for window/door framing calculations
-- Allows admins to customize calculation defaults instead of using hardcoded values

CREATE TABLE IF NOT EXISTS framing_calculation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,

  -- Rule metadata
  rule_name VARCHAR(100) NOT NULL DEFAULT 'Default Framing Rules',
  description TEXT,

  -- Rule values stored as JSONB for flexibility
  -- Contains all default calculation parameters:
  -- {
  --   "wallHeight": 97.125,        -- Default wall height in inches
  --   "headerSize": "2x10",         -- Default header size
  --   "headerType": "built-up",     -- built-up, solid, or lvl
  --   "topPlateConfig": "double",   -- double or single
  --   "studSpacing": 16,            -- 16 or 24 OC
  --   "studMaterial": "2x4",        -- 2x4 or 2x6
  --   "sillStyle": "flat",          -- flat, double, or sloped
  --   "sillHeight": 36,             -- Default window sill height AFF
  --   "roWidth": 36,                -- Default rough opening width
  --   "roHeight": 48,               -- Default rough opening height
  --   "slopedSillThickness": 2,     -- Sloped sill thickness in inches
  --   "headerTight": false,         -- Tight-fit header flag
  --   "finishFloor": 0              -- Finish floor thickness
  -- }
  rule_values JSONB NOT NULL,

  -- Version control
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,

  -- Audit trail
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Only one active rule set per organization
  UNIQUE(organization_id, is_active) WHERE is_active = true
);

-- Indexes for performance
CREATE INDEX idx_framing_rules_org ON framing_calculation_rules(organization_id);
CREATE INDEX idx_framing_rules_active ON framing_calculation_rules(organization_id, is_active) WHERE is_active = true;

-- GIN index for querying JSONB fields
CREATE INDEX idx_framing_rules_values ON framing_calculation_rules USING GIN (rule_values);

-- Enable Row Level Security
ALTER TABLE framing_calculation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view rules for their organization
CREATE POLICY "framing_rules_select" ON framing_calculation_rules
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policy: Only owners and admins can create rules
CREATE POLICY "framing_rules_insert" ON framing_calculation_rules
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT p.organization_id
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('owner', 'admin')
    )
  );

-- RLS Policy: Only owners and admins can update rules
CREATE POLICY "framing_rules_update" ON framing_calculation_rules
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT p.organization_id
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('owner', 'admin')
    )
  );

-- RLS Policy: Only owners can delete rules
CREATE POLICY "framing_rules_delete" ON framing_calculation_rules
  FOR DELETE
  USING (
    organization_id IN (
      SELECT p.organization_id
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'owner'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_framing_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the update function
CREATE TRIGGER update_framing_rules_timestamp
  BEFORE UPDATE ON framing_calculation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_framing_rules_updated_at();

-- Function to increment version and deactivate old rules when creating new active rule
CREATE OR REPLACE FUNCTION manage_framing_rules_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    -- Deactivate all other rules for this organization
    UPDATE framing_calculation_rules
    SET is_active = false
    WHERE organization_id = NEW.organization_id
      AND id != NEW.id
      AND is_active = true;

    -- Set version to max + 1 for this organization
    SELECT COALESCE(MAX(version), 0) + 1
    INTO NEW.version
    FROM framing_calculation_rules
    WHERE organization_id = NEW.organization_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to manage versions automatically
CREATE TRIGGER manage_framing_rules_version_trigger
  BEFORE INSERT ON framing_calculation_rules
  FOR EACH ROW
  EXECUTE FUNCTION manage_framing_rules_version();

-- Insert default rules for existing organizations (optional seed data)
-- This gives all existing orgs the hardcoded defaults as their starting point
INSERT INTO framing_calculation_rules (
  organization_id,
  rule_name,
  description,
  rule_values,
  is_active,
  version
)
SELECT
  id as organization_id,
  'Default Framing Rules',
  'System default framing calculation rules',
  '{
    "openingType": "window",
    "roWidth": 36,
    "roHeight": 48,
    "sillHeight": 36,
    "wallHeight": 97.125,
    "headerSize": "2x10",
    "headerType": "built-up",
    "topPlateConfig": "double",
    "studSpacing": 16,
    "sillStyle": "flat",
    "slopedSillThickness": 2,
    "studMaterial": "2x4",
    "headerTight": false,
    "finishFloor": 0
  }'::jsonb,
  true,
  1
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM framing_calculation_rules
  WHERE framing_calculation_rules.organization_id = organizations.id
);

COMMENT ON TABLE framing_calculation_rules IS 'Organization-specific default values for window/door framing calculations';
COMMENT ON COLUMN framing_calculation_rules.rule_values IS 'JSONB object containing all calculation default parameters';
COMMENT ON COLUMN framing_calculation_rules.is_active IS 'Only one active rule set per organization at a time';
COMMENT ON COLUMN framing_calculation_rules.version IS 'Auto-incremented version number for audit trail';
