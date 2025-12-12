import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Package, Hammer, Layers, DollarSign } from 'lucide-react';
import { Card } from '../ui';
import { calculateWallMaterials, getWallCostBreakdown } from '../../lib/wallMaterialCalculator';
import { getMaterials } from '../../lib/costCatalogue';

/**
 * WallMaterialBreakdown - Shows detailed material breakdown for wall assemblies
 *
 * Displays lumber, sheathing, and insulation quantities with real catalogue prices
 */
export function WallMaterialBreakdown({
  assembly,
  linearFeet = 10,
  ceilingHeight = 9,
  showDetails = true,
  compact = false,
}) {
  const [expanded, setExpanded] = useState(showDetails);

  const breakdown = useMemo(() => {
    if (!assembly?.calculatorConfig) return null;

    const materials = getMaterials();
    return calculateWallMaterials({
      linearFeet,
      ceilingHeight,
      ...assembly.calculatorConfig,
      materials,
    });
  }, [assembly, linearFeet, ceilingHeight]);

  if (!breakdown || !assembly?.calculatorConfig) {
    return (
      <div className="text-sm text-gray-500 italic">
        No material breakdown available for this assembly
      </div>
    );
  }

  // Group materials by category
  const grouped = useMemo(() => {
    const groups = {
      lumber: { label: 'Lumber', icon: Hammer, items: [], subtotal: 0 },
      sheathing: { label: 'Sheathing', icon: Layers, items: [], subtotal: 0 },
      insulation: { label: 'Insulation', icon: Package, items: [], subtotal: 0 },
    };

    breakdown.materials.forEach(mat => {
      const desc = mat.description.toLowerCase();
      let category = 'lumber';
      if (desc.includes('sheath')) category = 'sheathing';
      else if (desc.includes('insul')) category = 'insulation';

      groups[category].items.push(mat);
      groups[category].subtotal += mat.totalCost;
    });

    return groups;
  }, [breakdown]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  if (compact) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-charcoal">{assembly.name}</span>
          <span className="text-green-600 font-semibold">
            {formatCurrency(breakdown.costPerLinearFoot)}/LF
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {linearFeet} LF × {ceilingHeight}' ceiling = {breakdown.wallArea} SF
        </div>
        <div className="text-xs text-gray-500">
          Total: {formatCurrency(breakdown.totalCost)}
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
          <div className="text-left">
            <h3 className="font-medium text-charcoal">{assembly.name}</h3>
            <p className="text-sm text-gray-500">
              {linearFeet} LF × {ceilingHeight}' ceiling = {breakdown.wallArea} SF
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-green-600">
            {formatCurrency(breakdown.costPerLinearFoot)}/LF
          </div>
          <div className="text-sm text-gray-500">
            Total: {formatCurrency(breakdown.totalCost)}
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-4 border-t border-gray-100 space-y-4">
          {Object.entries(grouped).map(([key, group]) => {
            if (group.items.length === 0) return null;

            const Icon = group.icon;
            return (
              <div key={key}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-sm text-charcoal">{group.label}</span>
                  <span className="text-sm text-gray-500 ml-auto">
                    {formatCurrency(group.subtotal)}
                  </span>
                </div>
                <div className="space-y-1 pl-6">
                  {group.items.map((mat, idx) => (
                    <div key={idx} className="flex items-start justify-between text-sm">
                      <div>
                        <span className="text-gray-700">{mat.description}</span>
                        <div className="text-xs text-gray-500">
                          {mat.quantity} × {mat.name} @ {formatCurrency(mat.unitCost)}
                        </div>
                      </div>
                      <span className="text-gray-600 font-medium ml-4">
                        {formatCurrency(mat.totalCost)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Calculation Notes */}
          <div className="pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span>Prices from Cost Catalogue (Home Hardware NB)</span>
              </div>
              <div>• Plates: 1 bottom + 2 top (double plate)</div>
              <div>• Studs: 1 per linear foot (16" OC simplified)</div>
              <div>• Sheathing: 4'×8' sheets (32 SF each)</div>
              {assembly.calculatorConfig.includeInsulation && (
                <div>• Insulation: {assembly.calculatorConfig.insulationType === 'r20_batt' ? 'R20' : 'R12'} batts</div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * AssemblyPricePreview - Inline preview of assembly cost per LF
 * For use in assembly selection dropdowns
 */
export function AssemblyPricePreview({ assembly, ceilingHeight = 9 }) {
  const costPerLF = useMemo(() => {
    if (!assembly?.calculatorConfig) {
      return assembly?.materialCostPerUnit || 0;
    }

    const materials = getMaterials();
    const result = calculateWallMaterials({
      linearFeet: 1,
      ceilingHeight,
      ...assembly.calculatorConfig,
      materials,
    });

    return result.costPerLinearFoot;
  }, [assembly, ceilingHeight]);

  const laborPerLF = assembly?.laborCostPerUnit || 0;
  const totalPerLF = costPerLF + laborPerLF;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  return (
    <span className="text-xs text-gray-500">
      {formatCurrency(totalPerLF)}/LF
      <span className="text-gray-400 ml-1">
        (mat: {formatCurrency(costPerLF)} + labor: {formatCurrency(laborPerLF)})
      </span>
    </span>
  );
}

export default WallMaterialBreakdown;
