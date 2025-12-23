import { useState, useEffect } from 'react';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Palette,
  Bell,
  FileText,
  DollarSign,
  Check,
  Upload,
  Database,
  Trash2,
  AlertTriangle,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { Card, Button, Input, TextArea } from '../components/ui';
import { clearAllMockData, restoreMockData } from '../services/mockData';
import { useRoleVisibility, NAV_SECTIONS } from '../hooks/useRoleVisibility';
import { ROLES } from '../lib/devData';

// Storage key for settings
const STORAGE_KEY = 'hooomz_company_settings';

// Default settings
const DEFAULT_SETTINGS = {
  company: {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    website: '',
    logo: null,
  },
  owner: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  preferences: {
    defaultTier: 'better',
    currency: 'CAD',
    taxRate: 13,
    showTaxOnEstimates: true,
    autoSaveEnabled: true,
  },
  branding: {
    primaryColor: '#1a1a1a',
    accentColor: '#f59e0b',
  },
  notifications: {
    emailAlerts: true,
    projectUpdates: true,
    weeklyDigest: false,
  },
  documents: {
    estimatePrefix: 'EST-',
    contractPrefix: 'CON-',
    invoicePrefix: 'INV-',
    nextEstimateNumber: 1001,
    nextContractNumber: 1001,
    nextInvoiceNumber: 1001,
    defaultTerms: 'Payment due within 30 days of invoice date.',
    defaultWarranty: '1 year warranty on workmanship. Manufacturer warranties apply to materials.',
  },
};

// Load settings from localStorage
function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to ensure all fields exist
      return {
        company: { ...DEFAULT_SETTINGS.company, ...parsed.company },
        owner: { ...DEFAULT_SETTINGS.owner, ...parsed.owner },
        preferences: { ...DEFAULT_SETTINGS.preferences, ...parsed.preferences },
        branding: { ...DEFAULT_SETTINGS.branding, ...parsed.branding },
        notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
        documents: { ...DEFAULT_SETTINGS.documents, ...parsed.documents },
      };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

// Save settings to localStorage
function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// Roles that can be configured (internal team only)
const CONFIGURABLE_ROLES = ['administrator', 'manager', 'foreman', 'carpenter', 'apprentice', 'labourer'];

