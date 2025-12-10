import { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Layers,
  Search,
  BookOpen,
} from 'lucide-react';
import { Button, Select } from '../ui';
import { matchTask, getTaskSuggestions, getDefaultStageForCategory } from '../../data/taskMatcher';
import { getChecklistForTask, getFieldGuideModules } from '../../data/taskChecklists';

/**
 * Add Task Modal - Smart task creation with auto-detection
 * Automatically matches task name to category, stage, and checklist
 */
export function AddTaskModal({
  isOpen,
  onClose,
  onAdd,
  categories,
  stages,
  locations,
  contacts,
}) {
  const [taskName, setTaskName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Auto-detected values
  const [detectedMatch, setDetectedMatch] = useState(null);

  // Manual overrides (if user wants to change auto-detected values)
  const [manualCategory, setManualCategory] = useState('');
  const [manualStage, setManualStage] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Update suggestions as user types
  useEffect(() => {
    if (taskName.length > 0) {
      const newSuggestions = getTaskSuggestions(taskName, 8);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions(getTaskSuggestions('', 8));
      setShowSuggestions(false);
    }
    setSelectedSuggestionIndex(-1);

    // Try to match the task
    const match = matchTask(taskName);
    setDetectedMatch(match);

    // Auto-populate category/stage from match (only if currently empty)
    if (match) {
      setManualCategory((prev) => prev || match.categoryCode);
      setManualStage((prev) => prev || match.stageCode);
    }
  }, [taskName]);

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Select a suggestion
  const selectSuggestion = (suggestion) => {
    setTaskName(suggestion.name);
    setManualCategory(suggestion.categoryCode);
    setManualStage(suggestion.stageCode);
    setShowSuggestions(false);

    // Re-match to get checklist
    const match = matchTask(suggestion.name);
    setDetectedMatch(match);
  };

  // Handle category change (updates stage to default for category)
  const handleCategoryChange = (categoryCode) => {
    setManualCategory(categoryCode);
    if (categoryCode && !manualStage) {
      setManualStage(getDefaultStageForCategory(categoryCode));
    }
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!taskName.trim()) return;

    const finalCategoryCode = manualCategory || detectedMatch?.categoryCode;
    const finalStageCode = manualStage || detectedMatch?.stageCode;

    if (!finalCategoryCode || !finalStageCode) {
      // Can't submit without category and stage
      setShowAdvanced(true);
      return;
    }

    // Always compute checklist based on final category/stage/name
    const finalName = taskName.trim();
    const checklist = getChecklistForTask(finalCategoryCode, finalName, finalStageCode);
    const fieldGuideModules = getFieldGuideModules(finalCategoryCode);

    onAdd({
      name: finalName,
      categoryCode: finalCategoryCode,
      stageCode: finalStageCode,
      subcategoryId: detectedMatch?.subcategoryId || null,
      locationId: selectedLocation || null,
      assignedTo: assignedTo || null,
      checklist: checklist || null,
      fieldGuideModules: fieldGuideModules || [],
    });

    // Reset form
    handleClose();
  };

  // Handle close
  const handleClose = () => {
    setTaskName('');
    setDetectedMatch(null);
    setManualCategory('');
    setManualStage('');
    setSelectedLocation('');
    setAssignedTo('');
    setShowAdvanced(false);
    setShowSuggestions(false);
    onClose();
  };

  if (!isOpen) return null;

  // Get current category/stage for display
  const currentCategoryCode = manualCategory || detectedMatch?.categoryCode;
  const currentStageCode = manualStage || detectedMatch?.stageCode;
  const currentCategory = categories.find((c) => c.code === currentCategoryCode);
  const currentStage = stages.find((s) => s.code === currentStageCode);

  // Build location options
  const locationOptions = [
    { value: '', label: 'No specific location' },
    ...locations
      .filter((l) => l.locationType === 'room')
      .map((l) => ({
        value: l.id,
        label: l.path?.replace(/\./g, ' > ') || l.name,
      })),
  ];

  // Build contact options
  const contactOptions = [
    { value: '', label: 'Unassigned' },
    ...contacts
      .filter((c) => c.contact_type === 'subcontractor')
      .map((c) => ({
        value: c.id,
        label: `${c.name}${c.company ? ` - ${c.company}` : ''}`,
      })),
  ];

  // Category options
  const categoryOptions = categories.map((c) => ({
    value: c.code,
    label: c.name,
  }));

  // Stage options
  const stageOptions = stages.map((s) => ({
    value: s.code,
    label: s.name,
  }));

  const hasDetection = detectedMatch && detectedMatch.confidence === 'high';
  const isValid = taskName.trim() && currentCategoryCode && currentStageCode;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-charcoal">Add Task</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
          {/* Task Name Input */}
          <div className="relative mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What needs to be done?
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onFocus={() => setShowSuggestions(suggestions.length > 0 || taskName.length === 0)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Install floor tile, Rough-in electrical..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-transparent"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => {
                  const cat = categories.find((c) => c.code === suggestion.categoryCode);
                  return (
                    <button
                      key={`${suggestion.name}-${suggestion.categoryCode}`}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                        index === selectedSuggestionIndex ? 'bg-gray-100' : ''
                      }`}
                    >
                      {cat && (
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                      )}
                      <span className="text-sm text-gray-900">{suggestion.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Auto-Detection Result */}
          {taskName.length > 2 && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                hasDetection
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              {hasDetection ? (
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-800">
                      Auto-detected
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {currentCategory && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: currentCategory.color }}
                        >
                          {currentCategory.name}
                        </span>
                      )}
                      {currentStage && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-700 text-white rounded text-xs font-medium">
                          <Layers className="w-3 h-3" />
                          {currentStage.name}
                        </span>
                      )}
                      {detectedMatch?.checklist && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          <BookOpen className="w-3 h-3" />
                          Checklist attached
                        </span>
                      )}
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <Search className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Select category and stage below
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Selection (always visible if no match, or in advanced mode) */}
          {(!hasDetection || showAdvanced) && taskName.length > 0 && (
            <div className="space-y-3 mb-4">
              <Select
                label="Category"
                value={manualCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                options={[{ value: '', label: 'Select category...' }, ...categoryOptions]}
                required
              />

              <Select
                label="Stage"
                value={manualStage}
                onChange={(e) => setManualStage(e.target.value)}
                options={[{ value: '', label: 'Select stage...' }, ...stageOptions]}
                required
              />
            </div>
          )}

          {/* Advanced Options Toggle */}
          {hasDetection && !showAdvanced && (
            <button
              type="button"
              onClick={() => setShowAdvanced(true)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ChevronDown className="w-4 h-4" />
              More options
            </button>
          )}

          {/* Advanced Options */}
          {(showAdvanced || (!hasDetection && taskName.length > 0)) && (
            <div className="space-y-3 mb-4 pt-3 border-t border-gray-200">
              {/* Category/Stage if detected but want to override */}
              {hasDetection && showAdvanced && (
                <>
                  <Select
                    label="Category (override)"
                    value={manualCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    options={categoryOptions}
                  />

                  <Select
                    label="Stage (override)"
                    value={manualStage}
                    onChange={(e) => setManualStage(e.target.value)}
                    options={stageOptions}
                  />
                </>
              )}

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  Location (optional)
                </label>
                <Select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  options={locationOptions}
                />
              </div>

              {/* Assignment */}
              <Select
                label="Assign to (optional)"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                options={contactOptions}
              />
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={!isValid}
            onClick={handleSubmit}
          >
            Add Task
          </Button>
        </div>
      </div>
    </div>
  );
}
