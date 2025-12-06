# Hooomz Field Guide

Training modules for residential construction, organized by phase and trade.

## Structure

```
hooomz-field-guide/
├── README.md
├── schema/
│   └── module.schema.json      # JSON Schema for validation
├── types/
│   └── module.ts               # TypeScript interfaces
├── modules/
│   ├── phase-1-overhead/       # Safety, tools, site prep
│   ├── phase-2-foundation-framing/  # Structural work
│   ├── phase-3-exterior-weather/    # Envelope, insulation, roofing
│   ├── phase-4-interior-finish/     # Drywall, paint, trim, flooring
│   └── phase-5-tile-advanced/       # Tile work
└── index/
    └── modules.index.json      # Master index of all modules
```

## Module ID Convention

- `OH-XX` - Overhead (Phase 1)
- `FF-XX` - Foundation & Framing (Phase 2)
- `EW-XX` - Exterior & Weather (Phase 3)
- `IF-XX` - Interior Finish (Phase 4)
- `TI-XX` - Tile (Phase 5)

## Skill Levels

- **Apprentice** - Entry level, learning fundamentals
- **Journeyman** - Experienced, can work independently
- **Certified Professional** - Expert level, can train others

## Priority Levels

- **5** - Critical safety or code compliance
- **4** - High importance, core skills
- **3** - Standard knowledge
- **2** - Helpful but not essential
- **1** - Advanced/specialized

## Climate Zone

All content is tailored for **NB Zone 6 (Moncton)** climate considerations.

## Usage

Modules are loaded by the Hooomz OS Training page (`/training`) and rendered as interactive guides with:
- Section navigation
- Checklists (checkable in-app)
- Quizzes for knowledge verification
- Progress tracking per user
