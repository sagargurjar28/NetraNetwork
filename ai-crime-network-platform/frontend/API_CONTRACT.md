# API Contract

Base `VITE_API_BASE_URL`, Bearer JWT, errors `{ message, status }`.

## REST
- Auth: `POST /api/auth/login`, `GET /api/auth/me` (unchanged).
- Documents (case-scoped only): `GET /cases/{caseId}/documents/`, `POST /cases/{caseId}/documents/` (FormData `file` + `case_id`), `POST /documents/verify`. No single-document GET (filter the case list client-side); no stats route (compute client-side).
- Copilot: `POST /copilot/chat` only (`{ content, domain, attachments }` → `{ reply, citations }`). No Socket.IO in the request path.
- Boards: `GET /boards/{id}/`, `POST /boards/{id}/pins/`, `POST /boards/{id}/connections/`, `DELETE /boards/{id}/pins/{pinId}/`, `GET /cases/{caseId}/boards/`. No edge-delete, move, or rename endpoints (local-only).
- Mock-only routes (no backend match; mock regardless of `VITE_USE_MOCKS`): network (`/network/*`), admin (`/admin/*`).

## Socket.IO — namespace /copilot (mock streaming transport)
Connect: `io(BASE + '/copilot')`. Mock (`src/services/socketService.ts` `mockCopilotStream`) emits identical names at 15–30ms/token so socket is drop-in. Used only when `VITE_USE_MOCKS=true`; real mode uses `POST /copilot/chat`.

Client → server:
- `copilot:send` — `{ conversationId, content, domain, attachments: string[] }`
- `copilot:abort` — `{ conversationId, messageId }`
- `copilot:regenerate` — `{ conversationId, messageId }`

Server → client:
- `copilot:start` — `{ conversationId, messageId }`
- `copilot:token` — `{ conversationId, messageId, token: string }`
- `copilot:citation` — `{ conversationId, messageId, citation: Citation }`
- `copilot:end` — `{ conversationId, messageId }`
- `copilot:error` — `{ conversationId, messageId, error: { code, message } }`

Citation schema:
```ts
type Citation = { id: string; type: 'document'|'entity'|'case'; refId: string; title: string; excerpt: string }
```
Click → SourceDrawer → "Open in domain" → `/documents/:id`, `/network/entities/:id`, `/network/cases/:id`.

Edit/regenerate/feedback are client-store operations (no REST): `editUserMessage` truncates after + re-streams; regenerate removes reply + streams new; feedback via `setFeedback`.
