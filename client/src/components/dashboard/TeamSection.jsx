import { Users, Zap, Droplet, Wind, Square, Paintbrush, Box, Home, Wrench, Phone, Mail } from 'lucide-react';
import { Card } from '../ui';
import { QuickContactButton } from './QuickContactButton';

/**
 * TeamSection - Project team and subcontractors
 */
export function TeamSection({ team }) {
  const { projectLead, teamMembers, subcontractors } = team;

  const onSiteToday = subcontractors.filter(s => s.status === 'on_site');

  return (
    <Card className="p-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-charcoal flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          Team
        </h3>
        {onSiteToday.length > 0 && (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
            {onSiteToday.length} on site
          </span>
        )}
      </div>

      {/* Project Lead */}
      {projectLead && (
        <div className="mb-4">
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Project Lead</h4>
          <TeamMemberCard member={projectLead} isLead />
        </div>
      )}

      {/* Team Members */}
      {teamMembers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Team</h4>
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Subcontractors */}
      {subcontractors.length > 0 && (
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Subcontractors</h4>
          <div className="space-y-2">
            {subcontractors.map((sub) => (
              <SubcontractorCard key={sub.id} sub={sub} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!projectLead && teamMembers.length === 0 && subcontractors.length === 0 && (
        <div className="text-center py-6 text-gray-400">
          <Users className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">No team assigned yet</p>
        </div>
      )}
    </Card>
  );
}

/**
 * TeamMemberCard - Team member display
 */
function TeamMemberCard({ member, isLead }) {
  return (
    <div className={`
      flex items-center justify-between p-2 rounded-lg
      ${isLead ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}
    `}>
      <div className="flex items-center gap-2">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
          ${isLead ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-600'}
        `}>
          {getInitials(member.name)}
        </div>
        <div>
          <p className="text-sm font-medium text-charcoal">{member.name}</p>
          <p className="text-xs text-gray-500">{member.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {member.phone && (
          <QuickContactButton type="phone" value={member.phone} size="sm" />
        )}
        {member.email && (
          <QuickContactButton type="email" value={member.email} size="sm" />
        )}
      </div>
    </div>
  );
}

/**
 * SubcontractorCard - Subcontractor display with trade icon
 */
function SubcontractorCard({ sub }) {
  const tradeIcons = {
    electrical: Zap,
    plumbing: Droplet,
    hvac: Wind,
    drywall: Square,
    painting: Paintbrush,
    cabinets: Box,
    roofing: Home,
    general: Wrench,
  };

  const statusConfig = {
    on_site: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'On Site' },
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
    complete: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Complete' },
    not_scheduled: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Not Scheduled' },
  };

  const Icon = tradeIcons[sub.trade?.toLowerCase()] || Wrench;
  const status = statusConfig[sub.status] || statusConfig.not_scheduled;

  return (
    <div className={`
      p-2 rounded-lg border
      ${sub.status === 'on_site' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}
    `}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-charcoal">{sub.company}</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded text-xs ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{sub.trade}</span>
        <div className="flex items-center gap-2">
          {sub.contact && <span>{sub.contact}</span>}
          {sub.phone && (
            <a href={`tel:${sub.phone}`} className="text-blue-600 hover:text-blue-700">
              <Phone className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {sub.scheduledDates && sub.status === 'scheduled' && (
        <p className="text-xs text-blue-600 mt-1">
          {formatDateRange(sub.scheduledDates)}
        </p>
      )}
    </div>
  );
}

/**
 * Get initials from name
 */
function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format date range
 */
function formatDateRange(dates) {
  if (!dates.start) return '';
  const start = new Date(dates.start).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  if (!dates.end) return start;
  const end = new Date(dates.end).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  return `${start} - ${end}`;
}

/**
 * TeamSectionCompact - Smaller team view
 */
export function TeamSectionCompact({ team }) {
  const onSite = team.subcontractors.filter(s => s.status === 'on_site');

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">Team</span>
        {onSite.length > 0 && (
          <span className="text-xs text-emerald-600">{onSite.length} on site</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {team.projectLead && (
          <div className="w-7 h-7 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-medium">
            {getInitials(team.projectLead.name)}
          </div>
        )}
        {team.subcontractors.slice(0, 3).map((sub) => (
          <div
            key={sub.id}
            className={`
              w-7 h-7 rounded-full flex items-center justify-center text-xs
              ${sub.status === 'on_site' ? 'bg-emerald-200' : 'bg-gray-200'}
            `}
            title={`${sub.company} (${sub.trade})`}
          >
            {sub.company[0]}
          </div>
        ))}
        {team.subcontractors.length > 3 && (
          <span className="text-xs text-gray-500">+{team.subcontractors.length - 3}</span>
        )}
      </div>
    </div>
  );
}
