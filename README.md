# Kakeibo Personal Finance Web Application

A full-stack personal finance journal inspired by the Japanese **Kakeibo (家計簿)** budgeting method: **Plan · Track · Review · Reflect**.

## Technology Stack

- **Frontend**: React.js (TypeScript), Vite, Redux Toolkit, React Redux, React Router DOM, Axios, Tailwind CSS, Lucide React
- **Backend**: Node.js (TypeScript), Express.js, Prisma ORM, SQLite, JWT authentication, bcryptjs, Zod validation, Pino logging, Swagger / OpenAPI

## Project Structure

```text
├── client/
│   └── src/
│       ├── app/          # Redux store & typed hooks
│       ├── components/   # Reusable UI components
│       ├── features/     # Redux slices & feature modules
│       ├── layouts/      # Workspace shell & navigation
│       ├── pages/        # Route pages
│       ├── routes/       # ProtectedRoute wrapper
│       ├── services/     # Axios API client
│       ├── types/        # Shared frontend domain TypeScript interfaces
│       └── utils/        # Currency, date, & Kakeibo helpers
├── server/
│   ├── domain/           # Entities, repository interfaces, domain services & errors
│   ├── application/      # DTOs, Zod schemas, application services & UoW orchestration
│   ├── infrastructure/   # Config, Pino logger, Prisma client/mappers/repositories, security
│   ├── presentation/     # Express middlewares, Swagger docs, & /api/v1 routers
│   ├── prisma/
│   │   ├── schema.prisma # Database models & constraints
│   │   ├── migrations/   # Prisma SQLite migrations
│   │   └── seed.ts       # Default account & categories seed script
│   ├── index.ts          # Express /api/v1 + Vite middleware / static server entrypoint
│   └── tsconfig.json     # NodeNext TypeScript configuration for the server
├── .env.example
├── index.html
├── tsconfig.json
└── package.json
```

## Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update values as needed:

```bash
cp .env.example .env
```

Default `.env` variables:
- `PORT=3000`
- `NODE_ENV=development`
- `DATABASE_URL="file:./dev.db"`
- `JWT_SECRET="replace-with-a-strong-random-secret-in-production"`
- `JWT_EXPIRES_IN="7d"`

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

### 5. Seed Default Account & Categories

Every newly registered user automatically receives the default Kakeibo expense categories (`Needs`, `Wants`, `Culture`, `Unexpected`) and income categories (`Salary`, `Business`, `Investment`, `Bonus`, `Other`). Running the seed script also creates a default account (`email: admin`, `password: admin`) with all default categories and backfills any existing users:

```bash
npm run prisma:seed
```

### 6. Start the Application

#### Development (Unified Express API + Vite Dev Server on port 3000)

```bash
npm run dev
```

Or run the frontend build and production server:

```bash
npm run build
npm run start
```

### Run Locally with Docker Compose

Build and start the full-stack app with persistent SQLite storage (`./data/dev.db`) on `http://localhost:3000`:

```bash
docker compose up --build
```

To run in the background and stop later:

```bash
docker compose up -d --build
docker compose down
```

### 7. Lint & Build Verification

```bash
npm run lint
npm run build
```

## API Prefix

All backend REST endpoints are mounted under `/api/v1`:
- `/api/v1/auth` (`POST /register`, `POST /login`, `POST /logout`, `GET /me`)
- `/api/v1/categories` (`GET`, `GET /:id`, `POST`, `PUT /:id`, `PATCH /:id/status`, `DELETE /:id`)
- `/api/v1/plans` (`GET`, `GET /current`, `GET /:id`, `GET /:id/summary`, `POST`, `PUT /:id`, `PATCH /:id/status`)
- `/api/v1/plans/:id/budgets` (`GET`, `PUT`, `PATCH /:categoryId`)
- `/api/v1/transactions` (`GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`)
- `/api/v1/notes` (`GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`)
- `/api/v1/monthly-reflections` (`GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`)
- `/api/v1/dashboard` (`GET ?month=&year=`)
