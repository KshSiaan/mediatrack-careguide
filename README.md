# MediTrack CareGuide

MediTrack CareGuide is an administrative dashboard for managing doctors,
patients, assignments, and care-network activity. The frontend is built with
Next.js and communicates with an authenticated REST API backed by Better Auth.

> **Testing-only environment:** This repository documentation describes local
> development and integration testing. It must not be used as a production
> deployment guide without adding production security, observability, data
> protection, and operational controls.

## Completed implementation

### Admin experience

- Dashboard analytics loaded from `GET /api/dashboard`.
- Doctor management with server-side search, date filtering, pagination, and
  create, edit, and delete actions.
- Doctor assignment tabs backed by the API:
  - All doctors: `assignment=all`
  - Assigned doctors: `assignment=assigned`
  - Unassigned doctors: `assignment=unassigned`
- Patient management with server-side search, date filtering, pagination,
  doctor filtering, assignment, create, edit, and delete actions.
- Doctor patient views from the doctor management page.
- Reusable doctor and patient form fields.
- Quick Create workflow in the sidebar for creating a doctor or patient.
- Draggable Quick Create window using `react-draggable`.
- Loading, empty, validation, authentication, authorization, and API error
  states.
- Better Auth logout with redirect to the sign-in screen.

### Navigation and routing

- Landing-page routing:
  - Authenticated users are redirected to `/admin/d`.
  - Unauthenticated users are redirected to `/auth/signin`.
- Protected `/admin/*` routes use `proxy.ts` for an optimistic cookie check.
- The admin layout also uses a client-side session guard.
- The backend remains the final authority for authentication and authorization.
- Sidebar navigation is intentionally limited to the core dashboard,
  doctors, patients, and Quick Create actions.
- Admin breadcrumbs update based on the active route.

### Data and API integration

- Central typed REST client in `src/lib/api.ts`.
- Central TanStack Query factories in `src/lib/queries.ts`.
- Requests include `credentials: "include"` so Better Auth cookies are sent.
- Query cancellation uses TanStack Query's `AbortSignal`.
- Search and list requests are server-side to remain usable with large
  doctor and patient datasets.
- Mutations invalidate related doctor, patient, and dashboard queries.
- Query keys include serialized filter and pagination parameters so cached
  results do not overlap between views.
- The complete frontend contract is documented in `API_INTEGRATION.txt`.

## Design direction

The dashboard uses a focused clinical operations visual language rather than a
generic SaaS admin template:

- Calm semantic colors and restrained surfaces keep patient and provider data
  easy to scan.
- Strong typographic hierarchy makes care-network totals, trends, and actions
  easy to locate.
- Dashboard cards summarize the network without hiding the underlying data.
- Provider distribution and registration activity are visualized with charts.
- The bottom dashboard section contains a “Top assigned doctors” table.
- Tables remain information-dense while preserving clear spacing and readable
  action controls.
- Search and date controls stay aligned in a single toolbar.
- Empty and error states explain what happened and what the user can do next.
- Layouts are responsive and preserve keyboard focus and accessible dialog
  titles.

## Primary libraries

- **Next.js 16.3.8** — App Router application framework.
- **React 19.2.8** — UI rendering and client components.
- **TypeScript** — Static typing across API models and UI code.
- **shadcn/ui** with the project's Radix-based components — Accessible
  primitives and consistent dashboard composition.
- **Radix UI** — Dialogs, tabs, popovers, sidebar primitives, and other
  accessible interactions.
- **Tailwind CSS v4** — Utility-based layout and design tokens.
- **TanStack Query 5** — Server-state fetching, caching, cancellation,
  pagination, mutation state, and invalidation.
- **Better Auth** — Session management and authentication client.
- **Recharts** — Dashboard analytics charts.
- **react-draggable** — Draggable Quick Create window.
- **react-hook-form** and **Zod** — Form and validation support.
- **Sonner** — Toast feedback.
- **Lucide React** — Interface icons.
- **Biome** — Formatting and lint checks.
- **Bun 1.2.5** — Package manager and script runner.

