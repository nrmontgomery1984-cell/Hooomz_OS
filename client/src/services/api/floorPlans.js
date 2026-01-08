/**
 * Floor Plans API Module
 *
 * Handles floor plan and element CRUD operations.
 */

import { supabase, isConfigured, generateId, now, response, handleError } from './config';

/**
 * Floor plan status colors
 */
export const FLOOR_PLAN_STATUS_COLORS = {
  pending: '#9CA3AF',   // gray
  active: '#3B82F6',    // blue
  completed: '#22C55E', // green
  blocked: '#EF4444',   // red
};

/**
 * Element type defaults
 */
export const ELEMENT_TYPE_DEFAULTS = {
  room: { color: '#E5E7EB', strokeWidth: 2 },
  wall: { color: '#1F2937', strokeWidth: 3 },
  door: { color: '#6B7280', strokeWidth: 2 },
  window: { color: '#3B82F6', strokeWidth: 2 },
  electrical: { color: '#F59E0B', strokeWidth: 2 },
  plumbing: { color: '#3B82F6', strokeWidth: 2 },
  hvac: { color: '#10B981', strokeWidth: 2 },
  custom: { color: '#6B7280', strokeWidth: 2 },
};

/**
 * Trade colors for visualization
 */
export const TRADE_COLORS = {
  EL: '#F59E0B', // Electrical - amber
  PL: '#3B82F6', // Plumbing - blue
  HV: '#10B981', // HVAC - emerald
  DW: '#D1D5DB', // Drywall - gray
  PT: '#EC4899', // Painting - pink
  FL: '#8B5CF6', // Flooring - violet
  TL: '#14B8A6', // Tile - teal
  CM: '#92400E', // Cabinetry - brown
};

// =============================================================================
// FLOOR PLANS
// =============================================================================

/**
 * Get all floor plans for a project
 */
export async function getFloorPlans(projectId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('floor_plans')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('floor_number', { ascending: true });

    if (error) {
      return handleError(error, 'getFloorPlans');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getFloorPlans');
  }
}

/**
 * Get a single floor plan by ID
 */
export async function getFloorPlan(floorPlanId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('floor_plans')
      .select('*')
      .eq('id', floorPlanId)
      .single();

    if (error) {
      return handleError(error, 'getFloorPlan');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'getFloorPlan');
  }
}

/**
 * Create a new floor plan
 */
export async function createFloorPlan(floorPlanData) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const newPlan = {
    id: generateId(),
    project_id: floorPlanData.projectId,
    name: floorPlanData.name,
    svg_viewbox: floorPlanData.svgViewbox || '0 0 800 600',
    background_image_url: floorPlanData.backgroundImageUrl || null,
    width_feet: floorPlanData.widthFeet || null,
    height_feet: floorPlanData.heightFeet || null,
    floor_number: floorPlanData.floorNumber ?? 1,
    is_active: true,
    created_at: now(),
    updated_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('floor_plans')
      .insert(newPlan)
      .select()
      .single();

    if (error) {
      return handleError(error, 'createFloorPlan');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'createFloorPlan');
  }
}

/**
 * Update a floor plan
 */
export async function updateFloorPlan(floorPlanId, updates) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.svgViewbox !== undefined) dbUpdates.svg_viewbox = updates.svgViewbox;
  if (updates.backgroundImageUrl !== undefined) dbUpdates.background_image_url = updates.backgroundImageUrl;
  if (updates.widthFeet !== undefined) dbUpdates.width_feet = updates.widthFeet;
  if (updates.heightFeet !== undefined) dbUpdates.height_feet = updates.heightFeet;
  if (updates.floorNumber !== undefined) dbUpdates.floor_number = updates.floorNumber;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  dbUpdates.updated_at = now();

  try {
    const { data, error } = await supabase
      .from('floor_plans')
      .update(dbUpdates)
      .eq('id', floorPlanId)
      .select()
      .single();

    if (error) {
      return handleError(error, 'updateFloorPlan');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'updateFloorPlan');
  }
}

/**
 * Delete a floor plan (soft delete)
 */
export async function deleteFloorPlan(floorPlanId) {
  return updateFloorPlan(floorPlanId, { isActive: false });
}

// =============================================================================
// FLOOR PLAN ELEMENTS
// =============================================================================

/**
 * Get all elements for a floor plan
 */
export async function getFloorPlanElements(floorPlanId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('floor_plan_elements')
      .select('*')
      .eq('floor_plan_id', floorPlanId)
      .order('z_index', { ascending: true });

    if (error) {
      return handleError(error, 'getFloorPlanElements');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getFloorPlanElements');
  }
}

