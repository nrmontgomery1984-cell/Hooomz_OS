import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calculator,
  Plus,
  X,
  Home,
  Hammer,
  ChevronRight,
  Check,
  Trash2,
} from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, useToast } from '../components/ui';
import { getProjects, createProject, deleteProject } from '../services/api';
import {
  ROOM_TYPES,
  SQFT_RANGES,
} from '../data/intakeSchema';

/**
 * Estimates Page - Mobile optimized for field use
 */
export function Estimates() {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewEstimate, setShowNewEstimate] = useState(false);

  useEffect(() => {
    async function loadEstimates() {
      setLoading(true);
      const { data } = await getProjects();
      // Filter for projects in estimating phase only
      // Note: 'phase' is the source of truth, 'status' is legacy
      const estimateProjects = (data || []).filter(p =>
        p.phase === 'estimating' && p.phase !== 'cancelled'
      );
      setEstimates(estimateProjects);
      setLoading(false);
    }
    loadEstimates();
  }, []);

  const handleCreateEstimate = async (projectData) => {
    const { data, error } = await createProject({
      ...projectData,
      phase: 'estimating',
    });

    if (!error && data) {
      setShowNewEstimate(false);
      navigate(`/projects/${data.id}/estimate`);
    }
  };

  const totalHigh = estimates.reduce((sum, e) => sum + (e.estimate_high || 0), 0);

  return (
    <PageContainer
      title="Estimates"
      subtitle="Active estimates and pricing"
      action={
        <button
          onClick={() => setShowNewEstimate(true)}
          className="w-12 h-12 bg-charcoal text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      }
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-3">
          <p className="text-xs text-gray-500 mb-1">Active Estimates</p>
          <p className="text-2xl font-bold text-charcoal">{estimates.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-gray-500 mb-1">Pipeline Value</p>
          <p className="text-lg font-bold text-green-700">
            ${totalHigh.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Workflow explanation */}
      <Card className="p-4 mb-6 bg-amber-50 border-amber-100">
        <div className="flex items-start gap-3">
          <Calculator className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-charcoal mb-1">Estimate Phase</p>
            <p className="text-sm text-gray-600">
              Build detailed scope and pricing. Once approved by the customer,
              projects move to the Contract phase for signature.
            </p>
          </div>
        </div>
      </Card>

      {/* Section Header */}
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Estimates</h3>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      ) : estimates.length === 0 ? (
        <Card className="p-8 text-center">
          <Calculator className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No estimates yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Create an estimate to start building scope and pricing
          </p>
          <button
            onClick={() => setShowNewEstimate(true)}
            className="text-charcoal font-medium underline"
          >
            Create your first estimate
          </button>
        </Card>
      ) : (
        <div className="space-y-3">
          {estimates.map((project) => (
            <EstimateCard
              key={project.id}
              project={project}
              onDelete={(id) => setEstimates(estimates.filter(e => e.id !== id))}
            />
          ))}
        </div>
      )}

      {/* New Estimate Modal */}
      {showNewEstimate && (
        <NewEstimateModal
          onClose={() => setShowNewEstimate(false)}
          onSubmit={handleCreateEstimate}
        />
      )}
    </PageContainer>
  );
}

