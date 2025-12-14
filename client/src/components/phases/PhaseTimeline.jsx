/**
 * PhaseTimeline Component
 *
 * Displays the construction phase sequence as a vertical timeline.
 * Supports drag-and-drop reordering with dependency validation.
 */

import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
} from 'lucide-react';
import { PhaseCard } from './PhaseCard';
import { PHASE_CATEGORIES } from '../../data/phaseTemplates';
import {
  validatePhaseCompletion,
  getBlockedPhases,
  calculatePhaseProgress,
} from '../../lib/phaseValidation';

export function PhaseTimeline({
  phases,
  template,
  projectPhases = [], // Phases with status from project
  onPhaseStatusChange,
  onPhaseSelect,
  onPhasesReorder,
  selectedPhaseId,
  canEdit = true,
  groupByCategory = false,
}) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedPhase, setDraggedPhase] = useState(null);

  // Merge template phases with project status
  const phasesWithStatus = useMemo(() => {
    const statusMap = new Map(projectPhases.map(p => [p.id, p.status]));
    return phases.map(phase => ({
      ...phase,
      status: statusMap.get(phase.id) || 'pending',
    }));
  }, [phases, projectPhases]);

  // Get blocked phases
  const blockedPhases = useMemo(() => {
    if (!template) return [];
    return getBlockedPhases(projectPhases, template);
  }, [projectPhases, template]);

  const blockedMap = useMemo(() => {
    const map = new Map();
    blockedPhases.forEach(bp => {
      map.set(bp.id, bp.blockedBy);
    });
    return map;
  }, [blockedPhases]);

  // Calculate progress
  const progress = useMemo(() => {
    return calculatePhaseProgress(phasesWithStatus);
  }, [phasesWithStatus]);

  // Filter and search phases
  const filteredPhases = useMemo(() => {
    let result = phasesWithStatus;

    if (filterCategory !== 'all') {
      result = result.filter(p => p.category === filterCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.shortName.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.tradeCodes?.some(t => t.toLowerCase().includes(term))
      );
    }

    return result;
  }, [phasesWithStatus, filterCategory, searchTerm]);

  // Group phases by category if requested
  const groupedPhases = useMemo(() => {
    if (!groupByCategory) return { ungrouped: filteredPhases };

    const groups = {};
    filteredPhases.forEach(phase => {
      const category = phase.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(phase);
    });

    return groups;
  }, [filteredPhases, groupByCategory]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(phases.map(p => p.category));
    return Array.from(cats).filter(Boolean);
  }, [phases]);

  // Handle phase status change with validation
  const handleStatusChange = (phaseId, newStatus) => {
    if (newStatus === 'complete' && template) {
      const validation = validatePhaseCompletion(phaseId, projectPhases, template);

      if (!validation.valid) {
        // Show error - hard dependency violation
        alert(validation.errors.map(e => e.message).join('\n'));
        return;
      }

      if (validation.warnings.length > 0) {
        // Show warnings but allow override
        const proceed = window.confirm(
          'Warning:\n' +
          validation.warnings.map(w => `- ${w.message}`).join('\n') +
          '\n\nProceed anyway?'
        );
        if (!proceed) return;
      }
    }

    onPhaseStatusChange?.(phaseId, newStatus);
  };

  // Drag and drop handlers
  const handleDragStart = (e, phase) => {
    setDraggedPhase(phase);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, targetPhase) => {
    e.preventDefault();
    if (!draggedPhase || draggedPhase.id === targetPhase.id) return;
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetPhase) => {
    e.preventDefault();
    if (!draggedPhase || draggedPhase.id === targetPhase.id) return;

    const oldIndex = phases.findIndex(p => p.id === draggedPhase.id);
    const newIndex = phases.findIndex(p => p.id === targetPhase.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = [...phases];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, draggedPhase);
      onPhasesReorder?.(newOrder);
    }

    setDraggedPhase(null);
  };

  const handleDragEnd = () => {
    setDraggedPhase(null);
  };

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-charcoal">Phase Progress</h3>
          <span className="text-2xl font-bold text-charcoal">
            {progress.percentComplete}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress.percentComplete}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 bg-green-50 rounded">
            <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mb-1" />
            <span className="font-medium text-green-700">{progress.completed}</span>
            <p className="text-green-600">Done</p>
          </div>
          <div className="p-2 bg-blue-50 rounded">
            <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <span className="font-medium text-blue-700">{progress.inProgress}</span>
            <p className="text-blue-600">Active</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <span className="block w-4 h-4 border-2 border-gray-400 rounded-full mx-auto mb-1" />
            <span className="font-medium text-gray-700">{progress.pending}</span>
            <p className="text-gray-600">Pending</p>
          </div>
          <div className="p-2 bg-red-50 rounded">
            <AlertTriangle className="w-4 h-4 text-red-500 mx-auto mb-1" />
            <span className="font-medium text-red-700">{progress.blocked}</span>
            <p className="text-red-600">Blocked</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search phases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-charcoal/20"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-charcoal/20"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {PHASE_CATEGORIES[cat]?.label || cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Phase List */}
      <div className="space-y-2">
        {groupByCategory ? (
          // Grouped view
          Object.entries(groupedPhases).map(([category, categoryPhases]) => (
            <div key={category} className="space-y-2">
              <h4
                className="text-sm font-medium px-2 py-1 rounded flex items-center gap-2"
                style={{
                  backgroundColor: (PHASE_CATEGORIES[category]?.color || '#6B7280') + '15',
                  color: PHASE_CATEGORIES[category]?.color || '#6B7280',
                }}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: PHASE_CATEGORIES[category]?.color || '#6B7280' }}
                />
                {PHASE_CATEGORIES[category]?.label || category}
                <span className="text-xs opacity-70">({categoryPhases.length})</span>
              </h4>
              {categoryPhases.map(phase => (
                <div
                  key={phase.id}
                  draggable={canEdit}
                  onDragStart={(e) => handleDragStart(e, phase)}
                  onDragOver={(e) => handleDragOver(e, phase)}
                  onDrop={(e) => handleDrop(e, phase)}
                  onDragEnd={handleDragEnd}
                >
                  <PhaseCard
                    phase={phase}
                    status={phase.status}
                    isBlocked={blockedMap.has(phase.id)}
                    blockedBy={blockedMap.get(phase.id) || []}
                    onStatusChange={handleStatusChange}
                    onSelect={onPhaseSelect}
                    isSelected={selectedPhaseId === phase.id}
                    isDragging={draggedPhase?.id === phase.id}
                    canEdit={canEdit}
                    showDependencies
                  />
                </div>
              ))}
            </div>
          ))
        ) : (
          // Flat list view
          filteredPhases.map((phase, index) => (
            <div
              key={phase.id}
              draggable={canEdit}
              onDragStart={(e) => handleDragStart(e, phase)}
              onDragOver={(e) => handleDragOver(e, phase)}
              onDrop={(e) => handleDrop(e, phase)}
              onDragEnd={handleDragEnd}
              className="relative"
            >
              {/* Connection Line */}
              {index < filteredPhases.length - 1 && (
                <div className="absolute left-[26px] top-[48px] w-0.5 h-4 bg-gray-200 z-0" />
              )}
              <PhaseCard
                phase={phase}
                status={phase.status}
                isBlocked={blockedMap.has(phase.id)}
                blockedBy={blockedMap.get(phase.id) || []}
                onStatusChange={handleStatusChange}
                onSelect={onPhaseSelect}
                isSelected={selectedPhaseId === phase.id}
                isDragging={draggedPhase?.id === phase.id}
                canEdit={canEdit}
                showDependencies
              />
            </div>
          ))
        )}

        {filteredPhases.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No phases match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PhaseTimeline;
