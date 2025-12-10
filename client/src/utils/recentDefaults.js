/**
 * Smart Defaults Utility for Hooomz OS
 *
 * Stores and retrieves recent user selections per project.
 * Reduces form-filling friction by pre-populating fields.
 */

const STORAGE_PREFIX = 'hooomz_recent_defaults';

/**
 * Get storage key for a project
 * @param {string} projectId
 * @returns {string}
 */
function getStorageKey(projectId) {
  return projectId ? `${STORAGE_PREFIX}_${projectId}` : STORAGE_PREFIX;
}

/**
 * Get recent defaults for a project
 * @param {string} projectId - Optional project ID for project-scoped defaults
 * @returns {Object} Recent default values
 */
export function getRecentDefaults(projectId = null) {
  try {
    const key = getStorageKey(projectId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Update recent defaults for a project
 * @param {Object} updates - Key-value pairs to update
 * @param {string} projectId - Optional project ID for project-scoped defaults
 */
export function updateRecentDefaults(updates, projectId = null) {
  try {
    const key = getStorageKey(projectId);
    const current = getRecentDefaults(projectId);
    const updated = {
      ...current,
      ...updates,
      _lastUpdated: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // Silent fail - defaults are enhancement, not requirement
  }
}

/**
 * Clear recent defaults for a project
 * @param {string} projectId - Optional project ID
 */
export function clearRecentDefaults(projectId = null) {
  try {
    const key = getStorageKey(projectId);
    localStorage.removeItem(key);
  } catch {
    // Silent fail
  }
}

/**
 * Build smart defaults from multiple context sources
 * Priority: URL params > Current filters > Recent defaults
 *
 * @param {Object} options
 * @param {Object} options.urlParams - Values from URL (highest priority)
 * @param {Object} options.currentFilters - Values from active filters
 * @param {string} options.projectId - Project ID for recent defaults lookup
 * @returns {Object} Merged defaults with priority applied
 */
export function buildSmartDefaults({ urlParams = {}, currentFilters = {}, projectId = null }) {
  const recent = getRecentDefaults(projectId);

  // Priority: URL > Filters > Recent
  // Only include non-null, non-undefined values
  const merged = {};

  // Start with recent defaults (lowest priority)
  Object.entries(recent).forEach(([key, value]) => {
    if (value != null && !key.startsWith('_')) {
      merged[key] = value;
    }
  });

  // Override with current filters
  Object.entries(currentFilters).forEach(([key, value]) => {
    if (value != null && value !== '' && value !== 'all') {
      merged[key] = value;
    }
  });

  // Override with URL params (highest priority)
  Object.entries(urlParams).forEach(([key, value]) => {
    if (value != null && value !== '') {
      merged[key] = value;
    }
  });

  return merged;
}
