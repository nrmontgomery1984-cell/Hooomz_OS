import { useState } from 'react';
import { ClipboardList, Star, AlertCircle, ExternalLink, ChevronDown, ChevronUp, Grid3X3, X } from 'lucide-react';
import { Card, Button } from '../ui';

/**
 * ScopeSummary - Quick reference of project scope from intake
 */
export function ScopeSummary({ scope, onViewFullScope }) {
  const [expanded, setExpanded] = useState(false);
  const [showAllSelections, setShowAllSelections] = useState(false);

  const handleViewAllSelections = () => {
    setShowAllSelections((prev) => !prev);
    if (showAllSelections === false) {
      onViewFullScope?.();
    }
  };

  const {
    projectType,
    buildTier,
    rooms,
    specialFeatures,
    clientMustHaves,
    clientPainPoints,
    inspirationLinks,
  } = scope;

  const tierConfig = {
    good: { label: 'Good', color: 'bg-gray-100 text-gray-700', description: 'Budget-conscious quality' },
    better: { label: 'Better', color: 'bg-blue-100 text-blue-700', description: 'Enhanced finishes' },
    best: { label: 'Best', color: 'bg-amber-100 text-amber-700', description: 'Premium selections' },
  };

  const tier = tierConfig[buildTier] || tierConfig.better;

  return (
    <Card className="p-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-charcoal flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-gray-400" />
          Scope
        </h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tier.color}`}>
          {tier.label} Tier
        </span>
      </div>

      {/* Build Tier Info - Section with border */}
      <div className="p-3 border border-gray-400 bg-slate-50 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Build Quality</span>
          <span className="text-sm font-medium text-charcoal">{tier.description}</span>
        </div>
      </div>

      {/* Must-Haves - Section with border */}
      {clientMustHaves.length > 0 && (
        <div className="p-3 border border-gray-400 bg-slate-50 rounded-lg mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            Client Must-Haves
          </h4>
          <ul className="space-y-1">
            {clientMustHaves.slice(0, 3).map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-charcoal">
                <span className="text-amber-500 mt-1">•</span>
                {item}
              </li>
            ))}
            {clientMustHaves.length > 3 && (
              <li className="text-xs text-gray-400">+{clientMustHaves.length - 3} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Pain Points (Renovation) - Section with border */}
      {clientPainPoints && clientPainPoints.length > 0 && (
        <div className="p-3 border border-gray-400 bg-slate-50 rounded-lg mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            Pain Points to Address
          </h4>
          <ul className="space-y-1">
            {clientPainPoints.slice(0, 3).map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-red-400 mt-1">•</span>
                {item}
              </li>
            ))}
            {clientPainPoints.length > 3 && (
              <li className="text-xs text-gray-400">+{clientPainPoints.length - 3} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Rooms - Section with border */}
      <div className="p-3 border border-gray-400 bg-slate-50 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Rooms in Scope</h4>
          <span className="text-xs text-gray-500">{rooms.length} rooms</span>
        </div>
        <div className={`space-y-2 ${expanded === false && rooms.length > 3 ? 'max-h-48 overflow-hidden' : ''}`}>
          {rooms.map((room, index) => (
            <RoomCard key={index} room={room} />
          ))}
        </div>
        {rooms.length > 3 && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center justify-center w-full mt-2 py-1 text-xs text-blue-600 hover:text-blue-700"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show {rooms.length - 3} more rooms
              </>
            )}
          </button>
        )}
      </div>

      {/* Special Features - Section with border */}
      {specialFeatures.length > 0 && (
        <div className="p-3 border border-gray-400 bg-slate-50 rounded-lg mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Special Features</h4>
          <div className="flex flex-wrap gap-1">
            {specialFeatures.map((feature, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full"
              >
                {formatFeature(feature)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inspiration Links - Section with border */}
      {inspirationLinks && inspirationLinks.length > 0 && (
        <div className="p-3 border border-gray-400 bg-slate-50 rounded-lg mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Inspiration</h4>
          <div className="space-y-1">
            {inspirationLinks.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="truncate">{extractDomain(url)}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* View All Selections Button */}
      <Button
        variant={showAllSelections ? 'primary' : 'secondary'}
        size="sm"
        className="w-full"
        onClick={handleViewAllSelections}
      >
        {showAllSelections ? (
          <>
            <ChevronUp className="w-4 h-4 mr-1" />
            Collapse Selections
          </>
        ) : (
          <>
            <Grid3X3 className="w-4 h-4 mr-1" />
            View All Selections
          </>
        )}
      </Button>

      {/* Expanded All Selections Panel */}
      {showAllSelections && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-charcoal">All Selections by Room</h4>
            <button
              onClick={() => setShowAllSelections(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {rooms.map((room, index) => (
              <RoomCardExpanded key={index} room={room} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * RoomCard - Room scope summary (compact) with clickable expansion
 */
function RoomCard({ room }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tierConfig = {
    refresh: { label: 'Refresh', color: 'bg-emerald-100 text-emerald-700' },
    full_reno: { label: 'Full Reno', color: 'bg-blue-100 text-blue-700' },
    full_finish: { label: 'Full Finish', color: 'bg-purple-100 text-purple-700' },
  };

  const tier = tierConfig[room.tier] || tierConfig.full_reno;
  const hasSelections = room.keySelections && room.keySelections.length > 0;

  return (
    <div className="p-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <button
        onClick={() => hasSelections && setIsExpanded((prev) => !prev)}
        className="w-full text-left"
        disabled={hasSelections === false}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-charcoal flex items-center gap-1">
            {room.room}
            {hasSelections && (
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            )}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-xs ${tier.color}`}>
            {tier.label}
          </span>
        </div>
      </button>

      {/* Show selections when expanded */}
      {isExpanded && hasSelections && (
        <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
          {room.keySelections.map((sel, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{sel.item}</span>
              <span className="text-gray-700 font-medium">{sel.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Show preview when not expanded */}
      {isExpanded === false && hasSelections && (
        <p className="text-xs text-gray-400">
          {room.keySelections.length} selections - Click to expand
        </p>
      )}

      {room.scopeItemCount && hasSelections === false && (
        <p className="text-xs text-gray-400 mt-1">
          {room.scopeItemCount} items in scope
        </p>
      )}
    </div>
  );
}

/**
 * RoomCardExpanded - Full room details for expanded view
 */
function RoomCardExpanded({ room }) {
  const tierConfig = {
    refresh: { label: 'Refresh', color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
    full_reno: { label: 'Full Reno', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
    full_finish: { label: 'Full Finish', color: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
  };

  const tier = tierConfig[room.tier] || tierConfig.full_reno;

  return (
    <div className={`p-3 border-2 ${tier.border} rounded-lg`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-charcoal">{room.room}</span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${tier.color}`}>
          {tier.label}
        </span>
      </div>

      {room.keySelections && room.keySelections.length > 0 ? (
        <div className="space-y-1.5">
          {room.keySelections.map((sel, index) => (
            <div key={index} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1.5 rounded">
              <span className="text-gray-600">{sel.item}</span>
              <span className="text-charcoal font-medium">{sel.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">No specific selections recorded</p>
      )}

      {room.scopeItemCount && (
        <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
          Total: {room.scopeItemCount} items in scope
        </p>
      )}
    </div>
  );
}

/**
 * Format feature code to display name
 */
function formatFeature(code) {
  return code.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * ScopeSummaryCompact - Smaller version
 */
export function ScopeSummaryCompact({ scope }) {
  const tierConfig = {
    good: { label: 'Good', color: 'bg-gray-100 text-gray-700' },
    better: { label: 'Better', color: 'bg-blue-100 text-blue-700' },
    best: { label: 'Best', color: 'bg-amber-100 text-amber-700' },
  };

  const tier = tierConfig[scope.buildTier] || tierConfig.better;

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">Build Tier</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tier.color}`}>
          {tier.label}
        </span>
      </div>
      <p className="text-sm text-gray-700">
        {scope.rooms.length} rooms in scope
      </p>
      {scope.clientMustHaves.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          {scope.clientMustHaves.length} must-haves identified
        </p>
      )}
    </div>
  );
}
