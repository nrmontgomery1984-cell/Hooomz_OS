/**
 * Task Checklists Data
 * Auto-attached to tasks based on work category and stage
 * References Field Guide modules where available
 *
 * Structure:
 * - Each category has checklists for different task types/stages
 * - Each checklist has: tools, materials, process, photos
 */

// Field Guide module references for each category
export const FIELD_GUIDE_MODULES = {
  EL: ['EL-01', 'EL-02'], // Electrical
  PL: ['PL-01', 'PL-02'], // Plumbing
  DW: ['IF-01', 'IF-02'], // Drywall
  PT: ['IF-03'], // Painting
  TL: ['TI-01', 'TI-02', 'TI-03', 'TI-04', 'TI-05'], // Tile
  FR: ['FF-02', 'FF-03', 'FF-04'], // Framing
  FL: ['IF-06'], // Flooring
  FC: ['IF-04', 'IF-05'], // Finish Carpentry
  IN: ['EW-03'], // Insulation
  RF: ['EW-06', 'EW-07'], // Roofing
  EX: ['EW-05', 'EW-09'], // Exterior
  WD: ['EW-04', 'FF-06'], // Windows & Doors
  HV: ['HV-01', 'HV-02'], // HVAC
  CB: ['MW-01'], // Cabinetry
};

// ============================================================================
// ELECTRICAL CHECKLISTS
// ============================================================================
export const ELECTRICAL_CHECKLISTS = {
  'rough-in': {
    name: 'Electrical Rough-In',
    fieldGuideRef: 'EL-01',
    tools: [
      { id: 'el-t1', item: 'Voltage tester / Non-contact voltage detector', required: true },
      { id: 'el-t2', item: 'Wire strippers (14-10 AWG)', required: true },
      { id: 'el-t3', item: 'Lineman pliers', required: true },
      { id: 'el-t4', item: 'Side cutters / diagonal pliers', required: true },
      { id: 'el-t5', item: 'Screwdrivers (flat & Phillips)', required: true },
      { id: 'el-t6', item: 'Fish tape or wire pulling rods', required: false },
      { id: 'el-t7', item: 'Drill with hole saw kit', required: true },
      { id: 'el-t8', item: 'Stud finder', required: true },
      { id: 'el-t9', item: 'Level (torpedo and 4ft)', required: true },
      { id: 'el-t10', item: 'Tape measure', required: true },
      { id: 'el-t11', item: 'Marking pencil / Sharpie', required: true },
      { id: 'el-t12', item: 'Cable stapler', required: true },
    ],
    materials: [
      { id: 'el-m1', item: 'Romex NM-B wire (14/2, 12/2 as specified)', required: true },
      { id: 'el-m2', item: 'Electrical boxes (single, double, 4-square)', required: true },
      { id: 'el-m3', item: 'Box connectors / cable clamps', required: true },
      { id: 'el-m4', item: 'Wire nuts / push-in connectors', required: true },
      { id: 'el-m5', item: 'Cable staples', required: true },
      { id: 'el-m6', item: 'Nail plates (for stud protection)', required: true },
      { id: 'el-m7', item: 'Ground screws', required: true },
      { id: 'el-m8', item: 'Wire labels / circuit tags', required: false },
    ],
    process: [
      { id: 'el-p1', step: 'Review electrical plan and circuit layout', critical: true },
      { id: 'el-p2', step: 'Verify panel location and capacity', critical: true },
      { id: 'el-p3', step: 'Mark box locations per plan (outlets 12" AFF, switches 48" AFF)', critical: true },
      { id: 'el-p4', step: 'Install boxes at correct heights', critical: true },
      { id: 'el-p5', step: 'Drill holes for wire runs (center of studs)', critical: false },
      { id: 'el-p6', step: 'Run wire from panel to each box', critical: true },
      { id: 'el-p7', step: 'Staple wire within 12" of boxes and every 4.5ft', critical: true },
      { id: 'el-p8', step: 'Install nail plates where wire is within 1.25" of stud face', critical: true },
      { id: 'el-p9', step: 'Leave 6-8" of wire in each box', critical: true },
      { id: 'el-p10', step: 'Label all circuits at panel', critical: true },
      { id: 'el-p11', step: 'Request rough-in inspection', critical: true },
    ],
    photos: [
      { id: 'el-ph1', shot: 'Panel location with home runs visible', required: true },
      { id: 'el-ph2', shot: 'Each room showing all box locations', required: true },
      { id: 'el-ph3', shot: 'Nail plates installed on studs', required: true },
      { id: 'el-ph4', shot: 'Wire stapling pattern', required: false },
      { id: 'el-ph5', shot: 'Circuit labels at panel', required: true },
    ],
  },
  'trim': {
    name: 'Electrical Trim / Finish',
    fieldGuideRef: 'EL-02',
    tools: [
      { id: 'el-trim-t1', item: 'Voltage tester', required: true },
      { id: 'el-trim-t2', item: 'Wire strippers', required: true },
      { id: 'el-trim-t3', item: 'Screwdrivers (flat & Phillips)', required: true },
      { id: 'el-trim-t4', item: 'Level', required: true },
      { id: 'el-trim-t5', item: 'Receptacle tester', required: true },
    ],
    materials: [
      { id: 'el-trim-m1', item: 'Receptacles (15A/20A as specified)', required: true },
      { id: 'el-trim-m2', item: 'Switches (single pole, 3-way, dimmers)', required: true },
      { id: 'el-trim-m3', item: 'Cover plates', required: true },
      { id: 'el-trim-m4', item: 'Light fixtures', required: true },
      { id: 'el-trim-m5', item: 'Wire nuts', required: true },
      { id: 'el-trim-m6', item: 'GFCI receptacles (kitchens, baths, exterior)', required: true },
      { id: 'el-trim-m7', item: 'AFCI breakers (bedrooms)', required: true },
    ],
    process: [
      { id: 'el-trim-p1', step: 'Verify power is OFF at panel', critical: true },
      { id: 'el-trim-p2', step: 'Test for voltage with non-contact tester', critical: true },
      { id: 'el-trim-p3', step: 'Install receptacles - ground on bottom', critical: true },
      { id: 'el-trim-p4', step: 'Install switches - verify up = ON', critical: false },
      { id: 'el-trim-p5', step: 'Install GFCI in required locations', critical: true },
      { id: 'el-trim-p6', step: 'Connect and mount light fixtures', critical: true },
      { id: 'el-trim-p7', step: 'Install cover plates level and flush', critical: false },
      { id: 'el-trim-p8', step: 'Energize circuits and test all devices', critical: true },
      { id: 'el-trim-p9', step: 'Test GFCI trip and reset function', critical: true },
      { id: 'el-trim-p10', step: 'Update panel labels if needed', critical: true },
    ],
    photos: [
      { id: 'el-trim-ph1', shot: 'Completed receptacle installation', required: false },
      { id: 'el-trim-ph2', shot: 'GFCI locations in kitchen/bath', required: true },
      { id: 'el-trim-ph3', shot: 'Light fixtures installed', required: true },
      { id: 'el-trim-ph4', shot: 'Final panel with labels', required: true },
    ],
  },
};

