import { useState, useEffect, useRef } from 'react';
import {
  FileText,
  CheckCircle2,
  Circle,
  Upload,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  Building2,
  Ruler,
  FileCheck,
  Home,
  DoorOpen,
  Layers,
  HardHat,
  Zap,
  Droplets,
  Flame,
  Shield,
  Camera,
  ClipboardList,
  Link,
  File,
} from 'lucide-react';
import { Card } from '../ui';

// Google Drive icon component
function GoogleDriveIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.71 3.5L1.15 15l4.58 7.5h13.54l4.58-7.5L17.29 3.5H7.71zm.79 1.5h7l5.5 9.5-2.29 3.75L8.5 5zm-1.5 0L2.5 14.25 4.79 18l4.71-8.25L8.5 5zM12 10.5L8.5 17h7l-3.5-6.5z"/>
    </svg>
  );
}

/**
 * Document types organized by category
 * Each document has:
 * - id: unique identifier
 * - label: display name
 * - icon: lucide icon component
 * - required: whether it's required for the project
 * - phase: which phase this document is typically needed
 * - description: helper text
 */
const DOCUMENT_CATEGORIES = [
  {
    id: 'project_initiation',
    label: 'Project Initiation',
    documents: [
      {
        id: 'intake_form',
        label: 'Intake Form',
        icon: ClipboardList,
        required: true,
        phase: 'intake',
        description: 'Client requirements and project scope',
      },
      {
        id: 'site_photos',
        label: 'Site Photos',
        icon: Camera,
        required: true,
        phase: 'intake',
        description: 'Photos of existing conditions',
      },
      {
        id: 'site_measurements',
        label: 'Site Measurements',
        icon: Ruler,
        required: true,
        phase: 'intake',
        description: 'Measured drawings of existing space',
      },
    ],
  },
  {
    id: 'design_planning',
    label: 'Design & Planning',
    documents: [
      {
        id: 'blueprints',
        label: 'Blueprints / Floor Plans',
        icon: Home,
        required: true,
        phase: 'estimating',
        description: 'Architectural drawings and layouts',
      },
      {
        id: 'site_plan',
        label: 'Site Plan',
        icon: Building2,
        required: false,
        phase: 'estimating',
        description: 'Property layout and setbacks',
      },
      {
        id: 'elevations',
        label: 'Elevations',
        icon: Layers,
        required: false,
        phase: 'estimating',
        description: 'Exterior and interior elevation drawings',
      },
    ],
  },
  {
    id: 'permits_approvals',
    label: 'Permits & Approvals',
    documents: [
      {
        id: 'building_permit',
        label: 'Building Permit',
        icon: FileCheck,
        required: true,
        phase: 'contracted',
        description: 'Municipal building permit approval',
      },
      {
        id: 'electrical_permit',
        label: 'Electrical Permit',
        icon: Zap,
        required: false,
        phase: 'contracted',
        description: 'Electrical work permit',
      },
      {
        id: 'plumbing_permit',
        label: 'Plumbing Permit',
        icon: Droplets,
        required: false,
        phase: 'contracted',
        description: 'Plumbing work permit',
      },
      {
        id: 'hvac_permit',
        label: 'HVAC Permit',
        icon: Flame,
        required: false,
        phase: 'contracted',
        description: 'Heating/cooling system permit',
      },
      {
        id: 'hoa_approval',
        label: 'HOA Approval',
        icon: Shield,
        required: false,
        phase: 'contracted',
        description: 'Homeowners association approval',
      },
    ],
  },
  {
    id: 'engineering_specs',
    label: 'Engineering & Specs',
    documents: [
      {
        id: 'structural_drawings',
        label: 'Structural Drawings',
        icon: HardHat,
        required: false,
        phase: 'estimating',
        description: 'Engineered structural plans',
      },
      {
        id: 'truss_plans',
        label: 'Truss Plans',
        icon: Layers,
        required: false,
        phase: 'contracted',
        description: 'Roof truss engineering',
      },
      {
        id: 'window_door_schedule',
        label: 'Window & Door Schedule',
        icon: DoorOpen,
        required: false,
        phase: 'estimating',
        description: 'Window and door specifications',
      },
    ],
  },
  {
    id: 'contracts_orders',
    label: 'Contracts & Orders',
    documents: [
      {
        id: 'signed_contract',
        label: 'Signed Contract',
        icon: FileText,
        required: true,
        phase: 'contracted',
        description: 'Executed project contract',
      },
      {
        id: 'material_orders',
        label: 'Material Orders',
        icon: ClipboardList,
        required: false,
        phase: 'active',
        description: 'Lumber, fixtures, materials',
      },
      {
        id: 'subcontractor_agreements',
        label: 'Subcontractor Agreements',
        icon: FileCheck,
        required: false,
        phase: 'active',
        description: 'Sub trade contracts',
      },
    ],
  },
];

