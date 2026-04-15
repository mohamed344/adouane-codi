/**
 * CODI PRO MAX — Design System Configuration
 *
 * Style:    Linear / Vercel modern minimal (Flat Design)
 * Palette:  Indigo / Violet on slate neutrals (light only)
 * Type:     Geist Sans + Geist Mono
 * Skill:    .claude/skills/ui-ux-pro-max/SKILL.md
 *
 * Single source of truth for layout, spacing, typography, and pattern tokens.
 * Components should pull from these constants instead of hard-coding classnames.
 */

// ─── Z-INDEX SCALE ────────────────────────────────────────────
export const Z_INDEX = {
  base: "z-0",
  dropdown: "z-10",
  sticky: "z-20",
  overlay: "z-30",
  modal: "z-40",
  toast: "z-50",
} as const;

// ─── LAYOUT CONTAINER WIDTHS ──────────────────────────────────
export const LAYOUT = {
  maxWidth: {
    text:    "max-w-[68ch]",   // optimal reading width
    narrow:  "max-w-2xl",      // forms, profile
    default: "max-w-3xl",      // standard content
    wide:    "max-w-6xl",      // dashboards, grids
    full:    "max-w-7xl",      // landing, full-width
  },
  pagePadding:  "px-4 sm:px-6 lg:px-8",
  pageVertical: "py-8 sm:py-12",
} as const;

// ─── SPACING SCALE  (4/8 grid) ────────────────────────────────
export const SPACING = {
  section: {
    compact:  "py-12 sm:py-16",
    default:  "py-20 sm:py-28",
    generous: "py-28 sm:py-36",
  },
  maxWidth: {
    narrow:  "max-w-2xl",
    default: "max-w-4xl",
    wide:    "max-w-6xl",
  },
  card: {
    compact:  "p-5",
    default:  "p-6 sm:p-8",
    generous: "p-8 sm:p-10",
  },
  gap: {
    tight:   "gap-3",
    default: "gap-6",
    wide:    "gap-8 sm:gap-12",
    section: "gap-16 sm:gap-20",
  },
} as const;

// ─── BORDER RADIUS ────────────────────────────────────────────
export const RADIUS = {
  none: "rounded-none",
  sm:   "rounded-md",   // 6px  – chips, small badges
  md:   "rounded-lg",   // 8px  – buttons, inputs
  lg:   "rounded-xl",   // 12px – cards
  xl:   "rounded-2xl",  // 16px – feature cards, modals
  full: "rounded-full", // pills, avatars
} as const;

// ─── TYPOGRAPHY SCALE  (Linear/Vercel tight tracking) ─────────
export const TYPOGRAPHY = {
  display:   "text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[0.95]",
  h1:        "text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.025em] leading-[1.05]",
  h2:        "text-2xl sm:text-3xl font-semibold tracking-[-0.02em] leading-tight",
  h3:        "text-xl sm:text-2xl font-semibold tracking-[-0.015em]",
  h4:        "text-lg font-semibold tracking-tight",
  body:      "text-base leading-relaxed",
  bodyLg:    "text-lg leading-relaxed",
  bodySmall: "text-sm leading-relaxed",
  caption:   "text-xs uppercase tracking-[0.12em] font-medium text-[hsl(var(--muted-fg))]",
  label:     "text-sm font-medium text-[hsl(var(--foreground-2))]",
  mono:      "font-mono text-sm tracking-tight",
  monoSm:    "font-mono text-xs tracking-tight",
} as const;

