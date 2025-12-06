import { Input, Select, Checkbox } from '../../ui';
import { Card } from '../../ui';
import {
  BUDGET_RANGES_NEW,
  BUDGET_RANGES_RENO,
  BUILD_TIER_OPTIONS,
  PRIORITY_OPTIONS,
} from '../../../data/intakeSchema';

export function ProjectStep({ data, formType, onChange }) {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const handlePriorityToggle = (priority) => {
    const current = data.priorities || [];
    if (current.includes(priority)) {
      handleChange('priorities', current.filter(p => p !== priority));
    } else if (current.length < 3) {
      handleChange('priorities', [...current, priority]);
    }
  };

  const isNewConstruction = formType === 'new_construction';
  const budgetOptions = isNewConstruction ? BUDGET_RANGES_NEW : BUDGET_RANGES_RENO;

  return (
    <div className="space-y-6">
      {/* Address */}
      <Input
        label={isNewConstruction ? "Site / Lot Address" : "Property Address"}
        placeholder="123 Main Street, Moncton, NB"
        value={data.address || ''}
        onChange={(e) => handleChange('address', e.target.value)}
        required
      />

      {/* New Construction: Lot Status */}
      {isNewConstruction && (
        <Select
          label="Lot Purchased?"
          value={data.lot_purchased || 'still_looking'}
          onChange={(value) => handleChange('lot_purchased', value)}
          options={[
            { value: 'yes', label: 'Yes, I own the lot' },
            { value: 'under_contract', label: 'Under contract' },
            { value: 'still_looking', label: 'Still looking' },
          ]}
        />
      )}

      {/* Timeline */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Desired Start"
          type="month"
          value={data.desired_start_month || ''}
          onChange={(e) => handleChange('desired_start_month', e.target.value)}
        />
        <Input
          label={isNewConstruction ? "Target Move-In" : "Target Completion"}
          type="month"
          value={data.target_completion_month || ''}
          onChange={(e) => handleChange('target_completion_month', e.target.value)}
        />
      </div>

      {/* Budget */}
      <Select
        label="Budget Range"
        value={data.budget_range || 'undecided'}
        onChange={(value) => handleChange('budget_range', value)}
        options={budgetOptions}
      />

      {/* Build Tier */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-2">
          Build Tier
        </label>
        <div className="space-y-2">
          {BUILD_TIER_OPTIONS.map((tier) => (
            <button
              key={tier.value}
              type="button"
              onClick={() => handleChange('build_tier', tier.value)}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-all
                ${data.build_tier === tier.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-charcoal">{tier.label}</p>
                  <p className="text-sm text-gray-600">{tier.description}</p>
                </div>
                {data.build_tier === tier.value && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Priorities */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">
          Top Priorities (select up to 3)
        </label>
        <p className="text-xs text-gray-500 mb-3">
          What matters most to you in this project?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PRIORITY_OPTIONS.map((priority) => {
            const isSelected = (data.priorities || []).includes(priority.value);
            const isDisabled = !isSelected && (data.priorities || []).length >= 3;

            return (
              <button
                key={priority.value}
                type="button"
                onClick={() => handlePriorityToggle(priority.value)}
                disabled={isDisabled}
                className={`
                  p-3 rounded-lg border text-left text-sm transition-all
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : isDisabled
                      ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                {priority.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
