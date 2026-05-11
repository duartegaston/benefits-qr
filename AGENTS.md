# AGENTS.md

This file defines repository-level instructions for AI coding agents working in `benefitqr/`.
Its scope is the entire repository unless a deeper `AGENTS.md` overrides parts of it.

## Project Identity
- Product: Qupon
- Stack: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, Prisma 7, Neon Postgres
- Runtime style: server-first with route handlers under `src/app/api`

## Working Directory & Commands
Run commands from the project root (`benefitqr/`).

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint check
- `npx prisma db push` — push schema to DB
- `npx prisma generate` — regenerate Prisma client
- `npx prisma studio` — inspect DB

## Architecture Notes
### Auth model
There are two actor types sharing session infra:
- Local (merchant): `local_session`
- Cliente (customer): `cliente_session`

Use helpers in `src/lib/auth.ts`:
- API routes: `requireLocalAuth`, `requireClienteAuth`, `getSession`, `getClienteSession`
- Server components: `getSessionFromCookies`, `getClienteSessionFromCookies`

### Prisma conventions (important)
- Prisma 7 with driver adapter (`@prisma/adapter-pg` / `PrismaPg`)
- Prisma client output is `src/generated/prisma`
- Import client as: `import { PrismaClient } from "@/generated/prisma/client"`
- DB singleton lives in `src/lib/prisma.ts`
- `prisma.config.ts` loads `.env` then `.env.local` (override)

## Code Style & Implementation Rules
- Prefer minimal, focused changes; avoid broad refactors unless requested.
- Reuse existing utilities/components/services before creating new logic.
- Preserve existing layered structure:
  - UI/routes: `src/app`, `src/components`
  - domain/data logic: `src/server/services`, `src/server/repositories`
  - shared runtime utilities: `src/lib`
- Follow current naming and language style in codebase (Spanish domain terms are common and expected).
- Keep TypeScript strictness; avoid `any` unless unavoidable.
- Avoid adding comments unless necessary for non-obvious logic.

## Next.js / Frontend Rules
- Route params in dynamic routes are async in this codebase pattern: await `params` in App Router pages.
- `useSearchParams()` must be inside a `Suspense` boundary.
- Tailwind v4 is configured through `src/app/globals.css` with design tokens.
- For per-local brand color, use complete token injection helpers (not only `--brand-hue`).

## Mobile Performance Rules (must follow)
- Do not use unprefixed `backdrop-blur-*` in scrollable mobile pages.
  - Preferred pattern: `bg-white/90 sm:bg-white/75 sm:backdrop-blur-md`
- Hide expensive decorative `blur-3xl` blobs on mobile (`hidden sm:block`) when page scrolls.
- Avoid `overflow-hidden` ancestors around `position: fixed` children.
- In vertically centered layouts that may overflow, avoid `justify-center` on outer column; use inner `my-auto` pattern.

## Security & Data Safety
- Never hardcode secrets/API keys.
- Respect existing security headers in `next.config.ts`.
- Keep cookies `httpOnly`, `sameSite=lax`, secure in production.
- Preserve auth checks for protected routes and actions.

## Testing / Validation Expectations
When changes are made, validate as narrowly as possible first:
1. Run targeted check (or route-level verification)
2. Run `npm run lint` if relevant
3. Run `npm run build` for high-confidence validation when touching cross-cutting code

## Non-Goals (unless explicitly requested)
- Do not alter product behavior outside task scope.
- Do not rename files/folders for stylistic preferences.
- Do not introduce new dependencies without clear need.
- Do not revert unrelated user changes in dirty working trees.
