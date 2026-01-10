import { useState, useEffect } from 'react';
import { Settings, Save, X, AlertCircle, Check } from 'lucide-react';
import { Button } from '../../ui';
import { FractionInput, SelectInput } from '../shared';

/**
 * Admin Rules Editor Component
 * Allows administrators to edit framing calculation default rules
 * Two modes:
 * - "Apply to This Calculation" - One-time override (local state only)
 * - "Save as Universal Defaults" - Persists to database for entire organization
 */

// Dropdown options (match WindowDoorFraming)
const OPENING_TYPES = [
  { value: 'window', label: 'Window' },
  { value: 'door', label: 'Door' },
  { value: 'pass-through', label: 'Pass-through / Cased Opening' },
];

const HEADER_SIZES = [
  { value: '2x6', label: '2×6 (5 1/2")' },
  { value: '2x8', label: '2×8 (7 1/4")' },
  { value: '2x10', label: '2×10 (9 1/4")' },
  { value: '2x12', label: '2×12 (11 1/4")' },
  { value: 'LVL-9.25', label: 'LVL 9 1/4"' },
  { value: 'LVL-11.25', label: 'LVL 11 1/4"' },
];

const HEADER_TYPES = [
  { value: 'built-up', label: 'Built-up (2× + ply)' },
  { value: 'solid', label: 'Solid (single)' },
  { value: 'lvl', label: 'LVL' },
];

const STUD_MATERIALS = [
  { value: '2x4', label: '2×4' },
  { value: '2x6', label: '2×6' },
];

const PLATE_CONFIGS = [
  { value: 'double', label: 'Double top plate' },
  { value: 'single', label: 'Single top plate' },
];

const STUD_SPACINGS = [
  { value: 16, label: '16" OC' },
  { value: 24, label: '24" OC' },
];

const SILL_STYLES = [
  { value: 'flat', label: 'Flat (1 1/2")' },
  { value: 'double', label: 'Double flat (3")' },
  { value: 'sloped', label: 'Sloped' },
];

