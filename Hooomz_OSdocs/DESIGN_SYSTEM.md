# Hooomz OS - Design System Reference

## Overview

This design system defines the visual language for Hooomz OS. The goal is a **premium, minimal, Apple-like** aesthetic that feels professional and trustworthy for contractors and their clients.

---

## Design Principles

### 1. Subtle Sophistication
- Shadows are barely perceptible - they create lift, not depth
- Colors are muted but meaningful
- Every element feels considered, not templated

### 2. Clear Hierarchy
- Typography does the heavy lifting
- Whitespace is intentional, not empty
- Status indicators are visible but not dominating

### 3. Calm Efficiency
- Reduce visual noise
- Focus attention where it matters
- Nothing competes unnecessarily

### 4. Premium Feel
- No cheap-looking elements
- Refined details throughout
- Consistency across all screens

---

## Color Palette

### Primary Colors

```css
/* Charcoal - Primary text and actions */
--color-charcoal: #1a1a1a;

/* Status Colors - Muted but clear */
--color-status-green: #10b981;
--color-status-yellow: #f59e0b;
--color-status-red: #ef4444;
--color-status-gray: #9ca3af;
```

### Gray Scale

```css
--color-gray-50: #fafafa;   /* Secondary backgrounds */
--color-gray-100: #f5f5f5;  /* Card hover states */
--color-gray-200: #e5e5e5;  /* Borders, dividers */
--color-gray-300: #d4d4d4;  /* Disabled states */
--color-gray-400: #a3a3a3;  /* Placeholder text */
--color-gray-500: #737373;  /* Secondary text */
--color-gray-600: #525252;  /* Labels */
--color-gray-700: #404040;  /* Dark accents */
--color-gray-800: #262626;  /* Heavy text */
--color-gray-900: #171717;  /* Near black */
```

### Semantic Colors

```css
/* Backgrounds */
--bg-primary: #ffffff;
--bg-secondary: #fafafa;
--bg-card: #ffffff;

/* Text */
--text-primary: #1a1a1a;
--text-secondary: #6b7280;
--text-muted: #9ca3af;

/* Borders */
--border-light: #e5e5e5;
--border-default: #d4d4d4;
```

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        charcoal: '#1a1a1a',
        status: {
          green: '#10b981',
          yellow: '#f59e0b',
          red: '#ef4444',
          gray: '#9ca3af'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'elevated': '0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02)'
      }
    }
  }
}
```

---

## Typography

### Font Stack

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Scale

| Name | Size | Weight | Use Case |
|------|------|--------|----------|
| xs | 12px | 400 | Captions, metadata |
| sm | 14px | 400-500 | Body text, labels |
| base | 16px | 400-500 | Primary body |
| lg | 18px | 500-600 | Section headers |
| xl | 20px | 600 | Page titles (mobile) |
| 2xl | 24px | 600 | Large scores, hero numbers |
| 3xl | 30px | 700 | Dashboard metrics |

### Hierarchy Examples

```jsx
// Page title
<h1 className="text-xl font-semibold text-charcoal">Projects</h1>

// Section header
<h2 className="text-lg font-semibold text-charcoal">Active Loops</h2>

// Card title
<h3 className="text-base font-semibold text-charcoal">222 Whitney Ave</h3>

// Subtitle/metadata
<p className="text-sm text-gray-500">Johnson Family • Renovation</p>

// Body text
<p className="text-sm text-gray-600">Install baseboard and quarter round in living room</p>

// Caption
<span className="text-xs text-gray-400">Updated 2 hours ago</span>

// Large metric
<span className="text-2xl font-semibold text-charcoal">78</span>
```

---

## Shadows

### Philosophy
Shadows should feel like a gentle lift, not a heavy drop. They're almost invisible but create subtle depth.

### Definitions

```css
/* Barely there - for cards at rest */
--shadow-subtle: 0 1px 2px rgba(0, 0, 0, 0.03);

/* Default card shadow */
--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);

/* Elevated - for modals, dropdowns */
--shadow-elevated: 0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02);

/* Focus rings */
--shadow-focus: 0 0 0 2px rgba(26, 26, 26, 0.1);
```

### Usage

```jsx
// Standard card
<div className="bg-white rounded-lg shadow-card">

// Elevated element (modal, dropdown)
<div className="bg-white rounded-lg shadow-elevated">

