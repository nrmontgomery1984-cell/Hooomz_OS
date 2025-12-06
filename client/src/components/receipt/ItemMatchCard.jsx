import { useState } from 'react';
import { Check, Plus, ArrowRight, Tag, AlertCircle, ChevronDown } from 'lucide-react';
import { MATERIAL_CATEGORIES } from '../../lib/costCatalogue';
import { calculatePriceChange } from '../../lib/receiptParser';

export function ItemMatchCard({
  item,
  matches,
  onAddNew,
  onUpdateExisting,
  onSkip,
  isAdded,
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(matches[0] || null);
  const [editedItem, setEditedItem] = useState({
    name: item.name,
    category: item.suggestedCategory,
    unit: item.suggestedUnit || 'each',
    unitCost: item.unitPrice,
    supplier: '',
    sku: item.sku || '',
  });

  const hasMatch = matches.length > 0 && selectedMatch;
  const priceChange = hasMatch
    ? calculatePriceChange(selectedMatch.material.unitCost, item.unitPrice)
    : 0;

  const handleAddNew = () => {
    onAddNew({
      ...editedItem,
      unitCost: item.unitPrice,
    });
  };

  const handleUpdatePrice = () => {
    if (selectedMatch) {
      onUpdateExisting(selectedMatch.material.id, item.unitPrice);
    }
  };

  if (isAdded) {
    return (
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-emerald-800">{item.name}</p>
            <p className="text-sm text-emerald-600">Added to catalogue</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-charcoal truncate">{item.name}</p>
              {item.sku && (
                <span className="text-xs text-gray-400">#{item.sku}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span>{item.quantity} × ${item.unitPrice.toFixed(2)}</span>
              <span>=</span>
              <span className="font-medium text-charcoal">
                ${item.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasMatch ? (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Match found
              </span>
            ) : (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                New item
              </span>
            )}
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Matches section */}
          {matches.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Potential matches in catalogue:
              </p>
              <div className="space-y-2">
                {matches.map((match, idx) => (
                  <label
                    key={match.material.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedMatch?.material.id === match.material.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`match-${item.name}`}
                      checked={selectedMatch?.material.id === match.material.id}
                      onChange={() => setSelectedMatch(match)}
                      className="text-emerald-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate">
                        {match.material.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Current: ${match.material.unitCost.toFixed(2)}</span>
                        {match.matchType === 'sku' && (
                          <span className="text-emerald-600 font-medium">
                            SKU match
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {Math.round(match.score)}%
                    </span>
                  </label>
                ))}
              </div>

              {/* Price comparison */}
              {selectedMatch && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">
                    ${selectedMatch.material.unitCost.toFixed(2)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-charcoal">
                    ${item.unitPrice.toFixed(2)}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      priceChange > 0
                        ? 'text-red-600'
                        : priceChange < 0
                        ? 'text-emerald-600'
                        : 'text-gray-500'
                    }`}
                  >
                    ({priceChange > 0 ? '+' : ''}
                    {priceChange.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* New item form */}
          {!hasMatch && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span>No matching item found. Add as new?</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editedItem.name}
                    onChange={(e) =>
                      setEditedItem({ ...editedItem, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Category
                  </label>
                  <select
                    value={editedItem.category}
                    onChange={(e) =>
                      setEditedItem({ ...editedItem, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {MATERIAL_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Unit
                  </label>
                  <select
                    value={editedItem.unit}
                    onChange={(e) =>
                      setEditedItem({ ...editedItem, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="each">Each</option>
                    <option value="sqft">Sq Ft</option>
                    <option value="lnft">Ln Ft</option>
                    <option value="sheet">Sheet</option>
                    <option value="roll">Roll</option>
                    <option value="bundle">Bundle</option>
                    <option value="gallon">Gallon</option>
                    <option value="box">Box</option>
                    <option value="bag">Bag</option>
                    <option value="pack">Pack</option>
                    <option value="lb">Lb</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    SKU (optional)
                  </label>
                  <input
                    type="text"
                    value={editedItem.sku}
                    onChange={(e) =>
                      setEditedItem({ ...editedItem, sku: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            {hasMatch ? (
              <>
                <button
                  onClick={handleUpdatePrice}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Update Price
                </button>
                <button
                  onClick={handleAddNew}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add as New
                </button>
              </>
            ) : (
              <button
                onClick={handleAddNew}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add to Catalogue
              </button>
            )}
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
