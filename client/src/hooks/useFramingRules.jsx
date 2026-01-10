import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getEffectiveFramingRules,
  saveFramingRulesToDatabase,
  fetchFramingRulesHistory,
  DEFAULT_FRAMING_RULES,
} from '../services/api/framingRules';

/**
 * Hook for managing framing calculation rules
 * Provides:
 * - Current rules (from DB or defaults)
 * - Admin status check
 * - Functions to save rules (one-time or universal)
 * - Rules history
 */
export function useFramingRules() {
  const { employee, user } = useAuth();
  const [rules, setRules] = useState(DEFAULT_FRAMING_RULES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // Determine if user is admin (check employee role)
  const isAdmin =
    employee?.role === 'administrator' ||
    employee?.role === 'manager';

  const organizationId = employee?.organization_id;
  const userId = user?.id;

  // Load rules from database on mount
  useEffect(() => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    loadRules();
  }, [organizationId]);

  /**
   * Load active rules from database
   */
  const loadRules = useCallback(async () => {
    if (!organizationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const effectiveRules = await getEffectiveFramingRules(organizationId);
      setRules(effectiveRules);
    } catch (err) {
      console.error('Error loading framing rules:', err);
      setError(err);
      // Fallback to defaults on error
      setRules(DEFAULT_FRAMING_RULES);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  /**
   * Load rules history for the organization
   */
  const loadHistory = useCallback(async () => {
    if (!organizationId) return;

    try {
      const { data, error } = await fetchFramingRulesHistory(organizationId);
      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error('Error loading rules history:', err);
      setError(err);
    }
  }, [organizationId]);

  /**
   * Save rules to database as new universal defaults
   * Creates a new version and deactivates previous rules
   * Only admins can do this
   */
  const saveAsUniversalDefaults = useCallback(
    async (newRules, ruleName = 'Custom Framing Rules', description = null) => {
      if (!isAdmin) {
        throw new Error('Only administrators can save universal defaults');
      }

      if (!organizationId || !userId) {
        throw new Error('Organization or user not found');
      }

      setError(null);

      try {
        const { data, error } = await saveFramingRulesToDatabase(
          organizationId,
          newRules,
          userId,
          ruleName,
          description
        );

        if (error) throw error;

        // Update local state with new rules
        setRules(newRules);

        return { data, error: null };
      } catch (err) {
        console.error('Error saving universal defaults:', err);
        setError(err);
        return { data: null, error: err };
      }
    },
    [isAdmin, organizationId, userId]
  );

  /**
   * Apply rules for one-time use (local state only, doesn't save to DB)
   */
  const applyOneTimeRules = useCallback((newRules) => {
    setRules(newRules);
  }, []);

  /**
   * Reset rules to database defaults
   */
  const resetToDefaults = useCallback(() => {
    loadRules();
  }, [loadRules]);

  /**
   * Reset rules to hardcoded system defaults
   */
  const resetToSystemDefaults = useCallback(() => {
    setRules(DEFAULT_FRAMING_RULES);
  }, []);

  return {
    // Current rules
    rules,
    setRules: applyOneTimeRules,

    // Loading state
    isLoading,
    error,

    // Admin status
    isAdmin,

    // History
    history,
    loadHistory,

    // Actions
    saveAsUniversalDefaults,
    applyOneTimeRules,
    resetToDefaults,
    resetToSystemDefaults,
    reload: loadRules,
  };
}