// Interactive card hover
<div className="bg-white rounded-lg shadow-card hover:shadow-elevated transition-shadow">
```

---

## Spacing

### Base Unit
8px grid system

### Scale

```css
--space-1: 4px;   /* 0.25rem */
--space-2: 8px;   /* 0.5rem */
--space-3: 12px;  /* 0.75rem */
--space-4: 16px;  /* 1rem */
--space-5: 20px;  /* 1.25rem */
--space-6: 24px;  /* 1.5rem */
--space-8: 32px;  /* 2rem */
--space-10: 40px; /* 2.5rem */
--space-12: 48px; /* 3rem */
```

### Common Patterns

```jsx
// Card padding
<div className="p-4"> {/* 16px all sides */}

// Card with more breathing room
<div className="p-5"> {/* 20px all sides */}

// List item padding
<div className="px-4 py-3"> {/* 16px horizontal, 12px vertical */}

// Section spacing
<div className="space-y-4"> {/* 16px between children */}

// Page padding (mobile)
<div className="px-4 py-6">

// Page padding (desktop)
<div className="px-6 py-8">
```

---

## Border Radius

```css
--radius-sm: 4px;   /* Small elements like checkboxes */
--radius-md: 6px;   /* Buttons, inputs */
--radius-lg: 8px;   /* Cards */
--radius-xl: 12px;  /* Large cards, modals */
--radius-full: 9999px; /* Pills, avatars */
```

### Usage

```jsx
// Button
<button className="rounded-md">

// Card
<div className="rounded-lg">

// Status dot
<span className="rounded-full">

// Avatar
<img className="rounded-full">
```

---

## Components

### Cards

```jsx
// Basic card
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-card ${className}`}>
    {children}
  </div>
);

// Usage
<Card className="p-4">
  <h3 className="font-semibold text-charcoal">Title</h3>
  <p className="text-sm text-gray-500 mt-1">Description</p>
</Card>
```

### Status Dot

```jsx
const StatusDot = ({ status, size = 'sm' }) => {
  const colors = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400'
  };
  
  const sizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5'
  };
  
  return (
    <span className={`rounded-full ${colors[status]} ${sizes[size]}`} />
  );
};

// Usage
<StatusDot status="green" />
<StatusDot status="yellow" size="md" />
```

### Progress Bar