/**
 * Get localStorage key for document status
 */
function getStorageKey(projectId) {
  return `hooomz_documents_${projectId}`;
}

/**
 * Load document status from localStorage
 */
function loadDocumentStatus(projectId) {
  const saved = localStorage.getItem(getStorageKey(projectId));
  return saved ? JSON.parse(saved) : {};
}

/**
 * Save document status to localStorage
 */
function saveDocumentStatus(projectId, status) {
  localStorage.setItem(getStorageKey(projectId), JSON.stringify(status));
}

/**
 * DocumentChecklist - Track project documents
 */
export function DocumentChecklist({ projectId, projectPhase = 'intake', compact = false }) {
  const [documentStatus, setDocumentStatus] = useState(() => loadDocumentStatus(projectId));
  const [expandedCategories, setExpandedCategories] = useState(() => {
    // Expand categories relevant to current phase by default
    return DOCUMENT_CATEGORIES.reduce((acc, cat) => {
      const hasRelevantDocs = cat.documents.some(doc => doc.phase === projectPhase);
      acc[cat.id] = hasRelevantDocs;
      return acc;
    }, {});
  });

  // Save to localStorage when status changes
  useEffect(() => {
    saveDocumentStatus(projectId, documentStatus);
  }, [projectId, documentStatus]);

  // Toggle document completion
  const toggleDocument = (docId) => {
    setDocumentStatus(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        completed: !prev[docId]?.completed,
        completedAt: !prev[docId]?.completed ? new Date().toISOString() : null,
      },
    }));
  };

  // Add link to document
  const updateDocumentLink = (docId, link, linkType) => {
    setDocumentStatus(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        link,
        linkType,
        file: null, // Clear file if setting a link
      },
    }));
  };

  // Add file to document
  const updateDocumentFile = (docId, file) => {
    setDocumentStatus(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        file,
        link: null, // Clear link if setting a file
        linkType: null,
      },
    }));
  };

  // Toggle category expansion
  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Calculate stats
  const totalDocs = DOCUMENT_CATEGORIES.reduce((sum, cat) => sum + cat.documents.length, 0);
  const completedDocs = Object.values(documentStatus).filter(d => d?.completed).length;
  const requiredDocs = DOCUMENT_CATEGORIES.reduce(
    (sum, cat) => sum + cat.documents.filter(d => d.required).length,
    0
  );
  const completedRequired = DOCUMENT_CATEGORIES.reduce(
    (sum, cat) =>
      sum + cat.documents.filter(d => d.required && documentStatus[d.id]?.completed).length,
    0
  );

  // Compact view for sidebar/overview
  if (compact) {
    return (
      <div className="p-3 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-charcoal">Documents</span>
          </div>
          <span className="text-xs text-gray-500">
            {completedDocs}/{totalDocs}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${(completedDocs / totalDocs) * 100}%` }}
          />
        </div>
        {completedRequired < requiredDocs && (
          <p className="text-xs text-amber-600 mt-1.5">
            {requiredDocs - completedRequired} required docs pending
          </p>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-charcoal flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          Document Checklist
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {completedDocs} of {totalDocs} complete
          </span>
          {/* Progress circle */}
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray={`${(completedDocs / totalDocs) * 88} 88`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Required docs warning */}
      {completedRequired < requiredDocs && (
        <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-sm text-amber-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{requiredDocs - completedRequired} required documents still pending</span>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-3">
        {DOCUMENT_CATEGORIES.map((category) => {
          const catCompleted = category.documents.filter(
            d => documentStatus[d.id]?.completed
          ).length;
          const isExpanded = expandedCategories[category.id];

          return (
            <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-charcoal">{category.label}</span>
                  <span className="text-xs text-gray-500">
                    {catCompleted}/{category.documents.length}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Documents list */}
              {isExpanded && (
                <div className="divide-y divide-gray-100">
                  {category.documents.map((doc) => {
                    const status = documentStatus[doc.id] || {};
                    const isRelevantPhase = doc.phase === projectPhase;

                    return (
                      <DocumentItem
                        key={doc.id}
                        doc={doc}
                        status={status}
                        isRelevantPhase={isRelevantPhase}
                        onToggle={() => toggleDocument(doc.id)}
                        onUpdateNote={(link, linkType) => updateDocumentLink(doc.id, link, linkType)}
                        onUpdateFile={(file) => updateDocumentFile(doc.id, file)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/**
 * DocumentItem - Single document in the checklist
 */
function DocumentItem({ doc, status, isRelevantPhase, onToggle, onUpdateNote, onUpdateFile }) {
  const [showLinkOptions, setShowLinkOptions] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState(status.link || '');
  const fileInputRef = useRef(null);
  const Icon = doc.icon;

  const handleSaveLink = () => {
    onUpdateNote(linkValue, 'link');
    setShowLinkInput(false);
    setShowLinkOptions(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store file info (in real app, would upload to server/cloud)
      onUpdateFile({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      });
      setShowLinkOptions(false);
    }
  };

  const openGoogleDrivePicker = () => {
    // In a real implementation, this would open Google Drive picker
    // For now, prompt for a Google Drive link
    const driveLink = prompt('Paste your Google Drive share link:');
    if (driveLink) {
      onUpdateNote(driveLink, 'google_drive');
      setShowLinkOptions(false);
    }
  };

  // Determine what type of attachment we have
  const hasLink = status.link;
  const hasFile = status.file;
  const hasGoogleDrive = status.linkType === 'google_drive';
  const hasAttachment = hasLink || hasFile;

  // Get display info for the link
  const getLinkDisplay = () => {
    if (hasFile) {
      return {
        icon: <File className="w-3 h-3" />,
        label: status.file.name,
        isExternal: false,
      };
    }
    if (hasGoogleDrive) {
      return {
        icon: <GoogleDriveIcon className="w-3 h-3" />,
        label: 'Google Drive',
        isExternal: true,
      };
    }
    if (hasLink) {
      return {
        icon: <ExternalLink className="w-3 h-3" />,
        label: 'View document',
        isExternal: true,
      };
    }
    return null;
  };

  const linkDisplay = getLinkDisplay();

  return (
    <div
      className={`p-3 ${isRelevantPhase ? 'bg-blue-50/50' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className="mt-0.5 flex-shrink-0"
        >
          {status.completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Icon className={`w-4 h-4 ${status.completed ? 'text-gray-400' : 'text-gray-500'}`} />
            <span
              className={`font-medium ${
                status.completed ? 'text-gray-400 line-through' : 'text-charcoal'
              }`}
            >
              {doc.label}
            </span>
            {doc.required && (
              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                Required
              </span>
            )}
            {isRelevantPhase && !status.completed && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                Due now
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>

          {/* Attachment display */}
          {hasAttachment && !showLinkInput && linkDisplay && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {linkDisplay.isExternal ? (
                <a
                  href={status.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
                >
                  {linkDisplay.icon}
                  {linkDisplay.label}
                </a>
              ) : (
                <span className="text-xs text-gray-600 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                  {linkDisplay.icon}
                  {linkDisplay.label}
                </span>
              )}
              <button
                onClick={() => {
                  setLinkValue(status.link || '');
                  setShowLinkOptions(true);
                }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Change
              </button>
              <button
                onClick={() => {
                  onUpdateNote('', null);
                  onUpdateFile(null);
                }}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          )}

          {/* Link input */}
          {showLinkInput && (
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  placeholder="Paste URL here..."
                  className="flex-1 text-xs px-2 py-1.5 border border-gray-300 rounded"
                  autoFocus
                />
                <button
                  onClick={handleSaveLink}
                  disabled={!linkValue}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium disabled:text-gray-300"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowLinkInput(false);
                    setLinkValue(status.link || '');
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Link options menu */}
          {showLinkOptions && !showLinkInput && (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={openGoogleDrivePicker}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <GoogleDriveIcon className="w-4 h-4 text-[#4285f4]" />
                Google Drive
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <Upload className="w-4 h-4 text-gray-500" />
                Upload File
              </button>
              <button
                onClick={() => setShowLinkInput(true)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <Link className="w-4 h-4 text-gray-500" />
                Paste Link
              </button>
              <button
                onClick={() => setShowLinkOptions(false)}
                className="text-xs text-gray-400 hover:text-gray-600 px-2"
              >
                Cancel
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              />
            </div>
          )}

          {/* Add attachment button */}
          {!hasAttachment && !showLinkOptions && !showLinkInput && (
            <button
              onClick={() => setShowLinkOptions(true)}
              className="mt-2 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              Attach document
            </button>
          )}

          {/* Completion timestamp */}
          {status.completed && status.completedAt && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Completed {new Date(status.completedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * DocumentChecklistCompact - Smaller version for dashboard
 */
export function DocumentChecklistCompact({ projectId }) {
  return <DocumentChecklist projectId={projectId} compact />;
}

export default DocumentChecklist;
