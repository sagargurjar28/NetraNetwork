# Routes

AuthGuard: `if (!token) return <Navigate to="/login" state={{ from: location }} replace />`. Login reads `state.from` and navigates back (e.g. /network/graph).

Each route under AppShell is wrapped in its own `<RouteErrorBoundary label>` — throwing in one route shows ErrorState, shell survives.

| Path | Component | Layout |
|------|-----------|--------|
| /login | Login | public, mesh bg |
| /network | NetworkHome | shell + boundary |
| /network/graph | GraphExplorer | shell + boundary, filters + canvas + details + toolbar + context menu |
| /network/entities, /:id | Entities, EntityDetail | table + EmptyState |
| /network/cases, /:id | Cases, CaseDetail | table + EmptyState |
| /documents | DocsHome | stats + CTA |
| /documents/upload | UploadWizard | persist step + metadata |
| /documents/library | Library | grid/list + EmptyState |
| /documents/:id | DocumentDetail | metadata + preview + audit |
| /copilot | CopilotPage | **full-page chat**: left rail history + center CopilotChat + right collapsible context (domain, citations, attachments) |
| /settings | Settings | tabs |
| /admin | Admin | users + audit + health |
