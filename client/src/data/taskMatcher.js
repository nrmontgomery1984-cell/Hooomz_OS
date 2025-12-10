/**
 * Smart Task Matcher
 * Auto-detects category, subcategory, and stage from task name/description
 * Also provides common task suggestions for autocomplete
 */

import { getChecklistForTask, getFieldGuideModules } from './taskChecklists';

// Common task patterns with their category/stage mappings
export const TASK_PATTERNS = [
  // Electrical - specific patterns first
  { pattern: /rough.*electric|electric.*rough|run.*wire|install.*box|wire.*run/i, categoryCode: 'EL', stageCode: 'ST-RO', subcategoryId: 'sub-el-rgh', name: 'Rough-In Electrical' },
  { pattern: /trim.*electric|electric.*trim|device|outlet|switch.*install|install.*switch/i, categoryCode: 'EL', stageCode: 'ST-FX', subcategoryId: 'sub-el-fin', name: 'Trim Electrical' },
  { pattern: /panel|service.*electric|electric.*service|breaker/i, categoryCode: 'EL', stageCode: 'ST-RO', subcategoryId: 'sub-el-svc', name: 'Electrical Service' },
  { pattern: /light.*install|install.*light|fixture.*install|install.*fixture/i, categoryCode: 'EL', stageCode: 'ST-FX', subcategoryId: 'sub-el-ltg', name: 'Install Lighting' },
  { pattern: /low.*voltage|network|data|cable.*run|smart.*home/i, categoryCode: 'EL', stageCode: 'ST-RO', subcategoryId: 'sub-el-low', name: 'Low Voltage Wiring' },
  // Catch-all electrical (at end of electrical section)
  { pattern: /\belectric/i, categoryCode: 'EL', stageCode: 'ST-RO', name: 'Electrical Work' },

  // Plumbing - specific patterns first
  { pattern: /rough.*plumb|plumb.*rough|supply.*line|drain.*line|pex|pipe.*run/i, categoryCode: 'PL', stageCode: 'ST-RO', subcategoryId: 'sub-pl-drn', name: 'Rough Plumbing' },
  { pattern: /toilet|sink.*install|install.*sink|faucet|vanity.*plumb|fixture.*plumb/i, categoryCode: 'PL', stageCode: 'ST-FX', subcategoryId: 'sub-pl-fix', name: 'Install Plumbing Fixtures' },
  { pattern: /water.*heater|main.*shut|service.*plumb|plumb.*service/i, categoryCode: 'PL', stageCode: 'ST-RO', subcategoryId: 'sub-pl-svc', name: 'Plumbing Service' },
  { pattern: /gas.*line|gas.*run/i, categoryCode: 'PL', stageCode: 'ST-RO', subcategoryId: 'sub-pl-gas', name: 'Gas Line' },
  // Catch-all plumbing
  { pattern: /\bplumb/i, categoryCode: 'PL', stageCode: 'ST-RO', name: 'Plumbing Work' },

  // Drywall - specific patterns first
  { pattern: /hang.*drywall|drywall.*hang|rock.*hang|board.*hang|install.*drywall/i, categoryCode: 'DW', stageCode: 'ST-DW', subcategoryId: 'sub-dw-hng', name: 'Hang Drywall' },
  { pattern: /tape.*drywall|drywall.*tape|mud|first.*coat|second.*coat/i, categoryCode: 'DW', stageCode: 'ST-DW', subcategoryId: 'sub-dw-tap', name: 'Tape & Mud Drywall' },
  { pattern: /sand.*drywall|drywall.*sand|finish.*drywall|drywall.*finish|texture/i, categoryCode: 'DW', stageCode: 'ST-DW', subcategoryId: 'sub-dw-fin', name: 'Finish Drywall' },
  // Catch-all drywall
  { pattern: /\bdrywall|sheetrock/i, categoryCode: 'DW', stageCode: 'ST-DW', name: 'Drywall Work' },

  // Framing - specific patterns first
  { pattern: /frame.*wall|wall.*frame|stud.*wall|interior.*frame|partition/i, categoryCode: 'FR', stageCode: 'ST-SS', subcategoryId: 'sub-fr-int', name: 'Frame Interior Walls' },
  { pattern: /frame.*ceiling|ceiling.*frame|soffit|fur.*out/i, categoryCode: 'FR', stageCode: 'ST-SS', subcategoryId: 'sub-fr-clg', name: 'Frame Ceiling' },
  { pattern: /header|structural.*frame|load.*bear/i, categoryCode: 'FR', stageCode: 'ST-SS', subcategoryId: 'sub-fr-str', name: 'Structural Framing' },
  // Catch-all framing
  { pattern: /\bframe|framing/i, categoryCode: 'FR', stageCode: 'ST-SS', name: 'Framing Work' },

  // Tile - specific patterns first
  { pattern: /floor.*tile|tile.*floor|install.*tile/i, categoryCode: 'TL', stageCode: 'ST-FN', subcategoryId: 'sub-tl-flr', name: 'Install Floor Tile' },
  { pattern: /wall.*tile|tile.*wall|tub.*surround/i, categoryCode: 'TL', stageCode: 'ST-FN', subcategoryId: 'sub-tl-wal', name: 'Install Wall Tile' },
  { pattern: /shower.*tile|tile.*shower/i, categoryCode: 'TL', stageCode: 'ST-FN', subcategoryId: 'sub-tl-shw', name: 'Tile Shower' },
  { pattern: /backsplash/i, categoryCode: 'TL', stageCode: 'ST-FN', subcategoryId: 'sub-tl-bsp', name: 'Install Backsplash' },
  // Catch-all tile
  { pattern: /\btile|tiling/i, categoryCode: 'TL', stageCode: 'ST-FN', name: 'Tile Work' },

  // Painting
  { pattern: /prime|primer/i, categoryCode: 'PT', stageCode: 'ST-PR', name: 'Prime Walls' },
  { pattern: /paint.*wall|wall.*paint|paint.*room|paint.*ceiling/i, categoryCode: 'PT', stageCode: 'ST-FN', name: 'Paint Walls' },
  { pattern: /paint.*trim|trim.*paint|paint.*door|door.*paint|paint.*casing/i, categoryCode: 'PT', stageCode: 'ST-FN', name: 'Paint Trim' },
  // Catch-all painting
  { pattern: /\bpaint/i, categoryCode: 'PT', stageCode: 'ST-FN', name: 'Painting' },

  // Flooring
  { pattern: /hardwood|wood.*floor|lvp|vinyl.*plank|laminate.*floor/i, categoryCode: 'FL', stageCode: 'ST-FN', name: 'Install Flooring' },
  { pattern: /carpet/i, categoryCode: 'FL', stageCode: 'ST-FN', name: 'Install Carpet' },
  // Catch-all flooring
  { pattern: /\bfloor/i, categoryCode: 'FL', stageCode: 'ST-FN', name: 'Flooring' },

  // Insulation
  { pattern: /insulate|insulation|batt|spray.*foam|blown.*in/i, categoryCode: 'IN', stageCode: 'ST-IS', name: 'Install Insulation' },

  // Windows & Doors
  { pattern: /install.*window|window.*install|replace.*window/i, categoryCode: 'WD', stageCode: 'ST-EW', name: 'Install Windows' },
  { pattern: /install.*door|door.*install|hang.*door/i, categoryCode: 'WD', stageCode: 'ST-FN', name: 'Install Doors' },
  { pattern: /trim.*door|door.*trim|casing/i, categoryCode: 'FC', stageCode: 'ST-FN', name: 'Trim Doors' },
  // Catch-all windows/doors
  { pattern: /\bwindow/i, categoryCode: 'WD', stageCode: 'ST-EW', name: 'Windows' },
  { pattern: /\bdoor/i, categoryCode: 'WD', stageCode: 'ST-FN', name: 'Doors' },

  // Cabinetry
  { pattern: /cabinet|install.*cabinet|cabinet.*install/i, categoryCode: 'CB', stageCode: 'ST-FN', name: 'Install Cabinets' },

  // Countertops
  { pattern: /counter|countertop|granite|quartz|marble.*top/i, categoryCode: 'CT', stageCode: 'ST-FN', name: 'Install Countertops' },

  // HVAC
  { pattern: /hvac|duct|furnace|ac.*unit|air.*condition|heat.*pump/i, categoryCode: 'HV', stageCode: 'ST-RO', name: 'HVAC Rough-In' },
  { pattern: /register|vent.*cover|thermostat/i, categoryCode: 'HV', stageCode: 'ST-FX', name: 'HVAC Trim' },

  // Finish Carpentry
  { pattern: /baseboard|base.*board|base.*mold/i, categoryCode: 'FC', stageCode: 'ST-FN', name: 'Install Baseboards' },
  { pattern: /crown.*mold|crown/i, categoryCode: 'FC', stageCode: 'ST-FN', name: 'Install Crown Molding' },
  { pattern: /shoe.*mold|quarter.*round/i, categoryCode: 'FC', stageCode: 'ST-FN', name: 'Install Shoe Molding' },
  { pattern: /closet.*shelf|shelving/i, categoryCode: 'FC', stageCode: 'ST-FN', name: 'Install Shelving' },
  // Catch-all finish carpentry
  { pattern: /\btrim|molding|moulding/i, categoryCode: 'FC', stageCode: 'ST-FN', name: 'Finish Carpentry' },

  // Fixtures
  { pattern: /towel.*bar|mirror.*mount|bath.*access|toilet.*paper/i, categoryCode: 'FX', stageCode: 'ST-FX', name: 'Install Bath Accessories' },
  { pattern: /hardware|cabinet.*pull|knob|handle/i, categoryCode: 'FX', stageCode: 'ST-FX', name: 'Install Hardware' },

  // Roofing
  { pattern: /roof|shingle/i, categoryCode: 'RF', stageCode: 'ST-EW', name: 'Roofing' },

  // Exterior
  { pattern: /siding/i, categoryCode: 'EX', stageCode: 'ST-EW', name: 'Install Siding' },
  { pattern: /gutter/i, categoryCode: 'EX', stageCode: 'ST-EW', name: 'Install Gutters' },
  // Catch-all exterior
  { pattern: /\bexterior/i, categoryCode: 'EX', stageCode: 'ST-EW', name: 'Exterior Work' },

  // Site Work
  { pattern: /demo|demolition|tear.*out|remove.*exist/i, categoryCode: 'SW', stageCode: 'ST-DM', name: 'Demolition' },
  { pattern: /excavat|dig|grade|grading/i, categoryCode: 'SW', stageCode: 'ST-SS', name: 'Site Work' },

  // Cleaning
  { pattern: /clean|final.*clean|punch.*list/i, categoryCode: 'CL', stageCode: 'ST-PL', name: 'Final Cleaning' },
];

