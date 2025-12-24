-- Migration: Add phase-based workflow and intake data columns
-- This aligns the database with the new phase transition system

-- Add phase column for the new workflow system
-- Valid phases: intake, estimating, quoted, contracted, active, punch_list, complete, cancelled
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS phase VARCHAR(50) DEFAULT 'intake';

-- Add intake_data JSONB column for storing form data
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS intake_data JSONB DEFAULT '{}';

-- Add intake_type to distinguish between homeowner and contractor intake
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS intake_type VARCHAR(50);

-- Add build_tier for construction quality level
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS build_tier VARCHAR(50);

-- Add estimate columns for range pricing
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS estimate_low NUMERIC;

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS estimate_high NUMERIC;

-- Add estimate_line_items for storing estimate breakdown
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS estimate_line_items JSONB;

-- Migrate existing status values to new phase values
UPDATE projects SET phase = 'intake' WHERE status = 'intake' AND phase IS NULL;
UPDATE projects SET phase = 'estimating' WHERE status = 'estimate' AND phase IS NULL;
UPDATE projects SET phase = 'contracted' WHERE status = 'contract' AND phase IS NULL;
UPDATE projects SET phase = 'active' WHERE status = 'production' AND phase IS NULL;
UPDATE projects SET phase = 'complete' WHERE status = 'invoice' OR status = 'paid' AND phase IS NULL;

-- Set default phase for any remaining projects without one
UPDATE projects SET phase = 'intake' WHERE phase IS NULL;
