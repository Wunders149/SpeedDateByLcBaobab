# SpeedDate

A full-stack speed dating web application built with TypeScript, React, Express, and MongoDB.

## Features

- **Participant Registration & Profiles** — Secure registration with age verification, profile management, and privacy controls
- **Intelligent Questionnaire** — 60-question bank across 7 categories with configurable weights and scoring models
- **Matching Engine** — Category-weighted compatibility scoring with similarity/complementarity models, deal-breaker evaluation, and global optimal matching
- **Event Management** — Create, publish, and manage speed dating events with capacity limits and waitlists
- **Admin Dashboard** — Manage events, participants, questionnaires, matches, and view analytics
- **Real-time Updates** — Socket.IO for live event updates
- **Consent-Based Matching** — Mutual interest confirmation before revealing matches
- **Audit Logging** — All administrative actions are recorded

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, Socket.IO
- **Shared:** TypeScript types, Zod schemas, matching algorithm
- **Testing:** Vitest, Supertest

## Project Structure

```
speed-dating-app/
├── apps/
│   ├── web/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── contexts/    # React contexts (Auth)
│   │   │   ├── lib/         # API client, utilities
│   │   │   ├── pages/       # Page components
│   │   │   └── App.tsx      # Main app with routing
│   └── api/                 # Express backend
│       └── src/
│           ├── config/      # Database configuration
│           ├── middleware/  # Auth, validation, error handling
│           ├── models/      # Mongoose models
│           ├── modules/     # Route modules
│           │   ├── auth/
│           │   ├── events/
│           │   ├── registrations/
│           │   ├── questionnaires/
│           │   ├── matching/
│           │   └── admin/
│           ├── utils/       # Utilities (auth, audit)
│           ├── app.ts       # Express app setup
│           ├── server.ts    # Server entry point
│           └── seed.ts      # Database seed script
├── packages/
│   └── shared/              # Shared types, schemas, matching algorithm
│       └── src/
│           ├── types.ts
│           ├── schemas.ts
│           ├── matching.ts
│           └── constants.ts
├── .env.example
├── package.json
├── tsconfig.base.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)
- npm 9+

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd speed-dating-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```env
   PORT=4000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/speeddate
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=7d
   BCRYPT_ROUNDS=12
   ```

5. Initialize the default questionnaire question bank (optional; safe to run more than once):
   ```bash
   npm run seed
   ```

6. Start development servers:
   ```bash
   npm run dev
   ```

7. Open the frontend at http://localhost:5173

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both API and web dev servers |
| `npm run build` | Build all packages |
| `npm test` | Run all tests |
| `npm run seed` | Add default questionnaire questions if the question bank is empty; does not create demo users or events |

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` — Register new participant
- `POST /api/v1/auth/login` — Login
- `POST /api/v1/auth/logout` — Logout
- `GET /api/v1/auth/me` — Get current user

### Events
- `GET /api/v1/events` — List public events
- `GET /api/v1/events/:eventId` — Get event details
- `POST /api/v1/admin/events` — Create event (admin)
- `PATCH /api/v1/admin/events/:eventId` — Update event (admin)

### Registrations
- `POST /api/v1/events/:eventId/registrations` — Register for event
- `GET /api/v1/events/:eventId/my-registration` — Get my registration
- `POST /api/v1/events/:eventId/withdraw` — Withdraw registration

### Questionnaires
- `GET /api/v1/events/:eventId/questionnaire` — Get questionnaire
- `PUT /api/v1/events/:eventId/questionnaire/draft` — Save draft
- `POST /api/v1/events/:eventId/questionnaire/submit` — Submit questionnaire

### Matching
- `GET /api/v1/events/:eventId/my-matches` — Get my matches
- `POST /api/v1/events/:eventId/interests` — Express interest
- `GET /api/v1/events/:eventId/my-results` — Get my results

### Admin
- `GET /api/v1/admin/dashboard` — Dashboard overview
- `GET /api/v1/admin/participants` — List participants
- `GET /api/v1/admin/audit-logs` — View audit logs
- `POST /api/v1/admin/events/:eventId/matches/generate` — Generate matches
- `POST /api/v1/admin/events/:eventId/matches/publish` — Publish matches

## Matching Algorithm

The compatibility score is calculated using a category-weighted approach:

1. **Category Scores** — Each category (Values, Communication, Personality, etc.) has a weight
2. **Question Scoring** — Questions are scored based on similarity or complementarity
3. **Mutual Score** — Geometric mean of directional scores: `100 × sqrt(Score(A→B) × Score(B→A))`

The algorithm supports:
- Similarity scoring (higher score for similar answers)
- Complementarity scoring (higher score for compatible differences)
- Deal-breaker evaluation
- Global optimal matching
- Configurable minimum thresholds

## Security

- Password hashing with bcrypt
- JWT authentication with HTTP-only cookies
- Role-based access control (RBAC)
- Rate limiting on auth endpoints
- Input validation with Zod
- NoSQL injection prevention
- Security headers with Helmet
- CORS protection
- Audit logging

## License

MIT

## Notification Delivery Adapter

The backend includes a dependency-free notification adapter (\pps/api/src/services/notifications.service.ts\) with pluggable e-mail (console/SMTP) and SMS (console/HTTP) transports. Configure via \SMTP_HOST\, \SMTP_PORT\, \SMTP_USER\, \SMTP_PASS\, \SMTP_FROM\, \SMS_PROVIDER_URL\, \SMS_API_KEY\ env vars. With no provider configured, messages are logged to the console (development mode).

## E2E Testing

Playwright specs live in \	ests/e2e/\. Install browsers once, then run:

\\\ash
npm install --save-dev @playwright/test
npx playwright install
npm run test:e2e
\\\

