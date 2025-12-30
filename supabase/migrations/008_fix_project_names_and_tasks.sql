-- Migration: Fix project names and task subcategories
-- 1. Populate empty project names from client_name or address
-- 2. Ensure tasks have proper subcategory/location assignments

-- ============================================================================
-- FIX PROJECT NAMES
-- ============================================================================

-- Update projects with empty/null names to use client_name + address
UPDATE projects
SET name = COALESCE(
  -- Try client_name + address
  CASE
    WHEN client_name IS NOT NULL AND address IS NOT NULL
    THEN client_name || ' - ' || address
    WHEN client_name IS NOT NULL
    THEN client_name || ' Project'
    WHEN address IS NOT NULL
    THEN 'Project at ' || address
    ELSE 'Untitled Project'
  END,
  name
)
WHERE name IS NULL OR name = '' OR name = 'undefined';

-- Update projects that have intake_data with contact info but no name
UPDATE projects
SET name =
  CASE
    WHEN intake_data->>'contact'->>'full_name' IS NOT NULL
    THEN intake_data->'contact'->>'full_name' || ' - ' || COALESCE(address, 'Project')
    ELSE name
  END
WHERE (name IS NULL OR name = '' OR name LIKE 'undefined%')
  AND intake_data IS NOT NULL
  AND intake_data->'contact'->>'full_name' IS NOT NULL;

-- ============================================================================
-- NOTES ON TASK SUBCATEGORIES
-- ============================================================================
-- The "Other" grouping in tasks occurs because tasks don't have subcategory_id
-- assigned. This is handled at the application level in groupTasksBySubcategory().
--
-- Tasks are grouped by location (room) when viewing. The subcategory structure
-- is optional - tasks without a subcategory fall into "Other" which is acceptable
-- for tasks that don't fit a specific subcategory.
--
-- If we want to improve this:
-- 1. Ensure task creation includes location_id based on the task's room
-- 2. Or rename "Other" to something more descriptive like the location name
--
-- For now, we'll improve the grouping label in the frontend code.

-- ============================================================================
-- VERIFY CHANGES
-- ============================================================================
-- This SELECT can be run to verify the changes took effect
-- SELECT id, name, client_name, address FROM projects WHERE name IS NOT NULL LIMIT 10;
