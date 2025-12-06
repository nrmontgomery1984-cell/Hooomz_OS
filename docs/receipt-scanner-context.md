# Receipt Scanner Feature - Context Document

This document provides all the context needed to implement a receipt scanning feature that extracts material data and adds it to the Hooomz Cost Catalogue.

---

## 1. Project Overview

**Hooomz** is a construction project management application for residential contractors. The **Cost Catalogue** is a central pricing database that stores:

- **Labor Rates** - Hourly and piece-work rates by trade (Electrical, Plumbing, etc.)
- **Materials** - Individual items with name, unit, cost, supplier, and category
- **Assemblies** - Bundled labor + materials for common tasks

The goal is to add a feature that allows contractors to:
1. Take a photo of a receipt (from Home Depot, Lowes, local lumber yards, etc.)
2. Extract material items, quantities, and prices using AI/OCR
3. Review and edit the extracted data
4. Add items to the Cost Catalogue (updating existing items or adding new ones)

---

## 2. Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React hooks (useState, useEffect, useMemo)
- **Storage**: localStorage (no backend yet)
- **UI Components**: Custom components in `client/src/components/ui/`

---

## 3. Cost Catalogue Data Structures

### 3.1 Material Item Structure

```javascript
{
  id: 'lbr-2x4-8',           // Unique ID (string)
  category: 'lumber',         // Category ID (see MATERIAL_CATEGORIES)
  name: '2x4x8 SPF Stud',    // Display name
  unit: 'each',               // Unit of measure: 'each', 'sqft', 'lnft', 'bundle', 'roll', 'gallon', etc.
  unitCost: 4.25,            // Cost per unit (CAD)
  supplier: 'Home Depot'      // Optional supplier name
}
```

### 3.2 Material Categories

```javascript
const MATERIAL_CATEGORIES = [
  { id: 'lumber', name: 'Lumber & Framing' },
  { id: 'drywall', name: 'Drywall & Finishing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'hvac', name: 'HVAC' },
  { id: 'roofing', name: 'Roofing' },
  { id: 'insulation', name: 'Insulation' },
  { id: 'flooring', name: 'Flooring' },
  { id: 'tile', name: 'Tile & Stone' },
  { id: 'paint', name: 'Paint & Finishes' },
  { id: 'cabinets', name: 'Cabinets & Counters' },
  { id: 'doors_windows', name: 'Doors & Windows' },
  { id: 'trim', name: 'Trim & Molding' },
  { id: 'hardware', name: 'Hardware & Fasteners' },
  { id: 'exterior', name: 'Exterior & Siding' },
  { id: 'fixtures', name: 'Fixtures & Appliances' },
];
```

### 3.3 Existing Materials Examples

The catalogue already has ~300 materials. Here are some examples by category:

**Lumber:**
- `2x4x8 SPF Stud` - each - $4.25
- `OSB Sheathing 7/16" 4x8` - sheet - $32.00
- `Plywood 3/4" Subfloor 4x8` - sheet - $55.00

**Electrical:**
- `NMD90 14/2 Wire` - 75m roll - $85.00
- `Outlet - Standard 15A` - each - $3.50
- `GFCI Outlet` - each - $25.00
- `Pot Light 4" LED` - each - $18.00

**Plumbing:**
- `PEX Pipe 1/2"` - 100ft - $45.00
- `Toilet - Standard` - each - $250.00
- `Kitchen Faucet - Mid` - each - $175.00

**Paint:**
- `Primer - Interior` - gallon - $35.00
- `Paint - Eggshell Walls` - gallon - $55.00

---

## 4. Storage Functions

Located in: `client/src/lib/costCatalogue.js`

```javascript
// Load all catalogue data
loadCatalogueData()
// Returns: { laborRates, materials, assemblies, suppliers }

// Save materials array
saveMaterials(materials)
// Input: Array of material objects

// Storage keys used:
const STORAGE_KEYS = {
  MATERIALS: 'hooomz_materials',
  // ... others
};
```

---

## 5. Current Import/Export Feature

The Cost Catalogue already has JSON import/export. Here's the export format:

```javascript
{
  "version": "1.0",
  "exportedAt": "2024-12-02T...",
  "laborRates": { ... },
  "materials": [ ... ],
  "assemblies": [ ... ]
}
```

---

## 6. Relevant UI Patterns

### 6.1 Page Structure
Pages are in `client/src/pages/`. The Cost Catalogue is at `CostCatalogue.jsx`.

### 6.2 Common UI Components
Located in `client/src/components/ui/`:
- `Button` - Primary action buttons
- `Input` - Text inputs
- `Select` - Dropdown selects
- `Modal` - Dialog modals
- `Card` - Content containers

### 6.3 Edit Mode Pattern
The Cost Catalogue has three edit modes:
- **VIEW** - Read-only
- **QUICK** - Temporary edits
- **TEMPLATE** - Permanent edits saved to localStorage

---

## 7. Feature Requirements

### 7.1 Receipt Capture Options
1. **Camera capture** - Use device camera (mobile)
2. **File upload** - Upload image file (desktop/mobile)
3. **Drag & drop** - Drop image onto upload area

### 7.2 AI Extraction Requirements
The AI should extract:
- **Item name** - The material/product name
- **Quantity** - Number purchased
- **Unit price** - Price per unit
- **Total price** - Line total (for verification)
- **SKU/Item number** - If visible (helpful for matching)

