import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button, Input, TextArea, DateInput, Select, MultiSelect } from '../ui';
import {
  useScopeData,
  predictCategory,
  predictSubcategory,
  predictLocation,
  COMMON_LOCATIONS,
} from '../../hooks';

// Priority options
const PRIORITY_OPTIONS = [
  { value: 1, label: 'High' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Low' },
];

// Helper to get today's date + offset in YYYY-MM-DD format
function getDateString(daysFromNow = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

export function AddTaskModal({ isOpen, onClose, loopId, projectId, onSubmit, loopCategory = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getDateString(7)); // Default to 1 week out
  const [priority, setPriority] = useState(2); // Default medium
  const [categoryCode, setCategoryCode] = useState(loopCategory || '');
  const [subcategoryCode, setSubcategoryCode] = useState('');
  const [location, setLocation] = useState('');
  const [contactIds, setContactIds] = useState([]);
  const [estimatedHours, setEstimatedHours] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Location options for Select
  const locationOptions = COMMON_LOCATIONS.map(loc => ({ value: loc, label: loc }));

  // Get scope data from cache
  const {
    categoryOptions,
    getSubcategoryOptions,
    contactOptions,
  } = useScopeData(projectId);

  // Get subcategory options based on selected category
  const subcategoryOptions = categoryCode ? getSubcategoryOptions(categoryCode) : [];

  // Set default category from loop if provided
  useEffect(() => {
    if (loopCategory && !categoryCode) {
      setCategoryCode(loopCategory);
    }
  }, [loopCategory, categoryCode]);

  // Clear subcategory when category changes
  useEffect(() => {
    if (categoryCode) {
      const subs = getSubcategoryOptions(categoryCode);
      if (!subs.some(s => s.value === subcategoryCode)) {
        setSubcategoryCode('');
      }
    }
  }, [categoryCode, subcategoryCode, getSubcategoryOptions]);

  // Auto-predict category, subcategory, and location when title changes
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    // Only auto-predict if title is long enough
    if (newTitle.length > 5) {
      // Predict category if not already set
      if (!categoryCode) {
        const predictedCat = predictCategory(newTitle);
        if (predictedCat && predictedCat !== 'GN') {
          setCategoryCode(predictedCat);
          // Also predict subcategory based on predicted category
          if (!subcategoryCode) {
            const predictedSub = predictSubcategory(newTitle, predictedCat);
            if (predictedSub) {
              setSubcategoryCode(predictedSub);
            }
          }
        }
      } else if (!subcategoryCode) {
        // Category is set but subcategory isn't - predict subcategory
        const predictedSub = predictSubcategory(newTitle, categoryCode);
        if (predictedSub) {
          setSubcategoryCode(predictedSub);
        }
      }

      // Predict location if not already set
      if (!location) {
        const predictedLoc = predictLocation(newTitle);
        if (predictedLoc) {
          setLocation(predictedLoc);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);

    await onSubmit({
      loop_id: loopId,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      priority,
      category_code: categoryCode || null,
      subcategory_code: subcategoryCode || null,
      location: location || null,
      contact_ids: contactIds,
      estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
      status: 'pending',
    });

    setSubmitting(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(getDateString(7));
    setPriority(2);
    setCategoryCode(loopCategory || '');
    setSubcategoryCode('');
    setLocation('');
    setContactIds([]);
    setEstimatedHours('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          label="Task Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={handleTitleChange}
          required
          autoFocus
        />

        {/* Description */}
        <TextArea
          label="Description (optional)"
          placeholder="Additional details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        {/* Category & Subcategory */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            value={categoryCode}
            onChange={setCategoryCode}
            options={categoryOptions}
            placeholder="Select category"
            searchable
            clearable
          />
          <Select
            label="Subcategory"
            value={subcategoryCode}
            onChange={setSubcategoryCode}
            options={subcategoryOptions}
            placeholder={categoryCode ? "Select..." : "Pick category first"}
            disabled={!categoryCode}
            searchable
          />
        </div>

        {/* Location */}
        <Select
          label="Location"
          value={location}
          onChange={setLocation}
          options={locationOptions}
          placeholder="Where in the building?"
          searchable
          clearable
        />

        {/* People Involved */}
        <MultiSelect
          label="Assigned To"
          value={contactIds}
          onChange={setContactIds}
          options={contactOptions}
          placeholder="Who's doing this work?"
          searchable
        />

        {/* Due Date & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <DateInput
            label="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(val) => setPriority(Number(val))}
            options={PRIORITY_OPTIONS}
          />
        </div>

        {/* Estimated Hours */}
        <Input
          label="Estimated Hours (optional)"
          type="number"
          placeholder="e.g., 4"
          value={estimatedHours}
          onChange={(e) => setEstimatedHours(e.target.value)}
          min="0"
          step="0.5"
        />

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
            disabled={!title.trim() || submitting}
            className="flex-1"
          >
            {submitting ? 'Adding...' : 'Add Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