// ============================================================================
// PLUMBING CHECKLISTS
// ============================================================================
export const PLUMBING_CHECKLISTS = {
  'rough-in': {
    name: 'Plumbing Rough-In',
    fieldGuideRef: 'PL-01',
    tools: [
      { id: 'pl-t1', item: 'Pipe cutter / hacksaw', required: true },
      { id: 'pl-t2', item: 'PEX crimping tool or expansion tool', required: true },
      { id: 'pl-t3', item: 'Deburring tool', required: true },
      { id: 'pl-t4', item: 'Pipe wrenches (various sizes)', required: true },
      { id: 'pl-t5', item: 'Adjustable wrench', required: true },
      { id: 'pl-t6', item: 'Level', required: true },
      { id: 'pl-t7', item: 'Drill with hole saw kit', required: true },
      { id: 'pl-t8', item: 'Tape measure', required: true },
      { id: 'pl-t9', item: 'Marking tools', required: true },
      { id: 'pl-t10', item: 'Pressure test gauge', required: true },
    ],
    materials: [
      { id: 'pl-m1', item: 'PEX tubing (1/2" and 3/4")', required: true },
      { id: 'pl-m2', item: 'PEX fittings and manifold', required: true },
      { id: 'pl-m3', item: 'Copper stub-outs', required: true },
      { id: 'pl-m4', item: 'ABS/PVC drain pipe (1.5", 2", 3", 4")', required: true },
      { id: 'pl-m5', item: 'Drain fittings (P-traps, wyes, elbows)', required: true },
      { id: 'pl-m6', item: 'ABS cement and primer', required: true },
      { id: 'pl-m7', item: 'Pipe straps and hangers', required: true },
      { id: 'pl-m8', item: 'Nail plates', required: true },
      { id: 'pl-m9', item: 'Test caps', required: true },
    ],
    process: [
      { id: 'pl-p1', step: 'Review plumbing plan and fixture locations', critical: true },
      { id: 'pl-p2', step: 'Locate main stack and drain routing', critical: true },
      { id: 'pl-p3', step: 'Install drain rough-in (maintain proper slope 1/4" per foot)', critical: true },
      { id: 'pl-p4', step: 'Install venting per code', critical: true },
      { id: 'pl-p5', step: 'Install water supply lines', critical: true },
      { id: 'pl-p6', step: 'Install stub-outs at fixture locations', critical: true },
      { id: 'pl-p7', step: 'Install nail plates where pipes are close to stud face', critical: true },
      { id: 'pl-p8', step: 'Pressure test water lines (40-80 PSI for 15 min)', critical: true },
      { id: 'pl-p9', step: 'Water test drains (fill and check for leaks)', critical: true },
      { id: 'pl-p10', step: 'Request rough-in inspection', critical: true },
    ],
    photos: [
      { id: 'pl-ph1', shot: 'Drain rough-in with slope visible', required: true },
      { id: 'pl-ph2', shot: 'Vent stack connections', required: true },
      { id: 'pl-ph3', shot: 'Water supply manifold', required: true },
      { id: 'pl-ph4', shot: 'Fixture stub-outs', required: true },
      { id: 'pl-ph5', shot: 'Pressure test gauge reading', required: true },
    ],
  },
  'fixtures': {
    name: 'Plumbing Fixtures & Trim',
    fieldGuideRef: 'PL-02',
    tools: [
      { id: 'pl-fix-t1', item: 'Basin wrench', required: true },
      { id: 'pl-fix-t2', item: 'Adjustable wrenches', required: true },
      { id: 'pl-fix-t3', item: 'Screwdrivers', required: true },
      { id: 'pl-fix-t4', item: 'Level', required: true },
      { id: 'pl-fix-t5', item: 'Caulk gun', required: true },
      { id: 'pl-fix-t6', item: 'Teflon tape', required: true },
    ],
    materials: [
      { id: 'pl-fix-m1', item: 'Fixtures (sinks, toilets, faucets)', required: true },
      { id: 'pl-fix-m2', item: 'Supply lines (braided stainless)', required: true },
      { id: 'pl-fix-m3', item: 'P-traps', required: true },
      { id: 'pl-fix-m4', item: 'Angle stops / shut-off valves', required: true },
      { id: 'pl-fix-m5', item: 'Wax ring / wax-free seal (toilets)', required: true },
      { id: 'pl-fix-m6', item: 'Silicone caulk', required: true },
      { id: 'pl-fix-m7', item: "Plumber's putty", required: true },
    ],
    process: [
      { id: 'pl-fix-p1', step: 'Install angle stops on supply stub-outs', critical: true },
      { id: 'pl-fix-p2', step: 'Set and secure toilet (level, caulk base)', critical: true },
      { id: 'pl-fix-p3', step: 'Install vanity/pedestal sink', critical: true },
      { id: 'pl-fix-p4', step: 'Connect faucets and supply lines', critical: true },
      { id: 'pl-fix-p5', step: 'Connect P-trap and drain', critical: true },
      { id: 'pl-fix-p6', step: 'Test for leaks under pressure', critical: true },
      { id: 'pl-fix-p7', step: 'Check drain flow and P-trap seal', critical: true },
      { id: 'pl-fix-p8', step: 'Caulk around fixtures as needed', critical: false },
    ],
    photos: [
      { id: 'pl-fix-ph1', shot: 'Installed fixtures', required: true },
      { id: 'pl-fix-ph2', shot: 'Under-sink connections', required: true },
      { id: 'pl-fix-ph3', shot: 'Toilet installation complete', required: true },
    ],
  },
};

