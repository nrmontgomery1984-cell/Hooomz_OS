import { useState } from 'react';
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
} from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card } from '../components/ui';
import { ROLES } from '../lib/devData';

// Mock employees data - will be replaced with real data later
const MOCK_EMPLOYEES = [
  {
    id: 'emp-001',
    firstName: 'Nathan',
    lastName: 'Henderson',
    preferredName: '',
    email: 'nathan@hendersoncontracting.ca',
    phone: '(506) 555-1001',
    role: 'administrator',
    status: 'active',
    hireDate: '2020-01-15',
    address: { city: 'Moncton', province: 'NB' },
  },
  {
    id: 'emp-002',
    firstName: 'Lisa',
    lastName: 'Chen',
    preferredName: '',
    email: 'lisa@hendersoncontracting.ca',
    phone: '(506) 555-1002',
    role: 'manager',
    status: 'active',
    hireDate: '2021-03-10',
    address: { city: 'Moncton', province: 'NB' },
  },
  {
    id: 'emp-003',
    firstName: 'Mike',
    lastName: 'Sullivan',
    preferredName: '',
    email: 'mike@hendersoncontracting.ca',
    phone: '(506) 555-1003',
    role: 'foreman',
    status: 'active',
    hireDate: '2021-06-01',
    address: { city: 'Dieppe', province: 'NB' },
  },
  {
    id: 'emp-004',
    firstName: 'Joe',
    lastName: 'Martinez',
    preferredName: '',
    email: 'joe@hendersoncontracting.ca',
    phone: '(506) 555-1004',
    role: 'carpenter',
    status: 'active',
    hireDate: '2022-02-14',
    address: { city: 'Riverview', province: 'NB' },
  },
  {
    id: 'emp-005',
    firstName: 'Tyler',
    lastName: 'Brooks',
    preferredName: 'Ty',
    email: 'tyler@hendersoncontracting.ca',
    phone: '(506) 555-1005',
    role: 'apprentice',
    status: 'active',
    hireDate: '2023-09-01',
    address: { city: 'Moncton', province: 'NB' },
  },
  {
    id: 'emp-006',
    firstName: 'Sam',
    lastName: 'Wilson',
    preferredName: '',
    email: 'sam@hendersoncontracting.ca',
    phone: '(506) 555-1006',
    role: 'labourer',
    status: 'active',
    hireDate: '2024-01-08',
    address: { city: 'Moncton', province: 'NB' },
  },
];

// Contact Card Component
function ContactCard({ employee }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const roleConfig = ROLES[employee.role] || ROLES.labourer;
  const displayName = employee.preferredName || employee.firstName;
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`;

  const handleCardClick = (e) => {
    // Don't navigate if clicking on phone, email, or menu
    if (e.target.closest('a') || e.target.closest('button')) return;
    navigate(`/team/${employee.id}`);
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
            <a
              href={`tel:${employee.phone}`}
              className="flex items-center gap-2 hover:text-charcoal transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{employee.phone}</span>
            </a>
            <a
              href={`mailto:${employee.email}`}
              className="flex items-center gap-2 hover:text-charcoal transition-colors truncate"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{employee.email}</span>
            </a>
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
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    // TODO: Implement delete
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
      {employee.status !== 'active' && (
        <div className="mt-3 pt-3 border-t border-gray-100">
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
        </div>
      )}
    </Card>
  );
}

export function Team() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [employees] = useState(MOCK_EMPLOYEES);

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
                    <ContactCard key={emp.id} employee={emp} />
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
            <ContactCard key={emp.id} employee={emp} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-2">No team members found</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear search
            </button>
          )}
        </Card>
      )}
    </PageContainer>
  );
}
