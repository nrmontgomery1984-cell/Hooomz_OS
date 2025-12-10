import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Minus, AlertCircle } from 'lucide-react';
import { Card } from '../../ui';
import { SCOPE_ITEMS, UNIT_LABELS, UNIT_NAMES } from '../../../data/contractorIntakeSchema';

/**
 * Scope Step - Trade-specific scope of work entry
 *
 * Contractors can quickly select trades and enter quantities.
 * Designed for efficiency - expand categories, enter numbers, done.
 */
export function ScopeStep({ data, errors, onChange }) {
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (code) => {
    setExpandedCategories(prev => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  // Enable/disable a category
  const toggleCategoryEnabled = (code) => {
    onChange(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        [code]: {
          ...prev.scope[code],
          enabled: !prev.scope[code]?.enabled,
          items: prev.scope[code]?.items || {},
        },
      },
    }));

    // Auto-expand when enabling
    if (!data.scope[code]?.enabled) {
      setExpandedCategories(prev => ({ ...prev, [code]: true }));
    }
  };

  // Update item quantity
  const updateItemQty = (categoryCode, itemId, qty) => {
    const numQty = qty === '' ? null : parseFloat(qty) || 0;

    onChange(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        [categoryCode]: {
          ...prev.scope[categoryCode],
          enabled: true, // Auto-enable when entering quantity
          items: {
            ...prev.scope[categoryCode]?.items,
            [itemId]: {
              ...prev.scope[categoryCode]?.items?.[itemId],
              qty: numQty,
            },
          },
        },
      },
    }));
  };

  // Update item notes
  const updateItemNotes = (categoryCode, itemId, notes) => {
    onChange(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        [categoryCode]: {
          ...prev.scope[categoryCode],
          items: {
            ...prev.scope[categoryCode]?.items,
            [itemId]: {
              ...prev.scope[categoryCode]?.items?.[itemId],
              notes,
            },
          },
        },
      },
    }));
  };

  // Get item data from form state
  const getItemData = (categoryCode, itemId) => {
    return data.scope[categoryCode]?.items?.[itemId] || { qty: null, notes: '' };
  };

  // Check if category has any items with quantities
  const categoryHasItems = (categoryCode) => {
    const items = data.scope[categoryCode]?.items || {};
    return Object.values(items).some(item => item.qty > 0);
  };

  // Count items in category
  const getCategoryItemCount = (categoryCode) => {
    const items = data.scope[categoryCode]?.items || {};
    return Object.values(items).filter(item => item.qty > 0).length;
  };

  return (
    <div className="space-y-3">
      {errors.scope && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errors.scope}
        </div>
      )}

      <p className="text-sm text-gray-600 mb-4">
        Select the trades involved and enter quantities. Click a category to expand and add items.
      </p>

      {Object.entries(SCOPE_ITEMS).map(([code, category]) => {
        const isEnabled = data.scope[code]?.enabled;
        const isExpanded = expandedCategories[code];
        const itemCount = getCategoryItemCount(code);

        return (
          <Card key={code} className="overflow-hidden">
            {/* Category Header */}
            <button
              type="button"
              onClick={() => toggleCategory(code)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                isEnabled ? 'bg-blue-50' : ''
              }`}
            >
              {/* Expand Icon */}
              <div className="text-gray-400">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>

              {/* Category Name */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isEnabled ? 'text-blue-700' : 'text-charcoal'}`}>
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{code}</span>
                </div>
              </div>

              {/* Item Count Badge */}
              {itemCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </span>
              )}

              {/* Enable/Disable Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategoryEnabled(code);
                }}
                className={`p-1 rounded-md transition-colors ${
                  isEnabled
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {isEnabled ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </button>

            {/* Expanded Items */}
            {isExpanded && (
              <div className="border-t border-gray-100 divide-y divide-gray-100">
                {category.items.map((item) => {
                  const itemData = getItemData(code, item.id);
                  const hasQty = itemData.qty !== null && itemData.qty > 0;

                  return (
                    <div
                      key={item.id}
                      className={`px-4 py-3 ${hasQty ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Item Name */}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>

                        {/* Quantity Input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={itemData.qty ?? ''}
                            onChange={(e) => updateItemQty(code, item.id, e.target.value)}
                            placeholder="0"
                            min="0"
                            step={item.unit === 'sf' || item.unit === 'lf' ? '1' : '1'}
                            className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span
                            className="text-xs text-gray-500 w-12"
                            title={UNIT_NAMES[item.unit]}
                          >
                            {UNIT_LABELS[item.unit]}
                          </span>
                        </div>
                      </div>

                      {/* Item Notes (shown when qty > 0) */}
                      {hasQty && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={itemData.notes || ''}
                            onChange={(e) => updateItemNotes(code, item.id, e.target.value)}
                            placeholder="Notes (optional)"
                            className="w-full px-2 py-1 border border-gray-200 rounded text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
