import { useState, useMemo } from 'react';
import { Frame, Copy, ChevronDown, ChevronUp, Info, Plus, List } from 'lucide-react';
import {
  CalculatorCard,
  InputSection,
  InputRow,
  ResultsSection,
  CutListSection,
  WarningBanner,
  ActionBar,
  SelectInput,
  ToggleInput,
  FractionInput,
} from '../shared';
import {
  toFractionString,
  getLumberDimension,
} from '../../../lib/calculators/fractionUtils';
import { Button } from '../../ui';

/**
 * Window & Door Opening Framing Calculator
 *
 * Generates a complete cut list for framing a window or door rough opening:
 * - King studs
 * - Jack studs (trimmers)
 * - Header
 * - Top cripples
 * - Sill (windows only)
 * - Bottom cripples (windows only)
 */

// Opening type options
const OPENING_TYPES = [
  { value: 'window', label: 'Window' },
  { value: 'door', label: 'Door' },
  { value: 'pass-through', label: 'Pass-through / Cased Opening' },
];

// Header size options
const HEADER_SIZES = [
  { value: '2x6', label: '2×6 (5 1/2")' },
  { value: '2x8', label: '2×8 (7 1/4")' },
  { value: '2x10', label: '2×10 (9 1/4")' },
  { value: '2x12', label: '2×12 (11 1/4")' },
  { value: 'LVL-9.25', label: 'LVL 9 1/4"' },
  { value: 'LVL-11.25', label: 'LVL 11 1/4"' },
];

// Header type options
const HEADER_TYPES = [
  { value: 'built-up', label: 'Built-up (2× + ply)' },
  { value: 'solid', label: 'Solid (single)' },
  { value: 'lvl', label: 'LVL' },
];

// Stud material options
const STUD_MATERIALS = [
  { value: '2x4', label: '2×4' },
  { value: '2x6', label: '2×6' },
];

// Plate configuration
const PLATE_CONFIGS = [
  { value: 'double', label: 'Double top plate' },
  { value: 'single', label: 'Single top plate' },
];

// Stud spacing options
const STUD_SPACINGS = [
  { value: 16, label: '16" OC' },
  { value: 24, label: '24" OC' },
];

// Sill style options
const SILL_STYLES = [
  { value: 'flat', label: 'Flat (1 1/2")' },
  { value: 'double', label: 'Double flat (3")' },
  { value: 'sloped', label: 'Sloped' },
];

// Default values
const DEFAULTS = {
  openingType: 'window',
  openingTag: '', // e.g., "W1", "D2", "W-101"
  roWidth: 36, // 36"
  roHeight: 48, // 48"
  sillHeight: 36, // 36" AFF
  wallHeight: 97.125, // 97 1/8" (8' ceiling)
  headerSize: '2x10',
  headerType: 'built-up',
  topPlateConfig: 'double',
  studSpacing: 16,
  sillStyle: 'flat',
  slopedSillThickness: 2, // 2" thick sloped sill
  studMaterial: '2x4',
  headerTight: false,
  finishFloor: 0,
};

// Local storage key for saved cut list
const CUT_LIST_STORAGE_KEY = 'hooomz_framing_cut_list';

// Colors for framing diagram - wood tones
const DIAGRAM_COLORS = {
  wood: '#DEB887',
  woodDark: '#B8956E',
  woodLight: '#F5DEB3',
  king: '#C4A67C',
  jack: '#D4B896',
  header: '#E8C99B',
  cripple: '#BFA87A',
  sill: '#D4B896',
  plate: '#A89070',
  stroke: '#6B5B47',
  leaderLine: '#374151',
};

// Helper function to render a 3D lumber piece (isometric box)
function renderLumber(toIso, x, y, z, width, depth, height, fill) {
  const p1 = toIso(x, y, z);
  const p2 = toIso(x + width, y, z);
  const p3 = toIso(x + width, y + depth, z);
  const p5 = toIso(x, y, z + height);
  const p6 = toIso(x + width, y, z + height);
  const p7 = toIso(x + width, y + depth, z + height);
  const p8 = toIso(x, y + depth, z + height);

  const frontFace = `${p1.x},${p1.y} ${p2.x},${p2.y} ${p6.x},${p6.y} ${p5.x},${p5.y}`;
  const topFace = `${p5.x},${p5.y} ${p6.x},${p6.y} ${p7.x},${p7.y} ${p8.x},${p8.y}`;
  const sideFace = `${p2.x},${p2.y} ${p3.x},${p3.y} ${p7.x},${p7.y} ${p6.x},${p6.y}`;

  return (
    <g key={`lumber-${x}-${y}-${z}-${width}-${height}`}>
      <polygon points={frontFace} fill={fill || DIAGRAM_COLORS.wood} stroke={DIAGRAM_COLORS.stroke} strokeWidth="0.5" />
      <polygon points={topFace} fill={DIAGRAM_COLORS.woodLight} stroke={DIAGRAM_COLORS.stroke} strokeWidth="0.5" />
      <polygon points={sideFace} fill={DIAGRAM_COLORS.woodDark} stroke={DIAGRAM_COLORS.stroke} strokeWidth="0.5" />
    </g>
  );
}

