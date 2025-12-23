import { useState, useEffect, useCallback } from 'react';
import { useDevAuth } from './useDevAuth';
import { useAuth } from './useAuth';
import { ROLES } from '../lib/devData';

// Storage key for visibility settings
const STORAGE_KEY = 'hooomz_role_visibility';

// Nav sections that can be controlled
export const NAV_SECTIONS = {
  dashboard: {
    label: 'Dashboard',
    description: 'Main overview and project dashboard',
    routes: ['/']
  },
  time: {
    label: 'Time Tracking',
    description: 'Track hours worked on projects',
    routes: ['/time-tracker']
  },
  expenses: {
    label: 'Expenses',
    description: 'Log and manage project expenses',
    routes: ['/expenses']
  },
  dailyLog: {
    label: 'Daily Log',
    description: 'Daily notes and updates',
    routes: ['/daily-log']
  },
  pipeline: {
    label: 'Pipeline',
    description: 'Sales leads, estimates, and contracts',
    routes: ['/sales', '/estimates', '/contracts']
  },
  production: {
    label: 'Production',
    description: 'Active projects and completed work',
    routes: ['/production', '/completed']
  },
  team: {
    label: 'Team',
    description: 'Team member management',
    routes: ['/team']
  },
  costCatalogue: {
    label: 'Cost Catalogue',
    description: 'Pricing and material costs',
    routes: ['/cost-catalogue']
  },
  fieldGuide: {
    label: 'Field Guide',
    description: 'Training and reference materials',
    routes: ['/field-guide']
  },
  timeBudget: {
    label: 'Time Budget',
    description: 'Project time estimation tool',
    routes: ['/time-budget']
  },
  settings: {
    label: 'Settings',
    description: 'App configuration and preferences',
    routes: ['/settings']
  },
};

// Default visibility based on role hierarchy
// Higher level roles see more by default
const getDefaultVisibility = () => {
  const defaults = {};

  Object.keys(ROLES).forEach(role => {
    const roleConfig = ROLES[role];
    const level = roleConfig.level;

    defaults[role] = {
      dashboard: true, // Everyone sees dashboard
      time: level >= 20, // All team members
      expenses: level >= 20, // All team members
      dailyLog: level >= 20, // All team members
      pipeline: level >= 60, // Foreman and above
      production: level >= 40, // Carpenter and above
      team: level >= 60, // Foreman and above (view team directory)
      costCatalogue: level >= 60, // Foreman and above
      fieldGuide: level >= 20, // All team members
      timeBudget: level >= 60, // Foreman and above
      settings: level >= 100, // Admin only
    };
  });

  return defaults;
};

// Load visibility settings from localStorage
function loadVisibility() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to ensure all roles/sections exist
      const defaults = getDefaultVisibility();
      const merged = {};

      Object.keys(defaults).forEach(role => {
        merged[role] = {
          ...defaults[role],
          ...(parsed[role] || {}),
        };
      });

      return merged;
    }
  } catch (e) {
    console.error('Failed to load visibility settings:', e);
  }
  return getDefaultVisibility();
}

// Save visibility settings to localStorage
function saveVisibility(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Hook for managing role-based visibility settings
 * Returns visibility for current user's role and methods to update settings
 */
export function useRoleVisibility() {
  const { currentPersona } = useDevAuth();
  const { employee } = useAuth();
  const [allVisibility, setAllVisibility] = useState(getDefaultVisibility);

  // Get current role from either dev persona or real auth
  const currentRole = employee?.role || currentPersona?.role || 'labourer';

  // Load settings on mount
  useEffect(() => {
    setAllVisibility(loadVisibility());
  }, []);

  // Get visibility for current role
  const visibility = allVisibility[currentRole] || getDefaultVisibility()[currentRole];

  // Check if a section is visible for current role
  const canSee = useCallback((section) => {
    // Admin always sees everything
    if (currentRole === 'administrator') return true;
    return visibility[section] ?? false;
  }, [visibility, currentRole]);

  // Check if a route is accessible for current role
  const canAccessRoute = useCallback((route) => {
    // Admin always has access
    if (currentRole === 'administrator') return true;

    // Find which section this route belongs to
    for (const [sectionId, section] of Object.entries(NAV_SECTIONS)) {
      if (section.routes.some(r => route.startsWith(r) || route === r)) {
        return visibility[sectionId] ?? false;
      }
    }

    // Project routes are controlled by production visibility
    if (route.startsWith('/projects/')) {
      return visibility.production ?? false;
    }

    // Default to visible for unmatched routes
    return true;
  }, [visibility, currentRole]);

  // Get list of visible section IDs
  const visibleSections = Object.entries(visibility)
    .filter(([_, visible]) => visible)
    .map(([section]) => section);

  // Update visibility for a specific role (admin only)
  const updateRoleVisibility = useCallback((role, section, visible) => {
    // Prevent hiding settings from admin
    if (role === 'administrator' && section === 'settings') {
      return;
    }

    setAllVisibility(prev => {
      const updated = {
        ...prev,
        [role]: {
          ...prev[role],
          [section]: visible,
        },
      };
      saveVisibility(updated);
      return updated;
    });
  }, []);

  // Get visibility settings for all roles (for admin UI)
  const getAllVisibility = useCallback(() => {
    return allVisibility;
  }, [allVisibility]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    const defaults = getDefaultVisibility();
    setAllVisibility(defaults);
    saveVisibility(defaults);
  }, []);

  return {
    // For current user
    canSee,
    canAccessRoute,
    visibleSections,
    currentRole,

    // For admin configuration
    allVisibility,
    updateRoleVisibility,
    getAllVisibility,
    resetToDefaults,
  };
}