export function AdminRulesEditor({
  isOpen,
  onClose,
  currentRules,
  onApplyOneTime,
  onSaveUniversal,
  isAdmin,
}) {
  const [editedRules, setEditedRules] = useState(currentRules);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMode, setSaveMode] = useState(null); // 'one-time' | 'universal'
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ruleName, setRuleName] = useState('Custom Framing Rules');
  const [description, setDescription] = useState('');

  // Sync with current rules when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditedRules(currentRules);
      setSaveMode(null);
      setShowConfirmation(false);
    }
  }, [isOpen, currentRules]);

  if (!isOpen) return null;

  const handleFieldChange = (field, value) => {
    setEditedRules((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyOneTime = () => {
    onApplyOneTime(editedRules);
    onClose();
  };

  const handleSaveUniversalClick = () => {
    setSaveMode('universal');
    setShowConfirmation(true);
  };

  const handleConfirmSaveUniversal = async () => {
    setIsSaving(true);
    try {
      await onSaveUniversal(editedRules, ruleName, description);
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error('Failed to save universal defaults:', error);
      alert('Failed to save universal defaults. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Edit Framing Calculation Defaults
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {isAdmin
                  ? 'Customize default values for your organization'
                  : 'You can apply changes to this calculation only'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!showConfirmation ? (
            <div className="space-y-6">
              {/* Opening Defaults */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Opening Defaults
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <SelectInput
                    label="Default Opening Type"
                    value={editedRules.openingType}
                    onChange={(e) =>
                      handleFieldChange('openingType', e.target.value)
                    }
                    options={OPENING_TYPES}
                  />
                  <FractionInput
                    label="Default R.O. Width (inches)"
                    value={editedRules.roWidth}
                    onChange={(val) => handleFieldChange('roWidth', val)}
                  />
                  <FractionInput
                    label="Default R.O. Height (inches)"
                    value={editedRules.roHeight}
                    onChange={(val) => handleFieldChange('roHeight', val)}
                  />
                  <FractionInput
                    label="Default Sill Height AFF (inches)"
                    value={editedRules.sillHeight}
                    onChange={(val) => handleFieldChange('sillHeight', val)}
                  />
                </div>
              </div>

              {/* Wall & Header Defaults */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Wall & Header Defaults
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FractionInput
                    label="Wall Height (inches)"
                    value={editedRules.wallHeight}
                    onChange={(val) => handleFieldChange('wallHeight', val)}
                  />
                  <SelectInput
                    label="Header Size"
                    value={editedRules.headerSize}
                    onChange={(e) =>
                      handleFieldChange('headerSize', e.target.value)
                    }
                    options={HEADER_SIZES}
                  />
                  <SelectInput
                    label="Header Type"
                    value={editedRules.headerType}
                    onChange={(e) =>
                      handleFieldChange('headerType', e.target.value)
                    }
                    options={HEADER_TYPES}
                  />
                  <SelectInput
                    label="Top Plate Configuration"
                    value={editedRules.topPlateConfig}
                    onChange={(e) =>
                      handleFieldChange('topPlateConfig', e.target.value)
                    }
                    options={PLATE_CONFIGS}
                  />
                </div>
              </div>

              {/* Stud Defaults */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Stud Defaults
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <SelectInput
                    label="Stud Material"
                    value={editedRules.studMaterial}
                    onChange={(e) =>
                      handleFieldChange('studMaterial', e.target.value)
                    }
                    options={STUD_MATERIALS}
                  />
                  <SelectInput
                    label="Stud Spacing"
                    value={editedRules.studSpacing}
                    onChange={(e) =>
                      handleFieldChange('studSpacing', parseInt(e.target.value))
                    }
                    options={STUD_SPACINGS}
                  />
                </div>
              </div>

              {/* Sill Defaults */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Sill Defaults
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <SelectInput
                    label="Sill Style"
                    value={editedRules.sillStyle}
                    onChange={(e) =>
                      handleFieldChange('sillStyle', e.target.value)
                    }
                    options={SILL_STYLES}
                  />
                  {editedRules.sillStyle === 'sloped' && (
                    <FractionInput
                      label="Sloped Sill Thickness (inches)"
                      value={editedRules.slopedSillThickness}
                      onChange={(val) =>
                        handleFieldChange('slopedSillThickness', val)
                      }
                    />
                  )}
                </div>
              </div>

              {/* Other Defaults */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Other Defaults
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FractionInput
                    label="Finish Floor Thickness (inches)"
                    value={editedRules.finishFloor}
                    onChange={(val) => handleFieldChange('finishFloor', val)}
                  />
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="headerTight"
                      checked={editedRules.headerTight}
                      onChange={(e) =>
                        handleFieldChange('headerTight', e.target.checked)
                      }
                      className="w-4 h-4 text-charcoal border-gray-300 rounded focus:ring-charcoal"
                    />
                    <label
                      htmlFor="headerTight"
                      className="text-sm text-gray-700"
                    >
                      Header Tight-Fit by Default
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Confirmation Dialog */
            <div className="py-8">
              <div className="max-w-md mx-auto text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  Save as Universal Defaults?
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  This will update the default framing calculation rules for your
                  entire organization. All future calculations will use these new
                  defaults.
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-left text-xs font-medium text-gray-700 mb-1">
                      Rule Name
                    </label>
                    <input
                      type="text"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      placeholder="e.g., Updated Wall Heights 2026"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-charcoal text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-left text-xs font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief note about these changes..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-charcoal text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmSaveUniversal}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Confirm & Save'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!showConfirmation && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-xs text-gray-500">
              {isAdmin
                ? 'Changes can be applied once or saved for all calculations'
                : 'Changes will only apply to this calculation'}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleApplyOneTime}>
                Apply to This Calculation
              </Button>
              {isAdmin && (
                <Button onClick={handleSaveUniversalClick}>
                  <Save className="w-4 h-4 mr-2" />
                  Save as Universal Defaults
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
