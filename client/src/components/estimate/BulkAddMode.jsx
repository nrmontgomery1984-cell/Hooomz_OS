import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Calculator,
  ChevronDown,
} from 'lucide-react';
import {
  createInstance,
  calculateWallSF,
  SCOPE_ITEMS,
} from '../../lib/estimateHelpers';

/**
 * BulkAddMode - Continuous entry for wall measurements
 *
 * Flow:
 * 1. Select wall type (assembly) and level
 * 2. Enter feet, press Enter, enter inches, press Enter
 * 3. Row is added with total LF, new row appears
 * 4. Repeat until done
 * 5. Click "Calculate" to finalize
 */
export function BulkAddMode({
  scopeCategory = 'walls',
  levels,
  assemblies,
  ceilingHeight, // legacy single value
  ceilingHeights, // new per-level object
  instances,
  onInstancesChange,
}) {
  // Support both old single ceilingHeight and new per-level ceilingHeights
  const getCeilingHeightForLevel = (levelValue) => {
    if (ceilingHeights && ceilingHeights[levelValue]) {
      return ceilingHeights[levelValue];
    }
    return ceilingHeight || 9;
  };
  const [rows, setRows] = useState([createEmptyRow()]);
  const [selectedScopeItem, setSelectedScopeItem] = useState(
    SCOPE_ITEMS[scopeCategory]?.items[0]?.id || 'fr-ext'
  );
  const [selectedAssembly, setSelectedAssembly] = useState(
    assemblies?.find(a => a.selected)?.id || assemblies?.[0]?.id || 'ext-2x6'
  );

  const feetInputRefs = useRef({});
  const inchesInputRefs = useRef({});

  const scopeItems = SCOPE_ITEMS[scopeCategory]?.items || [];
  const selectedItem = scopeItems.find(i => i.id === selectedScopeItem);

  function createEmptyRow() {
    return {
      id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      level: levels?.[0]?.value || 'main',
      feet: '',
      inches: '',
      length: '', // Calculated total LF
      isNew: true,
      inputPhase: 'feet', // 'feet' or 'inches'
    };
  }

  // Calculate total length from feet and inches
  const calculateTotalLength = (feet, inches) => {
    const feetNum = parseFloat(feet) || 0;
    const inchesNum = parseFloat(inches) || 0;
    return feetNum + (inchesNum / 12);
  };

  // Focus the first feet input on the last new row
  useEffect(() => {
    const lastRow = rows[rows.length - 1];
    if (lastRow?.isNew && feetInputRefs.current[lastRow.id]) {
      feetInputRefs.current[lastRow.id].focus();
    }
  }, [rows.length]);

  const handleFeetChange = (rowId, value) => {
    setRows(prev =>
      prev.map(row => {
        if (row.id === rowId) {
          const totalLength = calculateTotalLength(value, row.inches);
          return { ...row, feet: value, length: totalLength, isNew: false };
        }
        return row;
      })
    );
  };

  const handleInchesChange = (rowId, value) => {
    setRows(prev =>
      prev.map(row => {
        if (row.id === rowId) {
          const totalLength = calculateTotalLength(row.feet, value);
          return { ...row, inches: value, length: totalLength, inputPhase: 'inches' };
        }
        return row;
      })
    );
  };

  const handleLevelChange = (rowId, level) => {
    setRows(prev =>
      prev.map(row => (row.id === rowId ? { ...row, level } : row))
    );
  };

  const handleFeetKeyDown = (e, rowId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Move to inches input
      setRows(prev =>
        prev.map(row =>
          row.id === rowId ? { ...row, inputPhase: 'inches' } : row
        )
      );
      // Focus inches input
      setTimeout(() => {
        if (inchesInputRefs.current[rowId]) {
          inchesInputRefs.current[rowId].focus();
        }
      }, 0);
    }
  };

  const handleInchesKeyDown = (e, rowId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const row = rows.find(r => r.id === rowId);
      const totalLength = calculateTotalLength(row?.feet, row?.inches);
      if (totalLength > 0) {
        // Add new row
        setRows(prev => [...prev, createEmptyRow()]);
      }
    }
  };

  const handleDeleteRow = (rowId) => {
    if (rows.length > 1) {
      setRows(prev => prev.filter(row => row.id !== rowId));
    } else {
      // Reset the single row
      setRows([createEmptyRow()]);
    }
  };

  const calculateSubtotal = () => {
    return rows.reduce((total, row) => {
      const length = parseFloat(row.length) || 0;
      if (selectedItem?.convertToSF) {
        const levelHeight = getCeilingHeightForLevel(row.level);
        return total + calculateWallSF(length, levelHeight);
      }
      return total + length;
    }, 0);
  };

  const handleCalculate = () => {
    // Convert valid rows to instances
    const validRows = rows.filter(row => row.length && parseFloat(row.length) > 0);

    if (validRows.length === 0) return;

    const newInstances = validRows.map(row =>
      createInstance({
        scopeItemId: selectedScopeItem,
        level: row.level,
        measurement: parseFloat(row.length),
        assemblyId: selectedAssembly,
      })
    );

    // Add to existing instances
    onInstancesChange?.([...instances, ...newInstances]);

    // Reset rows
    setRows([createEmptyRow()]);
  };

  const subtotal = calculateSubtotal();
  const unit = selectedItem?.convertToSF ? 'SF' : selectedItem?.unit?.toUpperCase() || 'LF';

  // Get assembly cost info
  const assembly = assemblies?.find(a => a.id === selectedAssembly);
  const costPerUnit = assembly
    ? (assembly.laborCostPerUnit || 0) + (assembly.materialCostPerUnit || 0)
    : 0;
  const estimatedCost = subtotal * costPerUnit;

  return (
    <div className="space-y-4">
      {/* Selectors */}
      <div className="flex gap-3 flex-wrap">
        {/* Scope Item Selector */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Item Type
          </label>
          <div className="relative">
            <select
              value={selectedScopeItem}
              onChange={(e) => setSelectedScopeItem(e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal bg-white"
            >
              {scopeItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Assembly Selector */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Assembly
          </label>
          <div className="relative">
            <select
              value={selectedAssembly}
              onChange={(e) => setSelectedAssembly(e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal bg-white"
            >
              {assemblies?.filter(a => a.selected !== false).map((assembly) => (
                <option key={assembly.id} value={assembly.id}>
                  {assembly.name} (${(assembly.laborCostPerUnit + assembly.materialCostPerUnit).toFixed(2)}/{assembly.unit})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Entry Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-32">
                Level
              </th>
              {selectedItem?.convertToSF ? (
                <>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase w-20">
                    Feet
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase w-20">
                    Inches
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase w-20">
                    Total LF
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase w-20">
                    SF
                  </th>
                </>
              ) : (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Area ({selectedItem?.unit?.toUpperCase() || 'SF'})
                </th>
              )}
              <th className="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, index) => {
              const length = parseFloat(row.length) || 0;
              const levelHeight = getCeilingHeightForLevel(row.level);
              const sf = selectedItem?.convertToSF
                ? calculateWallSF(length, levelHeight)
                : null;

              // Format display for feet and inches
              const displayFeet = row.feet || '';
              const displayInches = row.inches || '';
              const displayTotal = length > 0 ? length.toFixed(2) : '-';

              return (
                <tr key={row.id} className={row.isNew ? 'bg-blue-50/50' : ''}>
                  <td className="px-3 py-2">
                    <select
                      value={row.level}
                      onChange={(e) => handleLevelChange(row.id, e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-charcoal/20 focus:border-charcoal bg-white"
                    >
                      {levels?.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  {selectedItem?.convertToSF ? (
                    <>
                      <td className="px-2 py-2">
                        <input
                          ref={(el) => (feetInputRefs.current[row.id] = el)}
                          type="number"
                          value={displayFeet}
                          onChange={(e) => handleFeetChange(row.id, e.target.value)}
                          onKeyDown={(e) => handleFeetKeyDown(e, row.id)}
                          placeholder="ft"
                          className={`w-full px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-charcoal/20 focus:border-charcoal ${
                            row.inputPhase === 'feet' ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                          }`}
                          min="0"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          ref={(el) => (inchesInputRefs.current[row.id] = el)}
                          type="number"
                          value={displayInches}
                          onChange={(e) => handleInchesChange(row.id, e.target.value)}
                          onKeyDown={(e) => handleInchesKeyDown(e, row.id)}
                          placeholder="in"
                          className={`w-full px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-charcoal/20 focus:border-charcoal ${
                            row.inputPhase === 'inches' ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                          }`}
                          min="0"
                          max="11"
                        />
                      </td>
                      <td className="px-2 py-2 text-right text-sm text-gray-600 font-medium">
                        {displayTotal}
                      </td>
                      <td className="px-2 py-2 text-right text-sm text-gray-600 font-medium">
                        {sf > 0 ? sf.toLocaleString() : '-'}
                      </td>
                    </>
                  ) : (
                    <td className="px-3 py-2">
                      <input
                        ref={(el) => (feetInputRefs.current[row.id] = el)}
                        type="number"
                        value={row.feet || ''}
                        onChange={(e) => handleFeetChange(row.id, e.target.value)}
                        onKeyDown={(e) => handleInchesKeyDown(e, row.id)}
                        placeholder="Enter area..."
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-charcoal/20 focus:border-charcoal"
                        min="0"
                        step="0.5"
                      />
                    </td>
                  )}
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                      disabled={rows.length === 1 && !row.length}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Row Button */}
      <button
        onClick={() => setRows(prev => [...prev, createEmptyRow()])}
        className="flex items-center gap-2 text-sm text-charcoal hover:text-charcoal/80 font-medium"
      >
        <Plus className="w-4 h-4" />
        Add Row
      </button>

      {/* Subtotal & Calculate */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
        <div>
          <div className="text-sm text-gray-600">
            Subtotal: <span className="font-semibold text-charcoal">{subtotal.toLocaleString()} {unit}</span>
          </div>
          {costPerUnit > 0 && (
            <div className="text-xs text-gray-500">
              Est. cost: ${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
        <button
          onClick={handleCalculate}
          disabled={subtotal === 0}
          className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Calculator className="w-4 h-4" />
          Add to Estimate
        </button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        {selectedItem?.convertToSF
          ? 'Enter feet → press Enter → enter inches → press Enter to add next row. SF calculated from ceiling height.'
          : 'Enter area and press Enter to add another row.'}
      </p>
    </div>
  );
}

export default BulkAddMode;
