import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Frame,
  Calculator,
  PaintBucket,
  LayoutGrid,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import { Card } from '../../components/ui';

/**
 * Toolbox - Calculator Suite Landing Page
 *
 * Organized categories:
 * - Framing Calculators
 * - Layout Tools
 * - Material Calculators
 * - Estimating Tools
 */

const TOOL_CATEGORIES = [
  {
    id: 'framing',
    name: 'Framing',
    icon: Frame,
    color: 'bg-orange-100 text-orange-600',
    description: 'Window openings, stair calculations, structural framing',
    tools: [
      {
        id: 'window-door-framing',
        name: 'Window & Door Framing',
        description: 'Cut list for rough opening framing',
        path: '/toolbox/window-door-framing',
        ready: true,
      },
      {
        id: 'cut-list',
        name: 'Cut List',
        description: 'Consolidated cut list with manual entry',
        path: '/toolbox/cut-list',
        ready: true,
        icon: ClipboardList,
      },
      {
        id: 'stair-rise-run',
        name: 'Stair Rise & Run',
        description: 'Calculate optimal rise and run dimensions',
        path: '/toolbox/stair-rise-run',
        ready: false,
      },
      {
        id: 'stair-headroom',
        name: 'Stairwell Opening',
        description: 'Calculate opening length for headroom compliance',
        path: '/toolbox/stair-headroom',
        ready: false,
      },
    ],
  },
  {
    id: 'layout',
    name: 'Layout',
    icon: LayoutGrid,
    color: 'bg-blue-100 text-blue-600',
    description: 'Tile layout, flooring patterns, centering',
    tools: [
      {
        id: 'tile-layout',
        name: 'Tile / Flooring Layout',
        description: 'Center tile pattern and calculate cuts',
        path: '/toolbox/tile-layout',
        ready: false,
      },
    ],
  },
  {
    id: 'materials',
    name: 'Materials',
    icon: PaintBucket,
    color: 'bg-green-100 text-green-600',
    description: 'Paint, drywall, roofing, siding quantities',
    tools: [
      {
        id: 'paint',
        name: 'Paint Calculator',
        description: 'Calculate paint coverage and quantities',
        path: '/toolbox/paint',
        ready: false,
      },
      {
        id: 'drywall',
        name: 'Drywall Calculator',
        description: 'Sheet count and associated materials',
        path: '/toolbox/drywall',
        ready: false,
      },
      {
        id: 'roofing',
        name: 'Roofing Calculator',
        description: 'Bundles, underlayment, accessories',
        path: '/toolbox/roofing',
        ready: false,
      },
    ],
  },
  {
    id: 'estimating',
    name: 'Estimating',
    icon: Calculator,
    color: 'bg-purple-100 text-purple-600',
    description: 'Time budgets, labor hours, project planning',
    tools: [
      {
        id: 'time-budget',
        name: 'Time Budget Calculator',
        description: 'Calculate labor hours by trade and task',
        path: '/time-budget',
        ready: true,
      },
    ],
  },
];

export function Toolbox() {
  const [expandedCategory, setExpandedCategory] = useState('framing');

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Wrench className="w-6 h-6 text-gray-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Toolbox</h1>
        </div>
        <p className="text-gray-600">
          Construction calculators for the job site. Quick, accurate, fraction-friendly.
        </p>
      </div>

      {/* Tool Categories */}
      <div className="space-y-4">
        {TOOL_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategory === category.id;

          return (
            <Card key={category.id} className="overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h2 className="font-semibold text-gray-900">{category.name}</h2>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>

              {/* Tools List */}
              {isExpanded && (
                <div className="border-t border-gray-100">
                  {category.tools.map((tool) => (
                    <Link
                      key={tool.id}
                      to={tool.ready ? tool.path : '#'}
                      className={`
                        block px-4 py-3 border-b border-gray-50 last:border-b-0
                        ${tool.ready
                          ? 'hover:bg-blue-50 cursor-pointer'
                          : 'opacity-50 cursor-not-allowed'
                        }
                      `}
                      onClick={(e) => !tool.ready && e.preventDefault()}
                    >
                      <div className="flex items-center justify-between">
                        <div className="ml-10">
                          <h3 className="font-medium text-gray-900">
                            {tool.name}
                            {!tool.ready && (
                              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                Coming Soon
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">{tool.description}</p>
                        </div>
                        {tool.ready && (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default Toolbox;
