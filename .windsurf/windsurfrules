# Windsurf Rules — benefitqr

## Scope
These rules apply to all work inside this repository.

## Project Snapshot
- Framework: Next.js 16 App Router + React 19 + TypeScript (strict)
- Styling: Tailwind CSS v4 (`src/app/globals.css` tokens)
- Data: Prisma 7 + Postgres (Neon)
- API style: route handlers in `src/app/api`

## Before You Change Code
1. Understand existing patterns first.
2. Reuse existing utilities/components/services before adding new logic.
3. Keep changes minimal and scoped to the user request.
4. Do not touch unrelated files or behavior.

## Source of Truth Files
- Auth/session helpers: `src/lib/auth.ts`
- Prisma singleton: `src/lib/prisma.ts`
- Prisma schema: `prisma/schema.prisma`
- App theme tokens: `src/app/globals.css`
- Security headers: `next.config.ts`

## Architecture Guardrails
- Keep layering intact:
  - UI/routes: `src/app`, `src/components`
  - Domain/data: `src/server/services`, `src/server/repositories`
  - Shared runtime utilities: `src/lib`
- Preserve Spanish business-domain naming when existing code uses it.
- Keep TypeScript strict; avoid `any` unless there is no reasonable alternative.

## Auth & Security Rules
- Keep protected endpoints guarded with `requireLocalAuth` or `requireClienteAuth` as applicable.
- Preserve cookie security defaults (`httpOnly`, `sameSite: "lax"`, secure in production).
- Never hardcode secrets or API keys.
- Do not remove or weaken security headers in `next.config.ts`.

## Frontend & Next.js Rules
- Dynamic route params follow async pattern in this codebase; await `params`.
- Wrap `useSearchParams()` usage in a `Suspense` boundary.
- For local-brand theming, use complete token injection helpers (not just `--brand-hue`).

## Mobile Performance Rules (required)
- Do not use unprefixed `backdrop-blur-*` in scrollable mobile pages.
  - Preferred: `bg-white/90 sm:bg-white/75 sm:backdrop-blur-md`
- Hide decorative `blur-3xl` blobs on mobile (`hidden sm:block`) on scrolling pages.
- Avoid `overflow-hidden` ancestors around `position: fixed` children.
- Avoid outer `justify-center` in potentially overflowing vertical layouts; use inner `my-auto` centering pattern.

## Prisma Rules
- Use generated client import path: `@/generated/prisma/client`.
- Keep Prisma adapter setup pattern (`PrismaPg`) via `src/lib/prisma.ts`.
- If schema changes are made, regenerate and validate related queries/types.

## Validation Workflow
Run checks as narrowly as possible first, then broaden:
1. Targeted check for changed area
2. `npm run lint` when relevant
3. `npm run build` for cross-cutting confidence

## Non-Goals
- No broad refactors unless explicitly requested.
- No renaming files/folders for style preferences.
- No new dependencies without clear necessity.
- No reverting user/unrelated in-progress changes.
