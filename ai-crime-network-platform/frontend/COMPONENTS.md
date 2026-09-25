# Components

> Single canonical DomainSwitcher lives in Topbar only. Do not render elsewhere.

## DomainSwitcher (`src/components/layout/DomainSwitcher.tsx`)
No props. Compact capsule always. `role=tablist`, active via route, motion `layoutId="domain-capsule"` highlight `bg-accent-primary`.
```tsx
import { DomainSwitcher } from '@/components/layout/DomainSwitcher'
// Topbar only:
<DomainSwitcher />
```

## MeshBackground (`src/components/MeshBackground.tsx`)
```tsx
import { MeshBackground } from '@/components/MeshBackground'
<div className="app-background"><MeshBackground />{/* content z-1 */}</div>
```
Props: none. Handles dpr cap, rAF lerp, reduced-motion, FPS fallback internally.

## CopilotChat (`src/components/copilot/CopilotChat.tsx`)
Shared by drawer + page.
```tsx
<CopilotChat mode="drawer" onClose={() => setOpen(false)} />
<CopilotChat mode="page" />
```
Features: streaming tokens + ▍ cursor, Stop/abort, markdown + tables + code + citation chips, attachments, domain selector, edit/resend, regenerate, feedback, copy/delete, toasts.

## Conversation item menu (in `src/pages/copilot/FullPage.tsx`)
Hover ⋯ → Rename (inline input, Enter/blur save, Esc cancel), Pin, Duplicate, Delete (confirm modal, active → next-most-recent).

## GradientDivider (`src/components/ui/GradientDivider.tsx`)
```tsx
<GradientDivider orientation="vertical" />   // sidebar↔main, main↔aside
<GradientDivider orientation="horizontal" /> // topbar↔main
```
Shell seams only. `aria-hidden`, no role. Never on cards/inputs/tables/capsule.

## CopilotSplitHandle (`src/components/layout/SplitPane.tsx`)
Drag handle for the docked copilot aside. `role="separator"`, clamp 320–640px into `uiStore.copilotWidth`, double-click resets 420, arrows nudge ±10.

## Card / Panel radius + shadow rules
- `Card`: `rounded-panel`, `1px rgba(255,255,255,0.04)`, no default shadow, `hover:shadow-card` (interactive only).
- `Panel`: `rounded-panel`, no shadow, surface shift for elevation.
- `Modal`: `rounded-panel` + single `shadow-soft`. Radius tokens: panel 10 / control 6 / chip 4 (`rounded-full` stays for pills/avatars).

## RouteErrorBoundary (`src/components/errors/RouteErrorBoundary.tsx`)
```tsx
<Route path="/network" element={<RouteErrorBoundary label="Network home"><NetworkHome /></RouteErrorBoundary>} />
```
Isolates crashes per route; shell never crashes.

## SourceDrawer (`src/components/copilot/SourceDrawer.tsx`)
Props: `{ citation: Citation | null, onClose }`. Shows title, excerpt, doc/entity IDs, "Open in domain" link.

## Primitives (all token-routed, red focus rings)
Button (primary `bg-accent-primary`), IconButton, Input, Textarea, Select, Checkbox, Radio, Switch, Badge, Tag, Chip, Card/Panel, Modal, Drawer, Tooltip, Dropdown, Tabs, SegmentedControl, Table, Pagination, Skeleton, Spinner, Toast (central `toast()` helper), EmptyState (illustration + message + CTA, required on every list), ErrorState, Avatar, Divider, ProgressBar, Breadcrumb, Kbd.
