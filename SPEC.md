# mex-open-data-frontend-react — v0.2 redesign spec (executable)

> Mapped 1:1 to the commits that will land in this PR. No open questions.

---

## 0. Decisions taken

| Decision | Value |
|---|---|
| Visual identity | **Stone-warm neutrals + cinnabar accent** (`#bc3908`). No flag green. |
| Type display | Inter Variable |
| Type editorial | Source Serif 4 (used in headings + dataset descriptions) |
| Type mono | JetBrains Mono Variable |
| Dark mode | First-class, class-strategy (`<html class="dark">`), persisted |
| Component foundation | Radix UI primitives + Lucide icons + cmdk |
| Tables | TanStack Table + virtualization for ≥ 200 rows |
| Charts | Keep Recharts (no new heavy dep this iteration) |
| Maps / Observable Plot | **Deferred** to v0.3 (avoids ballooning bundle) |
| Insights page | **Deferred** to v0.3 (needs backend changes) |
| Storybook / axe-playwright | **Deferred** to v0.3 (tooling) |
| Routes | Spanish (`/categorias`, `/datasets`, `/insights` later) |
| Search | Folded into `/datasets` with chip filters + URL state |
| Atajos teclado | ⌘K palette, `g h`, `g c`, `g d`, `/`, `?`, `.` (mode toggle) |

---

## 1. Color tokens

```css
@theme {
  /* Neutrals — warm stone */
  --color-ink-0:  #fafaf7;
  --color-ink-1:  #f3f1ec;
  --color-ink-2:  #e7e4dc;
  --color-ink-3:  #cbc7bd;
  --color-ink-5:  #8b867b;
  --color-ink-7:  #4a463d;
  --color-ink-9:  #1c1a16;

  /* Dark mode mirror (used via [data-theme=dark] selectors) */
  --color-night-0: #0c0a09;
  --color-night-1: #17150f;
  --color-night-2: #221f17;
  --color-night-3: #36322a;
  --color-night-5: #6f6a5e;
  --color-night-7: #b8b3a8;
  --color-night-9: #ece9e0;

  /* Accent — cinnabar */
  --color-accent-50:  #fef3ee;
  --color-accent-100: #fde0d0;
  --color-accent-300: #f59669;
  --color-accent-500: #d35327;
  --color-accent-600: #bc3908;
  --color-accent-700: #9a2c06;

  /* Semantics */
  --color-good: #15803d;
  --color-warn: #b45309;
  --color-bad:  #b91c1c;
  --color-info: #1d4ed8;

  /* Data viz — qualitative ramp */
  --color-viz-1: #1c1a16;
  --color-viz-2: #bc3908;
  --color-viz-3: #0f766e;
  --color-viz-4: #6d28d9;
  --color-viz-5: #be123c;
  --color-viz-6: #4b5563;
}
```

Dark mode inverts the `ink-*` ramp into `night-*` (same indices). Accent + semantic + viz palettes stay identical.

## 2. Typography stack

```css
@theme {
  --font-display: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --font-serif:   "Source Serif 4", ui-serif, Georgia, serif;
  --font-mono:    "JetBrains Mono Variable", ui-monospace, monospace;
}
```

Web fonts loaded via `@fontsource-variable/inter`, `@fontsource-variable/source-serif-4`, `@fontsource-variable/jetbrains-mono` (no CDN, kept in node_modules).

## 3. Component primitives (`src/ui/`)

| Component | File | Notes |
|---|---|---|
| `Button` | `button.tsx` | variants `primary`, `secondary`, `ghost`; sizes `sm/md/lg` |
| `IconButton` | `icon-button.tsx` | square w/ tooltip; for `Theme` toggle, kbd hints |
| `Tag` | `tag.tsx` | for categories, formats, tags |
| `Card` | `card.tsx` | editorial card w/ optional `actions` slot |
| `KPI` | `kpi.tsx` | label · value · delta · optional sparkline |
| `Tabs` | `tabs.tsx` | Radix Tabs wrapper |
| `Tooltip` | `tooltip.tsx` | Radix Tooltip wrapper |
| `Dialog` | `dialog.tsx` | for filter sheets |
| `Skeleton` | `skeleton.tsx` | rectangles for placeholders |
| `EmptyState` | `empty-state.tsx` | icon · headline · helper · action |
| `Sparkline` | `sparkline.tsx` | tiny inline SVG line w/ optional dot |
| `Theme` | `theme.tsx` | provider + `useTheme()` |
| `CommandPalette` | `command-palette.tsx` | cmdk-based |

Each primitive is purely composable; no business logic.

## 4. Layout shell

| Region | Before | After |
|---|---|---|
| Header | Logo + flat nav + status pill | Wordmark editorial + slim nav (`Inicio · Categorías · Datasets · Insights · Acerca`) + ⌘K trigger + theme toggle + status pill |
| Footer | 2 links | Compact mini-grid (data, repo, build hash) |
| Body | `max-w-7xl` always | Per-page `prose | narrow | default | wide` |

## 5. Pages

