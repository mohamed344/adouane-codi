/**
 * CODI PRO MAX — Design System Configuration
 * Based on ui-ux-pro-max-skill rules for B2B SaaS
 *
 * Style: Flat + Minimal with Warm personality
 * Category: B2B SaaS / Trade / Data Tools
 * Priority: Trust & Authority + Approachability
 *
 * USAGE: Import constants from this file to keep UI consistent.
 * Update this file when design decisions change — single source of truth.
 */

// ─── SPACING SCALE (4pt grid) ───
export const SPACING = {
  /** Section padding — creates rhythm between sections */
  section: {
    compact: "py-12 sm:py-16",       // Stats, banners
    default: "py-16 sm:py-24",       // Standard sections
    generous: "py-20 sm:py-32",      // Hero, CTA
  },
  /** Container max-widths */
  maxWidth: {
    narrow: "max-w-2xl",             // Text-heavy, forms
    default: "max-w-4xl",            // Standard content
    wide: "max-w-6xl",               // Grids, dashboards
  },
  /** Card padding */
  card: {
    compact: "p-5",
    default: "p-6 sm:p-8",
    generous: "p-8 sm:p-10",
  },
  /** Gap between elements */
  gap: {
    tight: "gap-3",
    default: "gap-6",
    wide: "gap-8 sm:gap-12",
    section: "gap-16 sm:gap-20",
  },
} as const;

// ─── BORDER RADIUS ───
export const RADIUS = {
  none: "rounded-none",
  sm: "rounded-lg",         // Buttons, inputs, badges
  md: "rounded-xl",         // Cards, small containers
  lg: "rounded-2xl",        // Feature cards, modals
  full: "rounded-full",     // Avatars, pills, badges
} as const;

// ─── TYPOGRAPHY SCALE ───
export const TYPOGRAPHY = {
  /** Display — Hero headlines only */
  display: "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]",
  /** H1 — Page titles */
  h1: "text-3xl sm:text-4xl font-bold tracking-tight leading-tight",
  /** H2 — Section headings */
  h2: "text-2xl sm:text-3xl font-bold leading-tight",
  /** H3 — Card titles, sub-sections */
  h3: "text-lg sm:text-xl font-semibold",
  /** H4 — Small headings */
  h4: "text-base font-semibold",
  /** Body — Default text */
  body: "text-base leading-relaxed",
  /** Body small */
  bodySmall: "text-sm leading-relaxed",
  /** Caption */
  caption: "text-xs uppercase tracking-wider font-medium",
  /** Label */
  label: "text-sm font-medium",
} as const;

// ─── ANIMATION TIMING ───
export const ANIMATION = {
  /** Micro-interactions: button press, toggle */
  micro: "duration-100",
  /** Standard hover, focus transitions */
  standard: "duration-200",
  /** Page transitions, modal enter */
  page: "duration-300",
  /** Premium smooth effects */
  premium: "duration-500",
  /** Easing functions */
  easing: {
    default: "ease-out",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
} as const;

// ─── COLOR USAGE RULES ───
export const COLOR_USAGE = {
  /** Background alternation for visual rhythm */
  sectionBg: {
    base: "bg-background",                // Cream — default
    elevated: "bg-surface-white",          // White — stats, pricing
    warm: "bg-surface-warm",               // Amber tint — features, testimonials
    dark: "bg-secondary text-secondary-foreground", // Dark — CTA
  },
  /** Interactive states */
  interactive: {
    active: "bg-primary/10 text-primary",
    hover: "hover:bg-muted/50 hover:text-foreground",
    muted: "text-muted-foreground",
  },
  /** Emphasis */
  emphasis: {
    highlight: "bg-primary/5",             // Popular plan, featured items
    subtle: "bg-muted/30",                 // Sidebar, secondary surfaces
  },
} as const;

// ─── COMPONENT PATTERNS ───
export const PATTERNS = {
  /** Section header — left-aligned for human feel */
  sectionHeader: {
    wrapper: "mb-12 sm:mb-16",
    title: "text-2xl sm:text-3xl font-bold leading-tight",
    subtitle: "mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl",
  },
  /** Cards */
  card: {
    base: "rounded-2xl bg-card",
    interactive: "rounded-2xl bg-card transition-colors hover:bg-muted/20",
    featured: "rounded-2xl bg-primary/5",
  },
  /** Buttons */
  button: {
    primary: "h-12 px-8 rounded-xl text-base font-medium",
    secondary: "h-11 px-6 rounded-lg text-sm font-medium",
    ghost: "h-10 px-4 rounded-lg text-sm font-medium",
  },
  /** Avatar */
  avatar: {
    sm: "h-9 w-9 rounded-full text-sm font-semibold",
    md: "h-11 w-11 rounded-full font-semibold",
    lg: "h-14 w-14 rounded-full text-lg font-semibold",
  },
} as const;

// ─── ANTI-PATTERNS (DO NOT USE) ───
export const ANTI_PATTERNS = [
  "shadow-* on cards (use color/whitespace for hierarchy)",
  "border on every card (use bg color differentiation)",
  "Identical card sizes in grids (vary spans for visual interest)",
  "Everything centered (left-align text for natural reading)",
  "Generic stock photo backgrounds",
  "More than 2 animations visible at once per viewport",
  "Hover-only information (must work on touch)",
  "Purple/pink AI gradients in B2B context",
  "Color-only status indicators (add icon or text)",
  "z-index values above 50 (use scale: 10, 20, 30, 40, 50)",
] as const;

// ─── ACCESSIBILITY REQUIREMENTS ───
export const A11Y = {
  /** Minimum contrast ratios */
  contrast: {
    bodyText: 4.5,      // WCAG AA
    largeText: 3.0,     // 18pt+ or 14pt bold+
    cta: 7.0,           // WCAG AAA for CTA buttons
  },
  /** Touch targets */
  touchTarget: {
    min: "min-h-[44px] min-w-[44px]",
    gap: "gap-2",       // 8px between interactive elements
  },
  /** Focus */
  focus: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  /** Reduced motion */
  reducedMotion: "motion-reduce:animate-none motion-reduce:transition-none",
} as const;

// ─── BREAKPOINTS REFERENCE ───
export const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1536,
} as const;

// ─── LANDING PAGE SECTION ORDER ───
export const LANDING_SECTIONS = [
  "hero",           // Value prop + CTA — generous padding
  "stats",          // Social proof numbers — compact
  "features",       // Key differentiators — warm bg
  "how-it-works",   // 3-step flow — base bg
  "pricing",        // Plans — elevated bg
  "testimonials",   // Social proof — warm bg
  "cta",            // Final push — dark bg
] as const;
