import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, UserPlus, ArrowRight, Phone, Mail, Calendar } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, Button } from '../components/ui';
import { getProjects } from '../services/api';

/**
 * Sales / Leads Page
 *
 * Shows projects in the INTAKE phase - new inquiries that haven't
 * been estimated yet. This is where customer intake forms land.
 */
export function Sales() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      setLoading(true);
      const { data } = await getProjects();
      // Filter to only intake status projects
      const intakeProjects = (data || []).filter(p => p.status === 'intake' || p.phase === 'intake');
      setLeads(intakeProjects);
      setLoading(false);
    }
    loadLeads();
  }, []);

  return (
    <PageContainer
      title="Sales / Leads"
      subtitle="New inquiries and intake forms"
      action={
        <Link to="/intake">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New Intake
          </Button>
        </Link>
      }
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-charcoal">{leads.length}</p>
          <p className="text-xs text-gray-500">New Leads</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">0</p>
          <p className="text-xs text-gray-500">Awaiting Response</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-green-600">0</p>
          <p className="text-xs text-gray-500">This Week</p>
        </Card>
      </div>

      {/* Start New Intake CTA */}
      <Link to="/intake">
        <Card className="p-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-charcoal">Start Customer Intake</p>
                <p className="text-sm text-gray-600">New Construction or Renovation</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-500" />
          </div>
        </Card>
      </Link>

      {/* Leads List */}
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Inquiries</h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-20 animate-pulse" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <Card className="p-8 text-center">
          <UserPlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No leads yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Customer intake forms will appear here
          </p>
          <Link to="/intake">
            <Button size="sm">Start First Intake</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function LeadCard({ lead }) {
  const intakeData = lead.intake_data || {};
  const contact = intakeData.contact || {};

  return (
    <Link to={`/projects/${lead.id}`}>
      <Card className="p-4 hover:border-gray-300 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-medium text-charcoal">{lead.client_name || 'New Lead'}</h4>
            <p className="text-sm text-gray-500">{lead.address || 'Address pending'}</p>
          </div>
          <span className={`
            text-xs px-2 py-1 rounded-full
            ${lead.intake_type === 'new_construction'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-amber-100 text-amber-700'
            }
          `}>
            {lead.intake_type === 'new_construction' ? 'New Build' : 'Renovation'}
          </span>
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
          {contact.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {contact.phone}
            </span>
          )}
          {contact.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {contact.email}
            </span>
          )}
        </div>

        {/* Estimate Range if available */}
        {lead.estimate_low && lead.estimate_high && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">Ballpark Estimate</span>
            <span className="text-sm font-medium text-green-700">
              ${lead.estimate_low.toLocaleString()} - ${lead.estimate_high.toLocaleString()}
            </span>
          </div>
        )}

        {/* Created date */}
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          {new Date(lead.created_at).toLocaleDateString()}
        </div>
      </Card>
    </Link>
  );
}
