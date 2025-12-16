import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getFloorPlans,
  getFloorPlan,
  getFloorPlanElementsWithStatus,
  createFloorPlan,
  updateFloorPlan,
  deleteFloorPlan,
  createFloorPlanElement,
  updateFloorPlanElement,
  deleteFloorPlanElement,
  linkElementToLoop,
  unlinkElementFromLoop,
  getFloorPlanStatusSummary,
  FLOOR_PLAN_STATUS_COLORS,
  ELEMENT_TYPE_DEFAULTS,
  TRADE_COLORS,
} from '../services/api';

// Helper to extract error message from error object or string
const getErrorMessage = (error, fallback = 'An error occurred') => {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (typeof error === 'object') return error.message || fallback;
  return fallback;
};

/**
 * useFloorPlan - Hook for managing floor plan data and interactions
 *
 * Provides:
 * - Floor plans list for a project
 * - Current floor plan and its elements
 * - CRUD operations for plans and elements
 * - Loop linking/unlinking
 * - Status tracking and filtering
 */
export function useFloorPlan(projectId, initialFloorPlanId = null) {
  // Floor plans state
  const [floorPlans, setFloorPlans] = useState([]);
  const [currentFloorPlanId, setCurrentFloorPlanId] = useState(initialFloorPlanId);
  const [currentFloorPlan, setCurrentFloorPlan] = useState(null);

  // Elements state
  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);

  // Filters
  const [tradeFilter, setTradeFilter] = useState(null);
  const [elementTypeFilter, setElementTypeFilter] = useState(null);

  // Loading/error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Status summary
  const [statusSummary, setStatusSummary] = useState(null);

  // Load floor plans for project
  const loadFloorPlans = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getFloorPlans(projectId);

    if (fetchError) {
      setError(getErrorMessage(fetchError, 'Failed to load floor plans'));
      setFloorPlans([]);
    } else {
      setFloorPlans(data || []);
      // Auto-select first floor plan if none selected
      if (!currentFloorPlanId && data?.length > 0) {
        setCurrentFloorPlanId(data[0].id);
      }
    }

    setLoading(false);
  }, [projectId, currentFloorPlanId]);

  // Load current floor plan details and elements
  const loadFloorPlanDetails = useCallback(async () => {
    if (!currentFloorPlanId) {
      setCurrentFloorPlan(null);
      setElements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Load floor plan and elements in parallel
    const [planResult, elementsResult, summaryResult] = await Promise.all([
      getFloorPlan(currentFloorPlanId),
      getFloorPlanElementsWithStatus(currentFloorPlanId),
      getFloorPlanStatusSummary(currentFloorPlanId),
    ]);

    if (planResult.error) {
      setError(getErrorMessage(planResult.error, 'Failed to load floor plan'));
    } else {
      setCurrentFloorPlan(planResult.data);
    }

    if (elementsResult.error) {
      setError(getErrorMessage(elementsResult.error, 'Failed to load elements'));
      setElements([]);
    } else {
      setElements(elementsResult.data || []);
    }

    if (!summaryResult.error) {
      setStatusSummary(summaryResult.data);
    }

    setLoading(false);
  }, [currentFloorPlanId]);

  // Initial load
  useEffect(() => {
    loadFloorPlans();
  }, [loadFloorPlans]);

  // Load details when floor plan changes
  useEffect(() => {
    loadFloorPlanDetails();
  }, [loadFloorPlanDetails]);

  // Filtered elements based on trade/type filters
  const filteredElements = useMemo(() => {
    let filtered = elements;

    if (tradeFilter) {
      filtered = filtered.filter(e => e.tradeCategory === tradeFilter);
    }

    if (elementTypeFilter) {
      filtered = filtered.filter(e => e.elementType === elementTypeFilter);
    }

    return filtered;
  }, [elements, tradeFilter, elementTypeFilter]);

  // Selected element
  const selectedElement = useMemo(() => {
    if (!selectedElementId) return null;
    return elements.find(e => e.id === selectedElementId) || null;
  }, [elements, selectedElementId]);

  // Get element color based on status
  const getElementColor = useCallback((element) => {
    if (element.loopStatus) {
      return FLOOR_PLAN_STATUS_COLORS[element.loopStatus] || element.defaultColor;
    }
    return element.defaultColor;
  }, []);

  // ==========================================================================
  // Floor Plan CRUD
  // ==========================================================================

  const addFloorPlan = useCallback(async (planData) => {
    setSaving(true);
    const { data, error: createError } = await createFloorPlan({
      projectId,
      ...planData,
    });
    setSaving(false);

    if (createError) {
      setError(getErrorMessage(createError, 'Failed to create floor plan'));
      return { success: false, error: getErrorMessage(createError) };
    }

    setFloorPlans(prev => [...prev, data].sort((a, b) => a.floorNumber - b.floorNumber));
    setCurrentFloorPlanId(data.id);
    return { success: true, data };
  }, [projectId]);

  const editFloorPlan = useCallback(async (floorPlanId, updates) => {
    setSaving(true);
    const { data, error: updateError } = await updateFloorPlan(floorPlanId, updates);
    setSaving(false);

    if (updateError) {
      setError(getErrorMessage(updateError, 'Failed to update floor plan'));
      return { success: false, error: getErrorMessage(updateError) };
    }

    setFloorPlans(prev =>
      prev.map(p => p.id === floorPlanId ? { ...p, ...data } : p)
        .sort((a, b) => a.floorNumber - b.floorNumber)
    );

    if (currentFloorPlanId === floorPlanId) {
      setCurrentFloorPlan(prev => ({ ...prev, ...data }));
    }

    return { success: true, data };
  }, [currentFloorPlanId]);

  const removeFloorPlan = useCallback(async (floorPlanId) => {
    setSaving(true);
    const { error: deleteError } = await deleteFloorPlan(floorPlanId);
    setSaving(false);

    if (deleteError) {
      setError(getErrorMessage(deleteError, 'Failed to delete floor plan'));
      return { success: false, error: getErrorMessage(deleteError) };
    }

    setFloorPlans(prev => prev.filter(p => p.id !== floorPlanId));

    // If deleted current plan, switch to first available
    if (currentFloorPlanId === floorPlanId) {
      const remaining = floorPlans.filter(p => p.id !== floorPlanId);
      setCurrentFloorPlanId(remaining.length > 0 ? remaining[0].id : null);
    }

    return { success: true };
  }, [currentFloorPlanId, floorPlans]);

  // ==========================================================================
  // Element CRUD
  // ==========================================================================

  const addElement = useCallback(async (elementData) => {
    if (!currentFloorPlanId) {
      return { success: false, error: 'No floor plan selected' };
    }

    setSaving(true);
    const { data, error: createError } = await createFloorPlanElement({
      floorPlanId: currentFloorPlanId,
      ...elementData,
    });
    setSaving(false);

    if (createError) {
      setError(getErrorMessage(createError, 'Failed to create element'));
      return { success: false, error: getErrorMessage(createError) };
    }

    setElements(prev => [...prev, data].sort((a, b) => a.zIndex - b.zIndex));
    setSelectedElementId(data.id);
    return { success: true, data };
  }, [currentFloorPlanId]);

  const editElement = useCallback(async (elementId, updates) => {
    setSaving(true);
    const { data, error: updateError } = await updateFloorPlanElement(elementId, updates);
    setSaving(false);

    if (updateError) {
      setError(getErrorMessage(updateError, 'Failed to update element'));
      return { success: false, error: getErrorMessage(updateError) };
    }

    setElements(prev =>
      prev.map(e => e.id === elementId ? { ...e, ...data } : e)
        .sort((a, b) => a.zIndex - b.zIndex)
    );

    return { success: true, data };
  }, []);

  const removeElement = useCallback(async (elementId) => {
    setSaving(true);
    const { error: deleteError } = await deleteFloorPlanElement(elementId);
    setSaving(false);

    if (deleteError) {
      setError(getErrorMessage(deleteError, 'Failed to delete element'));
      return { success: false, error: getErrorMessage(deleteError) };
    }

    setElements(prev => prev.filter(e => e.id !== elementId));

    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }

    return { success: true };
  }, [selectedElementId]);

  // ==========================================================================
  // Loop Linking
  // ==========================================================================

  const linkToLoop = useCallback(async (elementId, loopId) => {
    setSaving(true);
    const { data, error: linkError } = await linkElementToLoop(elementId, loopId);
    setSaving(false);

    if (linkError) {
      setError(getErrorMessage(linkError, 'Failed to link to loop'));
      return { success: false, error: getErrorMessage(linkError) };
    }

    // Reload to get updated status
    await loadFloorPlanDetails();
    return { success: true, data };
  }, [loadFloorPlanDetails]);

  const linkToNewLoop = useCallback(async (elementId, loopData) => {
    setSaving(true);
    const { data, error: linkError } = await linkElementToLoop(elementId, null, {
      projectId,
      ...loopData,
    });
    setSaving(false);

    if (linkError) {
      setError(getErrorMessage(linkError, 'Failed to create and link loop'));
      return { success: false, error: getErrorMessage(linkError) };
    }

    // Reload to get updated status
    await loadFloorPlanDetails();
    return { success: true, data };
  }, [projectId, loadFloorPlanDetails]);

  const unlinkFromLoop = useCallback(async (elementId) => {
    setSaving(true);
    const { data, error: unlinkError } = await unlinkElementFromLoop(elementId);
    setSaving(false);

    if (unlinkError) {
      setError(getErrorMessage(unlinkError, 'Failed to unlink from loop'));
      return { success: false, error: getErrorMessage(unlinkError) };
    }

    setElements(prev =>
      prev.map(e => e.id === elementId ? { ...e, loopId: null, loopStatus: null, loopName: null } : e)
    );

    return { success: true, data };
  }, []);

  // ==========================================================================
  // Utility functions
  // ==========================================================================

  const refresh = useCallback(async () => {
    await Promise.all([loadFloorPlans(), loadFloorPlanDetails()]);
  }, [loadFloorPlans, loadFloorPlanDetails]);

  const clearFilters = useCallback(() => {
    setTradeFilter(null);
    setElementTypeFilter(null);
  }, []);

  const selectFloorPlan = useCallback((floorPlanId) => {
    setCurrentFloorPlanId(floorPlanId);
    setSelectedElementId(null);
  }, []);

  const selectElement = useCallback((elementId) => {
    setSelectedElementId(elementId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElementId(null);
  }, []);

  // Return hook interface
  return {
    // Floor plans
    floorPlans,
    currentFloorPlan,
    currentFloorPlanId,
    selectFloorPlan,

    // Elements
    elements,
    filteredElements,
    selectedElement,
    selectedElementId,
    selectElement,
    clearSelection,

    // Filters
    tradeFilter,
    setTradeFilter,
    elementTypeFilter,
    setElementTypeFilter,
    clearFilters,

    // Status
    statusSummary,
    getElementColor,

    // State
    loading,
    saving,
    error,

    // Floor plan operations
    addFloorPlan,
    editFloorPlan,
    removeFloorPlan,

    // Element operations
    addElement,
    editElement,
    removeElement,

    // Loop operations
    linkToLoop,
    linkToNewLoop,
    unlinkFromLoop,

    // Utilities
    refresh,

    // Constants
    FLOOR_PLAN_STATUS_COLORS,
    ELEMENT_TYPE_DEFAULTS,
    TRADE_COLORS,
  };
}

export default useFloorPlan;
