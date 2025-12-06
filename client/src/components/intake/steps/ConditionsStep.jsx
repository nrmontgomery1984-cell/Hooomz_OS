import { Card, Select, TextArea } from '../../ui';
import { AlertTriangle, Droplet, Bug, Zap, Building2, Wind } from 'lucide-react';

/**
 * ConditionsStep - Existing conditions for renovation
 */

const HOME_AGE_OPTIONS = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'pre_1950', label: 'Pre-1950' },
  { value: '1950_1970', label: '1950-1970' },
  { value: '1970_1990', label: '1970-1990' },
  { value: '1990_2010', label: '1990-2010' },
  { value: 'post_2010', label: '2010 or newer' },
];

const HOME_STYLE_OPTIONS = [
  { value: 'unknown', label: 'Unknown / Other' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'split_level', label: 'Split Level' },
  { value: 'two_storey', label: 'Two Storey' },
  { value: 'cape_cod', label: 'Cape Cod / 1.5 Storey' },
  { value: 'mobile', label: 'Mobile / Mini Home' },
];

const KNOWN_ISSUES = [
  { value: 'water_damage', label: 'Water damage / Leaks', icon: Droplet, color: 'text-blue-500' },
  { value: 'mold', label: 'Visible mold', icon: Bug, color: 'text-green-600' },
  { value: 'electrical', label: 'Electrical concerns', icon: Zap, color: 'text-amber-500' },
  { value: 'foundation', label: 'Foundation issues', icon: Building2, color: 'text-gray-600' },
  { value: 'hvac', label: 'HVAC problems', icon: Wind, color: 'text-cyan-500' },
  { value: 'asbestos', label: 'Possible asbestos', icon: AlertTriangle, color: 'text-red-500' },
];

export function ConditionsStep({ data, onChange }) {
  const renoData = data || {};
  const knownIssues = renoData.known_issues || [];

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const handleIssueToggle = (value) => {
    const updated = knownIssues.includes(value)
      ? knownIssues.filter(v => v !== value)
      : [...knownIssues, value];
    handleChange('known_issues', updated);
  };

  return (
    <div className="space-y-6">
      {/* Home Age */}
      <Card className="p-4">
        <h3 className="font-medium text-charcoal mb-3">When was the home built?</h3>
        <Select
          value={renoData.home_age || 'unknown'}
          onChange={(value) => handleChange('home_age', value)}
          options={HOME_AGE_OPTIONS}
        />
        <p className="text-xs text-gray-500 mt-2">
          Older homes may have lead paint, asbestos, or outdated wiring that affects scope.
        </p>
      </Card>

      {/* Home Style */}
      <Card className="p-4">
        <h3 className="font-medium text-charcoal mb-3">Home Style</h3>
        <Select
          value={renoData.home_style || 'unknown'}
          onChange={(value) => handleChange('home_style', value)}
          options={HOME_STYLE_OPTIONS}
        />
      </Card>

      {/* Known Issues */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-medium text-charcoal">Known Issues</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Select any issues you're aware of. This helps us plan for potential surprises.
        </p>
        <div className="grid grid-cols-1 gap-2">
          {KNOWN_ISSUES.map((issue) => {
            const Icon = issue.icon;
            const isSelected = knownIssues.includes(issue.value);
            return (
              <button
                key={issue.value}
                type="button"
                onClick={() => handleIssueToggle(issue.value)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all
                  ${isSelected
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-gray-300'}
                `}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <Icon className={`w-5 h-5 ${issue.color}`} />
                <span className="text-sm text-charcoal">{issue.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Issue Details */}
      {knownIssues.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium text-charcoal mb-3">Tell us more about these issues</h3>
          <TextArea
            value={renoData.issue_details || ''}
            onChange={(e) => handleChange('issue_details', e.target.value)}
            placeholder="Describe what you've noticed, where the issue is located, and any repairs attempted..."
            rows={4}
          />
        </Card>
      )}

      {/* Previous Renovations */}
      <Card className="p-4">
        <h3 className="font-medium text-charcoal mb-3">Previous Renovations</h3>
        <p className="text-sm text-gray-600 mb-3">
          Has any major work been done to the home? (roof, windows, siding, etc.)
        </p>
        <TextArea
          value={renoData.previous_renovations || ''}
          onChange={(e) => handleChange('previous_renovations', e.target.value)}
          placeholder="e.g., Roof replaced 2018, windows updated 2020..."
          rows={3}
        />
      </Card>

      {/* Structural Changes Wanted */}
      <Card className="p-4 border-blue-100 bg-blue-50">
        <h3 className="font-medium text-charcoal mb-3">Structural Changes</h3>
        <p className="text-sm text-gray-600 mb-3">
          Are you considering any walls being removed or major layout changes?
        </p>
        <TextArea
          value={renoData.structural_notes || ''}
          onChange={(e) => handleChange('structural_notes', e.target.value)}
          placeholder="e.g., Open up kitchen to living room, add an ensuite to master bedroom..."
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-2">
          Structural changes may require engineering and additional permits.
        </p>
      </Card>
    </div>
  );
}
