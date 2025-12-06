import { Card } from '../../ui';
import { ROOM_TYPES } from '../../../data/intakeSchema';
import { Check, Plus } from 'lucide-react';

export function ScopeStep({ data, onChange }) {
  const selectedRooms = data.selected_rooms || [];

  const handleRoomToggle = (roomValue) => {
    if (selectedRooms.includes(roomValue)) {
      // Remove room
      const newRooms = selectedRooms.filter(r => r !== roomValue);
      const newTiers = { ...data.room_tiers };
      delete newTiers[roomValue];
      onChange({
        selected_rooms: newRooms,
        room_tiers: newTiers,
      });
    } else {
      // Add room with default tier
      onChange({
        selected_rooms: [...selectedRooms, roomValue],
        room_tiers: {
          ...data.room_tiers,
          [roomValue]: 'full', // Default to full reno
        },
      });
    }
  };

  // Group rooms by area
  const roomGroups = [
    {
      title: 'Core Living',
      rooms: ROOM_TYPES.filter(r =>
        ['kitchen', 'living_room', 'dining_room'].includes(r.value)
      ),
    },
    {
      title: 'Bathrooms',
      rooms: ROOM_TYPES.filter(r =>
        ['primary_bath', 'secondary_bath', 'powder_room'].includes(r.value)
      ),
    },
    {
      title: 'Bedrooms & Private',
      rooms: ROOM_TYPES.filter(r =>
        ['bedrooms', 'home_office'].includes(r.value)
      ),
    },
    {
      title: 'Utility & Support',
      rooms: ROOM_TYPES.filter(r =>
        ['laundry', 'mudroom', 'basement', 'garage'].includes(r.value)
      ),
    },
    {
      title: 'Exterior & Structure',
      rooms: ROOM_TYPES.filter(r =>
        ['exterior', 'windows_doors', 'roofing', 'addition'].includes(r.value)
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Select all areas you want to include in this renovation. You'll specify the scope for each room in the next step.
      </p>

      {roomGroups.map((group) => (
        <div key={group.title}>
          <h3 className="text-sm font-medium text-gray-500 mb-2">{group.title}</h3>
          <div className="grid grid-cols-2 gap-2">
            {group.rooms.map((room) => {
              const isSelected = selectedRooms.includes(room.value);
              return (
                <button
                  key={room.value}
                  type="button"
                  onClick={() => handleRoomToggle(room.value)}
                  className={`
                    p-3 rounded-lg border-2 text-left transition-all flex items-center justify-between
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-charcoal'}`}>
                    {room.label}
                  </span>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Plus className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Addition sqft input */}
      {selectedRooms.includes('addition') && (
        <Card className="p-4 bg-amber-50 border-amber-100">
          <label className="block text-sm font-medium text-charcoal mb-2">
            Approximate Addition Size
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="500"
              value={data.addition_sqft || ''}
              onChange={(e) => onChange({ addition_sqft: parseInt(e.target.value) || null })}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-sm text-gray-600">sq ft</span>
          </div>
        </Card>
      )}

      {/* Summary */}
      {selectedRooms.length > 0 && (
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-charcoal">{selectedRooms.length}</span>
            {' '}area{selectedRooms.length !== 1 ? 's' : ''} selected
          </p>
        </Card>
      )}
    </div>
  );
}