// ============================================================================
// DRYWALL CHECKLISTS
// ============================================================================
export const DRYWALL_CHECKLISTS = {
  'hang': {
    name: 'Drywall Hanging',
    fieldGuideRef: 'IF-01',
    tools: [
      { id: 'dw-t1', item: 'Drywall lift (for ceilings)', required: true },
      { id: 'dw-t2', item: 'T-square (4ft)', required: true },
      { id: 'dw-t3', item: 'Utility knife with extra blades', required: true },
      { id: 'dw-t4', item: 'Drywall saw / jab saw', required: true },
      { id: 'dw-t5', item: 'Screw gun with depth setting', required: true },
      { id: 'dw-t6', item: 'Tape measure', required: true },
      { id: 'dw-t7', item: 'Chalk line', required: true },
      { id: 'dw-t8', item: 'Rasp / surform', required: false },
      { id: 'dw-t9', item: 'Drywall router (optional)', required: false },
    ],
    materials: [
      { id: 'dw-m1', item: 'Drywall sheets (1/2" or 5/8" as specified)', required: true },
      { id: 'dw-m2', item: 'Drywall screws (1-1/4" or 1-5/8")', required: true },
      { id: 'dw-m3', item: 'Corner bead (metal or paper-faced)', required: true },
      { id: 'dw-m4', item: 'J-bead / L-bead for edges', required: false },
    ],
    process: [
      { id: 'dw-p1', step: 'Verify all rough-ins complete and inspected', critical: true },
      { id: 'dw-p2', step: 'Plan layout to minimize butt joints', critical: true },
      { id: 'dw-p3', step: 'Hang ceiling sheets first, perpendicular to joists', critical: true },
      { id: 'dw-p4', step: 'Screw ceilings: 8" OC perimeter, 12" OC field', critical: true },
      { id: 'dw-p5', step: 'Float ceiling corners (screws 8" from wall)', critical: true },
      { id: 'dw-p6', step: 'Hang wall sheets horizontally, top first', critical: true },
      { id: 'dw-p7', step: 'Screw walls: 8" OC perimeter, 16" OC field', critical: true },
      { id: 'dw-p8', step: 'Leave 1/2" gap at floor', critical: true },
      { id: 'dw-p9', step: 'Cut outlets/boxes tight (1/8" max gap)', critical: true },
      { id: 'dw-p10', step: 'Install corner bead on outside corners', critical: true },
    ],
    photos: [
      { id: 'dw-ph1', shot: 'Ceiling drywall complete', required: true },
      { id: 'dw-ph2', shot: 'Wall drywall with staggered joints', required: true },
      { id: 'dw-ph3', shot: 'Electrical box cuts (showing tight fit)', required: true },
      { id: 'dw-ph4', shot: 'Corner bead installed', required: true },
    ],
  },
  'finish': {
    name: 'Drywall Taping & Finishing',
    fieldGuideRef: 'IF-02',
    tools: [
      { id: 'dw-fin-t1', item: 'Taping knives (6", 10", 12")', required: true },
      { id: 'dw-fin-t2', item: 'Mud pan', required: true },
      { id: 'dw-fin-t3', item: 'Corner trowel (inside)', required: true },
      { id: 'dw-fin-t4', item: 'Sanding pole with screen/paper', required: true },
      { id: 'dw-fin-t5', item: 'Work lights', required: true },
      { id: 'dw-fin-t6', item: 'Dust mask / respirator', required: true },
    ],
    materials: [
      { id: 'dw-fin-m1', item: 'Joint compound (all-purpose and/or setting)', required: true },
      { id: 'dw-fin-m2', item: 'Paper tape or mesh tape', required: true },
      { id: 'dw-fin-m3', item: 'Sanding screens (120-150 grit)', required: true },
      { id: 'dw-fin-m4', item: 'Primer (PVA drywall primer)', required: true },
    ],
    process: [
      { id: 'dw-fin-p1', step: 'Apply first coat on all joints, embedding tape', critical: true },
      { id: 'dw-fin-p2', step: 'Cover all screw heads with first coat', critical: true },
      { id: 'dw-fin-p3', step: 'First coat corner bead', critical: true },
      { id: 'dw-fin-p4', step: 'Let dry completely (12-24 hours)', critical: true },
      { id: 'dw-fin-p5', step: 'Apply second coat, feathering wider', critical: true },
      { id: 'dw-fin-p6', step: 'Let dry completely', critical: true },
      { id: 'dw-fin-p7', step: 'Apply third coat if needed, feather to 12"+ wide', critical: false },
      { id: 'dw-fin-p8', step: 'Sand smooth between coats and final', critical: true },
      { id: 'dw-fin-p9', step: 'Inspect with work light at oblique angle', critical: true },
      { id: 'dw-fin-p10', step: 'Prime all surfaces before paint', critical: true },
    ],
    photos: [
      { id: 'dw-fin-ph1', shot: 'First coat complete', required: false },
      { id: 'dw-fin-ph2', shot: 'Finished and sanded surfaces', required: true },
      { id: 'dw-fin-ph3', shot: 'Corners and transitions', required: true },
    ],
  },
};

