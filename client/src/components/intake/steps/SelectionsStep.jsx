import { Card } from '../../ui';

/**
 * SelectionsStep - Material and finish selections
 *
 * Handles multiple step IDs: selections, exterior, interior, kitchen, bathrooms, mechanical
 * Displays relevant options based on stepId and build tier
 */

// Selection options organized by category
const SELECTION_OPTIONS = {
  exterior: {
    siding_type: {
      label: 'Siding Material',
      options: [
        { value: 'vinyl', label: 'Vinyl Siding', tier: 'good' },
        { value: 'fiber_cement', label: 'Fiber Cement (HardiePlank)', tier: 'better' },
        { value: 'wood', label: 'Wood/Cedar', tier: 'best' },
        { value: 'stone_veneer', label: 'Stone Veneer Accent', tier: 'best' },
        { value: 'mixed', label: 'Mixed Materials', tier: 'better' },
      ],
    },
    roof_material: {
      label: 'Roofing',
      options: [
        { value: 'asphalt', label: 'Asphalt Shingles', tier: 'good' },
        { value: 'architectural', label: 'Architectural Shingles', tier: 'better' },
        { value: 'metal', label: 'Standing Seam Metal', tier: 'best' },
      ],
    },
    window_frame: {
      label: 'Window Frames',
      options: [
        { value: 'vinyl', label: 'Vinyl', tier: 'good' },
        { value: 'fiberglass', label: 'Fiberglass', tier: 'better' },
        { value: 'wood_clad', label: 'Wood-Clad', tier: 'best' },
      ],
    },
    exterior_style: {
      label: 'Exterior Details',
      options: [
        { value: 'simple', label: 'Simple/Clean Lines', tier: 'good' },
        { value: 'traditional', label: 'Traditional Details', tier: 'better' },
        { value: 'custom', label: 'Custom Millwork', tier: 'best' },
      ],
    },
  },
  interior: {
    main_floor_flooring: {
      label: 'Main Floor Flooring',
      options: [
        { value: 'lvp', label: 'Luxury Vinyl Plank', tier: 'good' },
        { value: 'engineered', label: 'Engineered Hardwood', tier: 'better' },
        { value: 'hardwood', label: 'Solid Hardwood', tier: 'best' },
        { value: 'tile', label: 'Porcelain Tile', tier: 'better' },
      ],
    },
    bedroom_flooring: {
      label: 'Bedroom Flooring',
      options: [
        { value: 'carpet', label: 'Carpet', tier: 'good' },
        { value: 'lvp', label: 'Luxury Vinyl Plank', tier: 'better' },
        { value: 'hardwood', label: 'Hardwood', tier: 'best' },
      ],
    },
    door_style: {
      label: 'Interior Doors',
      options: [
        { value: 'hollow', label: 'Hollow Core', tier: 'good' },
        { value: 'shaker', label: 'Solid Shaker', tier: 'better' },
        { value: 'panel', label: 'Raised Panel Solid', tier: 'best' },
      ],
    },
    trim_style: {
      label: 'Trim & Millwork',
      options: [
        { value: 'simple', label: 'Simple 3.5" Casing', tier: 'good' },
        { value: 'craftsman', label: 'Craftsman Style', tier: 'better' },
        { value: 'custom', label: 'Custom Millwork', tier: 'best' },
      ],
    },
  },
  kitchen: {
    cabinet_construction: {
      label: 'Cabinet Construction',
      options: [
        { value: 'modular', label: 'Stock/Modular', tier: 'good' },
        { value: 'semi_custom', label: 'Semi-Custom', tier: 'better' },
        { value: 'custom', label: 'Full Custom', tier: 'best' },
      ],
    },
    cabinet_style: {
      label: 'Cabinet Door Style',
      options: [
        { value: 'flat', label: 'Flat Panel', tier: 'good' },
        { value: 'shaker', label: 'Shaker', tier: 'better' },
        { value: 'raised', label: 'Raised Panel', tier: 'better' },
        { value: 'inset', label: 'Inset', tier: 'best' },
      ],
    },
    countertop: {
      label: 'Countertops',
      options: [
        { value: 'laminate', label: 'Laminate', tier: 'good' },
        { value: 'quartz', label: 'Quartz', tier: 'better' },
        { value: 'granite', label: 'Granite', tier: 'better' },
        { value: 'quartzite', label: 'Quartzite/Marble', tier: 'best' },
      ],
    },
    island_size: {
      label: 'Kitchen Island',
      options: [
        { value: 'none', label: 'No Island', tier: 'good' },
        { value: 'small', label: 'Small (4-6 ft)', tier: 'good' },
        { value: 'medium', label: 'Medium (6-8 ft)', tier: 'better' },
        { value: 'large', label: 'Large (8+ ft)', tier: 'best' },
      ],
    },
    backsplash: {
      label: 'Backsplash',
      options: [
        { value: 'none', label: 'Paint Only', tier: 'good' },
        { value: 'short', label: 'Short Tile (18")', tier: 'better' },
        { value: 'full', label: 'Full Height', tier: 'best' },
      ],
    },
  },
  bathrooms: {
    primary_shower: {
      label: 'Primary Bath Shower',
      options: [
        { value: 'acrylic_tub_shower', label: 'Acrylic Tub/Shower', tier: 'good' },
        { value: 'tile_tub_shower', label: 'Tiled Tub/Shower', tier: 'better' },
        { value: 'walk_in_tile', label: 'Walk-in Tile Shower', tier: 'better' },
        { value: 'glass_tile', label: 'Glass-enclosed Tile', tier: 'best' },
        { value: 'freestanding_tub', label: 'Freestanding Tub + Walk-in', tier: 'best' },
      ],
    },
    secondary_bath: {
      label: 'Secondary Bath(s)',
      options: [
        { value: 'acrylic_tub_shower', label: 'Acrylic Tub/Shower', tier: 'good' },
        { value: 'tile_tub_shower', label: 'Tiled Tub/Shower', tier: 'better' },
        { value: 'custom', label: 'Custom Each', tier: 'best' },
      ],
    },
    vanity_type: {
      label: 'Vanity Cabinets',
      options: [
        { value: 'stock', label: 'Stock/Box Store', tier: 'good' },
        { value: 'semi_custom', label: 'Semi-Custom', tier: 'better' },
        { value: 'custom', label: 'Custom Built', tier: 'best' },
      ],
    },
    vanity_top: {
      label: 'Vanity Tops',
      options: [
        { value: 'laminate', label: 'Cultured Marble', tier: 'good' },
        { value: 'quartz', label: 'Quartz', tier: 'better' },
        { value: 'stone', label: 'Natural Stone', tier: 'best' },
      ],
    },
  },
  mechanical: {
    hvac_system: {
      label: 'Heating/Cooling',
      options: [
        { value: 'baseboard_window', label: 'Electric Baseboard + Window AC', tier: 'good' },
        { value: 'baseboard_minisplit', label: 'Electric Baseboard + Mini-splits', tier: 'better' },
        { value: 'ducted_heat_pump', label: 'Ducted Heat Pump', tier: 'better' },
        { value: 'geothermal', label: 'Geothermal', tier: 'best' },
        { value: 'forced_air_gas', label: 'Forced Air Gas', tier: 'better' },
      ],
    },
    water_heater: {
      label: 'Hot Water',
      options: [
        { value: 'tank_electric', label: 'Electric Tank', tier: 'good' },
        { value: 'tank_propane', label: 'Propane Tank', tier: 'better' },
        { value: 'tankless_electric', label: 'Tankless Electric', tier: 'better' },
        { value: 'tankless_propane', label: 'Tankless Propane', tier: 'best' },
        { value: 'heat_pump', label: 'Heat Pump Water Heater', tier: 'best' },
      ],
    },
    electrical_upgrades: {
      label: 'Electrical Features',
      multiSelect: true,
      options: [
        { value: 'ev_ready', label: 'EV Charger Ready' },
        { value: 'generator_hookup', label: 'Generator Hookup' },
        { value: 'smart_panel', label: 'Smart Electrical Panel' },
        { value: 'whole_home_surge', label: 'Whole Home Surge' },
        { value: 'recessed_lighting', label: 'Recessed Lighting Throughout' },
      ],
    },
  },
};

