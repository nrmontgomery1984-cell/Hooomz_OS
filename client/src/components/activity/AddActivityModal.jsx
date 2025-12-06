import { useState, useEffect } from 'react';
import {
  CheckCircle,
  Clock,
  Camera,
  AlertTriangle,
  MessageSquare,
  ChevronLeft,
  Package,
  ClipboardCheck,
  CloudRain,
  Phone,
  FileEdit,
  DollarSign,
  HardHat
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Input, DateInput, TextArea, Select, MultiSelect } from '../ui';
import { useScopeData, predictCategory } from '../../hooks';

// Activity types with contextual date fields
const activityTypes = [
  {
    type: 'note.added',
    icon: MessageSquare,
    label: 'Add Note',
    color: 'text-gray-600',
    placeholder: 'Enter your note...',
    dateFields: [{ key: 'date', label: 'Date' }],
    showCategory: true,
    showContacts: false,
  },
  {
    type: 'issue.flagged',
    icon: AlertTriangle,
    label: 'Flag Issue',
    color: 'text-red-500',
    placeholder: 'Describe the issue...',
    dateFields: [{ key: 'date', label: 'Date Occurred' }],
    showCategory: true,
    showContacts: true,
  },
  {
    type: 'photo.uploaded',
    icon: Camera,
    label: 'Log Photo',
    color: 'text-purple-500',
    placeholder: 'Photo description...',
    dateFields: [{ key: 'date', label: 'Date Taken' }],
    showCategory: true,
    showContacts: false,
  },
  {
    type: 'task.completed',
    icon: CheckCircle,
    label: 'Task Done',
    color: 'text-emerald-500',
    placeholder: 'Task name...',
    dateFields: [{ key: 'completed_date', label: 'Completion Date' }],
    showCategory: true,
    showContacts: true,
  },
  {
    type: 'time.stopped',
    icon: Clock,
    label: 'Log Time',
    color: 'text-blue-500',
    placeholder: 'What did you work on...',
    dateFields: [{ key: 'date', label: 'Work Date' }],
    showCategory: true,
    showContacts: true,
  },
  {
    type: 'material.received',
    icon: Package,
    label: 'Material Received',
    color: 'text-amber-600',
    placeholder: 'What materials arrived...',
    dateFields: [{ key: 'received_date', label: 'Date Received' }],
    showCategory: true,
    showContacts: true, // supplier
  },
  {
    type: 'inspection.scheduled',
    icon: ClipboardCheck,
    label: 'Inspection',
    color: 'text-indigo-500',
    placeholder: 'Inspection details...',
    dateFields: [{ key: 'scheduled_date', label: 'Scheduled Date' }],
    showCategory: true,
    showContacts: true, // inspector
  },
  {
    type: 'weather.delay',
    icon: CloudRain,
    label: 'Weather Delay',
    color: 'text-sky-500',
    placeholder: 'Weather conditions...',
    dateFields: [
      { key: 'delay_date', label: 'Delay Date' },
      { key: 'original_due_date', label: 'Original Due Date' },
      { key: 'new_due_date', label: 'New Due Date' }
    ],
    showCategory: true,
    showContacts: false,
  },
  {
    type: 'client.contact',
    icon: Phone,
    label: 'Client Contact',
    color: 'text-teal-500',
    placeholder: 'What was discussed...',
    dateFields: [{ key: 'contact_date', label: 'Contact Date' }],
    showCategory: false,
    showContacts: true, // client
  },
  {
    type: 'change.requested',
    icon: FileEdit,
    label: 'Change Request',
    color: 'text-orange-500',
    placeholder: 'Describe the change...',
    dateFields: [
      { key: 'request_date', label: 'Request Date' },
      { key: 'original_due_date', label: 'Original Due Date' },
      { key: 'new_due_date', label: 'New Due Date' }
    ],
    showCategory: true,
    showContacts: true,
  },
  {
    type: 'payment.received',
    icon: DollarSign,
    label: 'Payment Received',
    color: 'text-emerald-600',
    placeholder: 'Payment details...',
    dateFields: [{ key: 'payment_date', label: 'Payment Date' }],
    showCategory: false,
    showContacts: false,
  },
  {
    type: 'subcontractor.update',
    icon: HardHat,
    label: 'Sub Update',
    color: 'text-orange-600',
    placeholder: 'Subcontractor update...',
    dateFields: [{ key: 'date', label: 'Date' }],
    showCategory: true,
    showContacts: true, // subcontractor
  },
];

// Helper to get today's date in YYYY-MM-DD format
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

