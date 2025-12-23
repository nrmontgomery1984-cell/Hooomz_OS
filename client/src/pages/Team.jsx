import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  Filter,
  Users,
  Send,
  Check,
  Loader2,
} from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card } from '../components/ui';
import { ROLES } from '../lib/devData';
import { getEmployees, deleteEmployee } from '../services/api';
import { useAuth } from '../hooks/useAuth';

// Contact Card Component
function ContactCard({ employee, onDelete, onInvite }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [inviteStatus, setInviteStatus] = useState(null); // null | 'sending' | 'sent' | 'error'
  const roleConfig = ROLES[employee.role] || ROLES.labourer;
  const displayName = employee.preferredName || employee.firstName || 'Unknown';
  const initials = `${(employee.firstName || 'U')[0]}${(employee.lastName || '')[0] || ''}`;

  const handleCardClick = (e) => {
    // Don't navigate if clicking on phone, email, or menu
    if (e.target.closest('a') || e.target.closest('button')) return;
    navigate(`/team/${employee.id}`);
  };

  const handleInvite = async () => {
    setInviteStatus('sending');
    setShowMenu(false);
    const { error } = await onInvite(employee.email);
    if (error) {
      setInviteStatus('error');
      setTimeout(() => setInviteStatus(null), 3000);
    } else {
      setInviteStatus('sent');
      setTimeout(() => setInviteStatus(null), 5000);
    }
  };

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
          style={{ backgroundColor: roleConfig.color }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-charcoal truncate">
              {displayName} {employee.lastName}
            </h3>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium text-white flex-shrink-0"
              style={{ backgroundColor: roleConfig.color }}
            >
              {roleConfig.shortLabel || roleConfig.label}
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-500">
            {employee.phone && (
              <a
                href={`tel:${employee.phone}`}
                className="flex items-center gap-2 hover:text-charcoal transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{employee.phone}</span>
              </a>
            )}
            {employee.email && (
              <a
                href={`mailto:${employee.email}`}
                className="flex items-center gap-2 hover:text-charcoal transition-colors truncate"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{employee.email}</span>
              </a>
            )}
            {employee.address?.city && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>{employee.address.city}, {employee.address.province}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[140px]">
                <Link
                  to={`/team/${employee.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                  onClick={handleInvite}
                >
                  <Send className="w-4 h-4" />
                  Send Invite
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    onDelete(employee.id);
                    setShowMenu(false);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status indicator */}
      {(employee.status !== 'active' || inviteStatus) && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          {employee.status !== 'active' && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              employee.status === 'on_leave'
                ? 'bg-amber-100 text-amber-700'
                : employee.status === 'inactive'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-red-100 text-red-700'
            }`}>
              {employee.status === 'on_leave' ? 'On Leave' :
               employee.status === 'inactive' ? 'Inactive' : 'Terminated'}
            </span>
          )}
          {inviteStatus === 'sending' && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Sending invite...
            </span>
          )}
          {inviteStatus === 'sent' && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Invite sent!
            </span>
          )}
          {inviteStatus === 'error' && (
            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
              Failed to send invite
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

export function Team() {
  const { inviteEmployee } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load employees on mount
  useEffect(() => {
    async function loadData() {
      const { data, error } = await getEmployees();
      if (!error && data) {
        setEmployees(data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Handle delete
  const handleDelete = async (id) => {
    const { error } = await deleteEmployee(id);
    if (!error) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  // Handle invite
  const handleInvite = async (email) => {
    return await inviteEmployee(email);
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      `${emp.firstName} ${emp.lastName} ${emp.preferredName} ${emp.email}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Group by role for display
  const groupedByRole = filteredEmployees.reduce((acc, emp) => {
    const role = emp.role;
    if (!acc[role]) acc[role] = [];
    acc[role].push(emp);
    return acc;
  }, {});

  // Order roles by level
  const roleOrder = ['administrator', 'manager', 'foreman', 'carpenter', 'apprentice', 'labourer'];

  return (
    <PageContainer title="Team">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team members..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="all">All Roles</option>
            {Object.entries(ROLES)
              .filter(([key]) => !['homeowner', 'subcontractor', 'contractor'].includes(key))
              .map(([key, role]) => (
                <option key={key} value={key}>{role.label}</option>
              ))
            }
          </select>
        </div>

        {/* Add Employee */}
        <Link
          to="/team/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </Link>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {roleOrder.map(role => {
          const count = employees.filter(e => e.role === role).length;
          const config = ROLES[role];
          return (
            <button
              key={role}
              onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
              className={`p-3 rounded-lg border transition-colors ${
                roleFilter === role
                  ? 'border-2 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ borderColor: roleFilter === role ? config.color : undefined }}
            >
              <div className="text-2xl font-bold" style={{ color: config.color }}>
                {count}
              </div>
              <div className="text-xs text-gray-500">{config.label}s</div>
            </button>
          );
        })}
      </div>

      {/* Employee Grid */}
      {roleFilter === 'all' ? (
        // Grouped by role
        <div className="space-y-6">
          {roleOrder.map(role => {
            const roleEmployees = groupedByRole[role];
            if (!roleEmployees?.length) return null;
            const config = ROLES[role];

            return (
              <div key={role}>
                <h2
                  className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{ color: config.color }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  {config.label}s ({roleEmployees.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roleEmployees.map(emp => (
                    <ContactCard key={emp.id} employee={emp} onDelete={handleDelete} onInvite={handleInvite} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Flat list for filtered view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(emp => (
            <ContactCard key={emp.id} employee={emp} onDelete={handleDelete} onInvite={handleInvite} />
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Loading team members...</p>
        </Card>
      )}

      {/* Empty State */}
      {!loading && filteredEmployees.length === 0 && (
        <Card className="p-8 text-center">
          {employees.length === 0 ? (
            <>
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">No team members yet</p>
              <Link
                to="/team/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Your First Employee
              </Link>
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-2">No team members found</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear search
                </button>
              )}
            </>
          )}
        </Card>
      )}
    </PageContainer>
  );
}