export function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeSection, setActiveSection] = useState('company');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [selectedRole, setSelectedRole] = useState('carpenter');

  // Role visibility management
  const { allVisibility, updateRoleVisibility, resetToDefaults } = useRoleVisibility();

  // Load settings on mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // Update nested setting
  const updateSetting = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Handle save
  const handleSave = () => {
    setIsSaving(true);
    saveSettings(settings);
    setTimeout(() => {
      setIsSaving(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2000);
    }, 500);
  };

  const sections = [
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'owner', label: 'Owner Info', icon: User },
    { id: 'preferences', label: 'Preferences', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your company profile and application preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {savedMessage ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-2">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                      ${activeSection === section.id
                        ? 'bg-charcoal text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Company Profile */}
          {activeSection === 'company' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Profile
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                This information appears on your estimates, contracts, and invoices.
              </p>

              <div className="space-y-4">
                {/* Logo Upload Placeholder */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    {settings.company.logo ? (
                      <img
                        src={settings.company.logo}
                        alt="Company logo"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">Company Logo</p>
                    <p className="text-xs text-gray-500">PNG or JPG, max 2MB</p>
                    <button className="mt-1 text-xs text-charcoal hover:underline">
                      Upload logo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <Input
                    value={settings.company.name}
                    onChange={(e) => updateSetting('company', 'name', e.target.value)}
                    placeholder="Your Construction Co."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-3 h-3 inline mr-1" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={settings.company.email}
                      onChange={(e) => updateSetting('company', 'email', e.target.value)}
                      placeholder="info@yourcompany.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-3 h-3 inline mr-1" />
                      Phone
                    </label>
                    <Input
                      value={settings.company.phone}
                      onChange={(e) => updateSetting('company', 'phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    Street Address
                  </label>
                  <Input
                    value={settings.company.address}
                    onChange={(e) => updateSetting('company', 'address', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <Input
                      value={settings.company.city}
                      onChange={(e) => updateSetting('company', 'city', e.target.value)}
                      placeholder="Toronto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province
                    </label>
                    <Input
                      value={settings.company.province}
                      onChange={(e) => updateSetting('company', 'province', e.target.value)}
                      placeholder="ON"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <Input
                      value={settings.company.postalCode}
                      onChange={(e) => updateSetting('company', 'postalCode', e.target.value)}
                      placeholder="M5V 1A1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <Input
                    value={settings.company.website}
                    onChange={(e) => updateSetting('company', 'website', e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Owner Info */}
          {activeSection === 'owner' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Owner Information
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Your personal contact information.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <Input
                      value={settings.owner.firstName}
                      onChange={(e) => updateSetting('owner', 'firstName', e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <Input
                      value={settings.owner.lastName}
                      onChange={(e) => updateSetting('owner', 'lastName', e.target.value)}
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-3 h-3 inline mr-1" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={settings.owner.email}
                      onChange={(e) => updateSetting('owner', 'email', e.target.value)}
                      placeholder="john@yourcompany.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-3 h-3 inline mr-1" />
                      Phone
                    </label>
                    <Input
                      value={settings.owner.phone}
                      onChange={(e) => updateSetting('owner', 'phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Preferences */}
          {activeSection === 'preferences' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Preferences
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Default settings for estimates and pricing.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Build Tier
                  </label>
                  <select
                    value={settings.preferences.defaultTier}
                    onChange={(e) => updateSetting('preferences', 'defaultTier', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-charcoal"
                  >
                    <option value="good">Good</option>
                    <option value="better">Better</option>
                    <option value="best">Best</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    The tier shown by default when creating new estimates
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={settings.preferences.currency}
                      onChange={(e) => updateSetting('preferences', 'currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-charcoal"
                    >
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="USD">USD - US Dollar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Rate (%)
                    </label>
                    <Input
                      type="number"
                      value={settings.preferences.taxRate}
                      onChange={(e) => updateSetting('preferences', 'taxRate', parseFloat(e.target.value) || 0)}
                      placeholder="13"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.preferences.showTaxOnEstimates}
                      onChange={(e) => updateSetting('preferences', 'showTaxOnEstimates', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Show tax on estimates</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.preferences.autoSaveEnabled}
                      onChange={(e) => updateSetting('preferences', 'autoSaveEnabled', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Auto-save drafts every 30 seconds</span>
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* Documents */}
          {activeSection === 'documents' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Settings
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Configure document numbering and default text.
              </p>

              <div className="space-y-6">
                {/* Numbering */}
                <div>
                  <h3 className="text-sm font-medium text-charcoal mb-3">Document Numbering</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Estimate Prefix</label>
                      <Input
                        value={settings.documents.estimatePrefix}
                        onChange={(e) => updateSetting('documents', 'estimatePrefix', e.target.value)}
                        placeholder="EST-"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Contract Prefix</label>
                      <Input
                        value={settings.documents.contractPrefix}
                        onChange={(e) => updateSetting('documents', 'contractPrefix', e.target.value)}
                        placeholder="CON-"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Invoice Prefix</label>
                      <Input
                        value={settings.documents.invoicePrefix}
                        onChange={(e) => updateSetting('documents', 'invoicePrefix', e.target.value)}
                        placeholder="INV-"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Next Estimate #</label>
                      <Input
                        type="number"
                        value={settings.documents.nextEstimateNumber}
                        onChange={(e) => updateSetting('documents', 'nextEstimateNumber', parseInt(e.target.value) || 1001)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Next Contract #</label>
                      <Input
                        type="number"
                        value={settings.documents.nextContractNumber}
                        onChange={(e) => updateSetting('documents', 'nextContractNumber', parseInt(e.target.value) || 1001)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Next Invoice #</label>
                      <Input
                        type="number"
                        value={settings.documents.nextInvoiceNumber}
                        onChange={(e) => updateSetting('documents', 'nextInvoiceNumber', parseInt(e.target.value) || 1001)}
                      />
                    </div>
                  </div>
                </div>

                {/* Default Terms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Payment Terms
                  </label>
                  <TextArea
                    value={settings.documents.defaultTerms}
                    onChange={(e) => updateSetting('documents', 'defaultTerms', e.target.value)}
                    placeholder="Payment terms..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Warranty Terms
                  </label>
                  <TextArea
                    value={settings.documents.defaultWarranty}
                    onChange={(e) => updateSetting('documents', 'defaultWarranty', e.target.value)}
                    placeholder="Warranty terms..."
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Manage your notification preferences.
              </p>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-charcoal">Email Alerts</p>
                    <p className="text-xs text-gray-500">Receive important alerts via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailAlerts}
                    onChange={(e) => updateSetting('notifications', 'emailAlerts', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-charcoal">Project Updates</p>
                    <p className="text-xs text-gray-500">Get notified when projects are updated</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.projectUpdates}
                    onChange={(e) => updateSetting('notifications', 'projectUpdates', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-charcoal">Weekly Digest</p>
                    <p className="text-xs text-gray-500">Summary of activity sent every Monday</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.weeklyDigest}
                    onChange={(e) => updateSetting('notifications', 'weeklyDigest', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                </label>
              </div>
            </Card>
          )}

          {/* Branding */}
          {activeSection === 'branding' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Branding
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Customize colors for your documents and client portal.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.branding.primaryColor}
                      onChange={(e) => updateSetting('branding', 'primaryColor', e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border border-gray-200"
                    />
                    <Input
                      value={settings.branding.primaryColor}
                      onChange={(e) => updateSetting('branding', 'primaryColor', e.target.value)}
                      placeholder="#1a1a1a"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Used for headers and primary buttons</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.branding.accentColor}
                      onChange={(e) => updateSetting('branding', 'accentColor', e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border border-gray-200"
                    />
                    <Input
                      value={settings.branding.accentColor}
                      onChange={(e) => updateSetting('branding', 'accentColor', e.target.value)}
                      placeholder="#f59e0b"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Used for highlights and accents</p>
                </div>

                {/* Preview */}
                <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 mb-3">Preview</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="px-4 py-2 rounded text-white text-sm font-medium"
                      style={{ backgroundColor: settings.branding.primaryColor }}
                    >
                      Primary Button
                    </div>
                    <div
                      className="px-4 py-2 rounded text-white text-sm font-medium"
                      style={{ backgroundColor: settings.branding.accentColor }}
                    >
                      Accent Button
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Permissions */}
          {activeSection === 'permissions' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Role Permissions
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Configure which navigation sections each role can see. Changes take effect immediately.
              </p>

              {/* Role Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role to Configure
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONFIGURABLE_ROLES.map((role) => {
                    const roleConfig = ROLES[role];
                    const isSelected = selectedRole === role;
                    return (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-all
                          ${isSelected
                            ? 'text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                        style={isSelected ? { backgroundColor: roleConfig.color } : {}}
                      >
                        {roleConfig.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Role Info */}
              {selectedRole && (
                <div
                  className="mb-6 p-4 rounded-lg border-2"
                  style={{ borderColor: ROLES[selectedRole].color, backgroundColor: `${ROLES[selectedRole].color}10` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ROLES[selectedRole].color }}
                    />
                    <span className="font-semibold text-charcoal">{ROLES[selectedRole].label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{ROLES[selectedRole].description}</p>
                </div>
              )}

              {/* Visibility Toggles */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-charcoal mb-3">Navigation Visibility</h3>
                {Object.entries(NAV_SECTIONS).map(([sectionId, section]) => {
                  const isVisible = allVisibility[selectedRole]?.[sectionId] ?? false;
                  const isAdminSettings = selectedRole === 'administrator' && sectionId === 'settings';

                  return (
                    <div
                      key={sectionId}
                      className={`
                        flex items-center justify-between p-3 rounded-lg border
                        ${isVisible ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}
                        ${isAdminSettings ? 'opacity-50' : ''}
                      `}
                    >
                      <div>
                        <div className="font-medium text-charcoal">{section.label}</div>
                        <div className="text-xs text-gray-500">{section.description}</div>
                      </div>
                      <button
                        onClick={() => {
                          if (!isAdminSettings) {
                            updateRoleVisibility(selectedRole, sectionId, !isVisible);
                          }
                        }}
                        disabled={isAdminSettings}
                        className={`
                          relative w-12 h-6 rounded-full transition-colors
                          ${isVisible ? 'bg-emerald-500' : 'bg-gray-300'}
                          ${isAdminSettings ? 'cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <span
                          className={`
                            absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform
                            ${isVisible ? 'translate-x-7' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Reset to Defaults */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (window.confirm('Reset all role permissions to defaults?')) {
                      resetToDefaults();
                    }
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  This will reset visibility settings for all roles to their default values.
                </p>
              </div>
            </Card>
          )}

          {/* Data Management */}
          {activeSection === 'data' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Manage your application data and storage.
              </p>

              <div className="space-y-6">
                {/* Clear All Data */}
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-800">Clear All Project Data</h3>
                      <p className="text-sm text-red-600 mt-1">
                        This will permanently delete all projects, tasks, time entries, selections, and other data.
                        This action cannot be undone.
                      </p>
                      <Button
                        variant="danger"
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
                            if (window.confirm('This is your last chance. Delete everything?')) {
                              clearAllMockData();
                              window.location.reload();
                            }
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Data
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Restore Demo Data */}
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-800">Restore Demo Data</h3>
                      <p className="text-sm text-blue-600 mt-1">
                        Restore the sample projects and demo data that comes with the app.
                        Useful for testing or seeing how the app works.
                      </p>
                      <Button
                        variant="secondary"
                        className="mt-4"
                        onClick={() => {
                          if (window.confirm('Restore demo projects and sample data?')) {
                            restoreMockData();
                            window.location.reload();
                          }
                        }}
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Restore Demo Data
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Storage Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-charcoal mb-2">Storage Information</h3>
                  <p className="text-xs text-gray-500">
                    Data is stored locally in your browser. Clearing browser data or using a different device
                    will not have access to this data.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
