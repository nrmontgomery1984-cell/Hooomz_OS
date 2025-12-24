import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HardHat, MapPin, Clock, Users, ArrowRight, Trash2 } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, ProgressBar } from '../components/ui';
import { getProjects, deleteProject } from '../services/api';

/**
 * Production Page
 *
 * Shows projects in the ACTIVE phase - contract signed,
 * work is in progress. This is the main construction management view.
 */
export function Production() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      const { data } = await getProjects();
      // Filter to active/punch_list phase projects
      // Exclude cancelled projects
      const activeProjects = (data || []).filter(p =>
        (p.phase === 'active' || p.phase === 'punch_list') &&
        p.phase !== 'cancelled'
      );
      setProjects(activeProjects);
      setLoading(false);
    }
    loadProjects();
  }, []);

  return (
    <PageContainer
      title="In Progress"
      subtitle="Active construction projects"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-charcoal">{projects.length}</p>
          <p className="text-xs text-gray-500">Active Jobs</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">4</p>
          <p className="text-xs text-gray-500">Tasks Today</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">1</p>
          <p className="text-xs text-gray-500">Needs Attention</p>
        </Card>
      </div>

      {/* Workflow explanation */}
      <Card className="p-4 mb-6 bg-green-50 border-green-100">
        <div className="flex items-start gap-3">
          <HardHat className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-charcoal mb-1">Production Phase</p>
            <p className="text-sm text-gray-600">
              Contract signed, work is underway. Track tasks, time, photos, and
              progress. Any scope additions require a Change Order.
            </p>
          </div>
        </div>
      </Card>

      {/* Projects List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-8 text-center">
          <HardHat className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No active projects</p>
          <p className="text-sm text-gray-400">
            Projects move here after contract is signed
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProductionCard
              key={project.id}
              project={project}
              onDelete={(id) => setProjects(projects.filter(p => p.id !== id))}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function ProductionCard({ project, onDelete }) {
  const progress = project.progress || 0;

  // Determine health color based on progress vs timeline
  const getHealthColor = () => {
    if (progress >= 75) return 'green';
    if (progress >= 40) return 'blue';
    if (progress >= 20) return 'yellow';
    return 'gray';
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete "${project.name}"? This cannot be undone.`)) {
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
      <Card className="p-4 hover:border-gray-300 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium text-charcoal">{project.name}</h4>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              {project.address || 'Address pending'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <span className={`
              text-xs px-2 py-1 rounded-full
              ${project.intake_type === 'new_construction'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-amber-100 text-amber-700'
              }
            `}>
              {project.intake_type === 'new_construction' ? 'New Build' : 'Renovation'}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-charcoal">{progress}%</span>
          </div>
          <ProgressBar value={progress} color={getHealthColor()} />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-sm font-medium text-charcoal">
              {project.loops_count || '—'}
            </p>
            <p className="text-xs text-gray-500">Loops</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-sm font-medium text-charcoal">
              {project.tasks_pending || '—'}
            </p>
            <p className="text-xs text-gray-500">Tasks Left</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-sm font-medium text-charcoal">
              {project.build_tier || '—'}
            </p>
            <p className="text-xs text-gray-500">Tier</p>
          </div>
        </div>

        {/* Contract Value & Timeline */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm">
          <div className="flex items-center gap-4">
            {project.estimate_high && (
              <span className="text-gray-600">
                <span className="font-medium text-green-700">
                  ${project.estimate_high.toLocaleString()}
                </span>
              </span>
            )}
            {project.target_completion && (
              <span className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" />
                Target: {project.target_completion}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs text-blue-600">
            Manage <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