// Helper function to render leader line with label
function renderLeaderLabel(fromX, fromY, toX, toY, text, align = 'left') {
  return (
    <g key={`label-${text}`}>
      <line x1={fromX} y1={fromY} x2={toX} y2={toY} stroke={DIAGRAM_COLORS.leaderLine} strokeWidth="1" />
      <circle cx={fromX} cy={fromY} r="2" fill={DIAGRAM_COLORS.leaderLine} />
      <text
        x={align === 'left' ? toX + 4 : toX - 4}
        y={toY + 1}
        className="text-[9px] font-medium fill-gray-700"
        textAnchor={align === 'left' ? 'start' : 'end'}
        dominantBaseline="middle"
      >
        {text}
      </text>
    </g>
  );
}

/**
 * SVG Isometric Framing Diagram Component
 * Shows a 3D-style view of the framing with labeled parts and leader lines
 * Similar to Family Handyman construction diagrams
 */
function FramingDiagram({ calculations, inputs }) {
  if (!calculations) return null;

  const {
    kingStudLength,
    jackStudLength,
    headerDepth,
    headerGap,
    topCrippleLength,
    bottomCrippleLength,
    headerTight,
    openingType,
  } = calculations;

  const { roWidth, topPlateConfig, sillStyle, slopedSillThickness } = inputs;

  // SVG dimensions
  const svgWidth = 450;
  const svgHeight = 380;

  // Isometric projection helpers (30-degree isometric)
  const isoAngle = Math.PI / 6;
  const cos30 = Math.cos(isoAngle);
  const sin30 = Math.sin(isoAngle);
  const scale = 2.2;
  const originX = 120;
  const originY = svgHeight - 50;

  const toIso = (x, y, z) => ({
    x: originX + (x * cos30 - y * cos30) * scale,
    y: originY - (x * sin30 + y * sin30 + z) * scale,
  });

  // Lumber dimensions
  const studW = 1.5;
  const studD = 3.5;
  const plateH = 1.5;
  const topPlateH = topPlateConfig === 'double' ? 3 : 1.5;
  const sillH = sillStyle === 'sloped' ? (slopedSillThickness || 2) : (sillStyle === 'double' ? 3 : 1.5);

  // Key positions
  const wallDepth = studD;
  const totalWidth = roWidth + studD * 4;

  const leftKingX = 0;
  const leftJackX = studD;
  const roStartX = leftJackX + studD;
  const roEndX = roStartX + roWidth;
  const rightJackX = roEndX;
  const rightKingX = rightJackX + studD;

  // Heights
  const bottomPlateZ = 0;
  const studStartZ = plateH;
  const jackTopZ = studStartZ + jackStudLength;
  const headerBottomZ = jackTopZ;
  const headerTopZ = headerBottomZ + headerDepth;
  const kingTopZ = studStartZ + kingStudLength;
  const topPlateZ = kingTopZ;
  const sillBottomZ = studStartZ + (bottomCrippleLength || 0);
  const sillTopZ = sillBottomZ + sillH;

  // RO indicator
  const roBottom = openingType === 'window' ? sillTopZ : studStartZ;
  const roTop = headerBottomZ;
  const bl = toIso(roStartX, 0, roBottom);
  const br = toIso(roEndX, 0, roBottom);
  const tr = toIso(roEndX, 0, roTop);
  const tl = toIso(roStartX, 0, roTop);

  // Label positions
  const topPlateLabel = toIso(totalWidth / 2, 0, topPlateZ + topPlateH / 2);
  const headerLabel = toIso(roStartX + roWidth / 2, 0, headerBottomZ + headerDepth / 2);
  const kingLabel = toIso(rightKingX + studD / 2, 0, studStartZ + kingStudLength * 0.6);
  const jackLabel = toIso(rightJackX + studD / 2, 0, studStartZ + jackStudLength * 0.5);
  const bottomPlateLabel = toIso(totalWidth * 0.7, 0, plateH / 2);
  const roMidZ = openingType === 'window' ? (sillTopZ + headerBottomZ) / 2 : (studStartZ + headerBottomZ) / 2;
  const roLabel = toIso(roStartX + roWidth / 2, 0, roMidZ);
  const sillLabel = toIso(roStartX + roWidth / 2, 0, sillBottomZ + sillH / 2);
  const crippleLabel = toIso(roStartX + roWidth * 0.3 + studD / 2, 0, studStartZ + (bottomCrippleLength || 1) / 2);
  const topCrippleLabel = toIso(roStartX + roWidth * 0.5, 0, headerTopZ + (topCrippleLength || 1) / 2);
  const fillerLabel = toIso(roStartX + roWidth / 2, 0, headerTopZ + (headerGap || 1) / 2);

  return (
    <div className="bg-gradient-to-b from-sky-50 to-gray-100 rounded-lg p-4 mb-4 overflow-hidden">
      <div className="text-xs font-medium text-gray-600 mb-2 text-center">
        Framing Assembly (Isometric View)
      </div>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full mx-auto" style={{ maxHeight: '400px' }}>
        {/* Bottom Plate */}
        {renderLumber(toIso, leftKingX, 0, bottomPlateZ, totalWidth, wallDepth, plateH, DIAGRAM_COLORS.plate)}

        {/* Top Plate(s) */}
        {renderLumber(toIso, leftKingX, 0, topPlateZ, totalWidth, wallDepth, topPlateH, DIAGRAM_COLORS.plate)}

        {/* Left King Stud */}
        {renderLumber(toIso, leftKingX, 0, studStartZ, studD, studW, kingStudLength, DIAGRAM_COLORS.king)}

        {/* Right King Stud */}
        {renderLumber(toIso, rightKingX, 0, studStartZ, studD, studW, kingStudLength, DIAGRAM_COLORS.king)}

        {/* Left Jack Stud */}
        {renderLumber(toIso, leftJackX, 0, studStartZ, studD, studW, jackStudLength, DIAGRAM_COLORS.jack)}

        {/* Right Jack Stud */}
        {renderLumber(toIso, rightJackX, 0, studStartZ, studD, studW, jackStudLength, DIAGRAM_COLORS.jack)}

        {/* Header */}
        {renderLumber(toIso, leftJackX, 0, headerBottomZ, roWidth + studD * 2, studW, headerDepth, DIAGRAM_COLORS.header)}

        {/* Header Filler (if tight) */}
        {headerTight && headerGap > 0 && renderLumber(toIso, leftJackX, 0, headerTopZ, roWidth + studD * 2, studW, headerGap, DIAGRAM_COLORS.wood)}

        {/* Top Cripples (if not tight) */}
        {!headerTight && topCrippleLength > 0 && (
          <>
            {renderLumber(toIso, roStartX + roWidth * 0.3, 0, headerTopZ, studD, studW, topCrippleLength, DIAGRAM_COLORS.cripple)}
            {renderLumber(toIso, roStartX + roWidth * 0.7 - studD, 0, headerTopZ, studD, studW, topCrippleLength, DIAGRAM_COLORS.cripple)}
          </>
        )}

        {/* Window-specific: Sill and bottom cripples */}
        {openingType === 'window' && (
          <>
            {renderLumber(toIso, roStartX, 0, sillBottomZ, roWidth, studW, sillH, DIAGRAM_COLORS.sill)}
            {bottomCrippleLength > 0 && (
              <>
                {renderLumber(toIso, roStartX + roWidth * 0.3, 0, studStartZ, studD, studW, bottomCrippleLength, DIAGRAM_COLORS.cripple)}
                {renderLumber(toIso, roStartX + roWidth * 0.7 - studD, 0, studStartZ, studD, studW, bottomCrippleLength, DIAGRAM_COLORS.cripple)}
              </>
            )}
          </>
        )}

        {/* Rough Opening indicator */}
        <polygon
          points={`${bl.x},${bl.y} ${br.x},${br.y} ${tr.x},${tr.y} ${tl.x},${tl.y}`}
          fill="rgba(254, 243, 199, 0.3)"
          stroke="#92400E"
          strokeWidth="1.5"
          strokeDasharray="6,3"
        />

        {/* Labels */}
        {renderLeaderLabel(topPlateLabel.x, topPlateLabel.y, topPlateLabel.x + 60, topPlateLabel.y - 30, topPlateConfig === 'double' ? 'DOUBLE TOP PLATE' : 'TOP PLATE')}
        {renderLeaderLabel(headerLabel.x, headerLabel.y, headerLabel.x + 80, headerLabel.y - 15, 'HEADER')}
        {renderLeaderLabel(kingLabel.x, kingLabel.y, kingLabel.x + 50, kingLabel.y + 20, 'KING STUD')}
        {renderLeaderLabel(jackLabel.x, jackLabel.y, jackLabel.x + 70, jackLabel.y + 40, 'JACK STUD (TRIMMER)')}
        {renderLeaderLabel(bottomPlateLabel.x, bottomPlateLabel.y, bottomPlateLabel.x + 50, bottomPlateLabel.y + 25, 'BOTTOM PLATE')}

        {/* RO label */}
        <text x={roLabel.x} y={roLabel.y} className="text-[10px] font-bold fill-amber-700" textAnchor="middle" dominantBaseline="middle">
          ROUGH OPENING
        </text>

        {/* Window labels */}
        {openingType === 'window' && (
          <>
            {renderLeaderLabel(sillLabel.x, sillLabel.y, sillLabel.x - 60, sillLabel.y + 10, sillStyle === 'sloped' ? 'SLOPED SILL' : (sillStyle === 'double' ? 'DOUBLE SILL' : 'SILL'), 'right')}
            {bottomCrippleLength > 0 && renderLeaderLabel(crippleLabel.x, crippleLabel.y, crippleLabel.x - 50, crippleLabel.y + 30, 'CRIPPLE STUDS', 'right')}
          </>
        )}

        {/* Top Cripples label */}
        {!headerTight && topCrippleLength > 0 && renderLeaderLabel(topCrippleLabel.x, topCrippleLabel.y, topCrippleLabel.x - 40, topCrippleLabel.y - 20, 'TOP CRIPPLES', 'right')}

        {/* Header Filler label */}
        {headerTight && headerGap > 0 && renderLeaderLabel(fillerLabel.x, fillerLabel.y, fillerLabel.x - 50, fillerLabel.y - 15, 'HEADER FILLER', 'right')}
      </svg>
    </div>
  );
}

