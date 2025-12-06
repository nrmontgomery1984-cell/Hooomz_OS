import { Card, Select } from '../../ui';
import {
  SQFT_RANGES,
  STOREY_OPTIONS,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
  GARAGE_OPTIONS,
} from '../../../data/intakeSchema';
import { Ruler, Building2, Bed, Bath, Car, Shirt, Trees } from 'lucide-react';

/**
 * LayoutStep - Home size and layout for new construction
 */

const BASEMENT_FINISH_OPTIONS = [
  { value: 'unfinished', label: 'Unfinished (concrete floor, exposed framing)' },
  { value: 'partial', label: 'Partially finished (rec room or bedroom)' },
  { value: 'full', label: 'Fully finished (legal suite potential)' },
];

const GARAGE_TYPE_OPTIONS = [
  { value: 'attached', label: 'Attached' },
  { value: 'detached', label: 'Detached' },
];

const LAUNDRY_OPTIONS = [
  { value: 'main_floor', label: 'Main Floor' },
  { value: 'second_floor', label: 'Second Floor / Near Bedrooms' },
  { value: 'basement', label: 'Basement' },
];

const OUTDOOR_SPACE_OPTIONS = [
  { value: 'covered_porch', label: 'Covered Front Porch' },
  { value: 'deck', label: 'Rear Deck' },
  { value: 'covered_deck', label: 'Covered Deck' },
  { value: 'patio', label: 'Patio' },
  { value: 'screened_room', label: 'Screened Room' },
  { value: 'sunroom', label: 'Sunroom' },
];

export function LayoutStep({ data, onChange }) {
  const layoutData = data || {};

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const handleOutdoorToggle = (value) => {
    const current = layoutData.outdoor_spaces || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleChange('outdoor_spaces', updated);
  };

  return (
    <div className="space-y-6">
      {/* Square Footage */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Ruler className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium text-charcoal">Home Size</h3>
        </div>
        <Select
          value={layoutData.sqft_range || '1600_2000'}
          onChange={(value) => handleChange('sqft_range', value)}
          options={SQFT_RANGES}
        />
        <p className="text-xs text-gray-500 mt-2">
          Main floor + upper floors (not including basement).
        </p>
      </Card>

      {/* Storeys */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-charcoal">Number of Storeys</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {STOREY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange('storeys', option.value)}
              className={`
                p-3 rounded-lg border-2 text-sm transition-all
                ${layoutData.storeys === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-charcoal'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Basement */}
      <Card className="p-4">
        <h3 className="font-medium text-charcoal mb-3">Basement Finish Level</h3>
        <Select
          value={layoutData.basement_finish || 'unfinished'}
          onChange={(value) => handleChange('basement_finish', value)}
          options={BASEMENT_FINISH_OPTIONS}
        />
      </Card>

      {/* Bedrooms */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bed className="w-5 h-5 text-purple-500" />
          <h3 className="font-medium text-charcoal">Bedrooms</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {BEDROOM_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange('bedrooms', option.value)}
              className={`
                p-3 rounded-lg border-2 text-sm transition-all
                ${layoutData.bedrooms === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-charcoal'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={layoutData.primary_ensuite !== false}
            onChange={(e) => handleChange('primary_ensuite', e.target.checked)}
            className="rounded border-gray-300"
          />
          Primary bedroom with ensuite bathroom
        </label>
      </Card>

      {/* Bathrooms */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bath className="w-5 h-5 text-cyan-500" />
          <h3 className="font-medium text-charcoal">Bathrooms</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Full Bathrooms</label>
            <div className="grid grid-cols-4 gap-2">
              {BATHROOM_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('full_bathrooms', option.value)}
                  className={`
                    p-2 rounded-lg border-2 text-sm transition-all
                    ${layoutData.full_bathrooms === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-charcoal'
                    }
                  `}
                >
                  {option.value}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Half Baths (Powder Rooms)</label>
            <div className="grid grid-cols-4 gap-2">
              {['0', '1', '2'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleChange('half_bathrooms', value)}
                  className={`
                    p-2 rounded-lg border-2 text-sm transition-all
                    ${layoutData.half_bathrooms === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-charcoal'
                    }
                  `}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Garage */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Car className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-charcoal">Garage</h3>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {GARAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('garage_size', option.value)}
                className={`
                  p-3 rounded-lg border-2 text-sm transition-all
                  ${layoutData.garage_size === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-charcoal'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
          {layoutData.garage_size && layoutData.garage_size !== 'none' && (
            <div className="flex gap-2">
              {GARAGE_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('garage_type', option.value)}
                  className={`
                    flex-1 p-2 rounded-lg border-2 text-sm transition-all
                    ${layoutData.garage_type === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-charcoal'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Laundry Location */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shirt className="w-5 h-5 text-rose-500" />
          <h3 className="font-medium text-charcoal">Laundry Location</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {LAUNDRY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange('laundry_location', option.value)}
              className={`
                p-3 rounded-lg border-2 text-sm text-left transition-all
                ${layoutData.laundry_location === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-charcoal'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Outdoor Spaces */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trees className="w-5 h-5 text-green-600" />
          <h3 className="font-medium text-charcoal">Outdoor Living Spaces</h3>
        </div>
        <p className="text-sm text-gray-600 mb-3">Select all that interest you:</p>
        <div className="grid grid-cols-2 gap-2">
          {OUTDOOR_SPACE_OPTIONS.map((option) => {
            const isSelected = (layoutData.outdoor_spaces || []).includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOutdoorToggle(option.value)}
                className={`
                  p-3 rounded-lg border-2 text-sm text-left transition-all
                  ${isSelected
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-charcoal'
                  }
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
