# Digital Signage Platform — Web Dashboards

Next.js app containing the Super Admin panel (`/`) and the Customer Portal (`/portal`). Both talk to the Platform API in the sibling repo `Digital-Signage-API`.

## Running with the API

1. Start the backend stack (Postgres, Redis, MinIO, API, worker) from the API repo:

   ```bash
   cd ../Digital-Signage-API
   docker compose -f docker/docker-compose.yml up --build
   ```

   The API listens on `http://localhost:4000` (`/docs` for the interactive reference) and seeds demo data on first start.

2. Point the dashboards at it and start the dev server:

   ```bash
   cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000/login](http://localhost:3000/login) and use a demo account:

   | Dashboard | Email | Password |
   |---|---|---|
   | Super Admin | `admin@dsp.local` | `Admin123!` |
   | Customer Portal (Acme Corp) | `sarah.mitchell@acmecorp.com` | `Customer123!` |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests (API client, session, formatting) |
| `npm run api:types` | Regenerate `src/lib/api/schema.d.ts` from `../Digital-Signage-API/docs/openapi.json`; run after any API schema change |

## How the frontend talks to the API

- `src/lib/api/client.ts` — typed `openapi-fetch` client. Attaches the bearer token, refreshes it once on expiry, unwraps the `{ data, meta }` envelope, and throws `ApiError` with the API's error code.
- `src/lib/api/session.ts` — access token in memory, rotating refresh token in `localStorage`.
- `src/lib/api/hooks/*` — TanStack Query hooks, one file per backend module.
- `src/components/auth/*` — `AuthProvider` (session, `/auth/me`, Socket.IO connection) and `RequireSession` (route guard by role).
- Real-time events from the `/app` Socket.IO namespace invalidate the matching queries, so screen status and media processing update without a refresh.

## Deployment

The Vercel deployment serves the dashboards only; it needs a hosted API reachable at `NEXT_PUBLIC_API_URL` to be functional.
