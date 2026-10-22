# SpeedDate

SpeedDate is a bilingual (English/French) speed-dating platform. Participants create profiles, browse published events, register, complete an event questionnaire, and receive matching results. Event administrators create events, manage registrations, build questionnaires, run matching, and manage event sessions.

## Current workflow

### Participant

1. Register or sign in.
2. Browse published events at `/events`.
3. Open an event and register while registration is open.
4. Open the questionnaire. Only events with an active registration are available.
5. Save questionnaire progress and submit at least the configured completion threshold (80% by default).
6. View sessions, notifications, matches, and published results when the organizer makes them available.

### Event administrator

1. Sign in through the host workspace.
2. Create an event as a draft.
3. Publish the event and open registration.
4. Create or manage questions in **Question bank**.
5. Select questions and category weights in **Questionnaire builder**, then publish a questionnaire version for the event.
6. Review registrations, check participants in, generate and review matches, publish results, and generate session rotations.

The database no longer contains demo accounts or demo events. A new database must be initialized with a real administrator and any desired question bank content.

## Technology

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router
- API: Node.js, Express, TypeScript, MongoDB, Mongoose, Socket.IO
- Shared package: TypeScript types, Zod schemas, and matching algorithm
- Tests: Vitest, Supertest, and Playwright E2E specifications

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- MongoDB 6 or newer, local or MongoDB Atlas

## Setup

```bash
npm install
cp .env.example .env
```

Configure `.env` with a real database URI and a strong JWT secret:

```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/speeddate
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

Initialize the default question bank. This command is safe to run repeatedly and does not create users or events:

```bash
npm run seed
```

For a new database, create the first administrator with temporary environment variables. The command refuses to run if an administrator already exists:

```powershell
$env:BOOTSTRAP_ADMIN_EMAIL = "admin@example.com"
$env:BOOTSTRAP_ADMIN_PASSWORD = "use-a-private-password-at-least-12-characters"
npm run bootstrap-admin
Remove-Item Env:BOOTSTRAP_ADMIN_EMAIL
Remove-Item Env:BOOTSTRAP_ADMIN_PASSWORD
```

Do not commit `.env` or share database credentials. The API redacts the database password in its connection log.

Start the development servers:

```bash
npm run dev
```

- Web: http://localhost:5173
- API health: http://localhost:4000/api/health

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API and web development servers |
| `npm run build` | Build shared code, API, and web assets |
| `npm run seed` | Add the default question bank only when the bank is empty |
| `npm run bootstrap-admin` | Create the first super administrator |
| `npm test` | Run shared and API tests; requires the configured test MongoDB instance |
| `npm run test:e2e` | Run Playwright browser tests after installing Playwright and its browsers |
| `npm run lint` | Run ESLint |

## Important API routes

### Authentication

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Events and registrations

- `GET /api/v1/events` - public published events
- `GET /api/v1/events/:eventId` - public event details
- `POST /api/v1/events/:eventId/registrations` - participant registration
- `GET /api/v1/my-registrations` - signed-in participant registrations
- `GET /api/v1/events/:eventId/my-registration`
- `POST /api/v1/events/:eventId/withdraw`

### Questionnaires

- `GET /api/v1/events/:eventId/questionnaire`
- `PUT /api/v1/events/:eventId/questionnaire/draft`
- `POST /api/v1/events/:eventId/questionnaire/submit`
- `GET /api/v1/admin/questions`
- `POST /api/v1/admin/questions`
- `PATCH /api/v1/admin/questions/:questionId`
- `POST /api/v1/admin/events/:eventId/questionnaires`
- `POST /api/v1/admin/events/:eventId/questionnaires/:versionId/publish`

Questionnaire routes require authentication, and participant questionnaire routes also require an active registration for that event.

### Matching and administration

- `GET /api/v1/events/:eventId/my-matches`
- `POST /api/v1/events/:eventId/interests`
- `GET /api/v1/events/:eventId/my-results`
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/events`
- `GET /api/v1/admin/participants`
- `GET /api/v1/admin/audit-logs`
- `POST /api/v1/admin/events/:eventId/matches/generate`
- `POST /api/v1/admin/events/:eventId/matches/publish`

## Security and operational notes

- Passwords are hashed with bcrypt.
- Authentication uses JWTs in HTTP-only cookies.
- Admin routes use role-based access control.
- API input is validated with Zod and protected by rate limiting, CORS, Helmet, and CSRF checks.
- Administrative actions are recorded in audit logs.
- Email and SMS delivery use console logging until SMTP and an SMS provider are configured.
- Password reset endpoints currently return placeholder responses and are not suitable for production account recovery yet.
- Socket.IO clients authenticate, but event-room membership authorization still needs to be enforced before relying on private realtime event data.

## Project layout

```text
apps/api/       Express API, models, routes, matching, and database configuration
apps/web/       React application and page components
packages/shared Shared types, schemas, constants, and matching algorithm
tests/e2e/      Playwright browser specifications
```

## License

MIT
