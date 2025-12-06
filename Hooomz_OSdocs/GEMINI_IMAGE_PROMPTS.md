# Hooomz OS - Gemini Image Generation Prompts

These prompts are designed to generate UI mockups that match the premium, minimal aesthetic established in the design system. Use these with Gemini's image generation to create visual targets before building.

---

## Design Language Reference

Before using these prompts, ensure Gemini understands the core aesthetic:

**Key Principles:**
- Ultra-clean, premium, Apple-like refinement
- Shadows barely perceptible (rgba(0,0,0,0.03-0.04))
- Typography does the heavy lifting
- Status colors muted but meaningful (🟢🟡🔴)
- Pure white backgrounds (#FFFFFF)
- No gradients, no heavy borders
- Every element feels polished and intentional

---

## Prompt 1: Project Dashboard (Mobile)

```
Create an ultra-clean, premium mobile app screenshot showing a construction project management dashboard.

Background: Pure white (#FFFFFF). Cards: White with barely perceptible shadows (rgba(0,0,0,0.03)) - the shadow should feel like a subtle lift, not a drop.

At the top: "Hey Nathan, here's your project status" in dark charcoal (#1a1a1a) sans-serif text, medium weight, not heavy.

Below, a vertical list of project cards with generous but intentional padding. Each card shows:
- Project name in semibold (e.g., "222 Whitney Ave", "45 Maple Renovation")
- Client name in muted gray (#6b7280), smaller size
- A health score like "78" as a larger number with a small, refined colored dot (muted green #10b981, amber #f59e0b, or soft red #ef4444) - dot is subtle, not dominating
- Thin progress bar underneath (2-3px height) matching the status color, with rounded ends

Bottom navigation bar: Three refined line-art icons (house, calendar, person) in muted gray, selected state in charcoal. Clean, minimal stroke weight, consistent style.

Typography: Inter or SF Pro style. Clear hierarchy - title 18px semibold, subtitle 14px regular, scores 24px medium.

Style: Premium, Apple-like refinement. No gradients, no heavy borders. Whitespace is intentional and balanced - not sparse, not cramped. Every element feels considered and polished.
```

---

## Prompt 2: Project Dashboard (Desktop)

```
Create an ultra-clean, premium desktop web app screenshot for a construction project management system.

Left sidebar: White background, navigation items in muted gray (#6b7280) with refined line-art icons. Selected item ("Dashboard") in charcoal with subtle background highlight (very light gray, barely visible). Items: Dashboard, Today, Projects, Clients, Archive, Settings.

Logo at top: "HOOOMZ" with three O's in muted red (#ef4444), amber (#f59e0b), green (#10b981) - colors should feel sophisticated, not bright/childish.

Main content: Light warm gray background (#fafafa). 3-column grid of white project cards with imperceptible shadows.

Each card shows:
- Project name in semibold charcoal
- Address in muted gray, smaller
- Large health score number (32px) with tiny trend indicator (↑8% in muted green or ↓3% in muted red) - arrows are subtle, not bold
- Thin colored progress bar at bottom (2px height)
- Status dot inline with score, small and refined

Top right: Subtle notification bell (line icon), user avatar (small, circular).

Typography: Inter or SF Pro. Excellent hierarchy. Nothing feels heavy or demanding attention unnecessarily.

Style: Premium SaaS aesthetic like Linear or Notion. Shadows almost invisible. Colors muted but clear. Generous whitespace that feels intentional, not empty. Every pixel considered.
```

---

## Prompt 3: Single Project View (Mobile)

```
Create a premium, minimal mobile app screenshot showing a single construction project detail view.

Background: Pure white.

Header: Back arrow (thin line icon), "222 Whitney Ave" as title in semibold charcoal. Below: "Johnson Family • Renovation" in muted gray, smaller.

Project health card: Clean white card with imperceptible shadow. Large "78" in charcoal with small muted green dot beside it. "Project Health" label below in gray. The number should feel prominent but not heavy.

Horizontal stats row: 4 compact stat cards in a row, each white with barely-there shadow:
- Budget: "$45,200" with tiny "↓2%" in muted red below
- Schedule: "On Track" with tiny green dot
- Tasks: "34/52" with thin progress indication
- Today: "3" with subtle label

"Active Loops" section: Clean section header in semibold, normal case (not all caps).

Expandable loop cards, each showing:
- Loop name ("Framing") with small status dot (amber)
- Subtitle "4 tasks remaining" in muted gray
- Thin chevron on right, very subtle

Cards have consistent spacing, soft corners (8px radius), imperceptible shadows.

Bottom nav: Refined line icons, muted gray, consistent stroke weight.

Style: Apple-level refinement. Typography hierarchy is clear. Colors are muted but meaningful. Nothing feels cheap or templated.
```

---

## Prompt 4: Daily Log / Today View (Mobile)

```
Create a premium, minimal mobile app screenshot showing a contractor's daily planning view.

Background: Pure white.

Header: "Today" in semibold charcoal, "WED, DEC 4" aligned right in muted gray, smaller.

"System Check" card: White with imperceptible shadow. Three refined horizontal sliders:
- Energy: 7/10 - thin track (4px), muted green filled portion, subtle circular thumb
- Weather Impact: 3/10 - same style, green (low is good)
- Crew Available: 8/10 - same style, green

Slider labels in muted gray, values in charcoal. Clean typography hierarchy.

"Today's Focus" section with subtle section header:
- Two focus items as minimal list rows (not heavy cards)
- "222 Whitney - Drywall needs attention" with small red dot
- "45 Maple - Inspection at 2pm" with small amber dot
- Thin separator lines between items

"Tasks" section: Clean checkbox list:
- Refined checkboxes (subtle rounded squares, not chunky)
- Completed task: muted strikethrough, checkbox filled with subtle check
- Pending tasks: clean typography, no visual noise
- Assignee initials or small avatar on right edge, subtle

Floating action button: Bottom right, circular, charcoal or dark gray, subtle shadow. Plus icon in white, thin stroke.

Bottom nav: Today icon highlighted (charcoal), others muted gray.

Style: Calm, focused, premium. Nothing competing for attention. Clear visual hierarchy guides the eye naturally.
```

---

## Prompt 5: Loop Detail View - Task List (Mobile)

```
Create a premium, refined mobile app screenshot showing tasks within a construction project phase.

Background: Pure white.

Header: Thin back arrow, "Framing" in semibold charcoal, small amber status dot beside title (subtle, not dominating).

Subheader: "222 Whitney Ave" in muted gray. Below: "12 of 18 complete" with thin amber progress bar (2px height, full width, rounded ends).

Task list with refined task rows (not heavy cards - more like clean list items with subtle separation):
- Refined checkbox on left (subtle rounded square, 18px, thin border when unchecked, filled with subtle check when complete)
- Task description in regular weight charcoal
- Metadata icons on right: tiny camera icon (has photos), document icon (has notes) - icons are 14px, muted gray, refined line style
- Completed tasks: checkbox filled, text in lighter gray (not struck through - just muted)

Section headers for groupings: "Wall Framing (6)" - subtle, smaller, muted gray, not heavy dividers

One task with thin left border in blue indicating "in progress" - border is 2px, subtle.

Overdue indicator: Small red dot next to task, not aggressive.

FAB: Bottom right, charcoal, subtle shadow, thin plus icon.

Bottom nav: Consistent refined line icons.

Style: This screen was specifically called out as needing refinement. Every element must feel polished - checkboxes, icons, spacing, typography. Premium and intentional, not templated or cheap.
```

---

## Prompt 6: Time Tracking Interface (Mobile)

```
Create a premium, minimal mobile app screenshot showing an active time tracking interface.

Background: Pure white (#FFFFFF) - NOT dark. This is critical.

Center of screen: Large circular progress ring showing time as PERCENTAGE of allocated time.
- Ring: Thin stroke (6px), muted green for filled portion, light gray (#e5e7eb) for remainder
- Inside ring: Large "58%" in charcoal, indicating percentage of allotted time used
- Below percentage inside ring: "02:34:18" as secondary info in muted gray, smaller

Above the ring: "Currently Working" in muted gray, small.

Below the ring:
- "Install baseboard - Living Room" in semibold charcoal
- "222 Whitney Ave" in muted gray below

Below that:
- "Started 9:15 AM • Allocated 4h" in small muted gray text

"Stop Timer" button: Rounded rectangle, muted red/coral (#ef4444 but slightly muted), white text "Stop Timer". Subtle shadow.

Below button: "Add notes..." as a subtle text input hint, muted gray.

Small "Switch Task" text link in muted gray at bottom.

No bottom navigation on this screen - it's a focused modal-like experience.

Style: Clean, focused, calming despite being an "active" state. White background is essential. The percentage visualization communicates resource consumption clearly. Premium, refined details throughout.
```

---

## Prompt 7: Client Portal View (Mobile)

```
Create a premium, friendly mobile app screenshot showing a homeowner's view of their renovation project.

Background: Pure white.

Header: Small house icon (refined line art), "Your Project" in semibold charcoal. "222 Whitney Ave" below in muted gray.

Hero card: White with imperceptible shadow, centered content.
- Circular progress ring (thin stroke, muted green fill, light gray remainder)
- "78%" large inside the ring
- "Complete" label below ring
- "Estimated completion: Dec 20" in muted gray below

"Recent Updates" section: Timeline-style, but minimal:
- Thin vertical line connecting entries (very subtle, light gray)
- Each entry: small date in muted gray, description in charcoal
- "Drywall completed in master bedroom" with tiny photo thumbnail (rounded corners)
- "Electrical inspection passed" with subtle green checkmark
- Clean, scannable, not cluttered

"Action Needed" card: Very subtle amber/warm background tint (barely there), white card feel maintained:
- "3 selections need your input" in charcoal
- List: "Kitchen backsplash, Master tile, Door color" in muted gray
- "Review Selections" button: outlined style, charcoal border, charcoal text

"Your Contractor" section at bottom:
- Small avatar, "Nathan Henderson" in semibold
- "Henderson Contracting" in muted gray
- Refined phone and message icons, muted gray

Style: Reassuring, premium, approachable. Designed for homeowners who want clarity without complexity. Every element feels trustworthy and polished.
```

---

## Prompt 8: Estimate Builder (Desktop)

```
Create a premium, clean desktop web app screenshot showing a construction estimate builder.

Layout: Split panel - left 40%, right 60%.

Left panel (editor): White background.
- "New Estimate" header in semibold charcoal
- Client section: "Johnson Family" and "222 Whitney Ave" in clean typography
- Line items as expandable sections with refined chevrons:
  - "Demo" with "$2,400" aligned right, muted gray
  - "Framing" - "$12,800"
  - "Electrical" - "$8,500"
  (and so on)
- Each section can expand to show sub-items
- "+ Add Category" at bottom: text button style, muted blue/gray

Right panel (preview): Light warm gray background (#fafafa) with white "document" card centered:
- Clean estimate preview as client would see it
- "Henderson Contracting" header with subtle logo
- Itemized breakdown with clean table typography
- Subtotal, Tax, Total with clear hierarchy (total is semibold, larger)
- "Valid until: Dec 30, 2024" in muted gray footer

Top toolbar: White bar with subtle bottom border. Buttons: "Save Draft" (text), "Preview" (text), "Send to Client" (filled, charcoal)

Bottom summary: Fixed bar, white, subtle top shadow. "Total: $34,700" prominent. "Send Estimate" button in muted green.

Style: Professional tool aesthetic like Stripe or Linear. Clean panels, clear purpose, refined details. Typography does the heavy lifting.
```

---

## Prompt 9: Training / Field Guides (Mobile)

```
Create a premium, clean mobile app screenshot showing a training module library for construction workers.

Background: Pure white.

Header: "Field Guides" in semibold charcoal, small book icon (refined line art).

Search bar: Clean rounded rectangle, light gray background (#f3f4f6), muted placeholder text "Search guides...", small search icon.

Category tabs: Horizontal scroll, pill-style buttons. "All" selected (subtle charcoal fill, white text), others outlined (light gray border, muted text). Tabs: All, Framing, Drywall, Tile, Finish

Guide cards: 2-column grid, white cards with imperceptible shadows.
Each card:
- Simple, refined illustration (line art style, single accent color)
- Guide title in semibold charcoal: "Wall Framing Basics"
- "15 min read" in muted gray
- If completed: subtle green checkmark in corner
- If in progress: tiny progress bar at bottom

"My Progress" section at bottom:
- "3 of 19 completed" with thin progress bar
- "Continue: Electrical Rough-In" as a subtle prompt
- Small arrow or chevron indicating continuation

Style: Educational but professional. Friendly without being childish. Illustrations are minimal and refined. Progress tracking feels encouraging, not gamified.
```

---

## Prompt 10: Empty State / First Project (Mobile)

```
Create a premium, welcoming mobile app screenshot showing an empty state for first-time users.

Background: Pure white.

Center of screen: Refined line illustration of a house under construction - minimal strokes, single accent color (muted charcoal or warm gray), sophisticated style (not clipart, not cartoon).

Headline: "Let's build something" in semibold charcoal, well-sized (24px), centered.

Subtext: "Create your first project to start tracking progress, managing your crew, and keeping clients informed." in muted gray, centered, comfortable line height.

Two buttons, stacked with good spacing:
- Primary: "Create Project" - filled charcoal/dark, white text, rounded (8px), subtle shadow
- Secondary: "Import from Estimate" - outlined, charcoal border, charcoal text

Small text link at bottom: "Explore a sample project →" in muted gray/blue, subtle.

Very subtle "HOOOMZ" wordmark at bottom with colored O's (red, amber, green) - watermark level opacity, not demanding attention.

Style: Welcoming, confident, premium. The empty state should make users feel they've chosen a quality tool. No cheap illustrations or generic stock art feeling.
```

---

## Usage Notes

### Generating Images
1. Copy the prompt for the screen you need
2. Paste into Gemini image generation
3. Review output against design system principles
4. Iterate if needed - adjust specific elements in the prompt

### Common Adjustments
If output doesn't match expectations:

**Shadows too heavy:**
Add: "Shadows must be barely visible - rgba(0,0,0,0.03) maximum. The card should look almost flat with the subtlest lift."

**Typography too generic:**
Add: "Typography must feel like Apple or Linear - clean, well-spaced, with clear hierarchy. Use Inter or SF Pro styling."

**Colors too bright:**
Add: "All status colors should be muted and sophisticated, not bright or childish. Green #10b981, Amber #f59e0b, Red #ef4444."

**Too much whitespace:**
Add: "Whitespace should feel intentional and balanced, not sparse. Content should feel well-contained."

**Background not white:**
Add explicit: "Background MUST be pure white #FFFFFF. This is non-negotiable."

### Quality Checklist
Before accepting a generated image:
- [ ] Background is pure white (not gray, not dark)
- [ ] Shadows are barely perceptible
- [ ] Typography hierarchy is clear
- [ ] Status dots are small and refined
- [ ] Icons are consistent line-art style
- [ ] Spacing feels intentional
- [ ] Overall feels premium, not templated