/**
 * Get elements with their linked loop status
 */
export async function getFloorPlanElementsWithStatus(floorPlanId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('floor_plan_elements')
      .select(`
        *,
        loops (
          id,
          name,
          status,
          health_color
        )
      `)
      .eq('floor_plan_id', floorPlanId)
      .order('z_index', { ascending: true });

    if (error) {
      return handleError(error, 'getFloorPlanElementsWithStatus');
    }

    // Flatten loop info
    const enriched = (data || []).map(elem => ({
      ...elem,
      loopStatus: elem.loops?.status || null,
      loopName: elem.loops?.name || null,
      loopHealthColor: elem.loops?.health_color || null,
    }));

    return response(enriched);
  } catch (err) {
    return handleError(err, 'getFloorPlanElementsWithStatus');
  }
}

/**
 * Create a new floor plan element
 */
export async function createFloorPlanElement(elementData) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const defaults = ELEMENT_TYPE_DEFAULTS[elementData.elementType] || ELEMENT_TYPE_DEFAULTS.custom;

  const newElement = {
    id: generateId(),
    floor_plan_id: elementData.floorPlanId,
    loop_id: elementData.loopId || null,
    element_type: elementData.elementType,
    label: elementData.label || null,
    trade_category: elementData.tradeCategory || null,
    svg_type: elementData.svgType,
    svg_data: elementData.svgData,
    stroke_width: elementData.strokeWidth ?? defaults.strokeWidth,
    default_color: elementData.defaultColor || defaults.color,
    z_index: elementData.zIndex ?? 0,
    notes: elementData.notes || null,
    specs: elementData.specs || null,
    created_at: now(),
    updated_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('floor_plan_elements')
      .insert(newElement)
      .select()
      .single();

    if (error) {
      return handleError(error, 'createFloorPlanElement');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'createFloorPlanElement');
  }
}

/**
 * Update a floor plan element
 */
export async function updateFloorPlanElement(elementId, updates) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const dbUpdates = {};
  if (updates.loopId !== undefined) dbUpdates.loop_id = updates.loopId;
  if (updates.label !== undefined) dbUpdates.label = updates.label;
  if (updates.tradeCategory !== undefined) dbUpdates.trade_category = updates.tradeCategory;
  if (updates.svgData !== undefined) dbUpdates.svg_data = updates.svgData;
  if (updates.strokeWidth !== undefined) dbUpdates.stroke_width = updates.strokeWidth;
  if (updates.defaultColor !== undefined) dbUpdates.default_color = updates.defaultColor;
  if (updates.zIndex !== undefined) dbUpdates.z_index = updates.zIndex;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.specs !== undefined) dbUpdates.specs = updates.specs;
  dbUpdates.updated_at = now();

  try {
    const { data, error } = await supabase
      .from('floor_plan_elements')
      .update(dbUpdates)
      .eq('id', elementId)
      .select()
      .single();

    if (error) {
      return handleError(error, 'updateFloorPlanElement');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'updateFloorPlanElement');
  }
}

/**
 * Delete a floor plan element
 */
export async function deleteFloorPlanElement(elementId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { error } = await supabase
      .from('floor_plan_elements')
      .delete()
      .eq('id', elementId);

    if (error) {
      return handleError(error, 'deleteFloorPlanElement');
    }

    return response({ id: elementId, deleted: true });
  } catch (err) {
    return handleError(err, 'deleteFloorPlanElement');
  }
}

/**
 * Link an element to a loop
 */
export async function linkElementToLoop(elementId, loopId) {
  return updateFloorPlanElement(elementId, { loopId });
}

/**
 * Unlink an element from its loop
 */
export async function unlinkElementFromLoop(elementId) {
  return updateFloorPlanElement(elementId, { loopId: null });
}

/**
 * Get status summary for a floor plan
 */
export async function getFloorPlanStatusSummary(floorPlanId) {
  const { data: elements, error } = await getFloorPlanElementsWithStatus(floorPlanId);

  if (error) {
    return response(null, error);
  }

  const summary = {
    total: elements.length,
    pending: 0,
    active: 0,
    completed: 0,
    blocked: 0,
    unlinked: 0,
  };

  elements.forEach(elem => {
    if (!elem.loopStatus) {
      summary.unlinked++;
    } else {
      summary[elem.loopStatus] = (summary[elem.loopStatus] || 0) + 1;
    }
  });

  return response(summary);
}
