import { Card, Select, TextArea } from '../../ui';
import { Home, Car, Dog, Calendar, Users } from 'lucide-react';

/**
 * LogisticsStep - Access and occupancy logistics for renovation
 */

const OCCUPANCY_OPTIONS = [
  { value: 'undecided', label: 'Undecided' },
  { value: 'move_out', label: 'We will move out completely' },
  { value: 'stay_full', label: 'We plan to stay throughout' },
  { value: 'stay_partial', label: 'We\'ll stay for some phases, leave for others' },
];

const ACCESS_OPTIONS = [
  { value: 'full_access', label: 'Full access anytime' },
  { value: 'key_lockbox', label: 'Key/lockbox - let yourselves in' },
  { value: 'someone_home', label: 'Someone will be home to let you in' },
  { value: 'schedule_required', label: 'Need to schedule access' },
];

const PARKING_OPTIONS = [
  { value: 'driveway', label: 'Driveway available' },
  { value: 'street', label: 'Street parking only' },
  { value: 'limited', label: 'Limited parking' },
  { value: 'garage', label: 'Garage can be used for staging' },
];

const PET_OPTIONS = [
  { value: 'none', label: 'No pets' },
  { value: 'indoor', label: 'Indoor pets (contained during work)' },
  { value: 'outdoor', label: 'Outdoor pets' },
  { value: 'both', label: 'Both indoor and outdoor pets' },
];

export function LogisticsStep({ data, onChange }) {
  const renoData = data || {};

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        These details help us plan the project schedule and coordinate work efficiently.
      </p>

      {/* Occupancy During Renovation */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Home className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium text-charcoal">Living Situation During Renovation</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {OCCUPANCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange('occupancy_during', option.value)}
              className={`
                p-3 rounded-lg border-2 text-sm text-left transition-all
                ${renoData.occupancy_during === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-charcoal'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
        {renoData.occupancy_during === 'stay_full' && (
          <p className="text-xs text-amber-600 mt-3 p-2 bg-amber-50 rounded">
            Living through a renovation can be challenging. We'll work to minimize disruption, but expect dust, noise, and temporary loss of some spaces.
          </p>
        )}
      </Card>

      {/* Site Access */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-green-600" />
          <h3 className="font-medium text-charcoal">Site Access</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {ACCESS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange('site_access', option.value)}
              className={`
                p-3 rounded-lg border-2 text-sm text-left transition-all
                ${renoData.site_access === option.value
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

      {/* Parking/Staging */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Car className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-charcoal">Parking & Staging Area</h3>
        </div>
        <Select
          value={renoData.parking || 'driveway'}
          onChange={(value) => handleChange('parking', value)}
          options={PARKING_OPTIONS}
        />
        <p className="text-xs text-gray-500 mt-2">
          We may need space for a dumpster, material deliveries, and work vehicles.
        </p>
      </Card>

      {/* Pets */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Dog className="w-5 h-5 text-amber-600" />
          <h3 className="font-medium text-charcoal">Pets</h3>
        </div>
        <Select
          value={renoData.pets || 'none'}
          onChange={(value) => handleChange('pets', value)}
          options={PET_OPTIONS}
        />
        {renoData.pets && renoData.pets !== 'none' && (
          <TextArea
            value={renoData.pet_notes || ''}
            onChange={(e) => handleChange('pet_notes', e.target.value)}
            placeholder="Any special considerations? (e.g., dog is nervous around strangers, cat will hide...)"
            rows={2}
            className="mt-3"
          />
        )}
      </Card>

      {/* Schedule Constraints */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-purple-500" />
          <h3 className="font-medium text-charcoal">Schedule Constraints</h3>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Are there any dates or times we should avoid?
        </p>
        <TextArea
          value={renoData.schedule_constraints || ''}
          onChange={(e) => handleChange('schedule_constraints', e.target.value)}
          placeholder="e.g., No work during exams week, family visiting in July, work from home on Fridays..."
          rows={3}
        />
      </Card>

      {/* Special Instructions */}
      <Card className="p-4">
        <h3 className="font-medium text-charcoal mb-3">Anything Else We Should Know?</h3>
        <p className="text-sm text-gray-600 mb-3">
          Special access codes, neighbor considerations, alarm systems, etc.
        </p>
        <TextArea
          value={renoData.logistics_notes || ''}
          onChange={(e) => handleChange('logistics_notes', e.target.value)}
          placeholder="e.g., Gate code is 1234, elderly neighbor on south side, alarm code in app..."
          rows={3}
        />
      </Card>
    </div>
  );
}
