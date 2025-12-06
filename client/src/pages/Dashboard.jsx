import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Button } from '../components/ui';
import { ProjectCard } from '../components/projects';
import { getProjects } from '../services/api';

export function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      const { data, error } = await getProjects();
      if (error) {
        setError(error);
      } else {
        setProjects(data || []);
      }
      setLoading(false);
    }
    loadProjects();
  }, []);

  const activeProjects = projects.filter(
    (p) =>
      !['archived', 'paid', 'warranty', 'cancelled'].includes(p.status) &&
      p.phase !== 'cancelled'
  );

  return (
    <PageContainer
      title="Projects"
      action={
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          New
        </Button>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load projects</p>
        </div>
      ) : activeProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No active projects</p>
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
