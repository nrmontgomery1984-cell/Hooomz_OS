/**
 * TemplateSelector Component
 *
 * Allows users to select and preview phase templates.
 */

import { useState, useMemo } from 'react';
import {
  FileText,
  Check,
  ChevronRight,
  Home,
  Hammer,
  Layers,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { Card } from '../ui';
import {
  PHASE_TEMPLATES,
  getAllSystemTemplates,
  suggestTemplate,
  PHASE_CATEGORIES,
} from '../../data/phaseTemplates';

const TEMPLATE_ICONS = {
  new_construction_multi_storey: Home,
  kitchen_renovation: Layers,
  bathroom_renovation: Layers,
  basement_finish: ArrowDown,
  deck_exterior: Hammer,
};

export function TemplateSelector({
  project,
  selectedTemplateId,
  onSelectTemplate,
  showPreview = true,
}) {
  const [previewTemplateId, setPreviewTemplateId] = useState(null);

  const templates = useMemo(() => getAllSystemTemplates(), []);

  // Get suggested template based on project
  const suggestedTemplate = useMemo(() => {
    if (!project) return null;
    return suggestTemplate(project);
  }, [project]);

  const previewTemplate = previewTemplateId ? PHASE_TEMPLATES[previewTemplateId] : null;

  const handleSelect = (templateId) => {
    onSelectTemplate?.(templateId);
    setPreviewTemplateId(null);
  };

  return (
    <div className="space-y-4">
      {/* Suggested Template */}
      {suggestedTemplate && !selectedTemplateId && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Recommended Template</h3>
              <p className="text-sm text-blue-700 mb-3">
                Based on your project type, we suggest:
              </p>
              <button
                onClick={() => handleSelect(suggestedTemplate.id)}
                className="flex items-center justify-between w-full p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = TEMPLATE_ICONS[suggestedTemplate.id] || FileText;
                    return <Icon className="w-5 h-5 text-blue-600" />;
                  })()}
                  <div className="text-left">
                    <p className="font-medium text-charcoal">{suggestedTemplate.name}</p>
                    <p className="text-xs text-gray-500">{suggestedTemplate.phases.length} phases</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-400" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((template) => {
          const Icon = TEMPLATE_ICONS[template.id] || FileText;
          const isSelected = selectedTemplateId === template.id;
          const isSuggested = suggestedTemplate?.id === template.id;

          return (
            <Card
              key={template.id}
              className={`
                p-4 cursor-pointer transition-all
                ${isSelected
                  ? 'border-charcoal bg-gray-50 ring-2 ring-charcoal ring-offset-1'
                  : 'hover:border-gray-300'
                }
              `}
              onClick={() => handleSelect(template.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  p-2 rounded-lg
                  ${isSelected ? 'bg-charcoal' : 'bg-gray-100'}
                `}>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-charcoal truncate">
                      {template.name}
                    </h4>
                    {isSelected && (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                    {isSuggested && !isSelected && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                        Suggested
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{template.phases.length} phases</span>
                    <span>•</span>
                    <span>{template.projectTypes.join(', ')}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewTemplateId(previewTemplateId === template.id ? null : template.id);
                  }}
                  className="text-xs text-gray-500 hover:text-charcoal underline"
                >
                  {previewTemplateId === template.id ? 'Hide' : 'Preview'}
                </button>
              </div>

              {/* Preview Panel */}
              {previewTemplateId === template.id && showPreview && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="text-xs font-medium text-gray-600 mb-2">Phase Overview:</h5>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {template.phases.slice(0, 15).map((phase, index) => {
                      const categoryInfo = PHASE_CATEGORIES[phase.category];
                      return (
                        <div
                          key={phase.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="text-gray-400 w-5 text-right">{index + 1}.</span>
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: categoryInfo?.color || '#6B7280' }}
                          />
                          <span className="text-gray-700 truncate">{phase.name}</span>
                          <span className="text-gray-400 font-mono">{phase.shortName}</span>
                        </div>
                      );
                    })}
                    {template.phases.length > 15 && (
                      <p className="text-xs text-gray-400 italic pl-7">
                        +{template.phases.length - 15} more phases...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Selected Template Summary */}
      {selectedTemplateId && PHASE_TEMPLATES[selectedTemplateId] && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-5 h-5" />
            <span className="font-medium">
              Template Selected: {PHASE_TEMPLATES[selectedTemplateId].name}
            </span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            {PHASE_TEMPLATES[selectedTemplateId].phases.length} phases will be created
          </p>
        </Card>
      )}
    </div>
  );
}

export default TemplateSelector;
