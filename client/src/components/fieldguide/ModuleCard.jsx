import { Clock, BookOpen, CheckCircle, Lock } from 'lucide-react';
import { Card } from '../ui';

const categoryColors = {
  'Safety & Compliance': 'bg-red-100 text-red-800 border-red-200',
  'Framing & Structure': 'bg-amber-100 text-amber-800 border-amber-200',
  'Exterior & Weather': 'bg-blue-100 text-blue-800 border-blue-200',
  'Interior Finish': 'bg-purple-100 text-purple-800 border-purple-200',
  'Tile': 'bg-teal-100 text-teal-800 border-teal-200',
  'default': 'bg-gray-100 text-gray-800 border-gray-200'
};

const levelColors = {
  'Apprentice': 'text-green-600',
  'Journeyman': 'text-blue-600',
  'Master': 'text-purple-600'
};

export function ModuleCard({ module, onClick, isComplete = false, isLocked = false }) {
  const categoryColor = categoryColors[module.category] || categoryColors.default;
  const levelColor = levelColors[module.level] || 'text-gray-600';

  return (
    <Card
      hover={!isLocked}
      className={`p-4 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={isLocked ? undefined : onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${categoryColor}`}>
          {module.category}
        </span>
        {isComplete ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : isLocked ? (
          <Lock className="w-5 h-5 text-gray-400" />
        ) : null}
      </div>

      <div className="mb-2">
        <span className="text-xs font-mono text-gray-400">{module.id}</span>
        <h3 className="text-sm font-semibold text-charcoal leading-tight mt-0.5">
          {module.title}
        </h3>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className={`font-medium ${levelColor}`}>{module.level}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {module.estimated_study_hours}h
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          {module.sections?.length || 0} sections
        </span>
      </div>

      {module.tags && module.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {module.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded"
            >
              {tag}
            </span>
          ))}
          {module.tags.length > 4 && (
            <span className="text-[10px] text-gray-400">+{module.tags.length - 4}</span>
          )}
        </div>
      )}
    </Card>
  );
}