// Common task suggestions for autocomplete
export const TASK_SUGGESTIONS = [
  // Electrical
  { name: 'Rough-In Electrical', categoryCode: 'EL', stageCode: 'ST-RO' },
  { name: 'Trim Electrical', categoryCode: 'EL', stageCode: 'ST-FX' },
  { name: 'Install Light Fixtures', categoryCode: 'EL', stageCode: 'ST-FX' },

  // Plumbing
  { name: 'Rough Plumbing', categoryCode: 'PL', stageCode: 'ST-RO' },
  { name: 'Install Toilet', categoryCode: 'PL', stageCode: 'ST-FX' },
  { name: 'Install Vanity & Faucet', categoryCode: 'PL', stageCode: 'ST-FX' },
  { name: 'Install Kitchen Sink', categoryCode: 'PL', stageCode: 'ST-FX' },

  // Drywall
  { name: 'Hang Drywall', categoryCode: 'DW', stageCode: 'ST-DW' },
  { name: 'Tape & Mud Drywall', categoryCode: 'DW', stageCode: 'ST-DW' },
  { name: 'Sand & Finish Drywall', categoryCode: 'DW', stageCode: 'ST-DW' },

  // Framing
  { name: 'Frame Interior Walls', categoryCode: 'FR', stageCode: 'ST-SS' },
  { name: 'Install Blocking', categoryCode: 'FR', stageCode: 'ST-SS' },

  // Tile
  { name: 'Install Floor Tile', categoryCode: 'TL', stageCode: 'ST-FN' },
  { name: 'Tile Shower', categoryCode: 'TL', stageCode: 'ST-FN' },
  { name: 'Install Backsplash', categoryCode: 'TL', stageCode: 'ST-FN' },

  // Painting
  { name: 'Prime Walls', categoryCode: 'PT', stageCode: 'ST-PR' },
  { name: 'Paint Walls', categoryCode: 'PT', stageCode: 'ST-FN' },
  { name: 'Paint Trim', categoryCode: 'PT', stageCode: 'ST-FN' },

  // Flooring
  { name: 'Install LVP Flooring', categoryCode: 'FL', stageCode: 'ST-FN' },
  { name: 'Install Hardwood', categoryCode: 'FL', stageCode: 'ST-FN' },

  // Insulation
  { name: 'Install Batt Insulation', categoryCode: 'IN', stageCode: 'ST-IS' },

  // Cabinetry
  { name: 'Install Kitchen Cabinets', categoryCode: 'CB', stageCode: 'ST-FN' },
  { name: 'Install Vanity Cabinet', categoryCode: 'CB', stageCode: 'ST-FN' },

  // Countertops
  { name: 'Install Countertops', categoryCode: 'CT', stageCode: 'ST-FN' },

  // Finish Carpentry
  { name: 'Install Baseboards', categoryCode: 'FC', stageCode: 'ST-FN' },
  { name: 'Install Crown Molding', categoryCode: 'FC', stageCode: 'ST-FN' },
  { name: 'Install Door Casing', categoryCode: 'FC', stageCode: 'ST-FN' },
  { name: 'Install Closet Shelving', categoryCode: 'FC', stageCode: 'ST-FN' },

  // Fixtures
  { name: 'Install Bath Accessories', categoryCode: 'FX', stageCode: 'ST-FX' },
  { name: 'Install Cabinet Hardware', categoryCode: 'FX', stageCode: 'ST-FX' },

  // HVAC
  { name: 'HVAC Rough-In', categoryCode: 'HV', stageCode: 'ST-RO' },

  // Windows & Doors
  { name: 'Install Interior Doors', categoryCode: 'WD', stageCode: 'ST-FN' },

  // Demo
  { name: 'Demolition', categoryCode: 'SW', stageCode: 'ST-DM' },

  // Cleaning
  { name: 'Final Cleaning', categoryCode: 'CL', stageCode: 'ST-PL' },
  { name: 'Punch List Items', categoryCode: 'CL', stageCode: 'ST-PL' },
];