/**
 * Collapsible section showing calculation rules and formulas
 */
function CalculationRules({ openingType, topPlateConfig }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const plateThickness = topPlateConfig === 'double' ? '3"' : '1½"';
  const plateDesc = topPlateConfig === 'double' ? 'double top plate' : 'single top plate';

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-charcoal">How Calculations Work</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 text-sm space-y-4 border-t border-gray-200 pt-4">
          {/* King Stud */}
          <div>
            <h4 className="font-medium text-charcoal mb-1">King Stud Length</h4>
            <p className="text-gray-700 font-mono text-xs bg-white px-2 py-1 rounded border border-gray-200 inline-block">
              Wall Height − Bottom Plate (1½") − Top Plate ({plateThickness})
            </p>
            <p className="text-xs text-gray-500 mt-1.5">
              Full-height studs on each side of the opening that run from bottom plate to {plateDesc}.
            </p>
          </div>

          {/* Jack Stud */}
          <div>
            <h4 className="font-medium text-charcoal mb-1">Jack Stud (Trimmer) Length</h4>
            {openingType === 'window' ? (
              <>
                <p className="text-gray-700 font-mono text-xs bg-white px-2 py-1 rounded border border-gray-200 inline-block">
                  Sill Height + RO Height + Sill Thickness − Bottom Plate (1½")
                </p>
                <p className="text-xs text-gray-500 mt-1.5">
                  Supports the header. For windows, measured from bottom plate to underside of header.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-700 font-mono text-xs bg-white px-2 py-1 rounded border border-gray-200 inline-block">
                  RO Height + Finish Floor Thickness
                </p>
                <p className="text-xs text-gray-500 mt-1.5">
                  For doors, measured from subfloor to underside of header. Add finish floor if door height is to finished floor.
                </p>
              </>
            )}
          </div>

          {/* Header */}
          <div>
            <h4 className="font-medium text-charcoal mb-1">Header Length</h4>
            <p className="text-gray-700 font-mono text-xs bg-white px-2 py-1 rounded border border-gray-200 inline-block">
              RO Width + (Jack Stud Width × 2 × Jacks per Side)
            </p>
            <p className="text-xs text-gray-500 mt-1.5">
              Header spans the opening and bears on jack studs. Built-up headers use two boards with ½" plywood spacer.
            </p>
          </div>

          {/* Top Cripples */}
          <div>
            <h4 className="font-medium text-charcoal mb-1">Top Cripple Length</h4>
            <p className="text-gray-700 font-mono text-xs bg-white px-2 py-1 rounded border border-gray-200 inline-block">
              King Stud Length − Jack Stud Length − Header Depth
            </p>
            <p className="text-xs text-gray-500 mt-1.5">
              Short studs between header and top plate. If running header tight, a flat filler piece is used instead.
            </p>
          </div>

          {/* Window-specific */}
          {openingType === 'window' && (
            <>
              <div>
                <h4 className="font-medium text-charcoal mb-1">Sill Length</h4>
                <p className="text-gray-700 font-mono text-xs bg-white px-2 py-1 rounded border border-gray-200 inline-block">
                  = RO Width
                </p>
                <p className="text-xs text-gray-500 mt-1.5">
                  Horizontal member at bottom of window opening. Sloped sills shed water; flat sills are easier to trim.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-charcoal mb-1">Bottom Cripple Length</h4>
                <p className="text-gray-700 font-mono text-xs bg-white px-2 py-1 rounded border border-gray-200 inline-block">
                  Sill Height − Bottom Plate (1½") − Sill Thickness
                </p>
                <p className="text-xs text-gray-500 mt-1.5">
                  Short studs between bottom plate and sill. Spaced at stud layout (16" or 24" OC).
                </p>
              </div>
            </>
          )}

          {/* Jack stud quantity rule */}
          <div className="pt-3 border-t border-gray-200">
            <h4 className="font-medium text-charcoal mb-2">Jack Stud Quantity Rules</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                Up to 6' span: 1 jack per side (2 total)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                6' to 8' span: 2 jacks per side (4 total)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                Over 8': Engineering required for header sizing
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// Load saved cut list from localStorage
function loadSavedCutList() {
  try {
    const saved = localStorage.getItem(CUT_LIST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Save cut list to localStorage
function saveCutListToStorage(list) {
  localStorage.setItem(CUT_LIST_STORAGE_KEY, JSON.stringify(list));
}

export function WindowDoorFraming() {
  // Input state
  const [inputs, setInputs] = useState(DEFAULTS);

  // Saved cut list (persisted across sessions)
  const [savedCutList, setSavedCutList] = useState(() => loadSavedCutList());
  const [showSavedList, setShowSavedList] = useState(false);

  // Update a single input
  const updateInput = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Calculate all framing members
  const calculations = useMemo(() => {
    const {
      openingType,
      roWidth,
      roHeight,
      sillHeight,
      wallHeight,
      headerSize,
      topPlateConfig,
      studSpacing,
      sillStyle,
      slopedSillThickness,
      studMaterial,
      headerTight,
      finishFloor,
    } = inputs;

    // Validate required inputs
    if (!roWidth || !roHeight || !wallHeight) {
      return null;
    }

    // Plate thicknesses
    const bottomPlateThickness = 1.5;
    const topPlateThickness = topPlateConfig === 'double' ? 3.0 : 1.5;

    // Header depth
    const headerDepth = getLumberDimension(headerSize, 'height');

    // Sill thickness (windows only)
    let sillThickness = 1.5;
    if (sillStyle === 'double') sillThickness = 3.0;
    if (sillStyle === 'sloped') sillThickness = slopedSillThickness || 2;

    // Stud width (for header length calculation)
    const studWidth = getLumberDimension(studMaterial, 'height');

    // Number of jacks per side (based on span)
    let jacksPerSide = 1;
    if (roWidth > 72) jacksPerSide = 2; // Over 6'
    if (roWidth > 96) jacksPerSide = 3; // Over 8' (should have engineering)

    // KING STUD LENGTH (full height between plates)
    const kingStudLength = wallHeight - bottomPlateThickness - topPlateThickness;

    // JACK STUD LENGTH
    let jackStudLength;
    if (openingType === 'window') {
      // Window: from bottom plate to header
      jackStudLength = sillHeight + roHeight + sillThickness - bottomPlateThickness;
    } else {
      // Door: from subfloor to bottom of header
      jackStudLength = roHeight + finishFloor;
    }

    // Ensure jack doesn't exceed king
    if (jackStudLength > kingStudLength) {
      jackStudLength = kingStudLength;
    }

    // HEADER LENGTH (spans between kings, bears on jacks)
    // Header length = RO width + (2 × jack width × number of jacks per side)
    const headerLength = roWidth + (studWidth * 2 * jacksPerSide);

    // Gap between header and top plate
    const headerGap = kingStudLength - jackStudLength - headerDepth;

    // TOP CRIPPLE LENGTH (only if not running header tight)
    let topCrippleLength = 0;
    if (!headerTight && headerGap > 0) {
      topCrippleLength = headerGap;
    }

    // TOP CRIPPLE QUANTITY (count studs at spacing within span)
    const topCrippleQty = topCrippleLength > 0
      ? Math.max(0, Math.floor((roWidth - studWidth) / studSpacing))
      : 0;

    // HEADER FILLER (flat piece on top of header when running tight)
    // Only needed when headerTight AND there's a gap to fill
    const headerFillerLength = headerTight && headerGap > 0 ? headerLength : 0;

    // SILL (windows only)
    const sillLength = openingType === 'window' ? roWidth : 0;

    // BOTTOM CRIPPLE LENGTH (windows only)
    let bottomCrippleLength = 0;
    if (openingType === 'window') {
      bottomCrippleLength = sillHeight - bottomPlateThickness - sillThickness;
      if (bottomCrippleLength < 0) bottomCrippleLength = 0;
    }

    // BOTTOM CRIPPLE QUANTITY
    const bottomCrippleQty = bottomCrippleLength > 0
      ? Math.max(0, Math.floor((roWidth - studWidth) / studSpacing))
      : 0;

    // Warnings
    const warnings = [];
    if (roWidth > 96) {
      warnings.push({
        type: 'warning',
        message: 'Span exceeds 8\'. Engineering may be required for header sizing.',
      });
    }
    if (headerTight && topCrippleLength > 2) {
      warnings.push({
        type: 'info',
        message: `Running header tight saves ${topCrippleQty} cripples (${toFractionString(topCrippleLength)} each).`,
      });
    }

    return {
      kingStudLength,
      jackStudLength,
      headerLength,
      headerDepth,
      headerGap,
      headerFillerLength,
      topCrippleLength,
      topCrippleQty,
      sillLength,
      sillThickness,
      bottomCrippleLength,
      bottomCrippleQty,
      jacksPerSide,
      studMaterial,
      headerSize,
      headerType: inputs.headerType,
      headerTight,
      sillStyle,
      openingType,
      warnings,
    };
  }, [inputs]);

  // Build cut list from calculations
  const cutList = useMemo(() => {
    if (!calculations) return [];

    const {
      kingStudLength,
      jackStudLength,
      headerLength,
      headerFillerLength,
      topCrippleLength,
      topCrippleQty,
      sillLength,
      bottomCrippleLength,
      bottomCrippleQty,
      jacksPerSide,
      studMaterial,
      headerSize,
      headerType,
      headerTight,
      sillStyle,
      openingType,
    } = calculations;

    const list = [];

    // King studs
    list.push({
      name: 'King Studs',
      length: toFractionString(kingStudLength),
      qty: 2,
      material: studMaterial,
    });

    // Jack studs
    list.push({
      name: 'Jack Studs',
      length: toFractionString(jackStudLength),
      qty: jacksPerSide * 2,
      material: studMaterial,
    });

    // Header
    const headerMaterial = headerType === 'built-up'
      ? `${headerSize} + 1/2" ply`
      : headerType === 'lvl'
        ? `LVL ${headerSize}`
        : headerSize;

    list.push({
      name: 'Header',
      length: toFractionString(headerLength),
      qty: headerType === 'built-up' ? 2 : 1,
      material: headerMaterial,
      highlight: true,
    });

    // Header filler (when running header tight to top plate)
    if (headerTight && headerFillerLength > 0) {
      list.push({
        name: 'Header Filler',
        length: toFractionString(headerFillerLength),
        qty: 1,
        material: studMaterial,
        note: 'Flat on top of header',
      });
    }

    // Top cripples
    if (topCrippleQty > 0 && topCrippleLength > 0) {
      list.push({
        name: 'Top Cripples',
        length: toFractionString(topCrippleLength),
        qty: topCrippleQty,
        material: studMaterial,
      });
    }

    // Sill (windows only)
    if (openingType === 'window' && sillLength > 0) {
      const sillQty = sillStyle === 'double' ? 2 : 1;
      const sillNote = sillStyle === 'sloped'
        ? `Sloped ${toFractionString(inputs.slopedSillThickness)} thick`
        : undefined;

      list.push({
        name: sillStyle === 'sloped' ? 'Sloped Sill' : 'Sill',
        length: toFractionString(sillLength),
        qty: sillQty,
        material: sillStyle === 'sloped' ? 'Custom' : studMaterial,
        note: sillNote,
      });
    }

    // Bottom cripples (windows only)
    if (openingType === 'window' && bottomCrippleQty > 0 && bottomCrippleLength > 0) {
      const crippleNote = sillStyle === 'sloped'
        ? 'Cut to fit under low point of slope'
        : undefined;

      list.push({
        name: 'Bottom Cripples',
        length: toFractionString(bottomCrippleLength),
        qty: bottomCrippleQty,
        material: studMaterial,
        note: crippleNote,
      });
    }

    return list;
  }, [calculations, inputs.slopedSillThickness]);

  // Copy cut list to clipboard
  const handleCopy = () => {
    if (!calculations) return;

    const {
      openingType,
      openingTag,
      roWidth,
      roHeight,
      sillHeight,
      wallHeight,
      headerSize,
      studMaterial,
      studSpacing,
    } = inputs;

    const tagDisplay = openingTag ? `${openingTag} - ` : '';
    let text = `${tagDisplay}${openingType.toUpperCase()} FRAMING CUT LIST\n`;
    text += '═'.repeat(50) + '\n';
    text += `Type: ${openingType.toUpperCase()}  |  RO: ${toFractionString(roWidth)} × ${toFractionString(roHeight)}`;
    if (openingType === 'window') {
      text += `  |  Sill: ${toFractionString(sillHeight)}`;
    }
    text += `\nWall: ${toFractionString(wallHeight)}  |  Header: ${headerSize}  |  Studs: ${studMaterial} @ ${studSpacing}" OC\n\n`;

    text += 'MEMBER              LENGTH          QTY     MATERIAL\n';
    text += '─'.repeat(50) + '\n';

    cutList.forEach(item => {
      const name = item.name.padEnd(20);
      const length = item.length.padEnd(16);
      const qty = String(item.qty).padEnd(8);
      text += `${name}${length}${qty}${item.material}\n`;
    });

    navigator.clipboard.writeText(text);
  };

  return (
    <CalculatorCard
      title="Window & Door Framing"
      icon={Frame}
      description="Generate cut list for rough opening framing"
    >
      {/* Opening Type & Dimensions */}
      <InputSection title="Opening">
        <InputRow>
          <SelectInput
            label="Opening Type"
            value={inputs.openingType}
            onChange={(v) => updateInput('openingType', v)}
            options={OPENING_TYPES}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Tag / Mark
            </label>
            <input
              type="text"
              value={inputs.openingTag}
              onChange={(e) => updateInput('openingTag', e.target.value.toUpperCase())}
              placeholder={inputs.openingType === 'window' ? 'W-101' : 'D-101'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal focus:ring-offset-1 hover:border-gray-400 bg-white"
            />
            <p className="text-xs text-gray-500">From plans/schedule</p>
          </div>
        </InputRow>

        <InputRow>
          <FractionInput
            label="Rough Opening Width"
            value={inputs.roWidth}
            onChange={(v) => updateInput('roWidth', v)}
            required
            placeholder='36"'
          />
          <FractionInput
            label="Rough Opening Height"
            value={inputs.roHeight}
            onChange={(v) => updateInput('roHeight', v)}
            required
            placeholder='48"'
          />
        </InputRow>

        {inputs.openingType === 'window' && (
          <FractionInput
            label="Sill Height (floor to bottom of RO)"
            value={inputs.sillHeight}
            onChange={(v) => updateInput('sillHeight', v)}
            placeholder='36"'
            helpText='Typical window sill height is 36" AFF'
          />
        )}

        {inputs.openingType !== 'window' && (
          <FractionInput
            label="Finish Floor Thickness"
            value={inputs.finishFloor}
            onChange={(v) => updateInput('finishFloor', v)}
            placeholder='0"'
            helpText="Add if door height is to finish floor"
          />
        )}
      </InputSection>

      {/* Wall Configuration */}
      <InputSection title="Wall">
        <InputRow>
          <FractionInput
            label="Wall Height"
            value={inputs.wallHeight}
            onChange={(v) => updateInput('wallHeight', v)}
            required
            placeholder='97 1/8"'
            helpText="Subfloor to top of top plate"
          />
          <SelectInput
            label="Stud Material"
            value={inputs.studMaterial}
            onChange={(v) => updateInput('studMaterial', v)}
            options={STUD_MATERIALS}
          />
        </InputRow>

        <InputRow>
          <SelectInput
            label="Top Plate"
            value={inputs.topPlateConfig}
            onChange={(v) => updateInput('topPlateConfig', v)}
            options={PLATE_CONFIGS}
          />
          <SelectInput
            label="Stud Spacing"
            value={inputs.studSpacing}
            onChange={(v) => updateInput('studSpacing', parseInt(v))}
            options={STUD_SPACINGS}
          />
        </InputRow>
      </InputSection>

      {/* Header Configuration */}
      <InputSection title="Header">
        <InputRow>
          <SelectInput
            label="Header Size"
            value={inputs.headerSize}
            onChange={(v) => updateInput('headerSize', v)}
            options={HEADER_SIZES}
          />
          <SelectInput
            label="Header Type"
            value={inputs.headerType}
            onChange={(v) => updateInput('headerType', v)}
            options={HEADER_TYPES}
          />
        </InputRow>

        <ToggleInput
          label="Run header tight to top plate"
          description="Adds filler instead of cripples"
          value={inputs.headerTight}
          onChange={(v) => updateInput('headerTight', v)}
        />
      </InputSection>

      {/* Sill Configuration (windows only) */}
      {inputs.openingType === 'window' && (
        <InputSection title="Sill">
          <SelectInput
            label="Sill Style"
            value={inputs.sillStyle}
            onChange={(v) => updateInput('sillStyle', v)}
            options={SILL_STYLES}
          />

          {inputs.sillStyle === 'sloped' && (
            <FractionInput
              label="Sloped Sill Thickness"
              value={inputs.slopedSillThickness}
              onChange={(v) => updateInput('slopedSillThickness', v)}
              placeholder='2"'
              helpText="Thickness at high point"
            />
          )}
        </InputSection>
      )}

      {/* Results */}
      {calculations && (
        <>
          {/* Calculation Rules */}
          <CalculationRules
            openingType={inputs.openingType}
            topPlateConfig={inputs.topPlateConfig}
          />

          {/* Warnings */}
          {calculations.warnings.map((warning, idx) => (
            <WarningBanner key={idx} type={warning.type}>
              {warning.message}
            </WarningBanner>
          ))}

          {/* Elevation Diagram */}
          <FramingDiagram calculations={calculations} inputs={inputs} />

          {/* Cut List */}
          <ResultsSection title="Cut List">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-500">
                {inputs.openingTag && <span className="font-semibold text-charcoal mr-2">{inputs.openingTag}</span>}
                {inputs.openingType.toUpperCase()} | RO: {toFractionString(inputs.roWidth)} × {toFractionString(inputs.roHeight)}
                {inputs.openingType === 'window' && ` | Sill: ${toFractionString(inputs.sillHeight)}`}
              </div>
              {savedCutList.length > 0 && (
                <button
                  onClick={() => setShowSavedList(!showSavedList)}
                  className="text-xs text-gray-500 hover:text-charcoal flex items-center gap-1"
                >
                  <List className="w-3.5 h-3.5" />
                  {savedCutList.length} saved
                </button>
              )}
            </div>
            <CutListSection items={cutList} title="" />
          </ResultsSection>

          {/* Saved Cut List */}
          {showSavedList && savedCutList.length > 0 && (
            <div className="bg-gray-50 -mx-4 px-4 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saved Openings ({savedCutList.length})
                </h3>
                <button
                  onClick={() => {
                    if (confirm('Clear all saved openings?')) {
                      setSavedCutList([]);
                      saveCutListToStorage([]);
                    }
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2">
                {savedCutList.map((saved, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 rounded-lg p-3 text-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-charcoal">
                        {saved.tag || `Opening ${idx + 1}`}
                      </span>
                      <button
                        onClick={() => {
                          const updated = savedCutList.filter((_, i) => i !== idx);
                          setSavedCutList(updated);
                          saveCutListToStorage(updated);
                        }}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {saved.type} | RO: {saved.roWidth} × {saved.roHeight}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {saved.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex justify-between text-gray-600">
                          <span>{item.name}</span>
                          <span className="font-mono">{item.qty}× {item.length}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <ActionBar>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newEntry = {
                  tag: inputs.openingTag || `${inputs.openingType.charAt(0).toUpperCase()}-${savedCutList.length + 1}`,
                  type: inputs.openingType,
                  roWidth: toFractionString(inputs.roWidth),
                  roHeight: toFractionString(inputs.roHeight),
                  items: cutList.map(item => ({
                    name: item.name,
                    length: item.length,
                    qty: item.qty,
                    material: item.material,
                  })),
                  timestamp: Date.now(),
                };
                const updated = [...savedCutList, newEntry];
                setSavedCutList(updated);
                saveCutListToStorage(updated);
                setShowSavedList(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to List
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </ActionBar>
        </>
      )}
    </CalculatorCard>
  );
}

export default WindowDoorFraming;
