import { Card, Select, TextArea } from '../../ui';
import { Zap, Droplet, Flame, Wind, Thermometer } from 'lucide-react';

/**
 * SystemsStep - Existing MEP (Mechanical, Electrical, Plumbing) systems
 */

const ELECTRICAL_SERVICE_OPTIONS = [
  { value: 'unknown', label: 'Unknown' },
  { value: '60_amp', label: '60 Amp (older home)' },
  { value: '100_amp', label: '100 Amp' },
  { value: '200_amp', label: '200 Amp' },
  { value: '400_amp', label: '400 Amp' },
];

const ELECTRICAL_PANEL_OPTIONS = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'fuse', label: 'Fuse Box' },
  { value: 'breaker_old', label: 'Circuit Breakers (older)' },
  { value: 'breaker_new', label: 'Circuit Breakers (modern)' },
];

const PLUMBING_TYPE_OPTIONS = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'galvanized', label: 'Galvanized Steel (older)' },
  { value: 'copper', label: 'Copper' },
  { value: 'pex', label: 'PEX (plastic)' },
  { value: 'mixed', label: 'Mixed / Partially Updated' },
];

const HEATING_TYPE_OPTIONS = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'oil_furnace', label: 'Oil Furnace' },
  { value: 'oil_boiler', label: 'Oil Boiler (hot water baseboard)' },
  { value: 'electric_baseboard', label: 'Electric Baseboard' },
  { value: 'electric_furnace', label: 'Electric Forced Air' },
  { value: 'heat_pump', label: 'Heat Pump' },
  { value: 'propane', label: 'Propane' },
  { value: 'natural_gas', label: 'Natural Gas' },
  { value: 'wood', label: 'Wood / Pellet' },
];

const COOLING_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'window_units', label: 'Window AC Units' },
  { value: 'portable', label: 'Portable AC' },
  { value: 'minisplit', label: 'Mini-split(s)' },
  { value: 'central', label: 'Central Air' },
];

const WATER_HEATER_OPTIONS = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'electric_tank', label: 'Electric Tank' },
  { value: 'oil_tank', label: 'Oil-fired Tank' },
  { value: 'propane_tank', label: 'Propane Tank' },
  { value: 'tankless', label: 'Tankless' },
  { value: 'heat_pump', label: 'Heat Pump Water Heater' },
];

export function SystemsStep({ data, onChange }) {
  const renoData = data || {};

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Knowing your current systems helps us understand what might need upgrading or replacing as part of the renovation.
      </p>

      {/* Electrical */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          <h3 className="font-medium text-charcoal">Electrical</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Service Size</label>
            <Select
              value={renoData.electrical_service || 'unknown'}
              onChange={(value) => handleChange('electrical_service', value)}
              options={ELECTRICAL_SERVICE_OPTIONS}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Panel Type</label>
            <Select
              value={renoData.electrical_panel || 'unknown'}
              onChange={(value) => handleChange('electrical_panel', value)}
              options={ELECTRICAL_PANEL_OPTIONS}
            />
          </div>
        </div>

        {(renoData.electrical_service === '60_amp' || renoData.electrical_panel === 'fuse') && (
          <p className="text-xs text-amber-600 mt-3 p-2 bg-amber-50 rounded">
            Older electrical systems may require upgrades. We'll assess during the site visit.
          </p>
        )}
      </Card>

      {/* Plumbing */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Droplet className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium text-charcoal">Plumbing</h3>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">Supply Piping</label>
          <Select
            value={renoData.plumbing_type || 'unknown'}
            onChange={(value) => handleChange('plumbing_type', value)}
            options={PLUMBING_TYPE_OPTIONS}
          />
        </div>

        {renoData.plumbing_type === 'galvanized' && (
          <p className="text-xs text-amber-600 mt-3 p-2 bg-amber-50 rounded">
            Galvanized pipes are prone to corrosion and restricted flow. Replacement is typically recommended.
          </p>
        )}
      </Card>

      {/* Heating */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="font-medium text-charcoal">Heating System</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Primary Heat Source</label>
            <Select
              value={renoData.heating_type || 'unknown'}
              onChange={(value) => handleChange('heating_type', value)}
              options={HEATING_TYPE_OPTIONS}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">System Age (if known)</label>
            <input
              type="text"
              value={renoData.heating_age || ''}
              onChange={(e) => handleChange('heating_age', e.target.value)}
              placeholder="e.g., 15 years, replaced 2018..."
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Cooling */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Wind className="w-5 h-5 text-cyan-500" />
          <h3 className="font-medium text-charcoal">Cooling/AC</h3>
        </div>

        <Select
          value={renoData.cooling_type || 'none'}
          onChange={(value) => handleChange('cooling_type', value)}
          options={COOLING_OPTIONS}
        />
      </Card>

      {/* Water Heater */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Thermometer className="w-5 h-5 text-red-500" />
          <h3 className="font-medium text-charcoal">Water Heater</h3>
        </div>

        <div className="space-y-4">
          <Select
            value={renoData.water_heater || 'unknown'}
            onChange={(value) => handleChange('water_heater', value)}
            options={WATER_HEATER_OPTIONS}
          />

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Age (if known)</label>
            <input
              type="text"
              value={renoData.water_heater_age || ''}
              onChange={(e) => handleChange('water_heater_age', e.target.value)}
              placeholder="e.g., 8 years old..."
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Additional Notes */}
      <Card className="p-4">
        <h3 className="font-medium text-charcoal mb-3">System Concerns</h3>
        <p className="text-sm text-gray-600 mb-3">
          Any specific concerns about your mechanical systems?
        </p>
        <TextArea
          value={renoData.system_notes || ''}
          onChange={(e) => handleChange('system_notes', e.target.value)}
          placeholder="e.g., Furnace makes noise, hot water runs out fast, considering switching to heat pump..."
          rows={3}
        />
      </Card>
    </div>
  );
}
