# Mocks

Toggle: `VITE_USE_MOCKS=true` in .env. Helper `isMock()` in `lib/mocks/helpers.ts`. All api modules branch on isMock.

## Fixtures (src/lib/mocks/fixtures.ts)
- mockEntities (6: Vikram Singh, Anita Rao, Rahul Mehta, Sun Logistics, Ahmed Khan, Priya Desai)
- mockCases (4: Black Kite, Sun Logistics Fraud, Cyber Extortion, Narcotics Corridor)
- mockGraph (nodes from entities, 5 links: associate/financial/owner/call)
- mockRelations, mockDocuments (4), mockConversations (2), mockUsers (3), mockAuditLogs (3)

## Behavior
- Latency: delay(200-800ms) default, graph 600ms, upload 1200ms
- Errors: maybeError(8% default, login 5%) throws {message} so ErrorState/Toast visible; verify by retrying
- Streaming: mockStream(prompt,onToken,onDone) emits fictional analysis in ~6-char chunks every 40ms
- Login: mockLogin(username) returns {token: mock-jwt-..., user:{name:username||Arjun, role:admin}}

## How to Extend
1. Add fixture array in fixtures.ts
2. Add branch in relevant api module (e.g., network.ts): if(isMock()){ await delay(); return fixture }
3. Add query hook in hooks/queries
4. Verify toggle: set VITE_USE_MOCKS=false to hit real API without code change

## How to Toggle
```bash
# mocks on
VITE_USE_MOCKS=true npm run dev
# mocks off (real backend)
VITE_USE_MOCKS=false VITE_API_BASE_URL=https://api.example.com/api npm run dev
```
