import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  MapPin,
  Shield,
  Award,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Plus,
  Trash2,
  Building,
  ExternalLink,
} from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card } from '../components/ui';
import { ROLES } from '../lib/devData';

// Employee storage
const STORAGE_KEY = 'hooomz_employees';

function loadEmployees() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEmployees(employees) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

function getEmployee(id) {
  const employees = loadEmployees();
  return employees.find(e => e.id === id) || null;
}

function saveEmployee(employee) {
  const employees = loadEmployees();
  const index = employees.findIndex(e => e.id === employee.id);
  if (index >= 0) {
    employees[index] = employee;
  } else {
    employees.push(employee);
  }
  saveEmployees(employees);
}

// Common certifications
const CERTIFICATION_TYPES = [
  { id: 'whmis', name: 'WHMIS', required: true },
  { id: 'fall_protection', name: 'Fall Protection', required: true },
  { id: 'first_aid', name: 'First Aid/CPR', required: false },
  { id: 'confined_space', name: 'Confined Space Entry', required: false },
  { id: 'scaffold', name: 'Scaffold User', required: false },
  { id: 'forklift', name: 'Forklift Operator', required: false },
  { id: 'aerial_lift', name: 'Aerial Lift Operator', required: false },
  { id: 'hoisting', name: 'Hoisting & Rigging', required: false },
  { id: 'propane', name: 'Propane Handling', required: false },
  { id: 'asbestos', name: 'Asbestos Awareness', required: false },
  { id: 'silica', name: 'Silica Awareness', required: false },
  { id: 'electrical_safety', name: 'Electrical Safety', required: false },
];

// Collapsible section component
function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-charcoal">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4 border-t border-gray-100 pt-4">{children}</div>}
    </Card>
  );
}

// Form field component
function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

// Input styles
const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';
const selectClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white';