/**
 * Match a task name to category, subcategory, and stage
 * @param {string} taskName - The task name/description
 * @returns {Object} - Matched task info or null
 */
export function matchTask(taskName) {
  if (!taskName || taskName.trim().length < 2) return null;

  const name = taskName.trim();

  // First try exact pattern matches
  for (const pattern of TASK_PATTERNS) {
    if (pattern.pattern.test(name)) {
      const checklist = getChecklistForTask(pattern.categoryCode, name, pattern.stageCode);
      const fieldGuideModules = getFieldGuideModules(pattern.categoryCode);

      return {
        name: name,
        categoryCode: pattern.categoryCode,
        stageCode: pattern.stageCode,
        subcategoryId: pattern.subcategoryId || null,
        suggestedName: pattern.name,
        checklist,
        fieldGuideModules,
        confidence: 'high',
      };
    }
  }

  // No match found - return null (user will need to pick manually)
  return null;
}

/**
 * Get autocomplete suggestions based on partial input
 * @param {string} input - Partial task name
 * @param {number} limit - Max suggestions to return
 * @returns {Array} - Matching suggestions
 */
export function getTaskSuggestions(input, limit = 10) {
  if (!input || input.trim().length < 1) {
    return TASK_SUGGESTIONS.slice(0, limit);
  }

  const searchTerm = input.toLowerCase().trim();

  // Score suggestions by relevance
  const scored = TASK_SUGGESTIONS.map(suggestion => {
    const name = suggestion.name.toLowerCase();
    let score = 0;

    // Exact match at start
    if (name.startsWith(searchTerm)) {
      score += 100;
    }
    // Word starts with search term
    else if (name.split(' ').some(word => word.startsWith(searchTerm))) {
      score += 50;
    }
    // Contains search term
    else if (name.includes(searchTerm)) {
      score += 25;
    }
    // Individual words match
    else {
      const searchWords = searchTerm.split(' ');
      searchWords.forEach(word => {
        if (word.length > 1 && name.includes(word)) {
          score += 10;
        }
      });
    }

    return { ...suggestion, score };
  });

  // Filter and sort by score
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get default stage for a category
 * @param {string} categoryCode - Category code
 * @returns {string} - Default stage code
 */
export function getDefaultStageForCategory(categoryCode) {
  const categoryStageDefaults = {
    'SW': 'ST-DM',
    'FN': 'ST-SS',
    'FR': 'ST-SS',
    'RF': 'ST-EW',
    'EX': 'ST-EW',
    'WD': 'ST-FN',
    'IN': 'ST-IS',
    'EL': 'ST-RO',
    'PL': 'ST-RO',
    'HV': 'ST-RO',
    'DW': 'ST-DW',
    'PT': 'ST-FN',
    'FL': 'ST-FN',
    'TL': 'ST-FN',
    'FC': 'ST-FN',
    'CB': 'ST-FN',
    'CT': 'ST-FN',
    'FX': 'ST-FX',
    'CL': 'ST-PL',
  };

  return categoryStageDefaults[categoryCode] || 'ST-FN';
}