## Local testing setup

### Requirements

- Bun 1.2.5 or a compatible recent Bun release.
- Node.js compatible with the installed Next.js version.
- A running MediTrack backend API.
- A Better Auth session supported by the backend.

### Environment variables

Create a local `.env` file. Environment files are ignored by Git and should
never be committed. The following is a **testing-only template**:

```env
# Testing only. Use the local backend URL for development.
NEXT_PUBLIC_API_URL=http://localhost:5000
```

`NEXT_PUBLIC_API_URL` is the base URL used by both the typed REST client and
the Better Auth client. If it is not set, the frontend defaults to
`http://localhost:5000`.

Do not place passwords, session tokens, private keys, database credentials,
real patient information, or other sensitive values in this README, `.env`
files committed to source control, screenshots, logs, or test fixtures. Use
synthetic accounts and synthetic records for testing. The example sign-in
credentials in backend documentation are test credentials only and should be
changed or removed before any shared or production environment.

### Install and run

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

The usual local flow is:

1. Start the backend API on `http://localhost:5000`.
2. Start the frontend with `bun run dev`.
3. Sign in through `/auth/signin`.
4. Use the dashboard, doctor, patient, assignment, and Quick Create flows.

### Verification commands

```bash
# Run Biome checks
bun run lint

# Create a production build
bun run build

# Start the production build locally
bun run start
```

The current implementation has been validated with Biome checks, TypeScript
diagnostics, and a successful Next.js production build.

## API expectations

The frontend expects the backend to provide authenticated routes including:

```text
GET    /api/auth/get-session
POST   /api/auth/sign-in/email
POST   /api/auth/sign-out
GET    /api/dashboard
GET    /api/doctors
GET    /api/doctors/:id/patients
POST   /api/doctors
PATCH  /api/doctors/:id
DELETE /api/doctors/:id
GET    /api/patients
POST   /api/patients/doctor/:doctorId
PATCH  /api/patients/:id
DELETE /api/patients/:id
```

Doctor list requests can include:

```text
/api/doctors?assignment=all|assigned|unassigned&search=...&from=...&to=...&page=1&limit=10
```

Patient list requests can include search, doctor, date, page, and limit
parameters. Successful collection responses should use:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0
  }
}
```

The backend must continue enforcing session validity and admin permissions.
Hiding admin controls in the frontend is only a usability measure, not an
authorization boundary.

See [`API_INTEGRATION.txt`](./API_INTEGRATION.txt) for the detailed request,
response, validation, and authentication contract.

## Project structure

```text
src/
  app/
    (view)/              Landing page and root redirect target
    admin/
      d/                 Dashboard
      doctors/           Doctor management
      patients/          Patient management
      layout.tsx         Protected admin shell
    auth/signin/         Sign-in screen
  components/
    ui/                  shadcn/ui primitives
    admin-form-fields.tsx
    admin-auth-guard.tsx
    app-sidebar.tsx
    date-range-filter.tsx
    doctor-picker.tsx
    quick-create.tsx
    site-header.tsx
  lib/
    api.ts               Typed REST client
    auth-client.ts       Better Auth client
    queries.ts           TanStack Query factories
proxy.ts                 Auth-cookie route gate and root redirects
API_INTEGRATION.txt      Backend API contract
```

## Security and privacy notes

- Keep `.env` files local and use secret management for any non-local
  environment.
- Use synthetic testing data only.
- Do not log authentication cookies, passwords, access tokens, or patient
  records.
- Treat the proxy as an early routing guard; enforce authorization in the
  backend on every protected endpoint.
- Review CORS, cookie flags, HTTPS, rate limiting, audit logging, and data
  retention before production use.


Visual Output & Screenshots:

<img src="https://i.ibb.co.com/GvCgWkWW/image.png" alt="image" border="0">
<img src="https://i.ibb.co.com/XkGzR6F5/image.png" alt="image" border="0">
<img src="https://i.ibb.co.com/5XdZmv7m/image.png" alt="image" border="0">
