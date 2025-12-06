import { useState } from 'react';
import { ArrowLeft, Clock, BookOpen, CheckSquare, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Card, Checkbox } from '../ui';
import { QuizView } from './QuizView';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ModuleViewer({ module, onBack }) {
  const [activeTab, setActiveTab] = useState('content');
  const [activeSection, setActiveSection] = useState(0);
  const [expandedChecklists, setExpandedChecklists] = useState({});
  const [checkedItems, setCheckedItems] = useState({});

  const toggleChecklist = (id) => {
    setExpandedChecklists(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCheckItem = (checklistId, itemIndex) => {
    const key = `${checklistId}-${itemIndex}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: 'content', label: 'Content', icon: BookOpen },
    { id: 'checklists', label: 'Checklists', icon: CheckSquare, count: module.checklists?.length },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle, count: module.quiz?.questions?.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-charcoal mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Field Guide
          </button>

          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono text-gray-400">{module.id}</span>
              <h1 className="text-xl font-bold text-charcoal">{module.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{module.category}</span>
                <span>{module.level}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {module.estimated_study_hours} hours
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 -mb-px">
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
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

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'content' && (
          <div className="flex gap-6">
            {/* Section Nav */}
            <div className="w-64 flex-shrink-0">
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

            {/* Section Content */}
            <div className="flex-1 min-w-0">
              {module.sections && module.sections[activeSection] && (
                <Card className="p-6">
                  <h2 className="text-lg font-bold text-charcoal mb-2">
                    {module.sections[activeSection].title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 pb-4 border-b">
                    {module.sections[activeSection].summary}
                  </p>
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {module.sections[activeSection].content_md}
                    </ReactMarkdown>
                  </div>

                  {/* Section Navigation */}
                  <div className="flex justify-between mt-8 pt-4 border-t">
                    <Button
                      variant="secondary"
                      onClick={() => setActiveSection(prev => Math.max(0, prev - 1))}
                      disabled={activeSection === 0}
                    >
                      Previous Section
                    </Button>
                    <Button
                      onClick={() => setActiveSection(prev => Math.min(module.sections.length - 1, prev + 1))}
                      disabled={activeSection === module.sections.length - 1}
                    >
                      Next Section
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