// ============================================================================
// TILE CHECKLISTS
// ============================================================================
export const TILE_CHECKLISTS = {
  'floor': {
    name: 'Floor Tile Installation',
    fieldGuideRef: 'TI-02',
    tools: [
      { id: 'tl-t1', item: 'Tile wet saw', required: true },
      { id: 'tl-t2', item: 'Tile cutter (manual)', required: false },
      { id: 'tl-t3', item: 'Notched trowel (size per tile)', required: true },
      { id: 'tl-t4', item: 'Grout float', required: true },
      { id: 'tl-t5', item: 'Sponges and buckets', required: true },
      { id: 'tl-t6', item: 'Tile spacers', required: true },
      { id: 'tl-t7', item: 'Level (4ft and torpedo)', required: true },
      { id: 'tl-t8', item: 'Chalk line', required: true },
      { id: 'tl-t9', item: 'Knee pads', required: true },
      { id: 'tl-t10', item: 'Mixing drill and paddle', required: true },
    ],
    materials: [
      { id: 'tl-m1', item: 'Floor tiles (verify quantity + 10% extra)', required: true },
      { id: 'tl-m2', item: 'Thinset mortar (modified for floors)', required: true },
      { id: 'tl-m3', item: 'Grout (sanded for joints 1/8"+)', required: true },
      { id: 'tl-m4', item: 'Tile spacers (size as specified)', required: true },
      { id: 'tl-m5', item: 'Grout sealer', required: true },
      { id: 'tl-m6', item: 'Backer board (if substrate prep needed)', required: false },
    ],
    process: [
      { id: 'tl-p1', step: 'Verify substrate is flat, clean, and sound', critical: true },
      { id: 'tl-p2', step: 'Dry-lay tiles to plan layout and cuts', critical: true },
      { id: 'tl-p3', step: 'Snap chalk lines for reference', critical: true },
      { id: 'tl-p4', step: 'Mix thinset to proper consistency', critical: true },
      { id: 'tl-p5', step: 'Apply thinset with notched trowel', critical: true },
      { id: 'tl-p6', step: 'Set tiles with slight twist, use spacers', critical: true },
      { id: 'tl-p7', step: 'Check level frequently', critical: true },
      { id: 'tl-p8', step: 'Let thinset cure 24 hours', critical: true },
      { id: 'tl-p9', step: 'Apply grout, working into joints', critical: true },
      { id: 'tl-p10', step: 'Clean grout haze with damp sponge', critical: true },
      { id: 'tl-p11', step: 'Seal grout after curing (72 hours)', critical: true },
    ],
    photos: [
      { id: 'tl-ph1', shot: 'Substrate preparation complete', required: true },
      { id: 'tl-ph2', shot: 'Tile layout / dry-fit', required: false },
      { id: 'tl-ph3', shot: 'Thinset coverage (back-butter large tiles)', required: true },
      { id: 'tl-ph4', shot: 'Completed tile installation', required: true },
      { id: 'tl-ph5', shot: 'Grouted and cleaned', required: true },
    ],
  },
  'shower': {
    name: 'Shower Tile Installation',
    fieldGuideRef: 'TI-03',
    tools: [
      { id: 'tl-sh-t1', item: 'Tile wet saw with diamond blade', required: true },
      { id: 'tl-sh-t2', item: 'Notched trowel', required: true },
      { id: 'tl-sh-t3', item: 'Grout float', required: true },
      { id: 'tl-sh-t4', item: 'Level (multiple sizes)', required: true },
      { id: 'tl-sh-t5', item: 'Tile spacers', required: true },
      { id: 'tl-sh-t6', item: 'Sponges and buckets', required: true },
      { id: 'tl-sh-t7', item: 'Caulk gun', required: true },
    ],
    materials: [
      { id: 'tl-sh-m1', item: 'Wall tiles', required: true },
      { id: 'tl-sh-m2', item: 'Floor tiles (if applicable)', required: false },
      { id: 'tl-sh-m3', item: 'Cement board', required: true },
      { id: 'tl-sh-m4', item: 'Waterproof membrane (RedGard, Kerdi, etc.)', required: true },
      { id: 'tl-sh-m5', item: 'Thinset mortar (modified)', required: true },
      { id: 'tl-sh-m6', item: 'Unsanded grout (for 1/8" joints or less)', required: true },
      { id: 'tl-sh-m7', item: 'Silicone caulk (matching grout color)', required: true },
      { id: 'tl-sh-m8', item: 'Schluter or similar edge trim', required: false },
    ],
    process: [
      { id: 'tl-sh-p1', step: 'Install cement board on walls', critical: true },
      { id: 'tl-sh-p2', step: 'Apply waterproof membrane to all surfaces', critical: true },
      { id: 'tl-sh-p3', step: 'Verify shower pan slope (1/4" per foot to drain)', critical: true },
      { id: 'tl-sh-p4', step: 'Plan tile layout from center of back wall', critical: true },
      { id: 'tl-sh-p5', step: 'Set tiles from bottom up, using ledger board', critical: true },
      { id: 'tl-sh-p6', step: 'Back-butter tiles for full coverage', critical: true },
      { id: 'tl-sh-p7', step: 'Check level and plumb frequently', critical: true },
      { id: 'tl-sh-p8', step: 'Install floor tile last (after walls)', critical: false },
      { id: 'tl-sh-p9', step: 'Grout wall and floor (separate colors OK)', critical: true },
      { id: 'tl-sh-p10', step: 'Caulk all corners and floor/wall transitions', critical: true },
      { id: 'tl-sh-p11', step: 'Seal grout after curing', critical: true },
    ],
    photos: [
      { id: 'tl-sh-ph1', shot: 'Cement board installation', required: true },
      { id: 'tl-sh-ph2', shot: 'Waterproof membrane applied', required: true },
      { id: 'tl-sh-ph3', shot: 'Tile installation in progress', required: true },
      { id: 'tl-sh-ph4', shot: 'Completed shower with grout', required: true },
      { id: 'tl-sh-ph5', shot: 'Caulked corners and transitions', required: true },
    ],
  },
};

