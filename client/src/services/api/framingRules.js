import { supabase } from '../supabase';

/**
 * Framing Calculation Rules Service
 * Manages organization-specific default values for window/door framing calculations
 */

// Default hardcoded rules (fallback when no DB rules exist)
export const DEFAULT_FRAMING_RULES = {
  openingType: 'window',
  openingTag: '',
  roWidth: 36,
  roHeight: 48,
  sillHeight: 36,
  wallHeight: 97.125,
  headerSize: '2x10',
  headerType: 'built-up',
  topPlateConfig: 'double',
  studSpacing: 16,
  sillStyle: 'flat',
  slopedSillThickness: 2,
  studMaterial: '2x4',
  headerTight: false,
  finishFloor: 0,
};

/**
 * Fetch active framing calculation rules for an organization
 * @param {string} organizationId - Organization UUID
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export async function fetchActiveFramingRules(organizationId) {
  try {
    const { data, error } = await supabase
      .from('framing_calculation_rules')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    if (error) {
      // If no rules exist yet, return null (will use defaults)
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching framing rules:', error);
    return { data: null, error };
  }
}

/**
 * Save new framing calculation rules to database (creates new version, deactivates old)
 * @param {string} organizationId - Organization UUID
 * @param {object} ruleValues - JSONB object with all rule parameters
 * @param {string} userId - User UUID (for audit trail)
 * @param {string} ruleName - Optional custom name for this rule set
 * @param {string} description - Optional description
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export async function saveFramingRulesToDatabase(
  organizationId,
  ruleValues,
  userId,
  ruleName = 'Custom Framing Rules',
  description = null
) {
  try {
    const { data, error } = await supabase
      .from('framing_calculation_rules')
      .insert({
        organization_id: organizationId,
        rule_name: ruleName,
        description,
        rule_values: ruleValues,
        is_active: true,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error saving framing rules:', error);
    return { data: null, error };
  }
}

/**
 * Fetch framing rules history for an organization (all versions)
 * @param {string} organizationId - Organization UUID
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function fetchFramingRulesHistory(organizationId) {
  try {
    const { data, error } = await supabase
      .from('framing_calculation_rules')
      .select(`
        *,
        created_by_profile:profiles!framing_calculation_rules_created_by_fkey(full_name, email),
        updated_by_profile:profiles!framing_calculation_rules_updated_by_fkey(full_name, email)
      `)
      .eq('organization_id', organizationId)
      .order('version', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching framing rules history:', error);
    return { data: null, error };
  }
}

/**
 * Reactivate a previous version of framing rules
 * @param {string} ruleId - Rule UUID to reactivate
 * @param {string} userId - User UUID (for audit trail)
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export async function reactivateFramingRules(ruleId, userId) {
  try {
    // The trigger will automatically deactivate other rules
    const { data, error } = await supabase
      .from('framing_calculation_rules')
      .update({
        is_active: true,
        updated_by: userId,
      })
      .eq('id', ruleId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error reactivating framing rules:', error);
    return { data: null, error };
  }
}

/**
 * Delete a framing rules version (soft delete by marking inactive)
 * @param {string} ruleId - Rule UUID to delete
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export async function deleteFramingRules(ruleId) {
  try {
    const { data, error } = await supabase
      .from('framing_calculation_rules')
      .delete()
      .eq('id', ruleId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error deleting framing rules:', error);
    return { data: null, error };
  }
}

/**
 * Get merged rules (database rules merged with defaults as fallback)
 * @param {string} organizationId - Organization UUID
 * @returns {Promise<object>} - Merged rule values
 */
export async function getEffectiveFramingRules(organizationId) {
  const { data, error } = await fetchActiveFramingRules(organizationId);

  if (error || !data) {
    // Return hardcoded defaults if no DB rules
    return DEFAULT_FRAMING_RULES;
  }

  // Merge DB rules with defaults (DB rules take precedence)
  return {
    ...DEFAULT_FRAMING_RULES,
    ...data.rule_values,
  };
}
