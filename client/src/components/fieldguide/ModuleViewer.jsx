import { useState } from 'react';
import { ArrowLeft, Clock, BookOpen, CheckSquare, HelpCircle, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { Button, Card, Checkbox } from '../ui';
import { QuizView } from './QuizView';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ModuleViewer({ module, onBack }) {
  const [activeTab, setActiveTab] = useState('content');
  const [activeSection, setActiveSection] = useState(0);
  const [expandedChecklists, setExpandedChecklists] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleChecklist = (id) => {
    setExpandedChecklists(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCheckItem = (checklistId, itemIndex) => {
    const key = `${checklistId}-${itemIndex}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSectionClick = (idx) => {
    setActiveSection(idx);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const tabs = [
    { id: 'content', label: 'Content', icon: BookOpen },
    { id: 'checklists', label: 'Checklists', icon: CheckSquare, count: module.checklists?.length },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle, count: module.quiz?.questions?.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-charcoal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Field Guide</span>
              <span className="sm:hidden">Back</span>
            </button>

            {/* Mobile menu button - only show on content tab */}
            {activeTab === 'content' && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -mr-2 text-gray-600 hover:text-charcoal"
                aria-label="Open sections menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>

          <div>
            <span className="text-xs font-mono text-gray-400">{module.id}</span>
            <h1 className="text-lg lg:text-xl font-bold text-charcoal leading-tight">{module.title}</h1>
            <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-2 text-xs lg:text-sm text-gray-500">
              <span className="px-2 py-0.5 bg-gray-100 rounded">{module.category}</span>
              <span>{module.level}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                {module.estimated_study_hours}h
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 lg:mt-4 -mb-px overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'border-charcoal text-charcoal'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {count && (
                  <span className="px-1.5 py-0.5 text-xs bg-gray-100 rounded-full">{count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-charcoal">Sections</h3>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 -mr-2 text-gray-500 hover:text-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-64px)]">
          {module.sections?.map((section, idx) => (
            <button
              key={section.id}
              onClick={() => handleSectionClick(idx)}
              className={`w-full text-left px-3 py-3 text-sm rounded transition-colors ${
                activeSection === idx
                  ? 'bg-charcoal text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xs text-gray-400 block mb-0.5">Section {idx + 1}</span>
              {section.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-4 lg:py-6 pb-20 lg:pb-6">
        {activeTab === 'content' && (
          <div className="flex gap-6">
            {/* Desktop Section Nav - Hidden on mobile */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <Card className="p-3 sticky top-32">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Sections</h3>
                <nav className="space-y-1">
                  {module.sections?.map((section, idx) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(idx)}
                      className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                        activeSection === idx
                          ? 'bg-charcoal text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </Card>
            </div>

            {/* Section Content - Full width on mobile */}
            <div className="flex-1 min-w-0">
              {module.sections && module.sections[activeSection] && (
                <Card className="p-4 lg:p-6">
                  {/* Mobile section indicator */}
                  <div className="lg:hidden flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <span className="text-xs text-gray-400">
                      Section {activeSection + 1} of {module.sections.length}
                    </span>
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="text-xs text-charcoal font-medium flex items-center gap-1"
                    >
                      <Menu className="w-3 h-3" />
                      All Sections
                    </button>
                  </div>

                  <h2 className="text-lg font-bold text-charcoal mb-2">
                    {module.sections[activeSection].title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 pb-4 border-b">
                    {module.sections[activeSection].summary}
                  </p>
                  <div className="markdown-content prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {module.sections[activeSection].content_md}
                    </ReactMarkdown>
                  </div>

                  {/* Section Navigation */}
                  <div className="flex justify-between mt-6 lg:mt-8 pt-4 border-t gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setActiveSection(prev => Math.max(0, prev - 1))}
                      disabled={activeSection === 0}
                      className="text-sm"
                    >
                      <span className="hidden sm:inline">Previous Section</span>
                      <span className="sm:hidden">Previous</span>
                    </Button>
                    <Button
                      onClick={() => setActiveSection(prev => Math.min(module.sections.length - 1, prev + 1))}
                      disabled={activeSection === module.sections.length - 1}
                      className="text-sm"
                    >
                      <span className="hidden sm:inline">Next Section</span>
                      <span className="sm:hidden">Next</span>
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'checklists' && (
          <div className="space-y-4">
            {module.checklists?.map((checklist) => (
              <Card key={checklist.id} className="overflow-hidden">
                <button
                  onClick={() => toggleChecklist(checklist.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-charcoal">{checklist.title}</span>
                    <span className="text-xs text-gray-400">
                      {checklist.items?.length} items
                    </span>
                  </div>
                  {expandedChecklists[checklist.id] ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedChecklists[checklist.id] && (
                  <div className="px-4 pb-4 space-y-2">
                    {checklist.items?.map((item, idx) => (
                      <label
                        key={idx}
                        className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <Checkbox
                          checked={checkedItems[`${checklist.id}-${idx}`] || false}
                          onChange={() => toggleCheckItem(checklist.id, idx)}
                        />
                        <span className={`text-sm ${
                          checkedItems[`${checklist.id}-${idx}`] ? 'text-gray-400 line-through' : 'text-gray-700'
                        }`}>
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'quiz' && module.quiz && (
          <QuizView quiz={module.quiz} moduleId={module.id} />
        )}
      </div>
    </div>
  );
}
