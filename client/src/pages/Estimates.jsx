import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calculator,
  DollarSign,
  Clock,
  ArrowRight,
  Plus,
  X,
  Home,
  Hammer,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, Button, ProgressBar } from '../components/ui';
import { getProjects, createProject } from '../services/api';
import {
  BUILD_TIER_OPTIONS,
  ROOM_TYPES,
  RENO_TIER_OPTIONS,
  SQFT_RANGES,
  STOREY_OPTIONS,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
} from '../data/intakeSchema';

/**
 * Estimates Page
 *
 * Shows projects in the ESTIMATE phase - intake is complete,
 * now pricing and detailed scope are being developed.
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
      // Filter to estimate status projects (check both status and phase for backwards compatibility)
      const estimateProjects = (data || []).filter(p =>
        p.status === 'estimate' || p.phase === 'estimate' || p.phase === 'estimating'
      );
      setEstimates(estimateProjects);
      setLoading(false);
    }
    loadEstimates();
  }, []);

  const handleCreateEstimate = async (projectData) => {
    // projectData now contains: name, client_name, client_email, address,
    // intake_type, build_tier, and intake_data from the mini-wizard
    const { data, error } = await createProject({
      ...projectData,
      status: 'estimate', // Start directly in estimate status
    });

    if (!error && data) {
      setShowNewEstimate(false);
      // Navigate to the estimate builder for the new project
      navigate(`/projects/${data.id}/estimate`);
    }
  };

  // Calculate totals
  const totalLow = estimates.reduce((sum, e) => sum + (e.estimate_low || 0), 0);
  const totalHigh = estimates.reduce((sum, e) => sum + (e.estimate_high || 0), 0);

  return (
    <PageContainer
      title="Estimates"
      subtitle="Pricing and scope development"
      action={
        <Button variant="primary" size="sm" onClick={() => setShowNewEstimate(true)}>
          <Plus className="w-4 h-4 mr-1" />
          New Estimate
        </Button>
      }
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-3">
          <p className="text-xs text-gray-500 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-charcoal">{estimates.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-gray-500 mb-1">Pipeline Value</p>
          <p className="text-lg font-bold text-green-700">
            ${totalLow.toLocaleString()} - ${totalHigh.toLocaleString()}
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
              Intake is complete. Review customer requirements, do site visit if needed,
              finalize material selections, and build detailed pricing.
            </p>
          </div>
        </div>
      </Card>

      {/* Estimates List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      ) : estimates.length === 0 ? (
        <Card className="p-8 text-center">
          <Calculator className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No estimates in progress</p>
          <p className="text-sm text-gray-400">
            Projects move here after intake is complete
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {estimates.map((project) => (
            <EstimateCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* New Estimate Modal */}
      <NewEstimateModal
        isOpen={showNewEstimate}
        onClose={() => setShowNewEstimate(false)}
        onSubmit={handleCreateEstimate}
      />
    </PageContainer>
  );
}