// ============================================================================
// FRAMING CHECKLISTS
// ============================================================================
export const FRAMING_CHECKLISTS = {
  'interior': {
    name: 'Interior Framing',
    fieldGuideRef: 'FF-03',
    tools: [
      { id: 'fr-t1', item: 'Framing hammer or nail gun', required: true },
      { id: 'fr-t2', item: 'Circular saw', required: true },
      { id: 'fr-t3', item: 'Speed square', required: true },
      { id: 'fr-t4', item: 'Level (4ft)', required: true },
      { id: 'fr-t5', item: 'Tape measure (25ft)', required: true },
      { id: 'fr-t6', item: 'Chalk line', required: true },
      { id: 'fr-t7', item: 'Sawhorses', required: true },
      { id: 'fr-t8', item: 'Pencil / marker', required: true },
    ],
    materials: [
      { id: 'fr-m1', item: '2x4 studs (or 2x6 as specified)', required: true },
      { id: 'fr-m2', item: 'Plates (top and bottom)', required: true },
      { id: 'fr-m3', item: 'Headers for openings', required: true },
      { id: 'fr-m4', item: 'Framing nails (16d)', required: true },
      { id: 'fr-m5', item: 'Blocking for cabinets/fixtures', required: true },
    ],
    process: [
      { id: 'fr-p1', step: 'Review plans for wall locations', critical: true },
      { id: 'fr-p2', step: 'Snap chalk lines on floor for plate locations', critical: true },
      { id: 'fr-p3', step: 'Mark stud layout (16" or 24" OC)', critical: true },
      { id: 'fr-p4', step: 'Cut and install bottom plate', critical: true },
      { id: 'fr-p5', step: 'Plumb and install top plate', critical: true },
      { id: 'fr-p6', step: 'Install king and jack studs at openings', critical: true },
      { id: 'fr-p7', step: 'Install headers at proper height', critical: true },
      { id: 'fr-p8', step: 'Install cripples above/below openings', critical: true },
      { id: 'fr-p9', step: 'Add blocking for cabinets, fixtures, etc.', critical: true },
      { id: 'fr-p10', step: 'Check all walls for plumb and square', critical: true },
    ],
    photos: [
      { id: 'fr-ph1', shot: 'Wall layout with chalk lines', required: false },
      { id: 'fr-ph2', shot: 'Framed walls showing stud spacing', required: true },
      { id: 'fr-ph3', shot: 'Headers and openings', required: true },
      { id: 'fr-ph4', shot: 'Blocking locations', required: true },
    ],
  },
};