function EstimateCard({ project, onDelete }) {
  const { showToast } = useToast();

  // Calculate days since creation - use useMemo to avoid impure function during render
  const days = useMemo(() => {
    return Math.floor(
      (Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
  }, [project.created_at]);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete "${project.name || 'this estimate'}"? This cannot be undone.`)) {
      const { error } = await deleteProject(project.id);
      if (error) {
        showToast('Failed to delete estimate', 'error');
      } else if (onDelete) {
        onDelete(project.id);
        showToast('Estimate deleted', 'success');
      }
    }
  };

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="p-4 hover:border-gray-300 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-charcoal truncate">{project.name}</h4>
            <p className="text-sm text-gray-500">{project.client_name}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
              Estimating
            </span>
          </div>
        </div>

        {/* Estimate Value */}
        {project.estimate_high && (
          <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Estimate Range</span>
            <span className="text-sm font-bold text-charcoal">
              ${project.estimate_low?.toLocaleString()} - ${project.estimate_high.toLocaleString()}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">{days}d ago</span>
          <span className="flex items-center gap-1 text-xs text-blue-600">
            View Estimate <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </Card>
    </Link>
  );
}

/**
 * Quick Estimate Modal - Ultra-simple mobile form
 */
function NewEstimateModal({ onClose, onSubmit }) {
  const [submitting, setSubmitting] = useState(false);
  const [clientName, setClientName] = useState('');
  const [projectType, setProjectType] = useState('renovation');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [sqftRange, setSqftRange] = useState('1600_2000');

  // Just show first 6 rooms for simplicity
  const quickRooms = ROOM_TYPES.slice(0, 6);

  const toggleRoom = (value) => {
    setSelectedRooms(prev =>
      prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]
    );
  };

  const canSubmit = clientName.trim().length > 0 &&
    (projectType === 'new_construction' || selectedRooms.length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    let name = 'New Project';
    if (projectType === 'renovation' && selectedRooms.length > 0) {
      const labels = selectedRooms.slice(0, 2).map(r =>
        ROOM_TYPES.find(rt => rt.value === r)?.label || r
      );
      name = labels.join(' & ') + (selectedRooms.length > 2 ? ` +${selectedRooms.length - 2}` : '') + ' Reno';
    } else if (projectType === 'new_construction') {
      const sqft = SQFT_RANGES.find(s => s.value === sqftRange)?.label || '';
      name = `New Home - ${sqft}`;
    }

    const roomTiers = {};
    selectedRooms.forEach(room => { roomTiers[room] = 'full'; });

    await onSubmit({
      name,
      client_name: clientName.trim(),
      intake_type: projectType,
      build_tier: 'better',
      intake_data: {
        form_type: projectType,
        project: { build_tier: 'better' },
        ...(projectType === 'renovation'
          ? { renovation: { selected_rooms: selectedRooms, room_tiers: roomTiers } }
          : { layout: { sqft_range: sqftRange } }
        ),
      },
    });
    setSubmitting(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>New Estimate</span>
        <button
          onClick={onClose}
          style={{
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: 'none',
            background: '#f3f4f6',
          }}
        >
          <X style={{ width: '20px', height: '20px' }} />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Client Name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
            Client Name
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Enter client name"
            style={{
              width: '100%',
              height: '48px',
              padding: '0 16px',
              fontSize: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Type Toggle */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
            Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setProjectType('renovation')}
              style={{
                height: '44px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: projectType === 'renovation' ? '#f59e0b' : '#f3f4f6',
                color: projectType === 'renovation' ? 'white' : '#4b5563',
              }}
            >
              <Hammer style={{ width: '16px', height: '16px' }} />
              Reno
            </button>
            <button
              type="button"
              onClick={() => setProjectType('new_construction')}
              style={{
                height: '44px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: projectType === 'new_construction' ? '#3b82f6' : '#f3f4f6',
                color: projectType === 'new_construction' ? 'white' : '#4b5563',
              }}
            >
              <Home style={{ width: '16px', height: '16px' }} />
              New Build
            </button>
          </div>
        </div>

        {/* Scope */}
        {projectType === 'renovation' ? (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
              Areas ({selectedRooms.length} selected)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {quickRooms.map((room) => {
                const isSelected = selectedRooms.includes(room.value);
                return (
                  <button
                    key={room.value}
                    type="button"
                    onClick={() => toggleRoom(room.value)}
                    style={{
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: isSelected ? 'none' : '1px solid #d1d5db',
                      fontWeight: '500',
                      fontSize: '14px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isSelected ? '#f59e0b' : 'white',
                      color: isSelected ? 'white' : '#374151',
                    }}
                  >
                    <span>{room.label}</span>
                    {isSelected && <Check style={{ width: '16px', height: '16px' }} />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
              Home Size
            </label>
            <select
              value={sqftRange}
              onChange={(e) => setSqftRange(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                padding: '0 16px',
                fontSize: '16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
              }}
            >
              {SQFT_RANGES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
          More details can be added later
        </p>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          style={{
            width: '100%',
            height: '48px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            fontSize: '16px',
            backgroundColor: canSubmit && !submitting ? '#1a1a1a' : '#e5e7eb',
            color: canSubmit && !submitting ? 'white' : '#9ca3af',
          }}
        >
          {submitting ? 'Creating...' : 'Create Estimate'}
        </button>
      </div>
    </div>
  );
}