export function AddActivityModal({ isOpen, onClose, projectId, onSubmit }) {
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [actorName, setActorName] = useState('');
  const [dates, setDates] = useState({});
  const [categoryCode, setCategoryCode] = useState('');
  const [subcategoryCode, setSubcategoryCode] = useState('');
  const [contactIds, setContactIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Get scope data from cache
  const {
    categoryOptions,
    getSubcategoryOptions,
    contactOptions,
  } = useScopeData(projectId);

  // Get subcategory options based on selected category
  const subcategoryOptions = categoryCode ? getSubcategoryOptions(categoryCode) : [];

  // Initialize date fields when type is selected
  const handleSelectType = (type) => {
    setSelectedType(type);
    // Initialize dates with today for the first/primary date field
    const initialDates = {};
    if (type.dateFields && type.dateFields.length > 0) {
      initialDates[type.dateFields[0].key] = getTodayString();
    }
    setDates(initialDates);
    // Reset category selections
    setCategoryCode('');
    setSubcategoryCode('');
    setContactIds([]);
  };

  // Auto-predict category when description changes
  const handleDescriptionChange = (e) => {
    const newDesc = e.target.value;
    setDescription(newDesc);

    // Only auto-predict if category not already set and description is long enough
    if (!categoryCode && newDesc.length > 10 && selectedType?.showCategory) {
      const predicted = predictCategory(newDesc);
      if (predicted && predicted !== 'GN') {
        setCategoryCode(predicted);
      }
    }
  };

  // Clear subcategory when category changes
  useEffect(() => {
    if (categoryCode) {
      // Check if current subcategory belongs to new category
      const subs = getSubcategoryOptions(categoryCode);
      if (!subs.some(s => s.value === subcategoryCode)) {
        setSubcategoryCode('');
      }
    }
  }, [categoryCode, subcategoryCode, getSubcategoryOptions]);

  const handleDateChange = (key, value) => {
    setDates((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType || !description.trim()) return;

    setSubmitting(true);

    const eventData = {};

    // Add all date fields to event_data
    Object.entries(dates).forEach(([key, value]) => {
      if (value) {
        eventData[key] = value;
      }
    });

    // Build event_data based on type
    switch (selectedType.type) {
      case 'note.added':
        eventData.note = description;
        break;
      case 'issue.flagged':
        eventData.description = description;
        break;
      case 'photo.uploaded':
        eventData.description = description;
        eventData.count = 1;
        break;
      case 'task.completed':
        eventData.title = description;
        break;
      case 'time.stopped':
        eventData.task_title = description;
        eventData.duration_minutes = 0;
        break;
      default:
        eventData.description = description;
    }

    await onSubmit({
      event_type: selectedType.type,
      event_data: eventData,
      project_id: projectId,
      category_code: categoryCode || null,
      subcategory_code: subcategoryCode || null,
      contact_ids: contactIds.length > 0 ? contactIds : [],
      actor_name: actorName.trim() || 'You',
    });

    setSubmitting(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedType(null);
    setDescription('');
    setActorName('');
    setDates({});
    setCategoryCode('');
    setSubcategoryCode('');
    setContactIds([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Log Activity">
      {!selectedType ? (
        // Step 1: Select activity type
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-4">What would you like to log?</p>
          {activityTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => handleSelectType(type)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
            >
              <type.icon className={`w-5 h-5 ${type.color}`} />
              <span className="text-sm font-medium text-charcoal">{type.label}</span>
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
              onClick={() => setSelectedType(null)}
              className="p-1.5 -ml-1.5 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <selectedType.icon className={`w-5 h-5 ${selectedType.color}`} />
              <span className="text-sm font-medium text-charcoal">{selectedType.label}</span>
            </div>
          </div>

          {/* Description */}
          <TextArea
            label="Description"
            placeholder={selectedType.placeholder}
            value={description}
            onChange={handleDescriptionChange}
            rows={3}
            required
          />

          {/* Category & Subcategory - shown for most types */}
          {selectedType.showCategory && (
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Category"
                value={categoryCode}
                onChange={setCategoryCode}
                options={categoryOptions}
                placeholder="Select category"
                searchable
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
          )}

          {/* Contacts/Subs involved */}
          {selectedType.showContacts && (
            <MultiSelect
              label="People Involved"
              value={contactIds}
              onChange={setContactIds}
              options={contactOptions}
              placeholder="Select contacts..."
              searchable
            />
          )}

          {/* Date fields - contextual based on activity type */}
          {selectedType.dateFields && selectedType.dateFields.length > 0 && (
            <div className={`grid gap-3 ${selectedType.dateFields.length > 1 ? 'grid-cols-1' : ''}`}>
              {selectedType.dateFields.map((field) => (
                <DateInput
                  key={field.key}
                  label={field.label}
                  value={dates[field.key] || ''}
                  onChange={(e) => handleDateChange(field.key, e.target.value)}
                />
              ))}
            </div>
          )}

          {/* Actor name (optional) */}
          <Input
            label="Your Name (optional)"
            placeholder="Who is logging this?"
            value={actorName}
            onChange={(e) => setActorName(e.target.value)}
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
              disabled={!description.trim() || submitting}
              className="flex-1"
            >
              {submitting ? 'Logging...' : 'Log Activity'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
