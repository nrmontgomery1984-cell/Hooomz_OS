import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card } from '../components/ui';
import { getProjects, deleteProject } from '../services/api';

/**
 * Completed Page
 *
 * Shows projects in the COMPLETE phase - all work done,
 * final walkthrough complete, project closed out.
 */
export function Completed() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      const { data } = await getProjects();
      const completedProjects = (data || []).filter(p => p.phase === 'complete');
      setProjects(completedProjects);
      setLoading(false);
    }
    loadProjects();
  }, []);

  const totalRevenue = projects.reduce((sum, p) => sum + (p.estimate_high || 0), 0);

  return (
    <PageContainer
      title="Completed"
      subtitle="Finished projects"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-3">
          <p className="text-xs text-gray-500 mb-1">Completed Projects</p>
          <p className="text-2xl font-bold text-green-600">{projects.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
          <p className="text-lg font-bold text-charcoal">
            ${totalRevenue.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-20 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No completed projects yet</p>
          <p className="text-sm text-gray-400">
            Projects move here after final walkthrough
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <CompletedCard
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

function CompletedCard({ project, onDelete }) {
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
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-medium text-charcoal">{project.name}</h4>
            <p className="text-sm text-gray-500">{project.client_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {project.completed_at
              ? new Date(project.completed_at).toLocaleDateString()
              : 'Recently'}
          </span>
          {project.estimate_high && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              ${project.estimate_high.toLocaleString()}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
