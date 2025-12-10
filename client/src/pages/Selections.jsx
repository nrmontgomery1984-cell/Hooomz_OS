import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Package,
  ExternalLink,
  MoreVertical,
  Trash2,
  Edit,
  X,
  Lightbulb,
} from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, Button, Select, StatusBadge } from '../components/ui';
import { AddSelectionModal, SelectionDetailModal } from '../components/selections';
import { haptic } from '../utils/haptic';
import {
  getMaterialSelections,
  getSelectionReferenceData,
  getProjectRooms,
  getProject,
  updateSelectionStatus,
  deleteMaterialSelection,
  getSuggestedSelections,
} from '../services/api';

export function Selections() {
  const { projectId } = useParams();

  const [selections, setSelections] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSelection, setEditingSelection] = useState(null);
  const [viewingSelection, setViewingSelection] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [prefilledSelection, setPrefilledSelection] = useState(null);

  // Reference data
  const [refData, setRefData] = useState({ categories: [], statuses: [], phases: [], trades: [] });
  const [rooms, setRooms] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    categoryCode: '',
    status: '',
    roomId: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load data
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Load reference data (sync)
      const ref = getSelectionReferenceData();
      setRefData(ref);

      // Load project rooms
      const projectRooms = getProjectRooms(projectId);
      setRooms(projectRooms);

      // Load project info
      const { data: projData } = await getProject(projectId);
      setProject(projData);

      // Load selections
      const { data } = await getMaterialSelections(projectId, filters);
      setSelections(data || []);

      // Load suggested selections based on tasks
      const suggestedItems = getSuggestedSelections(projectId);
      setSuggestions(suggestedItems);

      setLoading(false);
    }
    loadData();
  }, [projectId]);

  // Reload selections when filters change
  useEffect(() => {
    async function reloadSelections() {
      const { data } = await getMaterialSelections(projectId, filters);
      setSelections(data || []);
    }
    if (!loading) {
      reloadSelections();
    }
  }, [filters, projectId]);

  // Filter options
  const categoryOptions = useMemo(() => [
    { value: '', label: 'All Categories' },
    ...refData.categories.map(c => ({ value: c.code, label: c.name })),
  ], [refData.categories]);

  const statusOptions = useMemo(() => [
    { value: '', label: 'All Statuses' },
    ...refData.statuses.map(s => ({ value: s.code, label: s.name })),
  ], [refData.statuses]);

  const roomOptions = useMemo(() => [
    { value: '', label: 'All Rooms' },
    ...rooms.map(r => ({ value: r.id, label: r.name })),
  ], [rooms]);

  // Helper lookups
  const getCategoryName = (code) => refData.categories.find(c => c.code === code)?.name || code;
  const getSubcategoryName = (categoryCode, subCode) => {
    const cat = refData.categories.find(c => c.code === categoryCode);
    return cat?.subcategories?.find(s => s.code === subCode)?.name || subCode;
  };
  const getStatusInfo = (code) => refData.statuses.find(s => s.code === code) || { name: code, color: '#9CA3AF' };
  const getRoomName = (roomId) => rooms.find(r => r.id === roomId)?.name || '';
  const getTradeName = (code) => refData.trades.find(t => t.code === code)?.name || code;

  // Handlers
  const handleUpdateSelection = (updated) => {
    setSelections(prev => prev.map(s => s.id === updated.id ? updated : s));
    setEditingSelection(null);
    setShowAddModal(false);
  };

  const handleStatusChange = async (selectionId, newStatus) => {
    const { data, error } = await updateSelectionStatus(projectId, selectionId, newStatus);
    if (!error && data) {
      setSelections(prev => prev.map(s => s.id === selectionId ? data : s));
    }
  };

  const handleDelete = async (selectionId) => {
    if (!confirm('Delete this selection?')) return;
    const { error } = await deleteMaterialSelection(projectId, selectionId);
    if (!error) {
      setSelections(prev => prev.filter(s => s.id !== selectionId));
    }
  };

  // Handle creating a selection from a suggestion
  const handleAddFromSuggestion = (suggestion) => {
    setPrefilledSelection({
      categoryCode: suggestion.categoryCode,
      subcategoryCode: suggestion.subcategoryCode,
    });
    setEditingSelection(null);
    setShowAddModal(true);
  };

  // Dismiss a suggestion
  const handleDismissSuggestion = (subcategoryCode) => {
    setSuggestions(prev => prev.filter(s => s.subcategoryCode !== subcategoryCode));
  };

  // Refresh suggestions after adding a selection
  const handleAddSelection = (newSelection) => {
    setSelections(prev => [newSelection, ...prev]);
    setShowAddModal(false);
    setPrefilledSelection(null);
    // Refresh suggestions to remove any that are now fulfilled
    const updatedSuggestions = getSuggestedSelections(projectId);
    setSuggestions(updatedSuggestions);
  };

  // Stats
  const stats = useMemo(() => {
    const total = selections.length;
    const pending = selections.filter(s => ['pending', 'researching', 'narrowed_down'].includes(s.status)).length;
    const approved = selections.filter(s => ['selected', 'contractor_approved'].includes(s.status)).length;
    const ordered = selections.filter(s => ['ordered', 'on_site'].includes(s.status)).length;
    const installed = selections.filter(s => s.status === 'installed').length;

    const totalCost = selections.reduce((sum, s) => sum + (s.costPerUnit || 0) * (s.quantity || 1), 0);
    const totalAllowance = selections.reduce((sum, s) => sum + (s.allowanceAmount || 0), 0);

    return { total, pending, approved, ordered, installed, totalCost, totalAllowance };
  }, [selections]);

  if (loading) {
    return (
      <PageContainer title="Selections">
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg h-24 animate-pulse" />
          <div className="bg-gray-100 rounded-lg h-64 animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Material Selections"
      subtitle={project?.name}
      backLink={`/projects/${projectId}`}
    >
      {/* Stats Summary */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-charcoal">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-amber-500">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-emerald-500">{stats.approved}</p>
            <p className="text-xs text-gray-500">Approved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-blue-500">{stats.ordered}</p>
            <p className="text-xs text-gray-500">Ordered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-charcoal">${stats.totalCost.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Cost</p>
          </div>
        </div>
      </Card>

      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
              showFilters ? 'bg-charcoal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
        <button
          onClick={() => { setEditingSelection(null); setShowAddModal(true); }}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Select
              value={filters.categoryCode}
              onChange={(v) => setFilters(f => ({ ...f, categoryCode: v }))}
              options={categoryOptions}
            />
            <Select
              value={filters.status}
              onChange={(v) => setFilters(f => ({ ...f, status: v }))}
              options={statusOptions}
            />
            <Select
              value={filters.roomId}
              onChange={(v) => setFilters(f => ({ ...f, roomId: v }))}
              options={roomOptions}
            />
          </div>
          {(filters.categoryCode || filters.status || filters.roomId || filters.search) && (
            <button
              onClick={() => setFilters({ categoryCode: '', status: '', roomId: '', search: '' })}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </Card>
      )}

      {/* Suggested Selections */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="p-4 mb-4 border-amber-200 bg-amber-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-medium text-charcoal">Suggested Selections</h3>
              <span className="text-xs text-gray-500">Based on your tasks</span>
            </div>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Hide
            </button>
          </div>
          <div className="space-y-2">
            {suggestions.slice(0, 5).map(suggestion => (
              <div
                key={suggestion.subcategoryCode}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-charcoal">
                      {suggestion.subcategoryName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {suggestion.categoryName}
                    </span>
                    {suggestion.priority === 'high' && (
                      <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-600 rounded">
                        Needed soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    From task: {suggestion.matchedTask}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => handleAddFromSuggestion(suggestion)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                  <button
                    onClick={() => handleDismissSuggestion(suggestion.subcategoryCode)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {suggestions.length > 5 && (
              <p className="text-xs text-center text-gray-500 pt-1">
                +{suggestions.length - 5} more suggestions
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Selections List */}
      {selections.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No selections yet</p>
          <p className="text-sm text-gray-400 mb-4">Add material selections to track finishes and fixtures</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Selection
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {selections.map(selection => (
            <SelectionCard
              key={selection.id}
              selection={selection}
              getSubcategoryName={getSubcategoryName}
              getRoomName={getRoomName}
              statuses={refData.statuses}
              onStatusChange={handleStatusChange}
              onClick={() => setViewingSelection(selection)}
              onEdit={() => { setEditingSelection(selection); setShowAddModal(true); }}
              onDelete={() => handleDelete(selection.id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddSelectionModal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); setEditingSelection(null); setPrefilledSelection(null); }}
          projectId={projectId}
          selection={editingSelection}
          prefilled={prefilledSelection}
          onAdd={handleAddSelection}
          onUpdate={handleUpdateSelection}
          categories={refData.categories}
          statuses={refData.statuses}
          phases={refData.phases}
          trades={refData.trades}
          rooms={rooms}
        />
      )}

      {/* Selection Detail Modal */}
      <SelectionDetailModal
        selection={viewingSelection}
        isOpen={!!viewingSelection}
        onClose={() => setViewingSelection(null)}
        getCategoryName={getCategoryName}
        getSubcategoryName={getSubcategoryName}
        getStatusInfo={getStatusInfo}
        getRoomName={getRoomName}
        getTradeName={getTradeName}
        statuses={refData.statuses}
        onStatusChange={(id, status) => {
          handleStatusChange(id, status);
          // Update the viewing selection with new status
          setViewingSelection(prev => prev ? { ...prev, status } : null);
        }}
        onEdit={() => {
          setEditingSelection(viewingSelection);
          setShowAddModal(true);
        }}
        onDelete={() => {
          handleDelete(viewingSelection.id);
          setViewingSelection(null);
        }}
      />
    </PageContainer>
  );
}

function SelectionCard({
  selection,
  getSubcategoryName,
  getRoomName,
  statuses,
  onStatusChange,
  onClick,
  onEdit,
  onDelete,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const totalCost = (selection.costPerUnit || 0) * (selection.quantity || 1);
  const upgradeCost = totalCost - (selection.allowanceAmount || 0);

  // Handle status change with haptic feedback
  const handleStatusChange = (newStatus) => {
    haptic('light');
    onStatusChange(selection.id, newStatus);
  };

  return (
    <Card className="p-4" onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-charcoal truncate">{selection.itemName}</h3>
            {selection.supplierUrl && (
              <a
                href={selection.supplierUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
            <span>{getSubcategoryName(selection.categoryCode, selection.subcategoryCode)}</span>
            {selection.roomId && (
              <>
                <span className="text-gray-300">|</span>
                <span>{getRoomName(selection.roomId)}</span>
              </>
            )}
            {selection.manufacturer && (
              <>
                <span className="text-gray-300">|</span>
                <span>{selection.manufacturer}</span>
              </>
            )}
          </div>

          {/* Details Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {selection.modelNumber && (
              <span className="text-gray-400">#{selection.modelNumber}</span>
            )}
            {selection.color && (
              <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">{selection.color}</span>
            )}
            {selection.quantity > 1 && (
              <span className="text-gray-500">
                Qty: {selection.quantity} {selection.unitOfMeasurement}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Status & Cost */}
        <div className="flex flex-col items-end gap-2">
          {/* Status Badge - tap to cycle, long-press for menu */}
          <StatusBadge
            status={selection.status}
            customStatuses={statuses}
            onChange={handleStatusChange}
          />

          {/* Cost */}
          {totalCost > 0 && (
            <div className="text-right">
              <p className="text-sm font-medium text-charcoal">${totalCost.toLocaleString()}</p>
              {upgradeCost > 0 && (
                <p className="text-xs text-amber-600">+${upgradeCost.toLocaleString()} upgrade</p>
              )}
            </div>
          )}

          {/* Menu */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 w-full"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {selection.notes && (
        <p className="mt-2 pt-2 border-t border-gray-100 text-sm text-gray-500">{selection.notes}</p>
      )}
    </Card>
  );
}

export default Selections;
