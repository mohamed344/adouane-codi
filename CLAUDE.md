# CLAUDE.md

Project guidance for Claude Code working in this repository.

## Project

CODI PRO MAX — a Next.js 16 + Tailwind 4 + Supabase tariff/customs SaaS. Multilingual (EN/FR/AR with RTL). Backend uses Supabase + Google Gemini for AI tariff analysis + SlickPay for billing.

## UI/UX rules — IMPORTANT

**Every UI change in this repo must use the `ui-ux-pro-max` skill.** Read `.claude/skills/ui-ux-pro-max/SKILL.md` before touching any file under:

- `src/components/**`
- `src/app/[locale]/**` (any page or layout)
- `src/app/globals.css`
- `src/config/design-system.ts`

The skill encodes the project's locked design language so the whole app stays consistent. When you query it, prefer:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>
```

Domains: `style`, `color`, `typography`, `landing`, `chart`, `ux`, `product`.

### Locked design decisions (do not deviate without asking)

| Axis | Decision |
|---|---|
| Visual style | **Linear / Vercel — modern minimal** (tight grid, sharp lines, generous whitespace) |
| Color palette | **Deep navy (#1e3a5f) + teal (#0d9488) / emerald (#10b981) + slate neutrals** — maritime/customs authority feel |
| Theme mode | **Light only** — no dark-mode plumbing |
| Component foundation | **Custom primitives** — no shadcn/ui code. Radix UI is permitted only as a headless behavior layer for a11y-critical primitives (Dialog, Tabs, Switch, DropdownMenu, Toast, Tooltip) |
| Typography | **Geist Sans + Geist Mono** (Geist Mono for tariff codes / numerical IDs) |
| Border radius base | `--radius: 0.625rem` (10px) — `rounded-lg` buttons, `rounded-xl` cards |
| App nav | Top header only, with a contextual left rail **only on the Search page** |
| RTL | Use logical properties (`ms-*`/`me-*`/`ps-*`/`pe-*`) — never `ml-*`/`mr-*` in new components |
| A11y | WCAG AA minimum (≥4.5:1 body, ≥7:1 CTAs), visible focus rings, no hover-only info |

### Allowed primitive packages

Already in `package.json` and approved as headless layers:

- `@radix-ui/react-dialog`, `react-tabs`, `react-switch`, `react-dropdown-menu`, `react-toast`, `react-tooltip`, `react-select`, `react-accordion`
- `class-variance-authority` + `clsx` + `tailwind-merge` for variant composition
- `lucide-react` for icons (no emoji icons in UI)

## Backend boundary — DO NOT MODIFY

These files are out of scope for any UI/design work:

- `src/lib/supabase/{client,server,middleware}.ts`
- `src/app/api/**`
- `src/lib/{file-extractors,gemini,slickpay,tariff-translations}.ts`
- `src/config/plans.ts`
- `supabase/`, `supabase-init/`
- `src/i18n/{routing,config}.ts`

Translation **keys** in `src/i18n/messages/{en,fr,ar}.json` may have new keys added but existing keys may not be removed.

## Stack reference

- Next.js 16 (App Router) with `src/app/[locale]/` for i18n routing via next-intl
- Tailwind CSS v4 — design tokens live in `src/app/globals.css` under `@theme inline`
- Custom design tokens exported from `src/config/design-system.ts`
- React 19 + TypeScript strict
