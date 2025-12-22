import { MapPin, Calendar, FileText, MessageSquare, Plus, Home, Hammer, Eye } from 'lucide-react';
import { Card, Button } from '../ui';
import { HealthIndicator } from './HealthIndicator';
import { PhaseIndicator, PhaseChip } from './PhaseIndicator';
import { PhaseTransitionButton, PhaseSelector } from './PhaseTransitionModal';
import { formatDate } from '../../lib/dashboardHelpers';

/**
 * ProjectHeader - Status bar with project name, address, phase indicator
 *
 * @param {Object} header - Header data from dashboard
 * @param {Object} project - Full project object for phase transitions
 * @param {Function} onAction - Action handler
 * @param {Function} onPhaseTransition - Handler for initiating phase transitions
 */
export function ProjectHeader({ header, project, onAction, onPhaseTransition, viewMode = 'contractor' }) {
  const isNewConstruction = header.projectType === 'new_construction';
  const isHomeownerView = viewMode === 'homeowner';

  // Check if estimate exists (has saved line items or calculated totals)
  const hasEstimate =
    project?.estimate_line_items?.length > 0 ||
    project?.estimate_high > 0 ||
    project?.estimate_low > 0;

  // Determine button label based on phase and user role
  const getEstimateButtonLabel = () => {
    const phase = header.phase?.toLowerCase();
    if (!hasEstimate) return 'Create Estimate';

    if (phase === 'estimate' || phase === 'estimating' || phase === 'intake') {
      return 'Edit Estimate';
    } else if (phase === 'quoted' || phase === 'quote') {
      return 'View Quote';
    } else if (phase === 'contract' || phase === 'contracted' || phase === 'active' || phase === 'complete' || phase === 'punch_list') {
      return 'View Contract';
    }
    return 'Edit Estimate';
  };

  return (
    <Card className="p-3 lg:p-4 mb-2">
      {/* Mobile: Compact layout without redundant name */}
      <div className="lg:hidden">
        {/* Phase progress - full width */}
        <div className="mb-3">
          <PhaseIndicator currentPhase={header.phase} healthStatus={header.healthStatus} />
        </div>

        {/* Phase chip + days + change phase button */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <PhaseChip phase={header.phase} />
            <span className="text-xs text-gray-500">{header.daysInPhase}d</span>
          </div>
          {/* Phase selector - prominent button */}
          {project && onPhaseTransition && (
            <PhaseSelector project={project} onSelect={onPhaseTransition} />
          )}
        </div>

        {/* Quick Actions - wrap instead of scroll */}
        <div className="flex flex-wrap gap-2">
          {/* Homeowner: View only - label based on phase */}
          {isHomeownerView ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAction?.('view_estimate')}
              className="text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              {header.phase === 'quoted' || header.phase === 'quote' || header.phase === 'contract' ? 'View Quote' : 'View Estimate'}
            </Button>
          ) : (
            <>
              <Button
                variant={hasEstimate ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => onAction?.('view_estimate')}
                className="text-xs"
              >
                <FileText className="w-3.5 h-3.5 mr-1" />
                {hasEstimate ? 'Estimate' : 'Create'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onAction?.('message_client')}
                className="text-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                Message
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onAction?.('add_note')}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Log
              </Button>
              {hasEstimate && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onAction?.('preview_quote')}
                  className="text-xs"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Preview
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Desktop: Full layout */}
      <div className="hidden lg:block">
        {/* Top row: Name, type badge, health */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            {/* Project type icon */}
            <div className={`
              p-2 rounded-lg
              ${isNewConstruction ? 'bg-blue-100' : 'bg-amber-100'}
            `}>
              {isNewConstruction ? (
                <Home className="w-5 h-5 text-blue-600" />
              ) : (
                <Hammer className="w-5 h-5 text-amber-600" />
              )}
            </div>

            <div>
              <h1 className="text-lg font-semibold text-charcoal">{header.projectName}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                {header.address}
              </div>
            </div>
          </div>

          <HealthIndicator
            status={header.healthStatus}
            reason={header.healthReason}
            size="md"
          />
        </div>

        {/* Phase progress */}
        <div className="mb-4 py-3 border-t border-b border-gray-100">
          <PhaseIndicator currentPhase={header.phase} healthStatus={header.healthStatus} />
        </div>

        {/* Phase info row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm mb-3">
          <div className="flex items-center gap-2">
            <PhaseChip phase={header.phase} />
            <span className="text-gray-500">
              {header.daysInPhase}d in phase
            </span>
            {header.phaseStartDate && (
              <span className="text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(header.phaseStartDate)}
              </span>
            )}
          </div>
          {/* Phase selector - prominent button */}
          {project && onPhaseTransition && (
            <PhaseSelector project={project} onSelect={onPhaseTransition} />
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Homeowner: View only - label based on phase */}
          {isHomeownerView ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAction?.('view_estimate')}
            >
              <FileText className="w-4 h-4 mr-1" />
              {header.phase === 'quoted' || header.phase === 'quote' || header.phase === 'contract' ? 'View Quote' : 'View Estimate'}
            </Button>
          ) : (
            <>
              <Button
                variant={hasEstimate ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => onAction?.('view_estimate')}
              >
                <FileText className="w-4 h-4 mr-1" />
                {getEstimateButtonLabel()}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onAction?.('message_client')}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Message
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onAction?.('add_note')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Log
              </Button>
              {hasEstimate && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onAction?.('preview_quote')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview Quote
                </Button>
              )}
              {/* Primary phase transition action */}
              {project && onPhaseTransition && (
                <PhaseTransitionButton
                  project={project}
                  onTransition={onPhaseTransition}
                  size="sm"
                />
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * ProjectHeaderCompact - Smaller version for nested views
 */
export function ProjectHeaderCompact({ header }) {
  const isNewConstruction = header.projectType === 'new_construction';

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg mb-4">
      <div className="flex items-center gap-3">
        <div className={`
          p-1.5 rounded-lg
          ${isNewConstruction ? 'bg-blue-100' : 'bg-amber-100'}
        `}>
          {isNewConstruction ? (
            <Home className="w-4 h-4 text-blue-600" />
          ) : (
            <Hammer className="w-4 h-4 text-amber-600" />
          )}
        </div>
        <div>
          <h2 className="font-medium text-charcoal">{header.projectName}</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            {header.address}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <PhaseIndicator currentPhase={header.phase} healthStatus={header.healthStatus} compact />
        <HealthIndicator
          status={header.healthStatus}
          reason={header.healthReason}
          size="sm"
          showLabel={false}
        />
      </div>
    </div>
  );
}
