import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getWorkCategories,
  getWorkSubcategories,
  getStages,
  getPhases,
  getProjectLocations,
  getTaskInstances,
  getContacts,
  updateTaskInstance,
  createTaskInstance,
  groupTasksByCategory,
  groupTasksBySubcategory,
  createActivityEntry,
} from '../services/api';

/**
 * Hook for managing Task Tracker state and data
 * Implements the Three Axis Model: Work Category, Stage, Location
 */
export function useTaskTracker(projectId) {
  // Core data
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [stages, setStages] = useState([]);
  const [phases, setPhases] = useState([]);
  const [locations, setLocations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [instances, setInstances] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Filters
  const [filters, setFilters] = useState({
    categoryCode: null,
    stageCode: null,
    locationPath: null,
    status: null,
    assignedTo: null,
    phaseFilter: null, // For checklist filtering
  });

  // Load initial data
  useEffect(() => {
    async function loadData() {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        const [
          categoriesRes,
          subcategoriesRes,
          stagesRes,
          phasesRes,
          locationsRes,
          contactsRes,
          instancesRes,
        ] = await Promise.all([
          getWorkCategories(),
          getWorkSubcategories(),
          getStages(),
          getPhases(),
          getProjectLocations(projectId),
          getContacts(),
          getTaskInstances(projectId),
        ]);

        if (categoriesRes.error) throw new Error(typeof categoriesRes.error === 'string' ? categoriesRes.error : JSON.stringify(categoriesRes.error));
        if (instancesRes.error) throw new Error(typeof instancesRes.error === 'string' ? instancesRes.error : JSON.stringify(instancesRes.error));

        setCategories(categoriesRes.data || []);
        setSubcategories(subcategoriesRes.data || []);
        setStages(stagesRes.data || []);
        setPhases(phasesRes.data || []);
        setLocations(locationsRes.data || []);
        setContacts(contactsRes.data || []);

        // Enrich instances with location names for better grouping display
        const locationMap = new Map((locationsRes.data || []).map(loc => [loc.id, loc]));
        const enrichedInstances = (instancesRes.data || []).map(inst => {
          const location = locationMap.get(inst.locationId);
          return {
            ...inst,
            locationName: location?.name || inst.locationName || null,
          };
        });
        setInstances(enrichedInstances);

        // Auto-expand categories that have in-progress or blocked tasks
        const toExpand = {};
        enrichedInstances.forEach(inst => {
          if (inst.status === 'in_progress' || inst.status === 'blocked') {
            toExpand[inst.categoryCode] = true;
          }
        });
        setExpandedCategories(toExpand);
      } catch (err) {
        const errorMsg = err?.message || (typeof err === 'string' ? err : 'An error occurred');
        setError(errorMsg);
        console.error('Task Tracker error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectId]);

  // Filtered instances
  const filteredInstances = useMemo(() => {
    let result = [...instances];

    if (filters.categoryCode) {
      result = result.filter(t => t.categoryCode === filters.categoryCode);
    }
    if (filters.stageCode) {
      result = result.filter(t => t.stageCode === filters.stageCode);
    }
    if (filters.locationPath) {
      result = result.filter(t => t.locationPath?.startsWith(filters.locationPath));
    }
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        result = result.filter(t => filters.status.includes(t.status));
      } else {
        result = result.filter(t => t.status === filters.status);
      }
    }
    if (filters.assignedTo) {
      result = result.filter(t => t.assignedTo === filters.assignedTo);
    }

    return result;
  }, [instances, filters]);

  // Grouped by category (for loop view)
  const categoryGroups = useMemo(() => {
    return groupTasksByCategory(filteredInstances, categories);
  }, [filteredInstances, categories]);

  // Get subcategory groups for a specific category
  const getSubcategoryGroups = useCallback((categoryCode) => {
    const categoryInstances = filteredInstances.filter(
      t => t.categoryCode === categoryCode
    );
    const categorySubcats = subcategories.filter(
      s => s.categoryCode === categoryCode
    );
    return groupTasksBySubcategory(categoryInstances, categorySubcats);
  }, [filteredInstances, subcategories]);

  // Toggle category expansion
  const toggleCategory = useCallback((categoryCode) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryCode]: !prev[categoryCode],
    }));
  }, []);

  // Update a task instance
  const updateInstance = useCallback(async (instanceId, updates) => {
    const { data, error: updateError } = await updateTaskInstance(instanceId, updates);

    if (updateError) {
      return { error: updateError };
    }

    // Update local state
    setInstances(prev =>
      prev.map(inst =>
        inst.id === instanceId ? { ...inst, ...updates } : inst
      )
    );

    // Log activity for status changes
    if (updates.status) {
      const instance = instances.find(i => i.id === instanceId);
      await createActivityEntry({
        project_id: projectId,
        event_type: `task.${updates.status}`,
        event_data: {
          task_name: instance?.name,
          previous_status: instance?.status,
          new_status: updates.status,
        },
        actor_name: 'You',
      });
    }

    return { data };
  }, [projectId, instances]);

  // Toggle task completion
  const toggleTaskComplete = useCallback(async (instanceId) => {
    const instance = instances.find(i => i.id === instanceId);
    if (!instance) return;

    const newStatus = instance.status === 'completed' ? 'pending' : 'completed';
    return updateInstance(instanceId, { status: newStatus });
  }, [instances, updateInstance]);

  // Add a new task instance
  const addInstance = useCallback(async (taskData) => {
    // Get location path if locationId is provided
    let locationPath = taskData.locationPath || null;
    if (taskData.locationId && !locationPath) {
      const loc = locations.find(l => l.id === taskData.locationId);
      if (loc) locationPath = loc.path;
    }

    const { data, error: createError } = await createTaskInstance(projectId, {
      ...taskData,
      locationPath,
    });

    if (createError) {
      return { error: createError };
    }

    // Add to local state
    setInstances(prev => [...prev, data]);

    // Auto-expand the category
    setExpandedCategories(prev => ({
      ...prev,
      [data.categoryCode]: true,
    }));

    // Log activity
    await createActivityEntry({
      project_id: projectId,
      event_type: 'task.created',
      event_data: {
        task_name: data.name,
        category: data.categoryCode,
        stage: data.stageCode,
      },
      actor_name: 'You',
    });

    return { data };
  }, [projectId, locations]);

  // Update filters
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      categoryCode: null,
      stageCode: null,
      locationPath: null,
      status: null,
      assignedTo: null,
      phaseFilter: null,
    });
  }, []);

  // Get contact by ID
  const getContact = useCallback((contactId) => {
    return contacts.find(c => c.id === contactId);
  }, [contacts]);

  // Get location by ID
  const getLocation = useCallback((locationId) => {
    return locations.find(l => l.id === locationId);
  }, [locations]);

  // Get stage by code
  const getStage = useCallback((stageCode) => {
    return stages.find(s => s.code === stageCode);
  }, [stages]);

  // Get category by code
  const getCategory = useCallback((categoryCode) => {
    return categories.find(c => c.code === categoryCode);
  }, [categories]);

  // Summary stats
  const stats = useMemo(() => {
    const total = filteredInstances.length;
    const completed = filteredInstances.filter(t => t.status === 'completed').length;
    const inProgress = filteredInstances.filter(t => t.status === 'in_progress').length;
    const blocked = filteredInstances.filter(t => t.status === 'blocked').length;
    const pending = filteredInstances.filter(t => t.status === 'pending').length;
    const overdue = filteredInstances.filter(t => {
      if (t.status === 'completed' || t.status === 'cancelled') return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return {
      total,
      completed,
      inProgress,
      blocked,
      pending,
      overdue,
      completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [filteredInstances]);

  // Build location tree for filter selector
  const locationTree = useMemo(() => {
    const buildTree = (parentId = null) => {
      return locations
        .filter(l => l.parentId === parentId)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(loc => ({
          ...loc,
          children: buildTree(loc.id),
        }));
    };
    return buildTree();
  }, [locations]);

  return {
    // Data
    categories,
    subcategories,
    stages,
    phases,
    locations,
    locationTree,
    contacts,
    instances: filteredInstances,
    categoryGroups,

    // UI State
    loading,
    error,
    selectedInstance,
    setSelectedInstance,
    expandedCategories,
    toggleCategory,

    // Filters
    filters,
    setFilter,
    clearFilters,

    // Actions
    updateInstance,
    addInstance,
    toggleTaskComplete,
    getSubcategoryGroups,

    // Helpers
    getContact,
    getLocation,
    getStage,
    getCategory,

    // Stats
    stats,
  };
}
