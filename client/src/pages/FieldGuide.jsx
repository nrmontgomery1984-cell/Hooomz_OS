import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, CheckCircle } from 'lucide-react';
import { Card, Input } from '../components/ui';
import { ModuleCard, ModuleViewer } from '../components/fieldguide';

// List of complete modules (larger file size indicates complete content)
const COMPLETE_MODULES = [
  'OH-01', 'OH-02', 'OH-03', 'OH-04', 'OH-05',
  'FF-01', 'FF-02', 'FF-03', 'FF-04', 'FF-05', 'FF-06', 'FF-07', 'FF-08',
  'EW-01', 'EW-02', 'EW-03', 'EW-04', 'EW-05', 'EW-06', 'EW-07', 'EW-08', 'EW-09', 'EW-10', 'EW-11',
  'IF-01', 'IF-02', 'IF-03', 'IF-04', 'IF-05', 'IF-06', 'IF-07'
];

const CATEGORY_ORDER = [
  'Safety & Compliance',
  'Framing & Structure',
  'Exterior & Weather',
  'Interior Finish',
  'Tile'
];

export function FieldGuide() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      // Load all module JSON files
      const moduleFiles = [
        'OH-01_site-safety-ppe.json',
        'OH-02_tool-safety-maintenance.json',
        'OH-03_material-handling-storage.json',
        'OH-04_site-preparation-layout.json',
        'OH-05_waste-management-cleanup.json',
        'FF-01_foundation-systems.json',
        'FF-02_floor-framing.json',
        'FF-03_wall-framing.json',
        'FF-04_ceiling-roof-framing.json',
        'FF-05_structural-connections.json',
        'FF-06_window-door-framing.json',
        'FF-07_stairs-railings.json',
        'FF-08_structural-repairs-reinforcement.json',
        'EW-01_building-science-fundamentals.json',
        'EW-02_air-sealing-vapor-barriers.json',
        'EW-03_insulation-installation.json',
        'EW-04_window-door-installation.json',
        'EW-05_exterior-trim-cladding-prep.json',
        'EW-06_roofing-systems.json',
        'EW-07_flat-roof-systems.json',
        'EW-08_eavestroughs-drainage.json',
        'EW-09_exterior-weatherproofing-repairs.json',
        'EW-10_foundation-waterproofing.json',
        'EW-11_exterior-drainage-systems.json',
        'IF-01_drywall-installation.json',
        'IF-02_drywall-finishing.json',
        'IF-03_interior-painting.json',
        'IF-04_trim-carpentry-baseboard-casing.json',
        'IF-05_crown-moulding-advanced-trim.json',
        'IF-06_flooring-installation.json',
        'IF-07_interior-doors-trim-overview.json',
        'TI-01_wall-tile-installation.json',
        'TI-02_floor-tile-installation.json',
        'TI-03_shower-tile-installation.json',
        'TI-04_backsplash-installation.json',
        'TI-05_tile-repair-maintenance.json',
      ];

      const loadedModules = await Promise.all(
        moduleFiles.map(async (file) => {
          try {
            const res = await fetch(`/modules/${file}`);
            if (!res.ok) return null;
            return await res.json();
          } catch {
            return null;
          }
        })
      );

      const validModules = loadedModules.filter(m => m !== null);
      setModules(validModules);
      setLoading(false);
    } catch (err) {
      setError('Failed to load modules');
      setLoading(false);
    }
  };

  const categories = [...new Set(modules.map(m => m.category))].sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a);
    const bIndex = CATEGORY_ORDER.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const filteredModules = modules.filter(m => {
    const matchesSearch = searchQuery === '' ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedModules = filteredModules.reduce((acc, module) => {
    const cat = module.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(module);
    return acc;
  }, {});

  const completeCount = modules.filter(m => COMPLETE_MODULES.includes(m.id)).length;

  if (selectedModule) {
    return (
      <ModuleViewer
        module={selectedModule}
        onBack={() => setSelectedModule(null)}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
          <BookOpen className="w-7 h-7" />
          Field Guide
        </h1>
        <p className="text-gray-500 mt-1">
          NB Zone 6 Construction Training Modules
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-charcoal">{modules.length}</div>
          <div className="text-sm text-gray-500">Total Modules</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{completeCount}</div>
          <div className="text-sm text-gray-500">Ready to Study</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-amber-600">{modules.length - completeCount}</div>
          <div className="text-sm text-gray-500">Coming Soon</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
          <div className="text-sm text-gray-500">Categories</div>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-charcoal"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          Loading modules...
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500">
          {error}
        </div>
      )}

      {/* Module Grid by Category */}
      {!loading && !error && (
        <div className="space-y-8">
          {CATEGORY_ORDER.filter(cat => groupedModules[cat]).map(category => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                {category}
                <span className="text-sm font-normal text-gray-400">
                  ({groupedModules[category].length} modules)
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedModules[category]
                  .sort((a, b) => a.id.localeCompare(b.id))
                  .map(module => {
                    const isComplete = COMPLETE_MODULES.includes(module.id);
                    return (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        isComplete={false}
                        isLocked={!isComplete}
                        onClick={() => isComplete && setSelectedModule(module)}
                      />
                    );
                  })}
              </div>
            </div>
          ))}

          {/* Other categories not in CATEGORY_ORDER */}
          {Object.keys(groupedModules)
            .filter(cat => !CATEGORY_ORDER.includes(cat))
            .map(category => (
              <div key={category}>
                <h2 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                  {category}
                  <span className="text-sm font-normal text-gray-400">
                    ({groupedModules[category].length} modules)
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedModules[category]
                    .sort((a, b) => a.id.localeCompare(b.id))
                    .map(module => {
                      const isComplete = COMPLETE_MODULES.includes(module.id);
                      return (
                        <ModuleCard
                          key={module.id}
                          module={module}
                          isComplete={false}
                          isLocked={!isComplete}
                          onClick={() => isComplete && setSelectedModule(module)}
                        />
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
