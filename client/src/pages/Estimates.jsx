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
      const estimateProjects = (data || []).filter(p =>
        (p.status === 'estimate' || p.phase === 'estimate' || p.phase === 'estimating') &&
        p.status !== 'cancelled' && p.phase !== 'cancelled'
      );
      setEstimates(estimateProjects);
      setLoading(false);
    }
    loadEstimates();
  }, []);

  const handleCreateEstimate = async (projectData) => {
    const { data, error } = await createProject({
      ...projectData,
      status: 'estimate',
    });

    if (!error && data) {
      setShowNewEstimate(false);
      navigate(`/projects/${data.id}/estimate`);
    }
  };

  const totalLow = estimates.reduce((sum, e) => sum + (e.estimate_low || 0), 0);
  const totalHigh = estimates.reduce((sum, e) => sum + (e.estimate_high || 0), 0);

  return (
    <PageContainer
      title="Estimates"
      subtitle={`${estimates.length} active`}
      action={
        <button
          onClick={() => setShowNewEstimate(true)}
          className="w-12 h-12 bg-charcoal text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      }
    >
      {/* Stats row */}
      {estimates.length > 0 && (
        <div className="bg-green-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-green-600 font-medium">Pipeline Value</p>
          <p className="text-xl font-bold text-green-700">
            ${totalLow.toLocaleString()} - ${totalHigh.toLocaleString()}
          </p>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : estimates.length === 0 ? (
        <div className="text-center py-12">
          <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No estimates yet</p>
          <button
            onClick={() => setShowNewEstimate(true)}
            className="text-charcoal font-medium underline"
          >
            Create your first estimate
          </button>
        </div>
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
        alert('Failed to delete');
      } else if (onDelete) {
        onDelete(project.id);
      }
    }
  };

  return (
    <Link to={`/projects/${project.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-4 active:bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-charcoal truncate">{project.name}</p>
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
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {project.estimate_high && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-medium text-green-600">
              ${project.estimate_low?.toLocaleString()} - ${project.estimate_high.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">{days}d ago</span>
          </div>
        )}
      </div>
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
