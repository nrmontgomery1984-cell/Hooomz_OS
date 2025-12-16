import {
  MousePointer,
  Minus,
  Square,
  Circle,
  Grid3X3,
  Magnet,
  Trash2,
  Copy,
  Layers,
  Home,
  Zap,
  Droplets,
  Wind,
  Upload,
  Ruler,
  Undo2,
  X,
} from 'lucide-react';

/**
 * FloorPlanToolbar - Drawing tools for the floor plan editor
 */
export function FloorPlanToolbar({
  activeTool,
  onToolChange,
  activeElementType,
  onElementTypeChange,
  activeTrade,
  onTradeChange,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  selectedElement,
  onDeleteSelected,
  onDuplicateSelected,
  // New props for enhanced features
  lineWeight = 2,
  onLineWeightChange,
  scale = 10, // pixels per foot
  onScaleChange,
  showDimensions = true,
  onToggleDimensions,
  onImportImage,
  hasImportedImage,
  onClearImportedImage,
  canUndo,
  onUndo,
}) {
  const TOOLS = [
    { id: 'select', label: 'Select', icon: MousePointer },
    { id: 'line', label: 'Line', icon: Minus },
    { id: 'rect', label: 'Rectangle', icon: Square },
    { id: 'circle', label: 'Circle', icon: Circle },
  ];

  const ELEMENT_TYPES = [
    { id: 'wall', label: 'Wall' },
    { id: 'window', label: 'Window' },
    { id: 'door', label: 'Door' },
    { id: 'beam', label: 'Beam' },
    { id: 'zone', label: 'Zone' },
    { id: 'fixture', label: 'Fixture' },
    { id: 'outlet', label: 'Outlet' },
    { id: 'switch', label: 'Switch' },
    { id: 'hvac', label: 'HVAC' },
    { id: 'custom', label: 'Custom' },
  ];

  const TRADES = [
    { id: 'framing', label: 'Framing', icon: Layers },
    { id: 'electrical', label: 'Electrical', icon: Zap },
    { id: 'plumbing', label: 'Plumbing', icon: Droplets },
    { id: 'hvac', label: 'HVAC', icon: Wind },
    { id: 'drywall', label: 'Drywall', icon: Square },
    { id: 'general', label: 'General', icon: Home },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex flex-wrap items-center gap-4">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-2">Tool:</span>
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`
                  p-2 rounded-lg transition-colors flex items-center gap-1
                  ${activeTool === tool.id
                    ? 'bg-charcoal text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* Element Type (when drawing) */}
        {activeTool !== 'select' && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 mr-2">Element:</span>
            <select
              value={activeElementType}
              onChange={(e) => onElementTypeChange(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ELEMENT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Trade Category (when drawing) */}
        {activeTool !== 'select' && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 mr-2">Trade:</span>
            <select
              value={activeTrade || ''}
              onChange={(e) => onTradeChange(e.target.value || null)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {TRADES.map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {trade.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* Grid Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleGrid}
            className={`
              p-2 rounded-lg transition-colors
              ${showGrid
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
            title="Toggle Grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleSnap}
            className={`
              p-2 rounded-lg transition-colors
              ${snapToGrid
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
            title="Snap to Grid"
          >
            <Magnet className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* Undo & Selection Actions */}
        <div className="flex items-center gap-1">
          {/* Undo Button */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`
              p-2 rounded-lg transition-colors
              ${canUndo
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }
            `}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDuplicateSelected}
            disabled={!selectedElement}
            className={`
              p-2 rounded-lg transition-colors
              ${selectedElement
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }
            `}
            title="Duplicate Selected"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDeleteSelected}
            disabled={!selectedElement}
            className={`
              p-2 rounded-lg transition-colors
              ${selectedElement
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }
            `}
            title="Delete Selected (Del)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* Line Weight (when drawing) */}
        {activeTool !== 'select' && onLineWeightChange && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 mr-1">Weight:</span>
            <select
              value={lineWeight}
              onChange={(e) => onLineWeightChange(parseInt(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1px (Thin)</option>
              <option value={2}>2px (Normal)</option>
              <option value={3}>3px (Medium)</option>
              <option value={4}>4px (Bold)</option>
              <option value={6}>6px (Heavy)</option>
              <option value={8}>8px (Extra Heavy)</option>
            </select>
          </div>
        )}

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* Scale & Dimensions */}
        <div className="flex items-center gap-2">
          {onScaleChange && (
            <div className="flex items-center gap-1">
              <Ruler className="w-4 h-4 text-gray-500" />
              <select
                value={scale}
                onChange={(e) => onScaleChange(parseInt(e.target.value))}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Scale (pixels per foot)"
              >
                <option value={5}>1/4" = 1' (5px/ft)</option>
                <option value={10}>1/2" = 1' (10px/ft)</option>
                <option value={20}>1" = 1' (20px/ft)</option>
                <option value={40}>2" = 1' (40px/ft)</option>
              </select>
            </div>
          )}
          {onToggleDimensions && (
            <button
              onClick={onToggleDimensions}
              className={`
                p-2 rounded-lg transition-colors flex items-center gap-1
                ${showDimensions
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              title="Show Dimensions"
            >
              <span className="text-xs">Dims</span>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* Import Image */}
        {onImportImage && (
          <div className="flex items-center gap-1">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onImportImage(file);
                  }
                  e.target.value = ''; // Reset to allow re-upload of same file
                }}
                className="hidden"
              />
              <div className="flex items-center gap-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-xs font-medium">Import Plan</span>
              </div>
            </label>
            {/* Clear imported image button */}
            {hasImportedImage && onClearImportedImage && (
              <button
                onClick={onClearImportedImage}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                title="Clear Imported Image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FloorPlanToolbar;
