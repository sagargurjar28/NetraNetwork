# Architecture

## Layering
- **UI Layer**: React + Tailwind + Framer Motion + Recharts + react-force-graph-2d + lucide-react
- **Routing**: React Router v6, AuthGuard wraps authenticated routes, /login is public
- **Server State**: TanStack Query hooks in `src/hooks/queries/*`, mutations in `hooks/mutations`
- **Client State**: Zustand stores (auth, ui, graph, upload) with persist where needed
- **Data**: axios client (`lib/api/client.ts`) with JWT interceptor + dev logging; domain modules per bounded context; socket.io wrapper
- **Mock**: Toggle via `VITE_USE_MOCKS`, fixtures in `lib/mocks`, simulated latency + random errors

## Data Flow
UI -> Query Hook -> api module -> (mock or axios client) -> response -> Query cache -> UI.
Socket streaming: CopilotDrawer -> mockStream -> token updates -> UI.

## Routing Map
See ROUTES.md. All authenticated routes render inside AppShell (sidebar+topbar+outlet+copilot drawer). ErrorBoundary per route handles crashes.

## Folder Structure
See README folder map. Path alias `@/*` -> `src/*` configured in vite.config.ts + tsconfig.app.json.
