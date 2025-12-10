import { useNavigate } from 'react-router-dom';
import { Card, StatusDot, ProgressBar, getHealthColor } from '../ui';
import { DollarSign, Calendar, Home, Hammer, Trash2 } from 'lucide-react';
import { deleteProject } from '../../services/api';

// Phase display configuration - matches sidebar terminology
const phaseConfig = {
  intake: { label: 'New Lead', color: 'bg-gray-100 text-gray-700' },
  estimate: { label: 'Estimating', color: 'bg-blue-100 text-blue-700' },
  estimating: { label: 'Estimating', color: 'bg-blue-100 text-blue-700' },
  quoted: { label: 'Quoted', color: 'bg-purple-100 text-purple-700' },
  quote: { label: 'Quoted', color: 'bg-purple-100 text-purple-700' },
  contract: { label: 'Contract', color: 'bg-amber-100 text-amber-700' },
  contracted: { label: 'Contracted', color: 'bg-amber-100 text-amber-700' },
  active: { label: 'In Progress', color: 'bg-emerald-100 text-emerald-700' },
  punch_list: { label: 'Punch List', color: 'bg-orange-100 text-orange-700' },
  complete: { label: 'Complete', color: 'bg-green-100 text-green-700' },
};

// Format currency for display
function formatBudget(amount) {
  if (!amount) return null;
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

export function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate();
  const healthScore = project.health_score ?? 100; // Default to 100 if missing
  const healthColor = getHealthColor(healthScore);

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent card click navigation
    if (window.confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      const { error } = await deleteProject(project.id);
      if (error) {
        alert('Failed to delete project');
      } else if (onDelete) {
        onDelete(project.id);
      }
    }
  };

  // Get phase display info
  const phase = phaseConfig[project.phase] || phaseConfig.intake;

  // Determine budget to show (contract value if signed, otherwise estimate range)
  const budgetDisplay = project.contract_value
    ? formatBudget(project.contract_value)
    : project.estimate_high
      ? `${formatBudget(project.estimate_low)} - ${formatBudget(project.estimate_high)}`
      : null;

  // Project type
  const isNewConstruction = project.intake_type === 'new_construction';

  return (
    <Card
      hover
      className="p-4"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      {/* Top row: Name + Health Score + Delete */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {/* Project type icon */}
            <div className={`p-1.5 rounded ${isNewConstruction ? 'bg-blue-50' : 'bg-amber-50'}`}>
              {isNewConstruction ? (
                <Home className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Hammer className="w-3.5 h-3.5 text-amber-600" />
              )}
            </div>
            <h3 className="font-semibold text-charcoal truncate">{project.name}</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1 truncate">
            {project.client_name}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-semibold text-charcoal">
              {healthScore}
            </span>
            <StatusDot status={healthColor} />
          </div>
        </div>
      </div>

      {/* Middle row: Phase badge + Budget */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${phase.color}`}>
          {phase.label}
        </span>
        {budgetDisplay && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="font-medium">{budgetDisplay}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={healthScore}
        color={healthColor}
        className="mt-1"
      />

      {/* Bottom row: Address or target date */}
      {(project.address || project.target_completion) && (
        <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500 truncate">
          {project.address || (project.target_completion && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Target: {new Date(project.target_completion).toLocaleDateString()}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
