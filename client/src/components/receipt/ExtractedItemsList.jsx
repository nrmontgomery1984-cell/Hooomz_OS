import { useState } from 'react';
import { Package, Check, CheckCircle2 } from 'lucide-react';
import { ItemMatchCard } from './ItemMatchCard';
import { findMaterialMatches, generateMaterialId } from '../../lib/receiptParser';

export function ExtractedItemsList({
  items,
  existingMaterials,
  onAddMaterial,
  onUpdateMaterial,
  onComplete,
}) {
  const [processedItems, setProcessedItems] = useState({});
  const [skippedItems, setSkippedItems] = useState(new Set());

  const processedCount = Object.keys(processedItems).length + skippedItems.size;
  const totalItems = items.length;
  const allProcessed = processedCount >= totalItems;

  const handleAddNew = (index, itemData) => {
    const newId = generateMaterialId(itemData.category, existingMaterials);
    const newMaterial = {
      id: newId,
      category: itemData.category,
      name: itemData.name,
      unit: itemData.unit,
      unitCost: itemData.unitCost,
      supplier: itemData.supplier || '',
      sku: itemData.sku || '',
    };

    onAddMaterial(newMaterial);
    setProcessedItems((prev) => ({ ...prev, [index]: 'added' }));
  };

  const handleUpdateExisting = (index, materialId, newPrice) => {
    onUpdateMaterial(materialId, newPrice);
    setProcessedItems((prev) => ({ ...prev, [index]: 'updated' }));
  };

  const handleSkip = (index) => {
    setSkippedItems((prev) => new Set([...prev, index]));
  };

  const handleAddAll = () => {
    items.forEach((item, index) => {
      if (processedItems[index] || skippedItems.has(index)) return;

      const matches = findMaterialMatches(item, existingMaterials);
      if (matches.length > 0 && matches[0].score >= 80) {
        // Update existing if high confidence match
        handleUpdateExisting(index, matches[0].material.id, item.unitPrice);
      } else {
        // Add as new
        handleAddNew(index, {
          name: item.name,
          category: item.suggestedCategory,
          unit: item.suggestedUnit || 'each',
          unitCost: item.unitPrice,
          sku: item.sku || '',
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-charcoal">
            {totalItems} items extracted
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Check className="w-4 h-4" />
          <span>
            {processedCount} of {totalItems} processed
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${(processedCount / totalItems) * 100}%` }}
        />
      </div>

      {/* Bulk actions */}
      {!allProcessed && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddAll}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Add All Remaining
          </button>
          <span className="text-sm text-gray-500">
            (Updates matches, adds new items)
          </span>
        </div>
      )}

      {/* Item list */}
      <div className="space-y-3">
        {items.map((item, index) => {
          if (skippedItems.has(index)) {
            return (
              <div
                key={index}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-400 line-through">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-400">Skipped</p>
                  </div>
                </div>
              </div>
            );
          }

          const matches = findMaterialMatches(item, existingMaterials);

          return (
            <ItemMatchCard
              key={index}
              item={item}
              matches={matches}
              onAddNew={(data) => handleAddNew(index, data)}
              onUpdateExisting={(materialId, price) =>
                handleUpdateExisting(index, materialId, price)
              }
              onSkip={() => handleSkip(index)}
              isAdded={!!processedItems[index]}
            />
          );
        })}
      </div>

      {/* Completion */}
      {allProcessed && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-emerald-800 mb-1">
            All items processed!
          </h3>
          <p className="text-sm text-emerald-600 mb-4">
            {Object.keys(processedItems).length} items added/updated,{' '}
            {skippedItems.size} skipped
          </p>
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
