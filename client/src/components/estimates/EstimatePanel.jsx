import { useState, useMemo } from 'react';
import {
  DollarSign,
  RefreshCw,
  History,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Lock,
  ChevronDown,
  ChevronUp,
  Calculator,
} from 'lucide-react';
import { Card, Button } from '../ui';
import {
  recalculateProjectEstimate,
  canRecalculateEstimate,
} from '../../services/contractorIntakeService';
import { getCostSummary } from '../../lib/scopeCostEstimator';

/**
 * Format currency for display
 */
function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * EstimatePanel - Shows project cost estimates with history and recalculation
 */
export function EstimatePanel({ project, onProjectUpdate }) {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState(null);

  const canRecalculate = canRecalculateEstimate(project);
  const history = project?.estimate_history || [];
  const latestEstimate = history[history.length - 1];

  // Calculate estimates on-the-fly for projects that have intake data but no stored estimates
  const calculatedEstimate = useMemo(() => {
    if (project?.estimate_total) return null; // Already have stored estimates
    if (!project?.intake_data?.scope) return null; // No scope data to calculate from

    const specLevel = project?.intake_data?.project?.specLevel || project?.build_tier || 'standard';
    return getCostSummary(project.intake_data.scope, specLevel);
  }, [project]);

  // Use stored estimates or calculated ones
  const displayEstimate = {
    labour: project?.estimate_labour ?? calculatedEstimate?.rawCosts?.totalLabour ?? 0,
    materials: project?.estimate_materials ?? calculatedEstimate?.rawCosts?.totalMaterials ?? 0,
    total: project?.estimate_total ?? calculatedEstimate?.rawCosts?.grandTotal ?? 0,
  };

  const hasEstimateData = displayEstimate.total > 0 || project?.intake_data?.scope;

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    setError(null);

    const { data, error: recalcError } = await recalculateProjectEstimate(
      project.id,
      'Updated from Cost Catalogue'
    );

    setIsRecalculating(false);

    if (recalcError) {
      setError(recalcError);
      return;
    }

    if (data && onProjectUpdate) {
      onProjectUpdate(data);
    }
  };

  // If no estimate data exists and no intake data to calculate from
  if (!hasEstimateData) {
    // Check what type of intake this project has
    const intakeType = project?.intake_type || project?.intake_data?.form_type;
    const isContractorIntake = intakeType === 'contractor';
    const hasAnyIntakeData = !!project?.intake_data;

    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No Estimate Available</p>
          <p className="text-sm mt-1 mb-4">
            {isContractorIntake
              ? "This project's scope data couldn't be read. It may have been created before estimate tracking was added."
              : hasAnyIntakeData
              ? "This project was created via homeowner intake. Estimates are only available for contractor intake projects."
              : "This project doesn't have intake data to calculate estimates from."}
          </p>
          {isContractorIntake && (
            <p className="text-xs text-blue-600">
              Create a new project via Contractor Intake to see cost estimates with recalculation support.
            </p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Estimate Summary */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 bg-green-50 border-b border-green-100 flex items-center justify-between">
          <h3 className="font-medium text-charcoal flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            Project Estimate
          </h3>
          {project.contract_signed && (
            <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
              <Lock className="w-3 h-3" />
              Contract Signed
            </span>
          )}
        </div>

        <div className="p-4">
          {/* Calculated estimate notice */}
          {calculatedEstimate && !project?.estimate_total && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <Calculator className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <span className="font-medium">Live calculation</span> - This estimate is calculated from scope data but not yet saved.
                Click "Recalculate" to store it with history tracking.
              </div>
            </div>
          )}

          {/* Main totals */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Labour</div>
              <div className="text-lg font-semibold text-charcoal">
                {formatCurrency(displayEstimate.labour)}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Materials</div>
              <div className="text-lg font-semibold text-charcoal">
                {formatCurrency(displayEstimate.materials)}
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-xs text-green-600 mb-1">Total</div>
              <div className="text-xl font-bold text-green-700">
                {formatCurrency(displayEstimate.total)}
              </div>
            </div>
          </div>

          {/* Last updated info */}
          {latestEstimate && (
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last updated: {formatDate(latestEstimate.created_at)}
              </span>
              <span className="capitalize">{latestEstimate.source?.replace('_', ' ')}</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRecalculate}
              disabled={!canRecalculate || isRecalculating}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? 'Recalculating...' : 'Recalculate'}
            </Button>

            {!canRecalculate && !project.contract_signed && (
              <span className="text-xs text-gray-500">
                No scope data available
              </span>
            )}

            {project.contract_signed && (
              <span className="text-xs text-amber-600">
                Locked after contract signed
              </span>
            )}

            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="ml-auto flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <History className="w-4 h-4" />
                History ({history.length})
                {showHistory ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Estimate History */}
      {showHistory && history.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h4 className="font-medium text-charcoal flex items-center gap-2">
              <History className="w-4 h-4 text-gray-400" />
              Estimate History
            </h4>
          </div>
          <div className="divide-y divide-gray-100">
            {[...history].reverse().map((snapshot, index) => (
              <EstimateHistoryItem
                key={snapshot.id}
                snapshot={snapshot}
                isLatest={index === 0}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Individual history item
 */
function EstimateHistoryItem({ snapshot, isLatest }) {
  const changeAmount = snapshot.change_amount;
  const hasChange = changeAmount != null && changeAmount !== 0;

  return (
    <div className={`p-4 ${isLatest ? 'bg-green-50/50' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-charcoal">
              {formatCurrency(snapshot.grand_total)}
            </span>
            {isLatest && (
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                Current
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDate(snapshot.created_at)}
          </p>
        </div>

        {hasChange && (
          <div className={`flex items-center gap-1 text-sm ${
            changeAmount > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {changeAmount > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : changeAmount < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            {changeAmount > 0 ? '+' : ''}{formatCurrency(changeAmount)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>Labour: {formatCurrency(snapshot.total_labour)}</span>
        <span>Materials: {formatCurrency(snapshot.total_materials)}</span>
        <span>{snapshot.item_count} items</span>
      </div>

      {snapshot.notes && (
        <p className="text-xs text-gray-600 mt-2 italic">
          "{snapshot.notes}"
        </p>
      )}

      {snapshot.low_confidence_count > 0 && (
        <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
          <AlertTriangle className="w-3 h-3" />
          {snapshot.low_confidence_count} items with estimated rates
        </div>
      )}
    </div>
  );
}

export default EstimatePanel;
