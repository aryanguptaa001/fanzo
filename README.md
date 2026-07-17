# Fanzo

Fanzo is a creator monetization platform. This repository contains Milestone 0 only: the production-oriented foundation and no business functionality.

## Stack

- Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui conventions
- NestJS, Prisma, PostgreSQL, Redis/BullMQ
- Clerk authentication, Docker, pnpm workspaces, Turborepo

## Prerequisites

- Node.js 20.11 or newer
- Corepack-enabled pnpm 9
- Docker Desktop
- Clerk development keys

## Local setup

1. Enable pnpm: `corepack enable`.
2. Copy each `apps/*/.env.example` to its adjacent `.env` file and replace the Clerk placeholders. The root `.env.example` is the consolidated deployment reference.
3. Start local dependencies: `docker compose up -d`.
4. Install packages: `pnpm install`.
5. Generate Prisma Client: `pnpm --filter @fanzo/database generate`.
6. Create the first local database migration: `pnpm --filter @fanzo/database migrate:dev --name foundation`.
7. Start all applications: `pnpm dev`.

The web app runs on http://localhost:3000, the API health check on http://localhost:4000/v1/health, and Swagger UI on http://localhost:4000/docs.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start web, API, and worker together |
| `pnpm build` | Build all workspaces |
| `pnpm lint` | Run linting across all workspaces |
| `pnpm typecheck` | Type-check all workspaces |
| `pnpm format:check` | Validate formatting |
| `pnpm --filter @fanzo/database db:studio` | Open Prisma Studio |

## Environment and security

`.env` is ignored by Git. The web app receives only `NEXT_PUBLIC_*` values. API and worker secrets remain server-only. Provider integrations, object storage uploads, and webhooks are deliberately not implemented in this milestone.

## Foundation boundaries

Implemented: monorepo tooling, service shells, environment validation, PostgreSQL/Redis local infrastructure, Clerk middleware shell, database foundation, structured logging, error response envelope, Swagger, CI, formatting, and Git hooks.

Deferred: discovery, memberships, content, products, payments, booking, community, streaming, notifications, analytics, and admin workflows.
