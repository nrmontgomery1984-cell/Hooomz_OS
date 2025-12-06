import { Card, Input, TextArea } from '../../ui';
import { Plus, X, Link as LinkIcon, Heart, AlertTriangle, FileText } from 'lucide-react';

/**
 * NotesStep - Final intake step for must-haves, pain points, and inspiration
 */
export function NotesStep({ data, formType, onChange }) {
  const mustHaves = data?.must_haves || ['', '', ''];
  const painPoints = data?.pain_points || ['', '', ''];
  const inspirationUrls = data?.inspiration_urls || [];
  const styleNotes = data?.style_notes || '';
  const additionalNotes = data?.additional_notes || '';

  const handleMustHaveChange = (index, value) => {
    const updated = [...mustHaves];
    updated[index] = value;
    onChange({ must_haves: updated });
  };

  const handlePainPointChange = (index, value) => {
    const updated = [...painPoints];
    updated[index] = value;
    onChange({ pain_points: updated });
  };

  const handleAddUrl = () => {
    onChange({
      inspiration_urls: [...inspirationUrls, ''],
    });
  };

  const handleUrlChange = (index, value) => {
    const updated = [...inspirationUrls];
    updated[index] = value;
    onChange({ inspiration_urls: updated });
  };

  const handleRemoveUrl = (index) => {
    const updated = inspirationUrls.filter((_, i) => i !== index);
    onChange({ inspiration_urls: updated });
  };

  return (
    <div className="space-y-6">
      {/* Must-Haves */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-5 h-5 text-rose-500" />
          <h3 className="font-medium text-charcoal">Must-Haves</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          What are the top 3 things this project absolutely must include?
        </p>
        <div className="space-y-3">
          {mustHaves.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm text-gray-400 w-6">{index + 1}.</span>
              <Input
                value={item}
                onChange={(e) => handleMustHaveChange(index, e.target.value)}
                placeholder={
                  index === 0 ? 'e.g., Open concept kitchen/living'
                    : index === 1 ? 'e.g., Walk-in primary closet'
                    : 'e.g., Covered deck'
                }
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Pain Points (Renovation only) */}
      {formType === 'renovation' && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-medium text-charcoal">Current Pain Points</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            What are the biggest frustrations with your current space?
          </p>
          <div className="space-y-3">
            {painPoints.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-gray-400 w-6">{index + 1}.</span>
                <Input
                  value={item}
                  onChange={(e) => handlePainPointChange(index, e.target.value)}
                  placeholder={
                    index === 0 ? 'e.g., Not enough counter space'
                      : index === 1 ? 'e.g., Poor bathroom layout'
                      : 'e.g., Lack of storage'
                  }
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Inspiration Links */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-charcoal">Inspiration</h3>
          </div>
          <button
            type="button"
            onClick={handleAddUrl}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Share links to Pinterest boards, Houzz ideabooks, or images you love.
        </p>

        {inspirationUrls.length === 0 ? (
          <button
            type="button"
            onClick={handleAddUrl}
            className="w-full p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-gray-300 hover:text-gray-600 transition-colors"
          >
            <Plus className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">Add an inspiration link</span>
          </button>
        ) : (
          <div className="space-y-3">
            {inspirationUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder="https://pinterest.com/..."
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveUrl(index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Style Notes */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-purple-500" />
          <h3 className="font-medium text-charcoal">Style Description</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          How would you describe your desired style? (e.g., modern farmhouse, coastal, traditional)
        </p>
        <TextArea
          value={styleNotes}
          onChange={(e) => onChange({ style_notes: e.target.value })}
          placeholder="Describe the look and feel you're going for..."
          rows={3}
        />
      </Card>

      {/* Additional Notes */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-charcoal">Anything Else?</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Is there anything else you'd like us to know about this project?
        </p>
        <TextArea
          value={additionalNotes}
          onChange={(e) => onChange({ additional_notes: e.target.value })}
          placeholder="Special considerations, timeline constraints, budget flexibility..."
          rows={4}
        />
      </Card>
    </div>
  );
}