export function EmployeeProfile() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const isNew = !employeeId || employeeId === 'new';

  // Load existing employee or create new
  const getInitialProfile = () => {
    if (!isNew) {
      const existing = getEmployee(employeeId);
      if (existing) return existing;
    }
    return {
      id: `emp-${Date.now()}`,
      // Personal Information
      firstName: '',
      lastName: '',
      preferredName: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        province: 'NB',
        postalCode: '',
      },

      // Emergency Contact
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        altPhone: '',
      },

      // Employment Information
      employeeId: '',
      role: 'labourer',
      hireDate: '',
      employmentType: 'full_time',
      status: 'active',
      hourlyRate: '',

      // Certifications
      certifications: [],

      // Notes
      notes: '',
    };
  };

  // Form state
  const [profile, setProfile] = useState(getInitialProfile);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Update field helper
  const updateField = (path, value) => {
    setProfile(prev => {
      const keys = path.split('.');
      if (keys.length === 1) {
        return { ...prev, [path]: value };
      }

      // Handle nested paths like 'address.city'
      const newProfile = { ...prev };
      let current = newProfile;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newProfile;
    });
  };

  // Add certification
  const addCertification = (certType) => {
    if (profile.certifications.find(c => c.type === certType.id)) return;

    setProfile(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          type: certType.id,
          name: certType.name,
          issueDate: '',
          expiryDate: '',
          certNumber: '',
        },
      ],
    }));
  };

  // Remove certification
  const removeCertification = (certType) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c.type !== certType),
    }));
  };

  // Update certification
  const updateCertification = (certType, field, value) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.map(c =>
        c.type === certType ? { ...c, [field]: value } : c
      ),
    }));
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!profile.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!profile.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!profile.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!profile.email.trim()) newErrors.email = 'Email is required';
    if (!profile.role) newErrors.role = 'Role is required';
    if (!profile.hireDate) newErrors.hireDate = 'Hire date is required';
    if (!profile.emergencyContact.name.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!profile.emergencyContact.phone.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);

    // Save to localStorage
    saveEmployee(profile);

    setSaving(false);
    navigate('/team');
  };

  // Get role color
  const getRoleColor = (role) => {
    return ROLES[role]?.color || '#64748b';
  };

  return (
    <PageContainer
      title={isNew ? 'Add Employee' : 'Edit Employee'}
      showBack
    >
      {/* Header Actions */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Employee'}
        </button>
      </div>

      {/* Personal Information */}
      <Section title="Personal Information" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="First Name" required>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              className={`${inputClass} ${errors.firstName ? 'border-red-500' : ''}`}
              placeholder="John"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </Field>

          <Field label="Last Name" required>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              className={`${inputClass} ${errors.lastName ? 'border-red-500' : ''}`}
              placeholder="Smith"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </Field>

          <Field label="Preferred Name">
            <input
              type="text"
              value={profile.preferredName}
              onChange={(e) => updateField('preferredName', e.target.value)}
              className={inputClass}
              placeholder="Johnny"
            />
          </Field>

          <Field label="Date of Birth">
            <input
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) => updateField('dateOfBirth', e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Phone" required>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className={`${inputClass} ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="(506) 555-1234"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </Field>

          <Field label="Email" required>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`${inputClass} ${errors.email ? 'border-red-500' : ''}`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </Field>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Address
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Street Address" className="lg:col-span-2">
              <input
                type="text"
                value={profile.address.street}
                onChange={(e) => updateField('address.street', e.target.value)}
                className={inputClass}
                placeholder="123 Main Street"
              />
            </Field>

            <Field label="City">
              <input
                type="text"
                value={profile.address.city}
                onChange={(e) => updateField('address.city', e.target.value)}
                className={inputClass}
                placeholder="Moncton"
              />
            </Field>

            <Field label="Province">
              <select
                value={profile.address.province}
                onChange={(e) => updateField('address.province', e.target.value)}
                className={selectClass}
              >
                <option value="NB">New Brunswick</option>
                <option value="NS">Nova Scotia</option>
                <option value="PE">Prince Edward Island</option>
                <option value="NL">Newfoundland</option>
                <option value="QC">Quebec</option>
                <option value="ON">Ontario</option>
                <option value="MB">Manitoba</option>
                <option value="SK">Saskatchewan</option>
                <option value="AB">Alberta</option>
                <option value="BC">British Columbia</option>
                <option value="YT">Yukon</option>
                <option value="NT">Northwest Territories</option>
                <option value="NU">Nunavut</option>
              </select>
            </Field>

            <Field label="Postal Code">
              <input
                type="text"
                value={profile.address.postalCode}
                onChange={(e) => updateField('address.postalCode', e.target.value.toUpperCase())}
                className={inputClass}
                placeholder="E1C 1A1"
                maxLength={7}
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* Emergency Contact */}
      <Section title="Emergency Contact" icon={AlertTriangle}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Contact Name" required>
            <input
              type="text"
              value={profile.emergencyContact.name}
              onChange={(e) => updateField('emergencyContact.name', e.target.value)}
              className={`${inputClass} ${errors.emergencyContactName ? 'border-red-500' : ''}`}
              placeholder="Jane Smith"
            />
            {errors.emergencyContactName && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName}</p>}
          </Field>

          <Field label="Relationship">
            <input
              type="text"
              value={profile.emergencyContact.relationship}
              onChange={(e) => updateField('emergencyContact.relationship', e.target.value)}
              className={inputClass}
              placeholder="Spouse"
            />
          </Field>

          <Field label="Phone" required>
            <input
              type="tel"
              value={profile.emergencyContact.phone}
              onChange={(e) => updateField('emergencyContact.phone', e.target.value)}
              className={`${inputClass} ${errors.emergencyContactPhone ? 'border-red-500' : ''}`}
              placeholder="(506) 555-5678"
            />
            {errors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone}</p>}
          </Field>

          <Field label="Alternate Phone">
            <input
              type="tel"
              value={profile.emergencyContact.altPhone}
              onChange={(e) => updateField('emergencyContact.altPhone', e.target.value)}
              className={inputClass}
              placeholder="(506) 555-9999"
            />
          </Field>
        </div>
      </Section>

      {/* Employment Information */}
      <Section title="Employment Information" icon={Building}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Employee ID">
            <input
              type="text"
              value={profile.employeeId}
              onChange={(e) => updateField('employeeId', e.target.value)}
              className={inputClass}
              placeholder="EMP-001"
            />
          </Field>

          <Field label="Role" required>
            <select
              value={profile.role}
              onChange={(e) => updateField('role', e.target.value)}
              className={selectClass}
              style={{ borderLeftColor: getRoleColor(profile.role), borderLeftWidth: '4px' }}
            >
              {Object.entries(ROLES)
                .filter(([key]) => !['homeowner', 'subcontractor'].includes(key))
                .map(([key, role]) => (
                  <option key={key} value={key}>{role.label}</option>
                ))
              }
            </select>
          </Field>

          <Field label="Employment Type">
            <select
              value={profile.employmentType}
              onChange={(e) => updateField('employmentType', e.target.value)}
              className={selectClass}
            >
              <option value="full_time">Full-Time</option>
              <option value="part_time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="seasonal">Seasonal</option>
            </select>
          </Field>

          <Field label="Hire Date" required>
            <input
              type="date"
              value={profile.hireDate}
              onChange={(e) => updateField('hireDate', e.target.value)}
              className={`${inputClass} ${errors.hireDate ? 'border-red-500' : ''}`}
            />
            {errors.hireDate && <p className="text-red-500 text-xs mt-1">{errors.hireDate}</p>}
          </Field>

          <Field label="Status">
            <select
              value={profile.status}
              onChange={(e) => updateField('status', e.target.value)}
              className={selectClass}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </Field>

          <Field label="Hourly Rate">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={profile.hourlyRate}
                onChange={(e) => updateField('hourlyRate', e.target.value)}
                className={`${inputClass} pl-7`}
                placeholder="0.00"
              />
            </div>
          </Field>
        </div>

      </Section>

      {/* Certifications */}
      <Section title="Safety Certifications" icon={Award}>
        <div className="space-y-4">
          {/* Required Certifications */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Required Certifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {CERTIFICATION_TYPES.filter(c => c.required).map(cert => {
                const hasCert = profile.certifications.find(c => c.type === cert.id);
                return (
                  <div
                    key={cert.id}
                    className={`p-3 rounded-lg border ${hasCert ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{cert.name}</span>
                      {hasCert ? (
                        <button
                          onClick={() => removeCertification(cert.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => addCertification(cert)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {hasCert && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <input
                          type="date"
                          value={hasCert.expiryDate}
                          onChange={(e) => updateCertification(cert.id, 'expiryDate', e.target.value)}
                          className="text-xs px-2 py-1 border rounded"
                          placeholder="Expiry Date"
                        />
                        <input
                          type="text"
                          value={hasCert.certNumber}
                          onChange={(e) => updateCertification(cert.id, 'certNumber', e.target.value)}
                          className="text-xs px-2 py-1 border rounded"
                          placeholder="Cert #"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Certifications */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Certifications</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {CERTIFICATION_TYPES.filter(c => !c.required).map(cert => {
                const hasCert = profile.certifications.find(c => c.type === cert.id);
                return (
                  <button
                    key={cert.id}
                    onClick={() => hasCert ? removeCertification(cert.id) : addCertification(cert)}
                    className={`p-2 rounded-lg border text-sm text-left transition-colors ${
                      hasCert
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cert.name}</span>
                      {hasCert && <Shield className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Added certifications with details */}
          {profile.certifications.filter(c => !CERTIFICATION_TYPES.find(ct => ct.id === c.type)?.required).length > 0 && (
            <div className="space-y-2">
              {profile.certifications
                .filter(c => !CERTIFICATION_TYPES.find(ct => ct.id === c.type)?.required)
                .map(cert => (
                  <div key={cert.type} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium flex-1">{cert.name}</span>
                    <input
                      type="date"
                      value={cert.expiryDate}
                      onChange={(e) => updateCertification(cert.type, 'expiryDate', e.target.value)}
                      className="text-xs px-2 py-1 border rounded w-32"
                      placeholder="Expiry"
                    />
                    <input
                      type="text"
                      value={cert.certNumber}
                      onChange={(e) => updateCertification(cert.type, 'certNumber', e.target.value)}
                      className="text-xs px-2 py-1 border rounded w-24"
                      placeholder="Cert #"
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </Section>

      {/* Training Link */}
      <Card className="mb-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ExternalLink className="w-5 h-5 text-gray-500" />
            <div>
              <span className="font-medium text-charcoal">Training & Skills</span>
              <p className="text-sm text-gray-500">Track certifications, equipment competencies, and training in the Field Guide</p>
            </div>
          </div>
          <Link
            to="/field-guide"
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
          >
            Open Field Guide
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </Card>

      {/* Notes */}
      <Section title="Notes" icon={FileText} defaultOpen={false}>
        <textarea
          value={profile.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          className={`${inputClass} h-32 resize-none`}
          placeholder="Any additional notes about this employee..."
        />
      </Section>

      {/* Bottom Actions */}
      <div className="flex justify-end gap-2 mt-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Employee'}
        </button>
      </div>
    </PageContainer>
  );
}