// Tier badge colors
const TIER_COLORS = {
  good: 'bg-gray-100 text-gray-700',
  better: 'bg-blue-100 text-blue-700',
  best: 'bg-amber-100 text-amber-700',
};

// Get default value for a field based on build tier
function getTierDefault(fieldOptions, buildTier) {
  // First try to find an exact tier match
  const exactMatch = fieldOptions.find(opt => opt.tier === buildTier);
  if (exactMatch) return exactMatch.value;

  // Fallback: find the closest tier (for fields that don't have all tiers)
  const tierOrder = ['good', 'better', 'best'];
  const targetIndex = tierOrder.indexOf(buildTier);

  // Look for lower tiers if exact not found
  for (let i = targetIndex; i >= 0; i--) {
    const match = fieldOptions.find(opt => opt.tier === tierOrder[i]);
    if (match) return match.value;
  }

  // Fallback to first option
  return fieldOptions[0]?.value;
}

export function SelectionsStep({ stepId, data, formType, buildTier, onChange }) {
  // Determine which category to show based on stepId
  const categoryId = stepId === 'selections' ? 'exterior' : stepId;
  const category = SELECTION_OPTIONS[categoryId];

  if (!category) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">
          Selection options for "{stepId}" coming soon...
        </p>
      </Card>
    );
  }

  const currentSelections = data?.[categoryId] || {};

  // Get the effective value - use selection if made, otherwise tier default
  const getEffectiveValue = (fieldId, field) => {
    if (currentSelections[fieldId] !== undefined) {
      return currentSelections[fieldId];
    }
    // Return tier-based default for single-select fields
    if (!field.multiSelect && field.options?.length > 0) {
      return getTierDefault(field.options, buildTier || 'better');
    }
    return field.multiSelect ? [] : undefined;
  };

  const handleChange = (field, value) => {
    onChange({
      [categoryId]: {
        ...currentSelections,
        [field]: value,
      },
    });
  };

  const handleMultiSelect = (field, value) => {
    const current = currentSelections[field] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleChange(field, updated);
  };

  return (
    <div className="space-y-6">
      {Object.entries(category).map(([fieldId, field]) => (
        <div key={fieldId}>
          <label className="block text-sm font-medium text-charcoal mb-2">
            {field.label}
          </label>

          {field.multiSelect ? (
            // Multi-select checkboxes
            <div className="grid grid-cols-1 gap-2">
              {field.options.map((option) => {
                const effectiveValue = getEffectiveValue(fieldId, field);
                const isSelected = (effectiveValue || []).includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleMultiSelect(fieldId, option.value)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                      ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}
                    `}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-charcoal">{option.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            // Single select radio-style buttons
            <div className="grid grid-cols-1 gap-2">
              {field.options.map((option) => {
                const effectiveValue = getEffectiveValue(fieldId, field);
                const isSelected = effectiveValue === option.value;
                const isRecommended = option.tier === buildTier;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange(fieldId, option.value)}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border-2 text-left transition-all
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${isSelected ? 'border-blue-500' : 'border-gray-300'}
                      `}>
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <span className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-charcoal'}`}>
                        {option.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {option.tier && (
                        <span className={`text-xs px-2 py-0.5 rounded ${TIER_COLORS[option.tier]}`}>
                          {option.tier.charAt(0).toUpperCase() + option.tier.slice(1)}
                        </span>
                      )}
                      {isRecommended && (
                        <span className="text-xs text-green-600 font-medium">
                          Recommended
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Tier guide */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 mb-2">
          <strong>Your build tier:</strong> {buildTier?.charAt(0).toUpperCase() + buildTier?.slice(1)}
        </p>
        <p className="text-xs text-gray-500">
          Options labeled "Recommended" match your selected build tier. You can mix and match
          based on your priorities - upgrade where it matters most to you.
        </p>
      </div>
    </div>
  );
}
