# E-Douane Design System

## Color Palette

### Primary Colors
- **Orange (Primary)**: `#F59E0B` / HSL `38 92% 50%` — Main brand accent
- **Purple (Glow)**: `#A855F7` / HSL `280 60% 55%` — Secondary glow accent
- **Amber Warm**: `#D97706` — Hover/active states

### Dark Theme (Default)
- **Background**: `#0a0a0f` / HSL `240 15% 5%` — Near-black
- **Card**: `hsla(240, 10%, 12%, 0.6)` — Semi-transparent glass
- **Foreground**: `#e5e7eb` — Light gray text
- **Muted**: `#6b7280` — Subdued text

### Light Theme
- **Background**: `#fafaf9` — Warm off-white
- **Card**: `hsla(0, 0%, 100%, 0.7)` — Glass white
- **Foreground**: `#1a1a2e` — Deep blue-black

## Glass Effects

### Glass Card (`.glass-card`)
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 1rem;
```

### Glass Nav (`.glass-nav`)
```css
background: rgba(10, 10, 15, 0.7);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 9999px;
```

## Glow Effects
- **Orange Glow**: `radial-gradient(circle, rgba(245,158,11,0.15), transparent 70%)`
- **Purple Glow**: `radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)`
- **Amber Glow**: `radial-gradient(circle, rgba(217,119,6,0.1), transparent 70%)`

## 3D Glass Cube
- Uses CSS `perspective(800px)` and `transform-style: preserve-3d`
- 6 faces with glass material
- Continuous rotation via `@keyframes cube-rotate`
- Glowing orbs inside using radial gradients

## Bento Grid Layout
```
[Stat Card 1] [Stat Card 2]
[   Glass Cube (center)   ]
[Stat Card 3] [Stat Card 4]
```
- Stats: Large bold numbers, small uppercase labels
- Glass material on each card
- 2-col grid on mobile, bento on desktop

## Typography
- **Hero Title**: `text-5xl lg:text-7xl font-extrabold`, gradient text
- **Section Titles**: `text-3xl lg:text-5xl font-bold`
- **Body**: `text-base`, muted foreground
- **Stat Numbers**: `text-4xl font-bold`
- **Labels**: `text-xs uppercase tracking-widest`

## Spacing
- Section padding: `py-24 sm:py-32`
- Container max-width: default Tailwind container
- Card padding: `p-6` to `p-8`
- Gap between grid items: `gap-4` to `gap-6`

## Animations
- **Cube Rotate**: 20s infinite linear rotation
- **Float**: 6-8s ease-in-out vertical bobbing
- **Pulse Glow**: 3s ease-in-out shadow pulse (orange)
- **Scroll Reveal**: 0.8s ease-out translateY/opacity
- **Gradient Shift**: 8s background-position animation
- **Orb Pulse**: 4s scale + opacity pulse

## Component Patterns

### Floating Pill Header
- Fixed, centered, max-w-4xl, rounded-full
- Glass nav material
- Compact h-12 height
- Links: `text-sm text-white/60 hover:text-white`

### Service Cards
- 3-col grid, glass-card material
- Hover: border glow orange, slight translateY
- Icon top, title, description

### Pricing Cards
- Glass-card material
- Popular card: orange ring + glow
- Dynamic from Supabase

### CTA Banner
- Full-width rounded-2xl glass card
- Orange + purple glow orbs behind
- Centered text + button

### Bottom Feature Banner
- Rounded-full pill shape
- Glass material, key features listed inline
