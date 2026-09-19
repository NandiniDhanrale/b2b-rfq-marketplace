# B2B RFQ Marketplace

## Overview

A mini B2B Request for Quotation (RFQ) marketplace where buyers post procurement needs and suppliers submit competitive quotations. The application is intentionally simple: one Next.js app, one PostgreSQL database, and server-side authorization for all sensitive operations.

## Features

### Buyer
- Sign up and log in as a buyer
- Create, view, edit, and close RFQs
- View quotations received on owned RFQs
- Dashboard at `/buyer/rfqs`

### Supplier
- Sign up and log in as a supplier
- Browse open, non-expired RFQs
- Search by product/description and filter by delivery location
- Submit one quotation per RFQ (editable while RFQ is open)
- View quotation history at `/supplier/quotations`

## Tech Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **TypeScript**
- **PostgreSQL** with **Prisma ORM**
- **Auth.js (NextAuth v5)** — JWT session-based authentication
- **Zod** — input validation
- **Tailwind CSS** — responsive UI
- **bcryptjs** — password hashing

## Architecture

```
Browser
  → Next.js UI (React Server + Client Components)
  → Server Actions / Auth middleware
  → Authorization + validation (Zod)
  → Prisma
  → PostgreSQL
```

The architecture is deliberately flat: no microservices, no GraphQL, and no extra service layers. Business rules (RFQ open/expired checks, ownership) live in small server-side helpers and actions so they are easy to explain in an interview.

## Database Design

### User
- `id`, `name`, `email` (unique), `passwordHash`, `role` (`BUYER` | `SUPPLIER`)

### RFQ
- Belongs to a buyer (`buyerId`)
- `title`, `description`, `quantity`, `deliveryLocation`, `deadline`, `status` (`OPEN` | `CLOSED`)
- Expired RFQs are derived when `deadline < now` (no separate DB status)

### Quotation
- Belongs to an RFQ and a supplier
- `price`, `estimatedDelivery`, `message`
- Unique constraint on `(rfqId, supplierId)` prevents duplicate quotes

## Authentication & Authorization

- Passwords are hashed with bcrypt (12 rounds); hashes are never returned to the client
- Auth.js issues a secure JWT session (7-day max age)
- Middleware protects `/buyer/*` and `/supplier/*` routes by role
- **Every** server action re-checks authentication, role, and ownership — route protection is UX only
- Supplier identity always comes from the session, never from client input

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL (Neon, Supabase, or `npx prisma dev` for local Postgres)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and AUTH_SECRET

# 3. Run migrations
npm run db:migrate

# 4. Seed demo data (optional)
npm run db:seed

# 5. Start dev server
npm run dev
```

Open [http://localhost:43123](http://localhost:43123).

### Local Postgres with Prisma

```bash
npx prisma dev -d
npm run db:migrate
npm run db:seed
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Secret for Auth.js sessions (`openssl rand -base64 32`) |
| `AUTH_URL` | App URL (e.g. `http://localhost:43123` or production URL) |

## Deployment (Vercel + Neon)

1. Create a PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Push this repo to GitHub
3. Import the project in [Vercel](https://vercel.com)
4. Set environment variables: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` (your Vercel URL)
5. Add build command: `prisma generate && prisma migrate deploy && next build`
6. Deploy

After first deploy, run migrations if not included in build:

```bash
npx prisma migrate deploy
npm run db:seed
```

## Demo Accounts

After seeding:

| Role | Email | Password |
|------|-------|----------|
| Buyer | buyer@example.com | password123 |
| Supplier | supplier@example.com | password123 |

## Assumptions

- Currency is fixed to **INR** for display
- One quotation per supplier per RFQ (supplier may edit their existing quote)
- Expired RFQs (`deadline` passed) cannot receive new quotations
- Closed RFQs cannot receive new quotations
- No email notifications or quotation acceptance workflow

## Limitations

- No email verification or password reset
- No file attachments on RFQs or quotations
- No buyer–supplier messaging
- No pagination (suitable for demo/small datasets)
- No admin role

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed demo data |
