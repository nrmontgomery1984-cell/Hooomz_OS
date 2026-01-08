import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardList,
  Plus,
  Trash2,
  Copy,
  Download,
  ChevronDown,
  ChevronUp,
  Check,
  Square,
  CheckSquare,
} from 'lucide-react';
import { Card, Button } from '../../components/ui';

// Same storage key as WindowDoorFraming calculator
const CUT_LIST_STORAGE_KEY = 'hooomz_framing_cut_list';
const CUT_COMPLETED_STORAGE_KEY = 'hooomz_cut_completed';
// v2 - checkbox feature

// Load saved cut list from localStorage
function loadSavedCutList() {
  try {
    const saved = localStorage.getItem(CUT_LIST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Save cut list to localStorage
function saveCutListToStorage(list) {
  localStorage.setItem(CUT_LIST_STORAGE_KEY, JSON.stringify(list));
}

// Load completed items from localStorage
function loadCompletedItems() {
  try {
    const saved = localStorage.getItem(CUT_COMPLETED_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

// Save completed items to localStorage
function saveCompletedItems(completed) {
  localStorage.setItem(CUT_COMPLETED_STORAGE_KEY, JSON.stringify(completed));
}

// Common lumber materials
const MATERIALS = [
  '2x4',
  '2x6',
  '2x8',
  '2x10',
  '2x12',
  'LVL',
  '1x4',
  '1x6',
  'Plywood',
  'OSB',
  'Custom',
];

export function CutListPage() {
  const navigate = useNavigate();
  const [savedOpenings, setSavedOpenings] = useState(() => loadSavedCutList());
  const [expandedOpening, setExpandedOpening] = useState(null);

  // Manual items (separate from calculator-generated openings)
  const [manualItems, setManualItems] = useState([]);
  const [showAddManual, setShowAddManual] = useState(false);

  // Completed items tracking (keyed by material-length)
  const [completedItems, setCompletedItems] = useState(() => loadCompletedItems());

  // New manual item form
  const [newItem, setNewItem] = useState({
    name: '',
    length: '',
    qty: 1,
    material: '2x4',
    note: '',
  });

  // Consolidated cut list - combines all openings and manual items
  const consolidatedList = useMemo(() => {
    const itemMap = new Map();

    // Add items from saved openings
    savedOpenings.forEach(opening => {
      opening.items.forEach(item => {
        const key = `${item.material}-${item.length}`;
        if (itemMap.has(key)) {
          const existing = itemMap.get(key);
          existing.qty += item.qty;
          existing.sources.push(opening.tag);
        } else {
          itemMap.set(key, {
            name: item.name,
            length: item.length,
            qty: item.qty,
            material: item.material,
            sources: [opening.tag],
          });
        }
      });
    });

    // Add manual items
    manualItems.forEach(item => {
      const key = `${item.material}-${item.length}`;
      if (itemMap.has(key)) {
        const existing = itemMap.get(key);
        existing.qty += item.qty;
        existing.sources.push('Manual');
      } else {
        itemMap.set(key, {
          name: item.name,
          length: item.length,
          qty: item.qty,
          material: item.material,
          sources: ['Manual'],
        });
      }
    });

    // Convert to sorted array
    return Array.from(itemMap.values()).sort((a, b) => {
      // Sort by material, then by length
      if (a.material !== b.material) return a.material.localeCompare(b.material);
      return a.length.localeCompare(b.length);
    });
  }, [savedOpenings, manualItems]);

  // Add manual item
  const handleAddManual = () => {
    if (!newItem.name.trim() || !newItem.length.trim()) return;

    setManualItems(prev => [...prev, { ...newItem, id: Date.now() }]);
    setNewItem({ name: '', length: '', qty: 1, material: '2x4', note: '' });
    setShowAddManual(false);
  };

  // Remove manual item
  const removeManualItem = (id) => {
    setManualItems(prev => prev.filter(item => item.id !== id));
  };

  // Remove saved opening
  const removeOpening = (idx) => {
    const updated = savedOpenings.filter((_, i) => i !== idx);
    setSavedOpenings(updated);
    saveCutListToStorage(updated);
  };

  // Clear all
  const clearAll = () => {
    if (confirm('Clear all saved openings and manual items?')) {
      setSavedOpenings([]);
      setManualItems([]);
      saveCutListToStorage([]);
      setCompletedItems({});
      saveCompletedItems({});
    }
  };

  // Toggle item completion
  const toggleCompleted = (key) => {
    setCompletedItems(prev => {
      const updated = { ...prev };
      if (updated[key]) {
        delete updated[key];
      } else {
        updated[key] = true;
      }
      saveCompletedItems(updated);
      return updated;
    });
  };

  // Clear all completed items
  const clearCompleted = () => {
    setCompletedItems({});
    saveCompletedItems({});
  };

  // Copy consolidated list to clipboard
  const handleCopy = () => {
    let text = 'CONSOLIDATED CUT LIST\n';
    text += '═'.repeat(50) + '\n\n';

    text += 'MATERIAL        LENGTH          QTY     SOURCES\n';
    text += '─'.repeat(50) + '\n';

    consolidatedList.forEach(item => {
      const material = item.material.padEnd(16);
      const length = item.length.padEnd(16);
      const qty = String(item.qty).padEnd(8);
      const sources = item.sources.join(', ');
      text += `${material}${length}${qty}${sources}\n`;
    });

    navigator.clipboard.writeText(text);
  };

  const totalItems = consolidatedList.reduce((sum, item) => sum + item.qty, 0);
  const completedCount = Object.keys(completedItems).length;
  const remainingCount = consolidatedList.length - completedCount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/toolbox')} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-charcoal">Cut List v2.0</h1>
            <p className="text-xs text-gray-500">
              {savedOpenings.length} openings • {manualItems.length} manual • {totalItems} total pieces
              {completedCount > 0 && (
                <span className="text-green-600 ml-2">• {completedCount} cut</span>
              )}
            </p>
          </div>
          <ClipboardList className="w-5 h-5 text-gray-400" />
        </div>
      </header>

      <div className="p-4 space-y-4 pb-32">
        {/* Saved Openings from Calculator */}
        {savedOpenings.length > 0 && (
          <Card className="p-4">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              From Calculator
            </h2>
            <div className="space-y-2">
              {savedOpenings.map((opening, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedOpening(expandedOpening === idx ? null : idx)}
                    className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-charcoal">{opening.tag}</span>
                      <span className="text-xs text-gray-500">
                        {opening.type} | {opening.roWidth} × {opening.roHeight}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{opening.items.length} items</span>
                      {expandedOpening === idx ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {expandedOpening === idx && (
                    <div className="border-t border-gray-100 px-3 py-2 bg-gray-50">
                      <div className="space-y-1 mb-2">
                        {opening.items.map((item, itemIdx) => {
                          const itemKey = `${item.material}-${item.length}`;
                          const isItemCompleted = completedItems[itemKey];
                          return (
                            <div
                              key={itemIdx}
                              className={`flex items-center justify-between text-xs py-1.5 px-2 rounded cursor-pointer transition-colors ${isItemCompleted ? 'bg-green-100' : 'hover:bg-gray-100'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCompleted(itemKey);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {isItemCompleted ? (
                                  <CheckSquare className="w-4 h-4 text-green-600 flex-shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                )}
                                <span className={isItemCompleted ? 'text-green-700 line-through' : 'text-gray-600'}>
                                  {item.name}
                                </span>
                              </div>
                              <span className={`font-mono ${isItemCompleted ? 'text-green-600 line-through' : 'text-gray-700'}`}>
                                {item.qty}× {item.length} ({item.material})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => removeOpening(idx)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Manual Items */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Manual Items
            </h2>
            <button
              onClick={() => setShowAddManual(!showAddManual)}
              className="text-xs text-charcoal hover:text-gray-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>

          {/* Add Manual Item Form */}
          {showAddManual && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., King Stud"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Length</label>
                  <input
                    type="text"
                    value={newItem.length}
                    onChange={(e) => setNewItem(prev => ({ ...prev, length: e.target.value }))}
                    placeholder='e.g., 92 5/8"'
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-charcoal"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.qty}
                    onChange={(e) => setNewItem(prev => ({ ...prev, qty: parseInt(e.target.value) || 1 }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Material</label>
                  <select
                    value={newItem.material}
                    onChange={(e) => setNewItem(prev => ({ ...prev, material: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-charcoal bg-white"
                  >
                    {MATERIALS.map(mat => (
                      <option key={mat} value={mat}>{mat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button size="sm" onClick={handleAddManual} className="w-full">
                    Add
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Note (optional)</label>
                <input
                  type="text"
                  value={newItem.note}
                  onChange={(e) => setNewItem(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="e.g., For bedroom window"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-charcoal"
                />
              </div>
            </div>
          )}

          {/* Manual Items List */}
          {manualItems.length > 0 ? (
            <div className="space-y-2">
              {manualItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="text-sm font-medium text-charcoal">{item.name}</span>
                    {item.note && (
                      <span className="text-xs text-gray-400 ml-2">({item.note})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-600">
                      {item.qty}× {item.length}
                    </span>
                    <span className="text-xs text-gray-400">{item.material}</span>
                    <button
                      onClick={() => removeManualItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : !showAddManual && (
            <p className="text-sm text-gray-400 text-center py-4">
              No manual items. Click "Add Item" to add custom pieces.
            </p>
          )}
        </Card>

        {/* Consolidated Cut List */}
        {consolidatedList.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Consolidated List
              </h2>
              <span className="text-xs text-gray-400">{totalItems} pieces</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-10 px-2 py-2"></th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Material</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase">Length</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Sources</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {consolidatedList.map((item, idx) => {
                    const key = `${item.material}-${item.length}`;
                    const isCompleted = completedItems[key];
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${isCompleted ? 'bg-green-50' : ''}`}
                        onClick={() => toggleCompleted(key)}
                      >
                        <td className="px-2 py-2 text-center">
                          {isCompleted ? (
                            <CheckSquare className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                        <td className={`px-3 py-2 font-medium ${isCompleted ? 'text-green-700 line-through' : 'text-charcoal'}`}>
                          {item.material}
                        </td>
                        <td className={`px-3 py-2 text-right font-mono ${isCompleted ? 'text-green-600 line-through' : ''}`}>
                          {item.length}
                        </td>
                        <td className={`px-3 py-2 text-center ${isCompleted ? 'text-green-600' : ''}`}>
                          {item.qty}
                        </td>
                        <td className={`px-3 py-2 text-xs ${isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                          {item.sources.join(', ')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex gap-3">
                <button
                  onClick={clearAll}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Clear All
                </button>
                {completedCount > 0 && (
                  <button
                    onClick={clearCompleted}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Reset Checkmarks
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {savedOpenings.length === 0 && manualItems.length === 0 && (
          <Card className="p-8 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-charcoal mb-1">No items in cut list</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add openings from the Window & Door Framing calculator, or add manual items above.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/toolbox/window-door-framing')}
            >
              Go to Framing Calculator
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CutListPage;