### 7.3 Matching Logic
When items are extracted:
1. **Exact match** - If item name/SKU matches existing material, offer to update price
2. **Fuzzy match** - If similar item exists, suggest it as a match
3. **New item** - If no match, allow creating new material

### 7.4 Review Interface
Before adding to catalogue, user should see:
- List of extracted items
- Match status (existing/new)
- Editable fields (name, category, unit, price)
- Option to skip individual items
- Bulk "Add All" action

### 7.5 Category Auto-Detection
Based on item name, suggest category:
- "2x4", "lumber", "plywood", "OSB" → lumber
- "wire", "outlet", "switch", "breaker" → electrical
- "PEX", "pipe", "faucet", "toilet" → plumbing
- "paint", "primer", "stain" → paint
- etc.

---

## 8. Suggested Implementation Approach

### 8.1 New Files to Create
```
client/src/
├── components/
│   └── receipt/
│       ├── ReceiptScanner.jsx      # Main scanner component
│       ├── ReceiptUploader.jsx     # Camera/file upload UI
│       ├── ReceiptPreview.jsx      # Show captured image
│       ├── ExtractedItemsList.jsx  # List of extracted items
│       └── ItemMatchCard.jsx       # Individual item review card
└── lib/
    └── receiptParser.js            # Parsing/matching logic
```

### 8.2 Integration Points
1. Add "Scan Receipt" button to CostCatalogue.jsx header (next to Import/Export)
2. Open ReceiptScanner in a modal
3. On completion, refresh catalogue data

### 8.3 AI Integration Options

**Option A: Claude Vision API**
- Send image directly to Claude
- Use structured prompt to extract data
- Return JSON with items

**Option B: OCR + Claude**
- Use OCR service (Tesseract, Google Vision) to extract text
- Send text to Claude for parsing/structuring

**Option C: Third-party receipt API**
- Services like Veryfi, Taggun, or Mindee
- Pre-built receipt parsing

### 8.4 Suggested Claude Prompt for Extraction

```
You are analyzing a construction supply store receipt. Extract all material items with:
- name: Full product name
- sku: Item/SKU number if visible
- quantity: Number purchased
- unitPrice: Price per unit
- totalPrice: Line total
- suggestedCategory: One of [lumber, drywall, electrical, plumbing, hvac, roofing, insulation, flooring, tile, paint, cabinets, doors_windows, trim, hardware, exterior, fixtures]
- suggestedUnit: One of [each, sqft, lnft, bundle, roll, gallon, sheet, box, bag, pack]

Return as JSON array. Skip tax lines, subtotals, and non-material items.
```

---

## 9. Sample Receipt Data

Here's what a typical receipt might look like:

```
HOME DEPOT #1234
123 Main Street
Moncton, NB

Date: 12/02/2024

2X4X8 STUD SPF          4   @  4.25    17.00
2X6X10 SPF              2   @  8.25    16.50
ROMEX 14/2 75M          1   @ 85.00    85.00
GFCI OUTLET 15A         3   @ 24.97    74.91
POT LIGHT 4IN LED       6   @ 17.99   107.94
DRYWALL 1/2 4X8         10  @ 13.99   139.90
JOINT COMPOUND BOX      2   @ 17.99    35.98

                      SUBTOTAL:  477.23
                           TAX:   61.04
                         TOTAL:  538.27
```

Expected extraction:
```json
[
  {
    "name": "2X4X8 STUD SPF",
    "quantity": 4,
    "unitPrice": 4.25,
    "totalPrice": 17.00,
    "suggestedCategory": "lumber",
    "suggestedUnit": "each"
  },
  {
    "name": "2X6X10 SPF",
    "quantity": 2,
    "unitPrice": 8.25,
    "totalPrice": 16.50,
    "suggestedCategory": "lumber",
    "suggestedUnit": "each"
  },
  // ... etc
]
```

---

## 10. UI/UX Considerations

### 10.1 Mobile-First
- Large tap targets for camera capture
- Full-screen preview on mobile
- Easy swipe to dismiss items

### 10.2 Error Handling
- Blurry image detection
- Partial extraction recovery
- Manual entry fallback

### 10.3 Price Update Logic
When updating existing material prices:
- Show old price vs new price
- Calculate % change
- Option to keep old price
- Track last updated date

---

## 11. Files to Reference

When implementing, these existing files are useful references:

1. **`client/src/pages/CostCatalogue.jsx`** (1407 lines)
   - Full Cost Catalogue page implementation
   - Import/export patterns
   - Edit mode handling
   - Material CRUD operations

2. **`client/src/lib/costCatalogue.js`** (1039 lines)
   - Data structures (MATERIAL_CATEGORIES, DEFAULT_MATERIALS)
   - Storage functions (loadCatalogueData, saveMaterials)
   - Helper functions

3. **`client/src/components/ui/Modal.jsx`**
   - Modal dialog pattern

4. **`client/src/components/ui/Button.jsx`**
   - Button styling

---

## 12. Success Criteria

The feature is complete when:
1. User can capture/upload receipt image
2. AI extracts material items with >80% accuracy
3. User can review, edit, and approve items
4. Items are saved to Cost Catalogue
5. Existing items can be updated with new prices
6. Works on both mobile and desktop
7. Graceful error handling for failed extractions

---

## 13. Future Enhancements (Out of Scope)

- Receipt history/archive
- Multi-receipt batch processing
- Supplier auto-detection
- Price trend tracking
- Integration with accounting software
- Purchase order matching
