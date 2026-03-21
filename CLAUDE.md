# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Project root is `benefitqr/`** — run all commands from that directory, not the repo root.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # ESLint check

npx prisma db push      # Push schema changes to Neon DB (reads prisma.config.ts)
npx prisma generate     # Regenerate client after schema changes
npx prisma studio       # Visual DB browser
```

## Architecture

**BenefitQR** is a Next.js 16 App Router platform where local businesses (locales) create discount benefits and customers (clientes) claim them via email + QR code redemption.

### Two-actor auth system
- **Local** (merchants): email/password OR Google OAuth → `local_session` cookie
- **Cliente** (customers): magic link via email only (Resend) → `cliente_session` cookie

Both use the same `Session` table in the DB with a `userType` enum (`LOCAL | CLIENTE`). Both cookies are httpOnly, sameSite=lax.

Auth helpers in `src/lib/auth.ts`:
- `requireLocalAuth(req)` — guards API routes for merchants
- `requireClienteAuth(req)` — guards API routes for customers
- `getSession(req)` / `getClienteSession(req)` — for API routes (reads from NextRequest)
- `getSessionFromCookies()` / `getClienteSessionFromCookies()` — for server components (uses `await cookies()`)

### Prisma 7 (breaking changes from v5/v6)
- Prisma 7 requires a **driver adapter** — uses `PrismaPg` from `@prisma/adapter-pg`
- Config lives in `prisma.config.ts` (not `schema.prisma` datasource `url`)
- Client is generated to `src/generated/prisma/client` (not `node_modules`)
- Always import: `import { PrismaClient } from "@/generated/prisma/client"`
- `prisma.config.ts` uses `dotenv` to load `.env` then `.env.local` (override)
- Singleton in `src/lib/prisma.ts` with `PrismaPg` adapter

### Key flows

**Benefit claim** (`/beneficio/[id]`):
1. Cliente fills nombre + email + phone in `ReclamarForm`
2. `POST /api/reclamos` creates/finds `Cliente` (saves phone for future SMS integration), creates `Reclamo`, calls `createSession` (24h) + `sendMagicLink`
3. Cliente clicks email link → `GET /api/auth/cliente/verify?token=...` → sets `cliente_session` cookie → redirects to `/mis-beneficios`

**Direct login** (`/mis-beneficios`):
- If no session → shows `ClienteLoginForm` (email only, no phone)
- `POST /api/auth/cliente/magic-link` → finds/creates `Cliente`, calls `createSession` (1h) + `sendMagicLink`
- Same verify endpoint as above

**Magic link token**: single-use — `verify` route rotates the session (deletes old, creates new) so a second click returns `expired`.

**QR redemption**: Cliente shows QR (2-min expiring token) → merchant scans at `/dashboard/escanear` → `POST /api/reclamos/[id]/canjear`
- QR token: generated on `POST /api/reclamos/[id]/qr`, stored in `Reclamo.qrToken`, expires in 2 min

### Email (`src/lib/email.ts`)
All outbound email goes through Resend. Functions:
- `sendMagicLink(to, token, redirect)` — cliente auth link, used by both claim and login flows
- `sendOtpEmail(to, code)` — local merchant OTP
- `sendApprovalRequestEmail(...)` — new merchant approval request to owner
- `sendLocalOnboardingMagicLink(to, token)` — post-approval onboarding link

### Client-side QR
- `QRScanner.tsx` — loads `html5-qrcode` lazily inside `useEffect`. The escanear page uses: `dynamic(() => import("@/components/QRScanner"), { ssr: false })`
- `QRDisplay.tsx` — fetches QR token, generates data URL with `qrcode`, shows 2-min countdown with auto-refresh

### Next.js 16 specifics
- Dynamic route params are `Promise<{id: string}>` — must `await params`
- `useSearchParams()` requires a `<Suspense>` boundary
- Tailwind CSS 4: uses `@import "tailwindcss"` in globals.css (not `@tailwind base/components/utilities`)

### Logo upload
- `POST /api/upload/logo` — if `BLOB_READ_WRITE_TOKEN` env is set → Vercel Blob; otherwise → base64 data URL stored in DB (dev fallback, max 2MB)

### Required environment variables
```
DATABASE_URL=                   # Neon PostgreSQL pooled connection (postgresql://...neon.tech/...)
JWT_SECRET=                     # 64-char random string
RESEND_API_KEY=                 # resend.com API key
RESEND_FROM=                    # Verified sender (use onboarding@resend.dev for dev)
NEXT_PUBLIC_APP_URL=            # http://localhost:3000
OWNER_EMAIL=                    # Admin contact email
GOOGLE_CLIENT_ID=               # Google Cloud Console OAuth 2.0
GOOGLE_CLIENT_SECRET=           # Google Cloud Console OAuth 2.0
BLOB_READ_WRITE_TOKEN=          # Vercel Blob (optional — base64 fallback used without it)
```

Google OAuth callback URI to register in Google Cloud Console: `http://localhost:3000/api/auth/local/google/callback`

## UI / Mobile performance rules

### backdrop-blur en mobile
`backdrop-blur` dentro de contenedores con scroll causa jank en mobile (el browser recompone capas GPU en cada frame). Regla:
- **Nunca** aplicar `backdrop-blur-*` sin prefijo `sm:` en elementos dentro de páginas scrollables.
- Forma correcta: `bg-white/90 sm:bg-white/75 sm:backdrop-blur-md`
- En páginas que son `h-screen overflow-hidden` en desktop (sin scroll) sí se puede usar sin prefijo porque no hay scroll.

### blur-3xl decorativo en mobile
Los blobs decorativos con `blur-3xl` son costosos de renderizar durante el scroll. En páginas con scroll en mobile:
- Agregar `hidden sm:block` a los blobs decorativos.
- El gradiente del `body` (`bg-gradient-to-br`) es suficiente fondo en mobile.

### overflow-hidden y position: fixed
`overflow: hidden` en un ancestro rompe `position: fixed` en sus hijos (el fixed queda relativo al ancestro, no al viewport). Evitar poner `overflow-hidden` en contenedores que tengan hijos `fixed`. Usar `overflow-x-hidden` solo si es estrictamente necesario para evitar scroll horizontal.

### Scroll en páginas centradas
No usar `justify-center` en un flex column cuando el contenido puede desbordar la pantalla — el overflow va hacia arriba y el usuario no puede scrollear hasta el principio. Patrón correcto:
```tsx
// main: flex flex-col items-center py-14 (sin justify-center)
// inner div: my-auto  ← centra cuando hay espacio, colapsa cuando desborda
<main className="min-h-screen flex flex-col items-center py-14">
  <div className="my-auto w-full max-w-md">...</div>
</main>
```
