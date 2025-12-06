import { Card } from '../../ui';
import { ROOM_TYPES, RENO_TIER_OPTIONS } from '../../../data/intakeSchema';
import { getPriceRange } from '../../../data/intakeTemplates';
import { Sparkles, Hammer } from 'lucide-react';

export function RoomTiersStep({ data, buildTier, onChange, estimate }) {
  const selectedRooms = data.selected_rooms || [];
  const roomTiers = data.room_tiers || {};

  const handleTierChange = (roomValue, tier) => {
    onChange({
      room_tiers: {
        ...roomTiers,
        [roomValue]: tier,
      },
    });
  };

  const getRoomLabel = (value) => {
    const room = ROOM_TYPES.find(r => r.value === value);
    return room?.label || value;
  };

  const formatPrice = (range) => {
    if (!range) return null;
    return `$${range[0].toLocaleString()} - $${range[1].toLocaleString()}`;
  };

  if (selectedRooms.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">
          No rooms selected. Go back to select areas to renovate.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        For each area, choose the scope of work. Pricing shown is based on your <span className="font-medium">{buildTier}</span> tier selection.
      </p>

      {selectedRooms.map((roomValue) => {
        const currentTier = roomTiers[roomValue] || 'full';
        const refreshPrice = getPriceRange(roomValue, 'refresh', buildTier);
        const fullPrice = getPriceRange(roomValue, 'full', buildTier);

        return (
          <Card key={roomValue} className="p-4">
            <h3 className="font-medium text-charcoal mb-3">
              {getRoomLabel(roomValue)}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {/* Refresh Option */}
              <button
                type="button"
                onClick={() => handleTierChange(roomValue, 'refresh')}
                className={`
                  p-3 rounded-lg border-2 text-left transition-all
                  ${currentTier === 'refresh'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className={`w-4 h-4 ${currentTier === 'refresh' ? 'text-amber-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${currentTier === 'refresh' ? 'text-amber-700' : 'text-charcoal'}`}>
                    Refresh
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">
                  Cosmetic updates, keep layout
                </p>
                {refreshPrice && (
                  <p className={`text-xs font-medium ${currentTier === 'refresh' ? 'text-amber-600' : 'text-gray-400'}`}>
                    {formatPrice(refreshPrice)}
                  </p>
                )}
              </button>

              {/* Full Reno Option */}
              <button
                type="button"
                onClick={() => handleTierChange(roomValue, 'full')}
                className={`
                  p-3 rounded-lg border-2 text-left transition-all
                  ${currentTier === 'full'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Hammer className={`w-4 h-4 ${currentTier === 'full' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${currentTier === 'full' ? 'text-blue-700' : 'text-charcoal'}`}>
                    Full Reno
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">
                  Gut to studs, new everything
                </p>
                {fullPrice && (
                  <p className={`text-xs font-medium ${currentTier === 'full' ? 'text-blue-600' : 'text-gray-400'}`}>
                    {formatPrice(fullPrice)}
                  </p>
                )}
              </button>
            </div>
          </Card>
        );
      })}

      {/* Total Estimate */}
      {estimate && estimate.low > 0 && (
        <Card className="p-4 bg-green-50 border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Estimated Total</p>
              <p className="text-xl font-bold text-green-700">
                ${estimate.low.toLocaleString()} - ${estimate.high.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {selectedRooms.length} area{selectedRooms.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {buildTier} tier
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