### 5.1 `/` (Inicio)
- Hero **marquee** in serif, one sentence stating scope.
- **Treemap** of categories (proportional to `dataset_count`).
- **KPI strip**: total datasets, categorías, organizaciones, % CSV, recientes.
- **Recientemente actualizados**: list of 10 datasets with relative date + organization.
- **Explora por** tiles (4): Tema / Organización / Formato / Recencia → presets of `/datasets`.

### 5.2 `/categorias`
- Default: **small-multiples** (one mini-bar per category).
- Toggle `Tabla` (icon button, `.` shortcut): TanStack Table sortable by name, slug, `dataset_count`.

### 5.3 `/categorias/:slug`
- Editorial hero (serif title, slug as mono kicker).
- KPI strip (datasets, recursos totales, organizaciones únicas, última actualización).
- Two side-by-side charts: **formats donut** + **top organizaciones bar**.
- Dataset table virtualized (sticky header, row click → dataset).

### 5.4 `/datasets/:slug`
- Editorial hero.
- Tabs: `Resumen · EDA · ML · Recursos`. Persist via `?tab=`.
- Resumen: descripción larga, tags, organización, license, link al portal.
- Recursos: tabla con badge de formato, tamaño, descarga directa.

### 5.5 `/datasets/:slug?tab=eda`
- Variable selector dropdown (top-left).
- Profile table with **inline sparkline** + **null bar** for each column.
- 3 cards: histogram for the selected numeric var, top-10 for the selected categorical, time series if a date col is detected.
- Correlation matrix.

### 5.6 `/datasets/:slug?tab=ml`
- Slider `k = 2..8` → re-runs k-means client-side.
- Scatter PCA.
- Centroid table with viz colour swatches.
- **Resumen automático** en español describiendo qué hace cada cluster.

### 5.7 `/datasets`
- Chips for filters: `categoría`, `formato`, `q`.
- Add/remove chips edits URL `?q=...&category=...&format=...`.
- Virtualized list.

### 5.8 `/acerca`
- Editorial page (serif body), brand statement, links to sibling repos.

### 5.9 `/organizaciones`
- Kept as is (graceful 404 message until backend ships it).

## 6. Interactions

- ⌘K command palette (cmdk): categories, datasets, organizations, pages.
- Theme toggle (Sun/Moon).
- Shortcuts:
  - `g h` → /
  - `g c` → /categorias
  - `g d` → /datasets
  - `g i` → /insights (404 page if not yet)
  - `?` → kbd help dialog
  - `.` → toggle Reading↔Power mode where applicable
  - `[ / ]` → previous/next tab in dataset detail

## 7. Performance

- `React.lazy(() => import(...))` per page; root chunk targets `< 80 KB gz`.
- TanStack Query persisted to `localStorage` for `categories`, `category-datasets`.
- Lucide icons tree-shake (use named imports only).
- Recharts kept eager only on home; lazy elsewhere.

## 8. Accessibility

- Focus ring: `outline: 2px solid var(--color-accent-500); outline-offset: 2px;`.
- `prefers-reduced-motion`: disable Recharts animations.
- `aria-label` on every standalone icon button.
- `<table>` element used for data tables (with proper headers); chart frames include a `<figcaption>`.

## 9. Commit-by-commit roadmap

| # | Commit subject |
|---|---|
| 1 | `chore(deps): add radix, lucide, cmdk, fontsource, tanstack-table, react-hotkeys-hook` |
| 2 | `feat(theme): stone + cinnabar tokens, dark mode, web fonts` |
| 3 | `feat(ui): primitives — button, card, tag, kpi, tabs, tooltip, dialog, skeleton, empty-state, sparkline, theme provider` |
| 4 | `feat(shell): editorial header + footer + cmdk palette + theme toggle` |
| 5 | `feat(home): editorial landing — marquee, treemap, KPI strip, recent updates, explore tiles` |
| 6 | `feat(categorias): small-multiples + table toggle for the category index` |
| 7 | `feat(categoria): formats donut + top organizaciones + virtualized table` |
| 8 | `feat(dataset): tabs subnav, editorial hero, resources table` |
| 9 | `feat(eda): variable selector, inline sparklines, correlation matrix` |
| 10 | `feat(ml): k slider + narrative summary` |
| 11 | `feat(search): merge /search into /datasets with chip filters and URL state` |
| 12 | `perf(routes): lazy-load every page, route-level Suspense w/ skeletons, kbd shortcuts` |
| 13 | `chore(build): rsync + redeploy to lenovo` |

---

## 10. Definition of done

- 0 occurrences of `brand-green`, `--color-mex-green`, `emerald` in CSS.
- Dark mode works across every page.
- Bundle initial chunk < 100 KB gz (target 80; cap 100).
- All routes still build and the existing E2E (home + datasets + search) work end-to-end against the deployed backend.
- `npm run build` clean.
- Each route renders a meaningful skeleton, not a spinner.
- A11y: every icon button has `aria-label`; `prefers-reduced-motion` honoured.
- 13 commits, one per spec entry.
- Deployed on lenovo, reachable at `http://192.168.1.65:18080/`.
