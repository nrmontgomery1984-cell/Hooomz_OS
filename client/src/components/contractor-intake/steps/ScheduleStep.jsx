import { Calendar, Clock, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Card, Input, Select, Button } from '../../ui';

/**
 * Schedule Step - Project timeline and milestones
 */
export function ScheduleStep({ data, errors, onChange }) {
  const [newMilestone, setNewMilestone] = useState({ name: '', date: '' });

  // Duration options
  const durationOptions = [
    { value: '', label: 'Select duration...' },
    { value: '1', label: '1 week' },
    { value: '2', label: '2 weeks' },
    { value: '3', label: '3 weeks' },
    { value: '4', label: '4 weeks (1 month)' },
    { value: '6', label: '6 weeks' },
    { value: '8', label: '8 weeks (2 months)' },
    { value: '12', label: '12 weeks (3 months)' },
    { value: '16', label: '16 weeks (4 months)' },
    { value: '24', label: '24 weeks (6 months)' },
    { value: 'custom', label: 'Custom...' },
  ];

  // Add milestone
  const addMilestone = () => {
    if (!newMilestone.name || !newMilestone.date) return;

    onChange({
      ...data,
      milestones: [
        ...(data.milestones || []),
        { id: Date.now(), ...newMilestone },
      ],
    });

    setNewMilestone({ name: '', date: '' });
  };

  // Remove milestone
  const removeMilestone = (id) => {
    onChange({
      ...data,
      milestones: data.milestones.filter(m => m.id !== id),
    });
  };

  // Calculate end date based on start + duration
  const calculateEndDate = () => {
    if (!data.startDate || !data.estimatedDuration) return null;

    const start = new Date(data.startDate);
    const weeks = parseInt(data.estimatedDuration);
    if (isNaN(weeks)) return null;

    const end = new Date(start);
    end.setDate(end.getDate() + (weeks * 7));

    return end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const endDate = calculateEndDate();

  return (
    <div className="space-y-6">
      {/* Dates */}
      <Card className="p-4">
        <h3 className="font-medium text-charcoal mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          Project Timeline
        </h3>

        <div className="space-y-4">
          <Input
            label="Target Start Date"
            type="date"
            value={data.startDate}
            onChange={(e) => onChange({ ...data, startDate: e.target.value })}
            error={errors.startDate}
            required
          />

          <Select
            label="Estimated Duration"
            value={data.estimatedDuration}
            onChange={(value) => onChange({ ...data, estimatedDuration: value })}
            options={durationOptions}
          />

          {data.estimatedDuration === 'custom' && (
            <Input
              label="Custom Duration (weeks)"
              type="number"
              value={data.customDuration || ''}
              onChange={(e) => onChange({ ...data, customDuration: e.target.value })}
              placeholder="Enter number of weeks"
              min="1"
            />
          )}

          {/* Calculated End Date */}
          {endDate && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  <span className="font-medium">Estimated Completion:</span> {endDate}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Milestones */}
      <Card className="p-4">
        <h3 className="font-medium text-charcoal mb-4">
          Key Milestones (Optional)
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Add important project milestones like inspections, material deliveries, or phase completions.
        </p>

        {/* Existing Milestones */}
        {data.milestones?.length > 0 && (
          <div className="space-y-2 mb-4">
            {data.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-charcoal">
                    {milestone.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(milestone.date).toLocaleDateString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeMilestone(milestone.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Milestone */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="Milestone Name"
              value={newMilestone.name}
              onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Rough-In Inspection"
            />
          </div>
          <div className="w-40">
            <Input
              label="Date"
              type="date"
              value={newMilestone.date}
              onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addMilestone}
            disabled={!newMilestone.name || !newMilestone.date}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
