/**
 * Phase Builder Page
 *
 * Allows users to select templates, customize phase sequences,
 * and track progress through construction phases.
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Settings,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  List,
  LayoutGrid,
} from 'lucide-react';
import { Card, Button } from '../components/ui';
import { PhaseTimeline, TemplateSelector } from '../components/phases';
import {
  PHASE_TEMPLATES,
  getPhaseTemplate,
  suggestTemplate,
  PHASE_CATEGORIES,
} from '../data/phaseTemplates';
import {
  applyTempleScopeRules,
  validatePhaseReorder,
  calculatePhaseProgress,
  getReadyPhases,
} from '../lib/phaseValidation';
import { getProject, updateProject } from '../services/api';

export function PhaseBuilder() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [projectPhases, setProjectPhases] = useState([]); // Phases with status
  const [customizedPhases, setCustomizedPhases] = useState([]); // Modified phase order
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);

  // View settings
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'grid'

  // Load project data
  useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await getProject(projectId);

      if (error || !data) {
        console.error('Failed to load project:', error);
        setLoading(false);
        return;
      }

      setProject(data);

      // Load saved phases or suggest template
      if (data.phase_template_id && data.project_phases) {
        setSelectedTemplateId(data.phase_template_id);
        setProjectPhases(data.project_phases);
        setCustomizedPhases(data.project_phases);
      } else {
        // Suggest template based on project type
        const suggested = suggestTemplate(data);
        if (suggested) {
          setSelectedTemplateId(suggested.id);
          // Apply scope rules and set initial phases
          const filtered = applyTempleScopeRules(suggested, data);
          const initial = filtered.map(p => ({ ...p, status: 'pending' }));
          setProjectPhases(initial);
          setCustomizedPhases(initial);
        }
        setShowTemplateSelector(true);
      }

      setLoading(false);
    }

    loadProject();
  }, [projectId]);

  // Get current template
  const template = useMemo(() => {
    return selectedTemplateId ? getPhaseTemplate(selectedTemplateId) : null;
  }, [selectedTemplateId]);

  // Apply template when selected
  const handleSelectTemplate = (templateId) => {
    const newTemplate = getPhaseTemplate(templateId);
    if (!newTemplate) return;

    setSelectedTemplateId(templateId);

    // Apply scope rules
    const filtered = applyTempleScopeRules(newTemplate, project || {});
    const initial = filtered.map(p => ({ ...p, status: 'pending' }));
    setProjectPhases(initial);
    setCustomizedPhases(initial);
    setShowTemplateSelector(false);
  };

  // Handle phase status change
  const handlePhaseStatusChange = (phaseId, newStatus) => {
    setProjectPhases(prev =>
      prev.map(p => p.id === phaseId ? { ...p, status: newStatus } : p)
    );
    setCustomizedPhases(prev =>
      prev.map(p => p.id === phaseId ? { ...p, status: newStatus } : p)
    );
  };

  // Handle phase reorder
  const handlePhasesReorder = (newOrder) => {
    if (!template) return;

    // Validate new order
    const validation = validatePhaseReorder(newOrder, template);

    if (!validation.valid) {
      alert('Cannot reorder:\n' + validation.errors.map(e => e.message).join('\n'));
      return;
    }

    if (validation.warnings.length > 0) {
      const proceed = window.confirm(
        'Warning:\n' +
        validation.warnings.map(w => `- ${w.message}`).join('\n') +
        '\n\nProceed anyway?'
      );
      if (!proceed) return;
    }

    // Update order
    const reordered = newOrder.map((phase, index) => ({
      ...phase,
      order: index + 1,
    }));

    setCustomizedPhases(reordered);
  };

  // Reset to template defaults
  const handleResetToTemplate = () => {
    if (!template || !project) return;

    if (window.confirm('Reset all phases to template defaults? This will clear all customizations.')) {
      const filtered = applyTempleScopeRules(template, project);
      const initial = filtered.map(p => ({ ...p, status: 'pending' }));
      setProjectPhases(initial);
      setCustomizedPhases(initial);
    }
  };

  // Save phases to project
  const handleSave = async () => {
    if (!projectId) return;

    setSaving(true);
    try {
      await updateProject(projectId, {
        phase_template_id: selectedTemplateId,
        project_phases: customizedPhases,
      });
      console.log('Phases saved');
    } catch (error) {
      console.error('Failed to save phases:', error);
      alert('Failed to save phases');
    }
    setSaving(false);
  };

  // Calculate stats
  const progress = useMemo(() => {
    return calculatePhaseProgress(projectPhases);
  }, [projectPhases]);

  const readyPhases = useMemo(() => {
    if (!template) return [];
    return getReadyPhases(projectPhases, template);
  }, [projectPhases, template]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(projectId ? `/projects/${projectId}` : '/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-charcoal">
                  Phase Builder
                </h1>
                {project && (
                  <p className="text-sm text-gray-500">
                    {project.name} • {project.client_name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-2 ${viewMode === 'timeline' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  title="Timeline view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* Group Toggle */}
              <button
                onClick={() => setGroupByCategory(!groupByCategory)}
                className={`p-2 border rounded-lg transition-colors ${
                  groupByCategory ? 'bg-charcoal text-white border-charcoal' : 'border-gray-200 hover:bg-gray-50'
                }`}
                title={groupByCategory ? 'Show flat list' : 'Group by category'}
              >
                <Layers className="w-4 h-4" />
              </button>

              {/* Template Selector Toggle */}
              <button
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Change template"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Reset Button */}
              <button
                onClick={handleResetToTemplate}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Reset to template"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Template Selector (when visible) */}
            {showTemplateSelector && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium text-charcoal">Select Template</h2>
                  <button
                    onClick={() => setShowTemplateSelector(false)}
                    className="text-sm text-gray-500 hover:text-charcoal"
                  >
                    Hide
                  </button>
                </div>
                <TemplateSelector
                  project={project}
                  selectedTemplateId={selectedTemplateId}
                  onSelectTemplate={handleSelectTemplate}
                />
              </Card>
            )}

            {/* Phase Timeline */}
            {template && customizedPhases.length > 0 && (
              <PhaseTimeline
                phases={customizedPhases}
                template={template}
                projectPhases={projectPhases}
                onPhaseStatusChange={handlePhaseStatusChange}
                onPhaseSelect={(phase) => setSelectedPhaseId(phase.id)}
                onPhasesReorder={handlePhasesReorder}
                selectedPhaseId={selectedPhaseId}
                canEdit={true}
                groupByCategory={groupByCategory}
              />
            )}

            {/* No template selected */}
            {!template && !showTemplateSelector && (
              <Card className="p-8 text-center">
                <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-charcoal mb-2">
                  No Template Selected
                </h3>
                <p className="text-gray-500 mb-4">
                  Select a phase template to define your construction sequence.
                </p>
                <Button onClick={() => setShowTemplateSelector(true)}>
                  Choose Template
                </Button>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Current Template Info */}
            {template && (
              <Card className="p-4">
                <h3 className="font-medium text-charcoal mb-3">Current Template</h3>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-charcoal">{template.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span>{customizedPhases.length} phases</span>
                    <span>•</span>
                    <span>{template.projectTypes.join(', ')}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Ready to Start */}
            {readyPhases.length > 0 && (
              <Card className="p-4">
                <h3 className="font-medium text-charcoal mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Ready to Start
                </h3>
                <div className="space-y-2">
                  {readyPhases.slice(0, 5).map(phase => {
                    const categoryInfo = PHASE_CATEGORIES[phase.category];
                    return (
                      <button
                        key={phase.id}
                        onClick={() => {
                          setSelectedPhaseId(phase.id);
                          handlePhaseStatusChange(phase.id, 'in_progress');
                        }}
                        className="w-full flex items-center gap-2 p-2 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: categoryInfo?.color || '#6B7280' }}
                        />
                        <span className="text-sm text-gray-700 truncate">{phase.name}</span>
                      </button>
                    );
                  })}
                  {readyPhases.length > 5 && (
                    <p className="text-xs text-gray-400 text-center">
                      +{readyPhases.length - 5} more ready
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Category Legend */}
            <Card className="p-4">
              <h3 className="font-medium text-charcoal mb-3">Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PHASE_CATEGORIES).map(([key, cat]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-gray-600 truncate">{cat.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Help */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">Tips</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Click status icon to update phase status</li>
                <li>• Drag phases to reorder (respects dependencies)</li>
                <li>• Red lock = blocked by incomplete prerequisite</li>
                <li>• Yellow warning = soft dependency (can override)</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhaseBuilder;