function EstimateCard({ project }) {
  const daysInEstimate = Math.floor(
    (Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="p-4 hover:border-gray-300 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium text-charcoal">{project.name}</h4>
            <p className="text-sm text-gray-500">{project.client_name}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
            Estimating
          </span>
        </div>

        {/* Estimate Range */}
        {project.estimate_low && project.estimate_high && (
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              ${project.estimate_low.toLocaleString()} - ${project.estimate_high.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">
              ({project.build_tier} tier)
            </span>
          </div>
        )}

        {/* Scope Summary */}
        {project.estimate_breakdown && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.estimate_breakdown.slice(0, 4).map((item, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {item.room}
              </span>
            ))}
            {project.estimate_breakdown.length > 4 && (
              <span className="text-xs text-gray-400">
                +{project.estimate_breakdown.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {daysInEstimate} days in estimate
          </span>
          <span className="flex items-center gap-1 text-xs text-blue-600">
            Review <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Card>
    </Link>
  );
}

/**
 * Mini-Wizard Modal for creating a new estimate
 *
 * Captures essential decision-making data:
 * 1. Project Type (New Construction vs Renovation)
 * 2. Build Tier (Good/Better/Best)
 * 3. Scope (rooms for reno, sqft/layout for new)
 * 4. Client Info (name, email, address)
 *
 * This data feeds into the same estimate generation logic as intake.
 */
function NewEstimateModal({ isOpen, onClose, onSubmit }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Project Type
  const [projectType, setProjectType] = useState(null); // 'new_construction' | 'renovation'

  // Step 2: Build Tier
  const [buildTier, setBuildTier] = useState('better');

  // Step 3: Scope - Renovation
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomTiers, setRoomTiers] = useState({}); // { kitchen: 'full', primary_bath: 'refresh' }

  // Step 3: Scope - New Construction
  const [sqftRange, setSqftRange] = useState('1600_2000');
  const [storeys, setStoreys] = useState('1');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');

  // Step 4: Client Info
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [address, setAddress] = useState('');

  const STEPS = projectType === 'renovation'
    ? ['type', 'tier', 'rooms', 'room_tiers', 'client']
    : ['type', 'tier', 'layout', 'client'];

  const progress = STEPS.length > 0 ? ((step + 1) / STEPS.length) * 100 : 0;
  const currentStepId = STEPS[step];

  const resetForm = () => {
    setStep(0);
    setProjectType(null);
    setBuildTier('better');
    setSelectedRooms([]);
    setRoomTiers({});
    setSqftRange('1600_2000');
    setStoreys('1');
    setBedrooms('3');
    setBathrooms('2');
    setClientName('');
    setClientEmail('');
    setAddress('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canProceed = () => {
    switch (currentStepId) {
      case 'type':
        return projectType !== null;
      case 'tier':
        return buildTier !== null;
      case 'rooms':
        return selectedRooms.length > 0;
      case 'room_tiers':
        return selectedRooms.every((room) => roomTiers[room]);
      case 'layout':
        return sqftRange && storeys && bedrooms && bathrooms;
      case 'client':
        return clientName.trim().length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const toggleRoom = (roomValue) => {
    setSelectedRooms((prev) => {
      if (prev.includes(roomValue)) {
        // Remove room and its tier
        const newTiers = { ...roomTiers };
        delete newTiers[roomValue];
        setRoomTiers(newTiers);
        return prev.filter((r) => r !== roomValue);
      }
      return [...prev, roomValue];
    });
  };

  const setRoomTier = (room, tier) => {
    setRoomTiers((prev) => ({ ...prev, [room]: tier }));
  };

  const generateProjectName = () => {
    if (projectType === 'renovation' && selectedRooms.length > 0) {
      const roomLabels = selectedRooms
        .slice(0, 2)
        .map((r) => ROOM_TYPES.find((rt) => rt.value === r)?.label || r);
      const suffix = selectedRooms.length > 2 ? ` +${selectedRooms.length - 2}` : '';
      return `${roomLabels.join(' & ')}${suffix} Renovation`;
    }
    if (projectType === 'new_construction') {
      const sqftLabel = SQFT_RANGES.find((s) => s.value === sqftRange)?.label || '';
      return `New Home - ${sqftLabel}`;
    }
    return 'New Project';
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    // Build intake_data structure that matches what generateEstimateFromIntake expects
    const intakeData = {
      form_type: projectType,
      project: {
        build_tier: buildTier,
        address: address.trim() || null,
      },
    };

    if (projectType === 'renovation') {
      intakeData.renovation = {
        selected_rooms: selectedRooms,
        room_tiers: roomTiers,
      };
    } else {
      intakeData.layout = {
        sqft_range: sqftRange,
        storeys,
        bedrooms,
        full_bathrooms: bathrooms,
      };
    }

    await onSubmit({
      name: generateProjectName(),
      client_name: clientName.trim(),
      client_email: clientEmail.trim() || null,
      address: address.trim() || null,
      intake_type: projectType,
      build_tier: buildTier,
      intake_data: intakeData,
    });

    setSubmitting(false);
    resetForm();
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStepId) {
      case 'type':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">What type of project is this?</p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setProjectType('new_construction')}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  projectType === 'new_construction'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    projectType === 'new_construction' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Home className={`w-5 h-5 ${
                      projectType === 'new_construction' ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">New Construction</p>
                    <p className="text-xs text-gray-500">Building a new home from the ground up</p>
                  </div>
                  {projectType === 'new_construction' && (
                    <Check className="w-5 h-5 text-blue-600 ml-auto" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProjectType('renovation')}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  projectType === 'renovation'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    projectType === 'renovation' ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    <Hammer className={`w-5 h-5 ${
                      projectType === 'renovation' ? 'text-amber-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">Renovation</p>
                    <p className="text-xs text-gray-500">Updating or renovating an existing home</p>
                  </div>
                  {projectType === 'renovation' && (
                    <Check className="w-5 h-5 text-amber-600 ml-auto" />
                  )}
                </div>
              </button>
            </div>
          </div>
        );

      case 'tier':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Select the build quality tier for pricing:</p>
            <div className="space-y-2">
              {BUILD_TIER_OPTIONS.map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => setBuildTier(tier.value)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    buildTier === tier.value
                      ? 'border-charcoal bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-charcoal">{tier.label}</p>
                      <p className="text-xs text-gray-500">{tier.description}</p>
                    </div>
                    {buildTier === tier.value && (
                      <Check className="w-5 h-5 text-charcoal" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'rooms':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Select the areas to be renovated:</p>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {ROOM_TYPES.map((room) => (
                <button
                  key={room.value}
                  type="button"
                  onClick={() => toggleRoom(room.value)}
                  className={`p-2 rounded-lg border text-left text-sm transition-all ${
                    selectedRooms.includes(room.value)
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedRooms.includes(room.value) && (
                      <Check className="w-3 h-3 text-amber-600 flex-shrink-0" />
                    )}
                    <span className="truncate">{room.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              {selectedRooms.length} area{selectedRooms.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        );

      case 'room_tiers':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Set renovation level for each area:</p>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedRooms.map((roomValue) => {
                const room = ROOM_TYPES.find((r) => r.value === roomValue);
                return (
                  <div key={roomValue} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-charcoal mb-2">{room?.label}</p>
                    <div className="flex gap-2">
                      {RENO_TIER_OPTIONS.map((tier) => (
                        <button
                          key={tier.value}
                          type="button"
                          onClick={() => setRoomTier(roomValue, tier.value)}
                          className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                            roomTiers[roomValue] === tier.value
                              ? 'bg-amber-500 text-white'
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {tier.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'layout':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Define the home layout:</p>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Square Footage</label>
              <select
                value={sqftRange}
                onChange={(e) => setSqftRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {SQFT_RANGES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Storeys</label>
                <select
                  value={storeys}
                  onChange={(e) => setStoreys(e.target.value)}
                  className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {STOREY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Bedrooms</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {BEDROOM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Bathrooms</label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {BATHROOM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 'client':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Client information:</p>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., John Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-charcoal focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Client Email
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-charcoal focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Project Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-charcoal focus:border-transparent"
              />
            </div>

            {/* Preview */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Project will be created as:</p>
              <p className="text-sm font-medium text-charcoal">{generateProjectName()}</p>
              <p className="text-xs text-gray-500">
                {buildTier.charAt(0).toUpperCase() + buildTier.slice(1)} tier •{' '}
                {projectType === 'renovation' ? `${selectedRooms.length} areas` : sqftRange.replace('_', '-') + ' sqft'}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStepId) {
      case 'type': return 'Project Type';
      case 'tier': return 'Build Tier';
      case 'rooms': return 'Scope of Work';
      case 'room_tiers': return 'Renovation Level';
      case 'layout': return 'Home Layout';
      case 'client': return 'Client Info';
      default: return 'New Estimate';
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-charcoal">{getStepTitle()}</h2>
            <p className="text-xs text-gray-500">Step {step + 1} of {STEPS.length}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pt-2">
          <ProgressBar value={progress} color="blue" height="slim" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-3">
            {step > 0 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
            )}

            {isLastStep ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="flex-1"
              >
                {submitting ? 'Creating...' : 'Create Estimate'}
                {!submitting && <Check className="w-4 h-4 ml-1" />}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
