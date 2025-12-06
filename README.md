# Hooomz OS

A construction project management platform for small residential contractors.

## Quick Start

### Prerequisites
- Node.js 18+
- npm
- Supabase account (optional for development)

### Development Setup

1. **Install client dependencies:**
   ```bash
   cd client
   npm install
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables (optional):**
   ```bash
   # Client
   cp client/.env.example client/.env

   # Server
   cp server/.env.example server/.env
   ```

   Fill in your Supabase credentials. Without credentials, the app runs with mock data.

4. **Start development servers:**
   ```bash
   # Terminal 1 - Client
   cd client
   npm run dev

   # Terminal 2 - Server (optional)
   cd server
   npm run dev
   ```

5. **Open http://localhost:5173**

## Project Structure

```
Hooomz_OS/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/        # Design system components
│   │   │   ├── layout/    # Layout components
│   │   │   ├── projects/  # Project components
│   │   │   ├── loops/     # Loop components
│   │   │   ├── tasks/     # Task components
│   │   │   └── time/      # Time tracking components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and Supabase
│   │   └── index.css      # Tailwind CSS
│   └── package.json
├── server/                 # Express API server
│   └── src/
│       ├── routes/        # API routes
│       └── services/      # Supabase client
├── supabase/
│   └── migrations/        # Database migrations
└── Hooomz_OSdocs/         # Documentation
```

## Tech Stack

- **Frontend:** React 18 + Vite + TailwindCSS + Lucide Icons
- **Backend:** Node.js + Express
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth

## Key Features

- **Projects Dashboard:** View all projects with health scores
- **Loops:** Flexible nested containers for organizing work
- **Tasks:** Task management within loops
- **Today View:** Daily focus with system check
- **Time Tracker:** Track time with percentage visualization

## Design System

The app follows a premium, minimal, Apple-like aesthetic:
- Pure white backgrounds
- Barely perceptible shadows
- Clear typography hierarchy
- Small, refined status dots (green/yellow/red)
- Mobile-first responsive design

## Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Add your credentials to `.env` files

## Available Scripts

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Server
- `npm run dev` - Start with auto-reload
- `npm start` - Start production server

## Documentation

See `Hooomz_OSdocs/` for:
- [CLAUDE.md](Hooomz_OSdocs/CLAUDE.md) - Build instructions
- [DESIGN_SYSTEM.md](Hooomz_OSdocs/DESIGN_SYSTEM.md) - Design specifications
- [HOOOMZ_OS_BUILD_INSTRUCTIONS.md](Hooomz_OSdocs/HOOOMZ_OS_BUILD_INSTRUCTIONS.md) - Full spec
