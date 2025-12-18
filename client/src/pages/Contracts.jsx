import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileSignature, CheckCircle, Clock, AlertCircle, ArrowRight, Trash2 } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, Button } from '../components/ui';
import { getProjects, deleteProject } from '../services/api';

/**
 * Contracts Page
 *
 * Shows projects in the CONTRACT phase - estimate is approved,
 * scope is locked, awaiting signature to begin work.
 */
export function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContracts() {
      setLoading(true);
      const { data } = await getProjects();
      // Filter to contract phase projects (includes 'quoted' awaiting signature and 'contracted')
      // Exclude cancelled projects
      const contractProjects = (data || []).filter(p =>
        (p.phase === 'contract' || p.phase === 'contracted' || p.phase === 'quoted') &&
        p.status !== 'cancelled' && p.phase !== 'cancelled'
      );
      setContracts(contractProjects);
      setLoading(false);
    }
    loadContracts();
  }, []);

  // Calculate totals
  const totalValue = contracts.reduce((sum, c) => sum + (c.estimate_high || 0), 0);

  return (
    <PageContainer
      title="Contracts"
      subtitle="Scope approval and signatures"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-3">
          <p className="text-xs text-gray-500 mb-1">Awaiting Signature</p>
          <p className="text-2xl font-bold text-charcoal">{contracts.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-gray-500 mb-1">Contract Value</p>
          <p className="text-lg font-bold text-green-700">
            ${totalValue.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Workflow explanation */}
      <Card className="p-4 mb-6 bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <FileSignature className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-charcoal mb-1">Contract Phase</p>
            <p className="text-sm text-gray-600">
              Scope and pricing are finalized. Customer reviews the contract,
              signs, and pays deposit. Once signed, project moves to Production.
            </p>
          </div>
        </div>
      </Card>

      {/* Contract Status Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1 text-gray-500">
          <Clock className="w-3 h-3" /> Sent
        </span>
        <span className="flex items-center gap-1 text-amber-600">
          <AlertCircle className="w-3 h-3" /> Viewed
        </span>
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle className="w-3 h-3" /> Signed
        </span>
      </div>

      {/* Contracts List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <Card className="p-8 text-center">
          <FileSignature className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No contracts pending</p>
          <p className="text-sm text-gray-400">
            Projects move here after estimate approval
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {contracts.map((project) => (
            <ContractCard
              key={project.id}
              project={project}
              onDelete={(id) => setContracts(contracts.filter(c => c.id !== id))}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function ContractCard({ project, onDelete }) {
  // Mock contract status - in real app would come from project data
  const contractStatus = 'sent'; // sent | viewed | signed

  const statusConfig = {
    sent: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Sent' },
    viewed: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Viewed' },
    signed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Signed' },
  };

  const status = statusConfig[contractStatus];
  const StatusIcon = status.icon;

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
        <div className="flex items-start justify-between mb-3">
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
            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
        </div>

        {/* Contract Value */}
        <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
          <span className="text-sm text-gray-600">Contract Value</span>
          <span className="text-sm font-bold text-charcoal">
            ${(project.estimate_high || 0).toLocaleString()}
          </span>
        </div>

        {/* Scope Summary */}
        {project.estimate_breakdown && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Scope of Work</p>
            <div className="flex flex-wrap gap-1">
              {project.estimate_breakdown.map((item, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                  {item.room} ({item.tier})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Sent {new Date(project.updated_at).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1 text-xs text-blue-600">
            View Contract <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
