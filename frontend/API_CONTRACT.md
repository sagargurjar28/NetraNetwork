# API Contract

Base `VITE_API_BASE_URL`, Bearer JWT, errors `{ message, status }`.

## REST (unchanged shapes, see prior)
Auth, network, documents, admin, copilot REST as before. Identity endpoints (`/api/identity/*`, `/api/face/*`, `/api/verify/*`) removed with PS 188.

## Socket.IO — namespace /copilot
Connect: `io(BASE + '/copilot')`. Mock (`src/lib/socket.ts` `mockCopilotStream`) emits identical names at 15–30ms/token so socket is drop-in.

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
