# Changelog

## 2026-09-14 — Initial Build
- Scaffold Vite + React + TypeScript + React Router v6 + Zustand + TanStack Query + Tailwind + Framer Motion + Recharts + react-force-graph-2d + react-webcam + lucide-react
- Configure Tailwind tokens (dark base #0b1015 etc.), paths alias @/, ESLint/Prettier, .env.example
- Mesh background SVG + app-background pseudo-element per spec (opacity 0.08 on ::before only)
- UI primitives (29 components) with variants, sizes, loading/disabled, a11y, focus rings
- AppShell (collapsible sidebar + topbar + outlet + copilot drawer), DomainSwitcher capsule with motion sliding highlight, Topbar search/notifs/copilot toggle + Cmd+K
- Routing + AuthGuard + mock auth (localStorage token)
- Data layer: axios client with JWT + dev logging, domain api modules, socket.io wrapper + mockStream, mocks fixtures with latency/errors, Query hooks + login mutation
- Pages: Login, Network Home/KPIs/graph preview, Graph Explorer (filters, details, legend, toolbar), Entities/Cases tables + details
- Pages: Documents Home/UploadWizard(4 steps persist)/Library(grid/list)/Detail
- Pages: Identity Home/VerificationFlow(5 steps)/FaceScan(checkpoint history/detail)
- Copilot Drawer + Full Page with streaming, citations, markdown/table, domain context, history sidebar
- Settings (tabs) + Admin (users/audit/health)
- Polish: skeletons, ErrorBoundary, EmptyState, ErrorState, Toasts, shortcuts (/ , Esc, Cmd+K), responsive desktop-first, semantic/ARIA
- Docs: README, ARCHITECTURE, DESIGN_SYSTEM, COMPONENTS, ROUTES, API_CONTRACT, STATE, MOCKS, SHORTCUTS, this CHANGELOG
- Build verified: tsc -b && vite build passes (1.14MB chunk)

## 2026-09-16 — Group A: Visual corrections
- A1: Removed sidebar DomainSwitcher; Topbar capsule is single canonical (no props, layoutId domain-capsule, red highlight).
- A2: Validated mesh SVG (non-empty, red-tinted); .app-background isolation isolate; static opacity 0.12; no parent opacity.
- A3: New <MeshBackground /> canvas with lerped cursor light (rgba 0.06 → transparent 40%), dpr≤2, 60fps cap, reduced-motion static, FPS<30 fallback to 50% 30% static.
- A4: Black+red theme (surfaces #0a0e12/#10161c/#161d24, primary #dc2626/#ef4444/#991b1b); zero blue hex in src/; Button/tokens via Tailwind.

## 2026-09-16 — Group B: Copilot functionality
- B0: copilotStore exact shape, persist intelgrid.copilot.v1 (conversations+activeId only); /copilot socket contract documented, mock emits start/token/citation/end/error at 15–30ms.
- B1: Shared <CopilotChat /> in drawer + full page (left history, center thread, right context); placeholder deleted.
- B2: +New creates Untitled at top, focuses input.
- B3: ⋯ menu Rename/Pin/Duplicate/Delete + confirm modal + auto-title 40 chars.
- B4: User Copy/Edit (Save & Resend truncates)/Delete (confirm).
- B5: Assistant Copy/Regenerate/Thumbs/ Delete, feedback persisted.
- B6: Per-token appendToken, ▍ cursor, Send disabled, Stop aborts with partial + aborted:true.
- B7: Citation chips → SourceDrawer with Open in domain routing.
- B8: Auto-grow 6 lines, Enter/Shift+Enter, Cmd+K, Esc, attach chips → copilot:send, domain selector wired.

## 2026-09-19 — Split-pane copilot (prerequisite)
- `uiStore.copilotWidth` (320–640, default 420) + `SplitPane.tsx` resize handle (drag, double-click reset, arrow keys, separator role).
- `AppShell` docks copilot as an in-shell aside; `CopilotDrawer` is now a fill-parent panel (no fixed overlay).

## 2026-09-19 — Visual softening pass — unified shell container, gradient dividers, grain overlay, radius tokenization, FPS budget.
- Shell: `max-w-1920 mx-auto rounded-shell p-3` floating on mesh; sidebar/topbar transparent with gradient seams; nested half-radius rule (aside `rounded-r-shell`, no double seam).
- `GradientDivider` (H/V) at the three region seams only. Grain layer (120px data-URI, 0.035, soft-light) at z-1 between mesh img and cursor canvas (z-2).
- Radius tokens shell/panel/control/chip; chrome discipline (cards 0.04 border no shadow, inputs red-border focus, one soft shadow on modals, nav soft-surface + red edge).
- Graph: container-sized canvas (was window-sized → blank pane), settle-then-fit, node radii scaled to link distances.
- Perf: 59.5 FPS / 10s on `/network/graph` headless — no degradation. Screenshots before/after at 1440×900 in `walkthrough/`.

## 2026-09-19 — Post-cleanup walkthrough (1440×900, Playwright headless)
- "check" citation type removed from `Citation`/`MockCitation` unions and the markdown render branch (`CHK-` chip pattern deleted); two-segment capsule verified (highlight box == active tab box, no overhang).
- Walkthrough: 8-item sidebar (no Identity), switcher snaps Network↔Documents, `/identity*` → `/network` with content, copilot selector Auto/Network/Documents only, streaming tokens grow 205→367 chars with Stop show/hide, citation chip opens SourceDrawer, v1 identity state orphaned by v2 key bump (no crash), new send succeeds, zero console errors (only React Router v7 future-flag warnings).

## 2026-09-19 — Removed PS 188 (Identity Screening / Face ID) from prototype scope. Domain switcher reduced to 2 domains.
- Deleted `src/pages/identity/`, `src/lib/api/identity.ts`, identity query hooks; uninstalled `react-webcam`.
- Removed `/identity/*` routes (fall through to `/network`), Identity sidebar item + Topbar titles, Identity domain segment.
- Copilot `domain` union is now `"auto"|"network"|"documents"`; persist bumped to `intelgrid.copilot.v2` with identity→auto migration; selector shows Auto/Network/Documents only.
- Removed `mockChecks` fixtures; `check` citation type now resolves to `/copilot`.
- Docs updated: README, ROUTES, API_CONTRACT, STATE, MOCKS.

## 2026-09-16 — Group A — post-audit 2: mesh spec lock
- Replaced `public/assets/mesh-texture.svg` with final spec: viewBox 420×420, grid every 60px at 5% white, noise via feTurbulence baseFrequency 0.9, blobs via low-opacity radial gradients (#dc2626/white).
- `MeshBackground.tsx`: static layer is now `<img src="/assets/mesh-texture.svg">` absolute inset-0 w-full h-full, opacity 0.2, zIndex 0; cursor canvas at zIndex 1 with `clearRect` every frame and no opaque fill.
- `AppShell.tsx`: content wrapper at zIndex 10+ so grid shows behind panels and cursor light sweeps over it.
- Verify: open `/assets/mesh-texture.svg` directly (grid + noise + soft blobs), reload app for faint grid + sweeping light.

## 2026-09-16 — Group C: Audit items
- C1: AuthGuard preserves from-location; login returns (tested /network/graph).
- C2: uploadStore persist verified (step+metadata survive refresh).
- C3: FaceScan getUserMedia failure → ErrorState + Upload photo instead (same flow).
- C4: RouteErrorBoundary per route; shell survives route throw.
- C5: EmptyState on cases/entities/documents/checks/conversations/graph (illustration+message+CTA).
- C6: Shortcuts verified (Cmd+K, /, Esc, Enter/Shift+Enter).
- C7: Graph draggable/hover/click + right-click menu + toolbar Fit/ZoomIn/ZoomOut/Layout/ExportPNG.
- C8: Central toast() mounted once; all mutations toast success/error.
