import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit3, Eye, Settings, Trash2 } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Button } from '../components/ui';
import {
  FloorPlanViewer,
  FloorPlanEditor,
  FloorPlanControls,
  ElementModal,
} from '../components/floorplan';
import { useFloorPlan } from '../hooks/useFloorPlan';
import { getProject, getLoops } from '../services/api';

/**
 * FloorPlanPage - Main page for viewing and editing floor plans
 *
 * Features:
 * - View mode: pan/zoom floor plan viewer
 * - Edit mode: drawing tools for creating elements
 * - Floor level switching
 * - Trade filtering
 * - Element details modal
 * - Loop linking
 */
export function FloorPlanPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Project data
  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [loops, setLoops] = useState([]);

  // View state
  const [mode, setMode] = useState('view'); // 'view' | 'edit'
  const [showLabels, setShowLabels] = useState(false);
  const [showElementModal, setShowElementModal] = useState(false);
  const [showAddFloorPlanModal, setShowAddFloorPlanModal] = useState(false);

  // Floor plan hook
  const {
    floorPlans,
    currentFloorPlan,
    currentFloorPlanId,
    selectFloorPlan,
    elements,
    filteredElements,
    selectedElement,
    selectedElementId,
    selectElement,
    clearSelection,
    tradeFilter,
    setTradeFilter,
    statusSummary,
    getElementColor,
    loading,
    saving,
    error,
    addFloorPlan,
    editFloorPlan,
    removeFloorPlan,
    addElement,
    editElement,
    removeElement,
    linkToLoop,
    linkToNewLoop,
    unlinkFromLoop,
    refresh,
    FLOOR_PLAN_STATUS_COLORS,
    ELEMENT_TYPE_DEFAULTS,
    TRADE_COLORS,
  } = useFloorPlan(projectId);

  // Load project data
  useEffect(() => {
    async function loadProject() {
      setProjectLoading(true);
      const [projectRes, loopsRes] = await Promise.all([
        getProject(projectId),
        getLoops(projectId),
      ]);
      setProject(projectRes.data);
      setLoops(loopsRes.data || []);
      setProjectLoading(false);
    }
    loadProject();
  }, [projectId]);

  // Handle element click in viewer
  const handleElementClick = (element) => {
    if (element) {
      selectElement(element.id);
      setShowElementModal(true);
    } else {
      clearSelection();
    }
  };

  // Handle element double-click (quick edit)
  const handleElementDoubleClick = (element) => {
    selectElement(element.id);
    setShowElementModal(true);
  };

  // Handle adding element in edit mode
  const handleAddElement = async (elementData) => {
    const result = await addElement(elementData);
    if (result.success) {
      selectElement(result.data.id);
    }
  };

  // Handle element edit from modal
  const handleEditElement = async (elementId, updates) => {
    await editElement(elementId, updates);
  };

  // Handle element delete
  const handleDeleteElement = async (elementId) => {
    await removeElement(elementId);
    setShowElementModal(false);
  };

  // Handle floor plan creation
  const handleAddFloorPlan = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const result = await addFloorPlan({
      name: formData.get('name'),
      floorNumber: parseInt(formData.get('floorNumber'), 10),
      svgViewbox: '0 0 800 600',
    });
    if (result.success) {
      setShowAddFloorPlanModal(false);
    }
  };

  if (projectLoading || loading) {
    return (
      <PageContainer backTo={`/projects/${projectId}`}>
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg h-32 animate-pulse" />
          <div className="bg-gray-100 rounded-lg h-64 animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer backTo="/" title="Project Not Found">
        <p className="text-gray-500">This project doesn't exist.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      backTo={`/projects/${projectId}`}
      title="Floor Plans"
      subtitle={project.name}
      action={
        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setMode('view')}
              className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${
                mode === 'view'
                  ? 'bg-charcoal text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View</span>
            </button>
            <button
              onClick={() => setMode('edit')}
              className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${
                mode === 'edit'
                  ? 'bg-charcoal text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>

          {/* Add Floor Plan */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddFloorPlanModal(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Add Floor</span>
          </Button>
        </div>
      }
    >
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* No Floor Plans State */}
      {floorPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-charcoal mb-2">
            No Floor Plans Yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Create your first floor plan to start mapping out elements and tracking progress visually.
          </p>
          <Button onClick={() => setShowAddFloorPlanModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Floor Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <FloorPlanControls
              floorPlans={floorPlans}
              currentFloorPlanId={currentFloorPlanId}
              onFloorPlanChange={selectFloorPlan}
              tradeFilter={tradeFilter}
              onTradeFilterChange={setTradeFilter}
              statusSummary={statusSummary}
              showLabels={showLabels}
              onToggleLabels={setShowLabels}
              TRADE_COLORS={TRADE_COLORS}
            />
          </div>

          {/* Main Canvas */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {mode === 'view' ? (
              <FloorPlanViewer
                floorPlan={currentFloorPlan}
                elements={filteredElements}
                selectedElementId={selectedElementId}
                onElementClick={handleElementClick}
                onElementDoubleClick={handleElementDoubleClick}
                onBackgroundClick={clearSelection}
                getElementColor={getElementColor}
                showLabels={showLabels}
                className="h-[500px] lg:h-[600px]"
              />
            ) : (
              <FloorPlanEditor
                floorPlan={currentFloorPlan}
                elements={filteredElements}
                selectedElementId={selectedElementId}
                onElementClick={handleElementClick}
                onAddElement={handleAddElement}
                onUpdateElement={editElement}
                onDeleteElement={handleDeleteElement}
                getElementColor={getElementColor}
                className="min-h-[calc(100vh-200px)]"
              />
            )}
          </div>
        </div>
      )}

      {/* Element Detail Modal */}
      {showElementModal && selectedElement && (
        <ElementModal
          element={selectedElement}
          onClose={() => {
            setShowElementModal(false);
            clearSelection();
          }}
          onEdit={handleEditElement}
          onDelete={handleDeleteElement}
          onLinkToLoop={linkToLoop}
          onLinkToNewLoop={linkToNewLoop}
          onUnlinkFromLoop={unlinkFromLoop}
          loops={loops}
          projectId={projectId}
          TRADE_COLORS={TRADE_COLORS}
          FLOOR_PLAN_STATUS_COLORS={FLOOR_PLAN_STATUS_COLORS}
        />
      )}

      {/* Add Floor Plan Modal */}
      {showAddFloorPlanModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowAddFloorPlanModal(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md">
            <form
              onSubmit={handleAddFloorPlan}
              className="bg-white rounded-xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-charcoal mb-4">
                Add Floor Plan
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="e.g., First Floor, Basement"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Number
                  </label>
                  <input
                    name="floorNumber"
                    type="number"
                    required
                    defaultValue={floorPlans.length + 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use 0 for basement, 1 for first floor, etc.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddFloorPlanModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Creating...' : 'Create Floor Plan'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </PageContainer>
  );
}

export default FloorPlanPage;
