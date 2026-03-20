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
- **Cliente** (customers): magic link via email (Resend) OR OTP via WhatsApp → `cliente_session` cookie

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
- **Benefit claim**: Cliente opens `/beneficio/[id]` → enters email/phone → `POST /api/reclamos` creates Reclamo + sends magic link (email) or OTP (WhatsApp)
- **Magic link**: Email → `GET /api/auth/cliente/verify?token=...` → sets cookie → redirects to `/mis-beneficios`
- **WhatsApp OTP**: Customer enters OTP from WhatsApp → `POST /api/auth/cliente/verify-otp` → sets cookie
- **QR redemption**: Cliente shows QR (2-min expiring token) → merchant scans at `/dashboard/escanear` → `POST /api/reclamos/[id]/canjear`
- **QR token**: Generated on `POST /api/reclamos/[id]/qr`, stored in `Reclamo.qrToken`, expires in 2 min

### Client-side QR
- `QRScanner.tsx` — loads `html5-qrcode` lazily inside `useEffect` (not via dynamic import). The escanear page uses: `dynamic(() => import("@/components/QRScanner"), { ssr: false })`
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
WHATSAPP_TOKEN=                 # WhatsApp Business API token (optional)
WHATSAPP_PHONE_NUMBER_ID=       # WhatsApp Business Account phone ID (optional)
WHATSAPP_TEMPLATE_NAME=         # Message template name, e.g. qupon_magic_link (optional)
```

Google OAuth callback URI to register in Google Cloud Console: `http://localhost:3000/api/auth/local/google/callback`
