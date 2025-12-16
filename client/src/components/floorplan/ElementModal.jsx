import { useState } from 'react';
import {
  X,
  Edit2,
  Trash2,
  Link,
  Unlink,
  Save,
  FileText,
  Tag,
  Layers,
  Info,
  Plus,
} from 'lucide-react';

/**
 * ElementModal - Modal for viewing and editing floor plan element details
 *
 * Features:
 * - View element properties and specs
 * - Edit label and notes
 * - Link/unlink to loops
 * - Create new loop from element
 * - Delete element
 */
export function ElementModal({
  element,
  onClose,
  onEdit,
  onDelete,
  onLinkToLoop,
  onLinkToNewLoop,
  onUnlinkFromLoop,
  loops = [],
  projectId,
  TRADE_COLORS = {},
  FLOOR_PLAN_STATUS_COLORS = {},
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(element?.label || '');
  const [editNotes, setEditNotes] = useState(element?.notes || '');
  const [showLinkOptions, setShowLinkOptions] = useState(false);
  const [newLoopName, setNewLoopName] = useState('');
  const [selectedLoopId, setSelectedLoopId] = useState('');

  if (!element) return null;

  const statusColor = element.loopStatus
    ? FLOOR_PLAN_STATUS_COLORS[element.loopStatus] || '#9CA3AF'
    : '#9CA3AF';

  const tradeColor = element.tradeCategory
    ? TRADE_COLORS[element.tradeCategory] || '#6B7280'
    : '#6B7280';

  const handleSaveEdit = () => {
    onEdit(element.id, {
      label: editLabel,
      notes: editNotes,
    });
    setIsEditing(false);
  };

  const handleLinkToExisting = () => {
    if (selectedLoopId) {
      onLinkToLoop(element.id, selectedLoopId);
      setShowLinkOptions(false);
      setSelectedLoopId('');
    }
  };

  const handleCreateAndLink = () => {
    if (newLoopName.trim()) {
      onLinkToNewLoop(element.id, {
        name: newLoopName.trim(),
        loopType: 'room',
        projectId,
      });
      setShowLinkOptions(false);
      setNewLoopName('');
    }
  };

  const handleUnlink = () => {
    onUnlinkFromLoop(element.id);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg">
        <div
          className="bg-white rounded-xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded-full text-white uppercase"
                  style={{ backgroundColor: tradeColor }}
                >
                  {element.elementType}
                </span>
                {element.tradeCategory && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {element.tradeCategory}
                  </span>
                )}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full text-lg font-semibold text-charcoal border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Element label"
                />
              ) : (
                <h2 className="text-lg font-semibold text-charcoal truncate">
                  {element.label || 'Unnamed Element'}
                </h2>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Loop Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Loop Connection
                </h3>
              </div>

              {element.loopId ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: statusColor }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-charcoal">{element.loopName}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        Status: {element.loopStatus || 'Unknown'}
                      </p>
                    </div>
                    <button
                      onClick={handleUnlink}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Unlink from loop"
                    >
                      <Unlink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    Not linked to any loop. Link to track status.
                  </p>

                  {!showLinkOptions ? (
                    <button
                      onClick={() => setShowLinkOptions(true)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Link className="w-4 h-4" />
                      Link to Loop
                    </button>
                  ) : (
                    <div className="space-y-3 pt-2 border-t border-gray-200">
                      {/* Link to existing */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Link to existing loop:
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={selectedLoopId}
                            onChange={(e) => setSelectedLoopId(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select a loop...</option>
                            {loops.map((loop) => (
                              <option key={loop.id} value={loop.id}>
                                {loop.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={handleLinkToExisting}
                            disabled={!selectedLoopId}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Link
                          </button>
                        </div>
                      </div>

                      {/* Or create new */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-gray-50 px-2 text-xs text-gray-400">or</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Create new loop:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newLoopName}
                            onChange={(e) => setNewLoopName(e.target.value)}
                            placeholder="New loop name..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={handleCreateAndLink}
                            disabled={!newLoopName.trim()}
                            className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Create
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowLinkOptions(false)}
                        className="w-full text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                Notes
              </h3>
              {isEditing ? (
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  placeholder="Add notes about this element..."
                />
              ) : (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {element.notes || 'No notes added.'}
                </p>
              )}
            </div>

            {/* Specs */}
            {element.specs && Object.keys(element.specs).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4" />
                  Specifications
                </h3>
                <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                  {Object.entries(element.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between px-3 py-2 text-sm">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-medium text-charcoal">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Element Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4" />
                Element Info
              </h3>
              <div className="bg-gray-50 rounded-lg divide-y divide-gray-200 text-xs">
                <div className="flex justify-between px-3 py-2">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-charcoal capitalize">{element.elementType}</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-gray-600">SVG Type</span>
                  <span className="font-medium text-charcoal">{element.svgType}</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-gray-600">Z-Index</span>
                  <span className="font-medium text-charcoal">{element.zIndex}</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-gray-600">ID</span>
                  <span className="font-mono text-gray-500 text-xs truncate max-w-[150px]">
                    {element.id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
            <button
              onClick={() => onDelete(element.id)}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditLabel(element.label || '');
                      setEditNotes(element.notes || '');
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ElementModal;
