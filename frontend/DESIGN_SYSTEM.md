# Design System — Black + Red

## Palette
- Base: `#0b1015` (stays)
- Surfaces (deepened): `#0a0e12` (surface-1), `#10161c` (surface-2), `#161d24` (surface-3)
- Borders: `rgba(255,255,255,0.06)`
- Text: primary `#e6edf3`, secondary `#8b98a5`, muted `#5a6672`
- Primary accent (red): primary `#dc2626`, hover `#ef4444`, pressed/muted `#991b1b`
- Semantic only: success `#22c55e`, warning `#f59e0b`, info `#06b6d4`, danger `#ef4444` (destructive/critical only)
- Tailwind tokens: `bg-base, bg-surface-1/2/3, text-text-primary/secondary/muted, bg-accent-primary/hover/muted, text-accent-hover, border-accent-primary`

Applied to: primary buttons (`bg-accent-primary hover:bg-accent-hover active:bg-accent-muted`), active nav (`bg-accent-primary/15 border-accent-primary/30`), domain capsule highlight (`bg-accent-primary`), focus rings (`ring-accent-primary`), links (`#ef4444 → #dc2626`), chart primary series (`#dc2626`), selected node borders (`#dc2626`).

## Mesh + Light-follow
- Static SVG spec (`public/assets/mesh-texture.svg`, viewBox 420×420, tile 420px):
  - Base `rect #0b1015`; grid every 60px (`M0 60 H420…`, `M60 0 V420…`) stroke `#c9d1d9` at 5% opacity, 1px, no fill.
  - Noise via `feTurbulence fractalNoise baseFrequency 0.9 numOctaves 2 stitchTiles stitch seed 7` + `feColorMatrix` to white at 0.35 alpha, full-tile rect at opacity 0.5.
  - Blobs via low-opacity radial gradients: `blobA #dc2626 0.10 → 0.02 → 0`, `blobB #ffffff 0.05 → 0` (circles at 90,90 r140 / 340,320 r160 / 300,80 r110).
  - Rendered as `<img src="/assets/mesh-texture.svg">` absolute inset-0 w-full h-full, `opacity: 0.2`, `zIndex: 0`, pointer-events none, aria-hidden.
- Reactive: `<MeshBackground />` (`src/components/MeshBackground.tsx`) — `.mesh-root` absolute inset-0 z-0 inside `.app-background` (isolation isolate); cursor-light canvas at `zIndex: 1` above the img; every frame starts with `ctx.clearRect(0,0,w,h)` (no opaque fill) then a transparent radial gradient `rgba(255,255,255,0.06) → transparent 40%`; mousemove sets target, rAF lerps 0.08 (trails, not 1:1); dpr capped 2; 60fps throttle (16.6ms).
- AppShell content wrapper sits at `zIndex: 10` or higher so the grid stays faintly visible behind all panels while the light sweeps over it.
- `prefers-reduced-motion`: no tracking, static gradient at 50% 30% only.
- FPS fallback: avg FPS over 3s window <30 → degrade to `.mesh-fallback.visible` (static radial at 50% 30%, fade-in 1.2s), stop pointer tracking.
- Never put opacity on parent — only on mesh layers.

## Shell Container
- Viewport: `min-h-screen p-3` on `.app-background`; mesh body `#0b1015` shows through the padding.
- Shell: `mx-auto max-w-[1920px] w-full rounded-shell (16px) border 1px rgba(255,255,255,0.04) bg-surface-1 overflow-hidden flex`, `min-height: calc(100vh - 1.5rem)`, `z-index: 10`.
- Sidebar + topbar are transparent (no own background, no solid borders); they share the shell surface. Domain capsule keeps its inset `bg-base` — the single allowed nested surface in the topbar.

## Nested Rounding Rule
- Any element touching the shell edge uses a matching half-radius; never a full `rounded-*` on an edge-touching child (double-round seam).
- Sidebar: `rounded-l-shell rounded-r-none`. Copilot aside: `rounded-r-shell rounded-l-none`. Main column: `rounded-l-none rounded-r-shell` when aside closed, `rounded-none` when open.
- Shell `overflow-hidden` clips anything missed.

## Gradient Dividers
- Component: `src/components/ui/GradientDivider.tsx` (`orientation horizontal|vertical`, `aria-hidden`, no role).
- Horizontal: `h-px w-full bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.08),transparent)]`.
- Vertical: `w-px self-stretch bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.08),transparent)]`.
- Placed only at: sidebar↔main, topbar↔main, main↔copilot aside. Card/input/table/capsule edges stay solid.

## Grain Overlay (z-order)
- `z-0` mesh SVG `img` (opacity 0.2) → `z-1` grain (new) → `z-2` cursor-light canvas → `z-10` shell content.
- Grain: inline SVG data-URI, 120×120 tile, `feTurbulence fractalNoise baseFrequency 0.85 numOctaves 1 stitchTiles stitch` → grayscale `feColorMatrix`; `opacity: 0.035`, `mix-blend-mode: soft-light`, `pointer-events: none`, `repeat`.
- Tiles seamlessly (120px repeat verified at 1280/1440/1920 widths via computed-style audit + screenshots). At 100% invisible; at 400% zoom fine grain resolves.

## Radius Scale
- Tokens (`tailwind.config.js`): `shell 16px` (`rounded-shell`), `panel 10px` (`rounded-panel`), `control 6px` (`rounded-control`), `chip 4px` (`rounded-chip`). `rounded-full` stays for avatars/pills (badges, chips, capsule, switch, progress).
- Cards/Panels/Modals/Tables/EmptyStates → `rounded-panel`. Buttons/inputs/menus/tabs/toasts → `rounded-control`. Kbd/tooltips → `rounded-chip`. Native checkbox/radio keep platform shape + red focus ring.

## Chrome Discipline
- Cards: `1px rgba(255,255,255,0.04)`, no default shadow; `hover:shadow-card` for interactive cards only. Panels: no shadows, elevation via surface shift.
- Inputs: `1px rgba(255,255,255,0.06)`, no inner shadow; focus = red accent border (`focus:border-accent-primary`), no glow ring. (Native checkbox/radio + buttons keep thin focus rings for a11y.)
- One soft shadow (`shadow-soft 0 8px 32px rgba(0,0,0,0.5)`) allowed on Modals/overlay Drawer/SourceDrawer. Nothing else.
- Active sidebar nav: `bg-surface-hover (rgba(255,255,255,0.03))` + red `border-l-2` indicator. Not a pill, not a rounded rect.

## Performance Budget
- Three stacked layers (mesh + grain + cursor light). Measured 2026-09-19 on `/network/graph` over 10s in headless Chromium (software rendering, 1440×900, cursor tracking active): **59.5 FPS** — no degradation triggered.
- Degradation path if FPS < 30 on target hardware: (1) reduce grain opacity 0.035 → 0.02; (2) if still < 30, disable cursor-light tracking (existing static-radial fallback). Grain is never removed — cheapest layer (static, composited once).

## Do / Don't
- DO use `bg-accent-primary` for primary actions, active states, capsule highlight.
- DO reserve red-danger for destructive/critical; use success/warning/info only semantically.
- DO keep text on red as white; check AA contrast.
- DON'T use blue hex anywhere (`#3b82f6, #2563eb, rgba(59,130,246)` banned — grep must be empty).
- DON'T use accent decoratively (no red gradients on cards, no colored shadows).
- DON'T put opacity on `.app-background`; DON'T render DomainSwitcher outside Topbar.
