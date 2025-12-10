import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Building2 } from 'lucide-react';
import { getProjects } from '../../services/api';

// Phase colors and labels
const phaseInfo = {
  intake: { label: 'Intake', color: 'bg-purple-100 text-purple-700' },
  estimate: { label: 'Estimate', color: 'bg-blue-100 text-blue-700' },
  estimating: { label: 'Estimating', color: 'bg-blue-100 text-blue-700' },
  contract: { label: 'Contract', color: 'bg-amber-100 text-amber-700' },
  contracted: { label: 'Contracted', color: 'bg-amber-100 text-amber-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  production: { label: 'Production', color: 'bg-green-100 text-green-700' },
  complete: { label: 'Complete', color: 'bg-gray-100 text-gray-600' },
  completed: { label: 'Complete', color: 'bg-gray-100 text-gray-600' },
};

export function ProjectSearch({ onClose, isMobile = false }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all projects
  useEffect(() => {
    async function loadProjects() {
      const { data } = await getProjects();
      setProjects(data || []);
      setLoading(false);
    }
    loadProjects();
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Filter projects by search term
  const filteredProjects = projects.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(searchLower) ||
      p.client_name?.toLowerCase().includes(searchLower) ||
      p.address?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (project) => {
    navigate(`/projects/${project.id}`);
    onClose?.();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden max-h-[70vh]">
      {/* Search Input */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects by name, client, or address..."
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="overflow-y-auto max-h-[50vh]">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'No projects match your search' : 'No projects yet'}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {filteredProjects.map(project => {
              const phase = project.phase || project.status || 'intake';
              const info = phaseInfo[phase] || { label: phase, color: 'bg-gray-100 text-gray-600' };

              return (
                <button
                  key={project.id}
                  onClick={() => handleSelect(project)}
                  className="w-full px-3 py-2.5 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {project.client_name}
                      {project.address && ` • ${project.address}`}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${info.color}`}>
                    {info.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-400 text-center">
          {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>
    </div>
  );
}

// Search trigger button component
export function SearchTrigger({ onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-charcoal hover:bg-gray-100 rounded-lg transition-colors ${className}`}
    >
      <Search className="w-4 h-4" />
      <span className="hidden sm:inline">Search projects...</span>
    </button>
  );
}
