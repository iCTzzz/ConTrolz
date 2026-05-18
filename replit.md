# AttendanceIQ

A premium SaaS attendance control system for registering employee check-ins and check-outs in real time.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/attendance run dev` — run the frontend (port 18763)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, shadcn/ui, Tailwind CSS, Framer Motion, wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/db/src/schema/` — Drizzle ORM schema (employees.ts, attendance.ts)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/attendance/src/pages/` — Frontend pages (dashboard, checkin, employees, attendance)
- `artifacts/attendance/src/components/` — Shared UI components and layout

## Architecture decisions

- Contract-first: OpenAPI spec gates codegen which gates frontend development
- Drizzle ORM with Postgres — no migrations layer, uses `drizzle-kit push` in dev
- Orval generates React Query hooks and Zod validators from the OpenAPI spec
- Entity-shaped schema names in OpenAPI (EmployeeInput, EmployeeUpdate) to avoid TS2308 collisions
- Active employee detection: latest log per employee per day determines checkin/checkout state

## Product

- **Dashboard**: Real-time KPIs (active employees, check-ins/outs today, total headcount), activity feed, active now panel
- **Check-in Kiosk**: Employees enter their code to check in or out, with smart validation (duplicate check-in prevention, no-entry checkout prevention, inactive employee detection)
- **Employee Management**: Add, edit, delete employees with search/filter
- **Attendance Logs**: Paginated history filterable by date and type

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec changes before touching backend routes
- `pnpm run typecheck` verifies the full stack including generated types — run before deploying
- Active employee state is determined by the most recent log entry per employee per calendar day

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
