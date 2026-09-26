NetraNetwork frontend — part of the NetraNetwork repository.

Stack: Vite + React + TypeScript + Tailwind + zustand + TanStack Query + react-force-graph-2d

Extension note: uses .tsx / .ts, not .jsx / .js. TypeScript is deliberate.

Run: npm install, cp .env.example .env, npm run dev

Env: VITE_USE_MOCKS=true serves fixtures. Set false and configure VITE_API_BASE_URL to hit the backend.

Note: Dockerfile intentionally absent. Add when frontend is added to docker-compose.yml.