// ============================================================================
// MASTER CATEGORY MAPPING
// ============================================================================
export const CATEGORY_CHECKLISTS = {
  EL: ELECTRICAL_CHECKLISTS,
  PL: PLUMBING_CHECKLISTS,
  DW: DRYWALL_CHECKLISTS,
  TL: TILE_CHECKLISTS,
  FR: FRAMING_CHECKLISTS,
};

// ============================================================================
// CHECKLIST LOOKUP FUNCTION
// ============================================================================

/**
 * Get the appropriate checklist for a task based on category and task name/type
 * @param {string} categoryCode - Work category code (EL, PL, DW, etc.)
 * @param {string} taskName - Task name to help determine which checklist
 * @param {string} stageCode - Stage code for additional context
 * @returns {Object|null} Checklist object with tools, materials, process, photos
 */
export function getChecklistForTask(categoryCode, taskName, stageCode) {
  const categoryChecklists = CATEGORY_CHECKLISTS[categoryCode];

  if (!categoryChecklists) {
    return null;
  }

  const taskNameLower = (taskName || '').toLowerCase();

  // Determine which specific checklist based on task name keywords
  let checklistKey = null;

  if (categoryCode === 'EL') {
    if (taskNameLower.includes('rough') || taskNameLower.includes('rough-in')) {
      checklistKey = 'rough-in';
    } else if (taskNameLower.includes('trim') || taskNameLower.includes('finish') || taskNameLower.includes('device')) {
      checklistKey = 'trim';
    } else if (stageCode === 'ST-RI') {
      checklistKey = 'rough-in';
    } else if (stageCode === 'ST-FX') {
      checklistKey = 'trim';
    }
  } else if (categoryCode === 'PL') {
    if (taskNameLower.includes('rough') || taskNameLower.includes('drain') || taskNameLower.includes('supply')) {
      checklistKey = 'rough-in';
    } else if (taskNameLower.includes('fixture') || taskNameLower.includes('install') || taskNameLower.includes('toilet') || taskNameLower.includes('faucet')) {
      checklistKey = 'fixtures';
    } else if (stageCode === 'ST-RI') {
      checklistKey = 'rough-in';
    } else if (stageCode === 'ST-FX') {
      checklistKey = 'fixtures';
    }
  } else if (categoryCode === 'DW') {
    if (taskNameLower.includes('hang') || taskNameLower.includes('install')) {
      checklistKey = 'hang';
    } else if (taskNameLower.includes('tape') || taskNameLower.includes('finish') || taskNameLower.includes('mud')) {
      checklistKey = 'finish';
    } else if (stageCode === 'ST-RI') {
      checklistKey = 'hang';
    } else if (stageCode === 'ST-FN') {
      checklistKey = 'finish';
    }
  } else if (categoryCode === 'TL') {
    if (taskNameLower.includes('shower') || taskNameLower.includes('tub')) {
      checklistKey = 'shower';
    } else if (taskNameLower.includes('floor') || taskNameLower.includes('bathroom')) {
      checklistKey = 'floor';
    } else {
      checklistKey = 'floor'; // Default to floor tile
    }
  } else if (categoryCode === 'FR') {
    checklistKey = 'interior'; // Currently only have interior framing
  }

  // Return the checklist or the first available one
  if (checklistKey && categoryChecklists[checklistKey]) {
    return categoryChecklists[checklistKey];
  }

  // Return first available checklist for this category
  const keys = Object.keys(categoryChecklists);
  return keys.length > 0 ? categoryChecklists[keys[0]] : null;
}

/**
 * Get Field Guide module references for a category
 * @param {string} categoryCode - Work category code
 * @returns {string[]} Array of module IDs
 */
export function getFieldGuideModules(categoryCode) {
  return FIELD_GUIDE_MODULES[categoryCode] || [];
}
