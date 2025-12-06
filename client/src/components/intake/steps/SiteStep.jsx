import { Card, Select } from '../../ui';
import {
  WATER_SUPPLY_OPTIONS,
  SEWAGE_OPTIONS,
  FOUNDATION_TYPES,
} from '../../../data/intakeSchema';
import { Droplet, Trash2, Zap, Car, Trees, Home } from 'lucide-react';

/**
 * SiteStep - Site conditions for new construction
 */

const ROAD_ACCESS_OPTIONS = [
  { value: 'paved_municipal', label: 'Paved Municipal Road' },
  { value: 'gravel_municipal', label: 'Gravel Municipal Road' },
  { value: 'private_road', label: 'Private Road' },
  { value: 'no_road', label: 'No Road Access Yet' },
];

const LOT_CLEARED_OPTIONS = [
  { value: 'yes', label: 'Yes, cleared and ready' },
  { value: 'partial', label: 'Partially cleared' },
  { value: 'no', label: 'No, still wooded' },
  { value: 'unknown', label: 'Unknown / Haven\'t visited' },
];

const POWER_OPTIONS = [
  { value: 'yes', label: 'Yes, power to lot' },
  { value: 'at_road', label: 'Power at road (need to run to lot)' },
  { value: 'no', label: 'No power nearby' },
  { value: 'unknown', label: 'Unknown' },
];

export function SiteStep({ data, onChange }) {
  const siteData = data || {};

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Water Supply */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Droplet className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium text-charcoal">Water Supply</h3>
        </div>
        <Select
          value={siteData.water_supply || 'unknown'}
          onChange={(value) => handleChange('water_supply', value)}
          options={WATER_SUPPLY_OPTIONS}
        />
        <p className="text-xs text-gray-500 mt-2">
          Municipal water is typically easiest. Well drilling can add $8,000-$15,000+.
        </p>
      </Card>

      {/* Sewage */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trash2 className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-charcoal">Sewage/Septic</h3>
        </div>
        <Select
          value={siteData.sewage_system || 'unknown'}
          onChange={(value) => handleChange('sewage_system', value)}
          options={SEWAGE_OPTIONS}
        />
        <p className="text-xs text-gray-500 mt-2">
          New septic systems typically range $15,000-$30,000 depending on soil and system type.
        </p>
      </Card>

      {/* Power */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-amber-500" />
          <h3 className="font-medium text-charcoal">Electrical Service</h3>
        </div>
        <Select
          value={siteData.power_to_lot || 'unknown'}
          onChange={(value) => handleChange('power_to_lot', value)}
          options={POWER_OPTIONS}
        />
        <p className="text-xs text-gray-500 mt-2">
          NB Power handles service connections. Distance from road affects cost.
        </p>
      </Card>

      {/* Road Access */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Car className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-charcoal">Road Access</h3>
        </div>
        <Select
          value={siteData.road_access || 'paved_municipal'}
          onChange={(value) => handleChange('road_access', value)}
          options={ROAD_ACCESS_OPTIONS}
        />
      </Card>

      {/* Lot Cleared */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trees className="w-5 h-5 text-green-600" />
          <h3 className="font-medium text-charcoal">Lot Condition</h3>
        </div>
        <Select
          value={siteData.lot_cleared || 'no'}
          onChange={(value) => handleChange('lot_cleared', value)}
          options={LOT_CLEARED_OPTIONS}
        />
        <p className="text-xs text-gray-500 mt-2">
          Clearing and grading costs vary significantly based on lot size and tree density.
        </p>
      </Card>

      {/* Foundation Type */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Home className="w-5 h-5 text-gray-700" />
          <h3 className="font-medium text-charcoal">Foundation Preference</h3>
        </div>
        <Select
          value={siteData.foundation_type || 'undecided'}
          onChange={(value) => handleChange('foundation_type', value)}
          options={FOUNDATION_TYPES}
        />
        <p className="text-xs text-gray-500 mt-2">
          Full basements add living potential. Crawlspaces and slabs can reduce costs.
        </p>
      </Card>
    </div>
  );
}