```jsx
const ProgressBar = ({ value, color = 'green', height = 'thin' }) => {
  const colors = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500'
  };
  
  const heights = {
    thin: 'h-0.5',    // 2px
    normal: 'h-1',    // 4px
    thick: 'h-1.5'    // 6px
  };
  
  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heights[height]}`}>
      <div 
        className={`h-full rounded-full transition-all ${colors[color]}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

// Usage
<ProgressBar value={75} color="green" />
<ProgressBar value={45} color="yellow" height="normal" />
```

### Buttons

```jsx
// Primary button
const ButtonPrimary = ({ children, ...props }) => (
  <button 
    className="px-4 py-2 bg-charcoal text-white rounded-md text-sm font-medium 
               hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 
               focus:ring-offset-2 focus:ring-charcoal disabled:opacity-50"
    {...props}
  >
    {children}
  </button>
);

// Secondary button
const ButtonSecondary = ({ children, ...props }) => (
  <button 
    className="px-4 py-2 border border-gray-300 text-charcoal rounded-md text-sm 
               font-medium hover:bg-gray-50 transition-colors focus:outline-none 
               focus:ring-2 focus:ring-offset-2 focus:ring-charcoal"
    {...props}
  >
    {children}
  </button>
);

// Text button
const ButtonText = ({ children, ...props }) => (
  <button 
    className="text-sm text-gray-600 hover:text-charcoal transition-colors"
    {...props}
  >
    {children}
  </button>
);

// Danger button
const ButtonDanger = ({ children, ...props }) => (
  <button 
    className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium 
               hover:bg-red-600 transition-colors"
    {...props}
  >
    {children}
  </button>
);
```

### Checkbox

```jsx
const Checkbox = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div className={`
      w-[18px] h-[18px] rounded border-[1.5px] flex items-center justify-center
      transition-all
      ${checked 
        ? 'bg-charcoal border-charcoal' 
        : 'border-gray-300 group-hover:border-gray-400'
      }
    `}>
      {checked && (
        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
          <path 
            d="M2 6L5 9L10 3" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
    {label && (
      <span className={`text-sm ${checked ? 'text-gray-400' : 'text-charcoal'}`}>
        {label}
      </span>
    )}
  </label>
);
```

### Input

```jsx
const Input = ({ label, error, ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <input
      className={`
        w-full px-3 py-2 text-sm border rounded-md transition-colors
        focus:outline-none focus:ring-2 focus:ring-charcoal focus:ring-offset-1
        ${error 
          ? 'border-red-300 focus:ring-red-500' 
          : 'border-gray-300 hover:border-gray-400'
        }
      `}
      {...props}
    />
    {error && (
      <p className="text-xs text-red-500">{error}</p>
    )}
  </div>
);
```

---

## Icons

### Library
Use **Lucide React** for all icons.

```bash
npm install lucide-react
```

### Style Guidelines
- Stroke width: 1.5px (default)
- Size: 16px (small), 20px (default), 24px (large)
- Color: Match text color of context

### Common Icons

```jsx
import { 
  Home,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Check,
  Clock,
  Camera,
  FileText,
  Settings,
  Bell,
  Search,
  MoreHorizontal
} from 'lucide-react';

// Usage
<Home className="w-5 h-5 text-gray-500" />
<Plus className="w-4 h-4 text-white" />
```

### Navigation Icons
- Home: `Home`
- Today: `Calendar`
- Profile: `User`
- Settings: `Settings`
- Back: `ChevronLeft`

### Action Icons
- Add: `Plus`
- Close: `X`
- Complete: `Check`
- More: `MoreHorizontal`
- Search: `Search`

### Content Icons
- Time: `Clock`
- Photo: `Camera`
- Document: `FileText`
- Notification: `Bell`

---

## Layout

### Mobile Navigation (Bottom)

```jsx
const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
    <div className="flex items-center justify-around h-14">
      <NavItem icon={Home} label="Home" active />
      <NavItem icon={Calendar} label="Today" />
      <NavItem icon={User} label="Profile" />
    </div>
  </nav>
);

const NavItem = ({ icon: Icon, label, active }) => (
  <a className="flex flex-col items-center gap-1">
    <Icon className={`w-5 h-5 ${active ? 'text-charcoal' : 'text-gray-400'}`} />
    <span className={`text-xs ${active ? 'text-charcoal font-medium' : 'text-gray-400'}`}>
      {label}
    </span>
  </a>
);
```

### Desktop Sidebar

```jsx
const Sidebar = () => (
  <aside className="w-60 bg-white border-r border-gray-200 h-screen flex flex-col">
    {/* Logo */}
    <div className="p-4 border-b border-gray-100">
      <Logo />
    </div>
    
    {/* Navigation */}
    <nav className="flex-1 p-3 space-y-1">
      <SidebarItem icon={Home} label="Dashboard" active />
      <SidebarItem icon={Calendar} label="Today" />
      <SidebarItem icon={Folder} label="Projects" />
      <SidebarItem icon={Users} label="Clients" />
      <SidebarItem icon={Archive} label="Archive" />
      <SidebarItem icon={Settings} label="Settings" />
    </nav>
  </aside>
);

const SidebarItem = ({ icon: Icon, label, active }) => (
  <a className={`
    flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
    ${active 
      ? 'bg-gray-100 text-charcoal font-medium' 
      : 'text-gray-600 hover:bg-gray-50 hover:text-charcoal'
    }
  `}>
    <Icon className="w-4 h-4" />
    {label}
  </a>
);
```

### Page Container

```jsx
// Mobile
const MobilePageContainer = ({ children, title }) => (
  <div className="min-h-screen bg-white pb-16"> {/* pb for bottom nav */}
    {title && (
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-semibold text-charcoal">{title}</h1>
      </header>
    )}
    <main className="px-4">
      {children}
    </main>
  </div>
);

// Desktop
const DesktopPageContainer = ({ children, title }) => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <main className="flex-1 p-8">
      {title && (
        <h1 className="text-xl font-semibold text-charcoal mb-6">{title}</h1>
      )}
      {children}
    </main>
  </div>
);
```

---

## Patterns

### Project Card

```jsx
const ProjectCard = ({ project }) => (
  <div className="bg-white rounded-lg shadow-card p-4 hover:shadow-elevated transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="font-semibold text-charcoal">{project.name}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{project.client}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-lg font-semibold text-charcoal">{project.health}</span>
        <StatusDot status={getHealthColor(project.health)} />
      </div>
    </div>
    <ProgressBar 
      value={project.health} 
      color={getHealthColor(project.health)} 
      className="mt-3"
    />
  </div>
);
```

### Task Item

```jsx
const TaskItem = ({ task, onToggle }) => (
  <div className={`
    flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0
    ${task.status === 'in_progress' ? 'border-l-2 border-l-blue-500' : ''}
  `}>
    <Checkbox 
      checked={task.status === 'completed'} 
      onChange={() => onToggle(task.id)}
    />
    <div className="flex-1 min-w-0">
      <p className={`text-sm ${
        task.status === 'completed' ? 'text-gray-400' : 'text-charcoal'
      }`}>
        {task.title}
      </p>
    </div>
    <div className="flex items-center gap-2">
      {task.hasPhotos && <Camera className="w-3.5 h-3.5 text-gray-400" />}
      {task.hasNotes && <FileText className="w-3.5 h-3.5 text-gray-400" />}
      {task.isOverdue && <StatusDot status="red" size="xs" />}
    </div>
  </div>
);
```

### Stat Card

```jsx
const StatCard = ({ label, value, trend, trendDirection }) => (
  <div className="bg-white rounded-lg shadow-card p-3 text-center">
    <p className="text-lg font-semibold text-charcoal">{value}</p>
    {trend && (
      <p className={`text-xs mt-0.5 ${
        trendDirection === 'up' ? 'text-emerald-600' : 'text-red-500'
      }`}>
        {trendDirection === 'up' ? '↑' : '↓'}{trend}
      </p>
    )}
    <p className="text-xs text-gray-500 mt-1">{label}</p>
  </div>
);
```

---

## Responsive Breakpoints

```css
/* Mobile first approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Common Responsive Patterns

```jsx
// Grid that changes columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Stack to row
<div className="flex flex-col sm:flex-row gap-4">

// Hide on mobile, show on desktop
<div className="hidden lg:block">

// Show on mobile, hide on desktop
<div className="lg:hidden">

// Different padding per breakpoint
<div className="px-4 lg:px-6">
```

---

## Animation

### Principles
- Keep animations subtle and purposeful
- Duration: 150-200ms for micro-interactions
- Easing: ease-out for most transitions

### Common Transitions

```css
/* Default transition */
transition-colors     /* Color changes */
transition-shadow     /* Shadow changes */
transition-transform  /* Scale, translate */
transition-all        /* Multiple properties */

/* Duration */
duration-150  /* Fast - hover states */
duration-200  /* Normal - most interactions */
duration-300  /* Slow - larger animations */
```

### Usage

```jsx
// Hover shadow change
<div className="shadow-card hover:shadow-elevated transition-shadow duration-150">

// Button hover
<button className="bg-charcoal hover:bg-gray-800 transition-colors">

// Scale on click
<button className="active:scale-95 transition-transform">
```

---

## Accessibility

### Focus States
All interactive elements must have visible focus states.

```jsx
// Focus ring pattern
className="focus:outline-none focus:ring-2 focus:ring-charcoal focus:ring-offset-2"
```

### Color Contrast
- Text on white: minimum #525252 (gray-600) for body, #1a1a1a for headings
- Status colors meet WCAG AA on white backgrounds

### Touch Targets
- Minimum 44x44px for touch targets on mobile
- Use padding to increase tap area, not visual size

---

## Logo

```jsx
const Logo = ({ size = 'default' }) => {
  const sizes = {
    small: 'text-lg',
    default: 'text-xl',
    large: 'text-2xl'
  };
  
  return (
    <span className={`font-bold tracking-tight ${sizes[size]}`}>
      <span className="text-charcoal">H</span>
      <span className="text-red-500">O</span>
      <span className="text-amber-500">O</span>
      <span className="text-emerald-500">O</span>
      <span className="text-charcoal">MZ</span>
    </span>
  );
};
```

---

## File Naming Conventions

- Components: PascalCase (`ProjectCard.jsx`)
- Hooks: camelCase with `use` prefix (`useProjects.js`)
- Utils: camelCase (`formatDate.js`)
- Styles: kebab-case (`design-tokens.js`)
- Pages: PascalCase (`Dashboard.jsx`)
