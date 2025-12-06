import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Input, TextArea, Select } from '../ui';
import { useScopeData } from '../../hooks';

// Loop types
const LOOP_TYPES = [
  { value: 'phase', label: 'Phase', description: 'Major project milestone (e.g., Rough-In, Finishes)' },
  { value: 'task_group', label: 'Task Group', description: 'Collection of related tasks' },
  { value: 'checklist', label: 'Checklist', description: 'Simple to-do list' },
  { value: 'inspection', label: 'Inspection', description: 'Inspection or walkthrough items' },
  { value: 'punch', label: 'Punch List', description: 'Items to address before completion' },
];

export function AddLoopModal({ isOpen, onClose, projectId, onSubmit, existingLoops = [] }) {
  const [step, setStep] = useState(1);
  const [loopType, setLoopType] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [parentLoopId, setParentLoopId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get scope data from cache
  const { categoryOptions } = useScopeData(projectId);

  // Parent loop options (only phases can be parents)
  const parentLoopOptions = existingLoops
    .filter(l => l.loop_type === 'phase' && l.status !== 'completed')
    .map(l => ({ value: l.id, label: l.name }));

  const handleSelectType = (type) => {
    setLoopType(type);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loopType || !name.trim()) return;

    setSubmitting(true);

    await onSubmit({
      project_id: projectId,
      parent_loop_id: parentLoopId || null,
      name: name.trim(),
      description: description.trim() || null,
      loop_type: loopType.value,
      category_code: categoryCode || null,
      status: 'pending',
      health_score: 0,
      health_color: 'gray',
    });

    setSubmitting(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setStep(1);
    setLoopType(null);
    setName('');
    setDescription('');
    setCategoryCode('');
    setParentLoopId('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Loop">
      {step === 1 ? (
        // Step 1: Select loop type
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-4">What type of loop?</p>
          {LOOP_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleSelectType(type)}
              className="w-full flex flex-col items-start p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-sm font-medium text-charcoal">{type.label}</span>
              <span className="text-xs text-gray-500 mt-0.5">{type.description}</span>
            </button>
          ))}
        </div>
      ) : (
        // Step 2: Enter details
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Back button + Selected type */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="p-1.5 -ml-1.5 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex-1">
              <span className="text-sm font-medium text-charcoal">{loopType.label}</span>
              <span className="text-xs text-gray-500 ml-2">{loopType.description}</span>
            </div>
          </div>

          {/* Name */}
          <Input
            label="Loop Name"
            placeholder="e.g., Rough-In, Kitchen Punch List"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          {/* Description */}
          <TextArea
            label="Description (optional)"
            placeholder="What's this loop for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          {/* Category - optional, links to scope */}
          <Select
            label="Category (optional)"
            value={categoryCode}
            onChange={setCategoryCode}
            options={categoryOptions}
            placeholder="Link to scope category..."
            searchable
            clearable
          />

          {/* Parent Loop - for nesting */}
          {parentLoopOptions.length > 0 && (
            <Select
              label="Parent Loop (optional)"
              value={parentLoopId}
              onChange={setParentLoopId}
              options={parentLoopOptions}
              placeholder="Nest under a phase..."
              clearable
            />
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || submitting}
              className="flex-1"
            >
              {submitting ? 'Creating...' : 'Create Loop'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
