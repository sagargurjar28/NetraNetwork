# Architecture

## Layering
- **UI Layer**: React + Tailwind + Recharts + React Flow (@xyflow/react) + lucide-react. Framer Motion removed (zero live imports). date-fns removed (zero live imports).
- **Routing**: React Router v6, AuthGuard wraps authenticated routes, /login is public
- **Server State**: TanStack Query hooks in `src/hooks/queries/*`, mutations in `hooks/mutations`
- **Client State**: Zustand stores (auth, ui, copilot, upload) with persist where needed (graphStore deleted; uiStore persists `settings` only)
- **Data**: axios client (`src/services/api/client.ts`) with JWT interceptor + dev logging; barrel `src/services/api.ts`; facades `copilotService.ts`/`socketService.ts`
- **Mock**: Toggle via `VITE_USE_MOCKS`, fixtures in `src/mocks`, simulated latency + random errors. network/admin modules are mock-only (no backend routes).

## Data Flow
UI -> Query Hook -> api module -> (mock or axios client) -> response -> Query cache -> UI.
Socket streaming: CopilotDrawer -> mockStream -> token updates -> UI.

## Routing Map
See ROUTES.md. All authenticated routes render inside AppShell (sidebar+topbar+outlet+copilot drawer). ErrorBoundary per route handles crashes.

## Folder Structure
See README folder map. Path alias `@/*` -> `src/*` configured in vite.config.ts + tsconfig.app.json.
