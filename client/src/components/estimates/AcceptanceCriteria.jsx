import { useState } from 'react';
import { CheckCircle, AlertCircle, Info, ChevronDown, ChevronRight, Shield, Eye, EyeOff } from 'lucide-react';

/**
 * AcceptanceCriteriaToggle - Toggle to show/hide quality standards
 */
export function AcceptanceCriteriaToggle({ enabled, onChange }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-medium text-gray-900">Show Quality Standards</h4>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Display the official acceptance criteria and tolerances for each line item
        </p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span className="sr-only">Enable Quality Standards</span>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

/**
 * AcceptanceCriteriaDisplay - Shows criteria details for a line item
 */
export function AcceptanceCriteriaDisplay({ criteria, compact = false }) {
  if (!criteria) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-blue-600">
        <CheckCircle className="w-3 h-3" />
        <span className="font-medium">{criteria.tolerance}</span>
      </div>
    );
  }

  return (
    <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
      <div className="flex items-start gap-2">
        <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Quality Standard
            </span>
            {criteria.referenceSection && (
              <span className="text-xs text-blue-500">
                ({criteria.referenceSection})
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {criteria.description}
          </p>
          {criteria.tolerance && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Tolerance:</span>
              <span className="text-xs text-gray-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                {criteria.tolerance}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * AcceptanceCriteriaInline - Inline badge showing criteria exists
 */
export function AcceptanceCriteriaInline({ criteria, onClick }) {
  if (!criteria) return null;

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
      title="View quality standard"
    >
      <Shield className="w-3 h-3" />
      <span>Standard</span>
    </button>
  );
}

/**
 * AcceptanceCriteriaList - Shows all criteria for a category/section
 */
export function AcceptanceCriteriaList({ criteria, title = 'Quality Standards' }) {
  const [expanded, setExpanded] = useState(true);

  if (!criteria || criteria.length === 0) return null;

  // Group by category
  const grouped = criteria.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  return (
    <div className="border border-blue-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 bg-blue-50 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-900">{title}</span>
          <span className="text-sm text-gray-500">({criteria.length})</span>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="divide-y divide-blue-100">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {category}
              </h4>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900">{item.itemType}</h5>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      {item.tolerance && (
                        <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded whitespace-nowrap">
                          {item.tolerance}
                        </span>
                      )}
                    </div>
                    {item.referenceSection && (
                      <p className="text-xs text-gray-400 mt-2">{item.referenceSection}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * AcceptanceCriteriaModal - Modal showing all criteria for a document
 */
export function AcceptanceCriteriaSummary({ lineItems, criteriaMap, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  // Count items with criteria
  const itemsWithCriteria = lineItems.filter(item => criteriaMap[item.id]).length;

  if (itemsWithCriteria === 0) return null;

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
      >
        <Info className="w-4 h-4" />
        <span>{itemsWithCriteria} items have quality standards defined</span>
      </button>
    </div>
  );
}

export default AcceptanceCriteriaToggle;