// ─── ANIMATION TIMING ─────────────────────────────────────────
export const ANIMATION = {
  micro:    "duration-100",  // button press, toggle
  standard: "duration-200",  // hover, focus
  page:     "duration-300",  // modal enter, panel slide
  premium:  "duration-500",  // hero entrance
  easing: {
    default: "ease-out",
    smooth:  "cubic-bezier(0.16, 1, 0.3, 1)",
    spring:  "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
} as const;

// ─── TRANSITIONS  (composed timing + easing) ──────────────────
export const TRANSITIONS = {
  micro:        "transition-all duration-100 ease-out",
  standard:     "transition-all duration-200 ease-out",
  page:         "transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
  premium:      "transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
  reducedMotion:"motion-reduce:transition-none",
} as const;

// ─── SKELETON PATTERNS  (prevent layout shift) ────────────────
export const SKELETON = {
  card:        "h-48 rounded-xl",
  cardCompact: "h-32 rounded-lg",
  tableRow:    "h-14 rounded-md",
  statsCard:   "h-28 rounded-xl",
  formField:   "h-10 rounded-md",
  avatar:      "h-10 w-10 rounded-full",
  heading:     "h-8 w-48 rounded-md",
  paragraph:   "h-4 rounded",
  button:      "h-10 w-32 rounded-lg",
  pricingCard: "h-96 rounded-xl",
} as const;

// ─── COLOR USAGE RULES ────────────────────────────────────────
export const COLOR_USAGE = {
  sectionBg: {
    base:     "bg-[hsl(var(--background))]",
    elevated: "bg-[hsl(var(--surface))]",
    soft:     "bg-[hsl(var(--surface-2))]",
    accent:   "bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--surface))]",
  },
  interactive: {
    active: "bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]",
    hover:  "hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))]",
    muted:  "text-[hsl(var(--muted-fg))]",
  },
  emphasis: {
    highlight: "bg-[hsl(var(--primary)/0.06)] ring-1 ring-[hsl(var(--primary)/0.15)]",
    subtle:    "bg-[hsl(var(--surface))]",
  },
} as const;

// ─── COMPONENT PATTERNS ───────────────────────────────────────
export const PATTERNS = {
  sectionHeader: {
    wrapper:  "mb-12 sm:mb-16",
    eyebrow:  "text-xs uppercase tracking-[0.16em] font-medium text-[hsl(var(--primary))]",
    title:    "mt-3 text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-[1.1]",
    subtitle: "mt-4 text-lg text-[hsl(var(--muted-fg))] leading-relaxed max-w-2xl",
  },
  card: {
    base:        "rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))]",
    interactive: "rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] transition-all duration-200 hover:border-[hsl(var(--border-2))] hover:-translate-y-px hover:shadow-sm",
    elevated:    "rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]",
    featured:    "rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--primary)/0.30)] ring-1 ring-[hsl(var(--primary)/0.10)] shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.30)]",
  },
  button: {
    primary:     "h-10 px-5 rounded-lg text-sm font-medium",
    secondary:   "h-10 px-5 rounded-lg text-sm font-medium",
    ghost:       "h-9 px-3 rounded-lg text-sm font-medium",
    lg:          "h-11 px-6 rounded-lg text-base font-medium",
    sm:          "h-8 px-3 rounded-md text-xs font-medium",
  },
  avatar: {
    sm: "h-8 w-8 rounded-full text-xs font-semibold",
    md: "h-9 w-9 rounded-full text-sm font-semibold",
    lg: "h-12 w-12 rounded-full text-base font-semibold",
  },
  input: {
    base: "h-10 px-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm placeholder:text-[hsl(var(--muted-fg-2))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.20)]",
  },
} as const;

// ─── ANTI-PATTERNS  (DO NOT USE) ──────────────────────────────
export const ANTI_PATTERNS = [
  "Drop-shadow blur > 24px (use subtle 1-2px shadows or none)",
  "Amber/gold backgrounds (legacy brand — replaced with indigo/violet)",
  "Identical card sizes in feature grids (vary spans for visual rhythm)",
  "Centered text everywhere (left-align body for natural reading)",
  "Stock photo backgrounds (use abstract gradients or product screenshots)",
  "More than 2 simultaneous animations per viewport",
  "Hover-only information (must work on touch)",
  "Color-only status indicators (always pair with icon or text)",
  "Z-index values above 50 (use scale: 0/10/20/30/40/50)",
  "Hard-coded hex colors in components (use --color-* tokens)",
  "Margin between flex/grid items (use gap-*)",
  "Bold weight for body text (semibold reserved for headings)",
] as const;

// ─── ACCESSIBILITY REQUIREMENTS ───────────────────────────────
export const A11Y = {
  contrast: {
    bodyText:  4.5,   // WCAG AA
    largeText: 3.0,   // 18pt+ or 14pt bold+
    cta:       7.0,   // WCAG AAA
  },
  touchTarget: {
    min: "min-h-[44px] min-w-[44px]",
    gap: "gap-2",
  },
  focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]",
  reducedMotion: "motion-reduce:animate-none motion-reduce:transition-none",
} as const;

// ─── BREAKPOINTS REFERENCE ────────────────────────────────────
export const BREAKPOINTS = {
  mobile:    375,
  tablet:    768,
  desktop:   1024,
  wide:      1280,
  ultrawide: 1536,
} as const;

// ─── LANDING PAGE SECTION ORDER ───────────────────────────────
export const LANDING_SECTIONS = [
  "hero",          // mesh gradient + grid + animated badge
  "logos",         // social proof marquee
  "features",      // 3-column icon cards
  "how-it-works",  // 3 numbered steps
  "bento",         // asymmetric showcase grid
  "pricing",       // 3 plans, indigo highlight on Pro
  "testimonials",  // 2-row staggered quotes
  "faq",           // accordion
  "cta",           // final mesh + glowing CTA
] as const;
