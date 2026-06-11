## Exploration: logo-upload-resilience

### Current State
- Logo uploads are handled by a shared client component, `LogoUpload`, used by both onboarding and profile edit.
- Selecting a file creates an immediate local preview, then uploads separately to `POST /api/upload/logo`.
- The upload endpoint optimizes images with `sharp`: preserves aspect ratio with `fit: "inside"`, never enlarges, converts to WebP, tries max box sizes from 512px down to 96px, and rejects outputs above 200KB.
- Persisted data is only `Local.logoUrl`. No width, height, byte size, or original format metadata is stored in Prisma.
- If Vercel Blob is configured, DB stores a public blob URL; otherwise it stores a base64 data URL.
- Most logo renderers place the image inside fixed square or circular containers using `object-cover`, which crops rectangular logos even though the stored asset itself is not square-cropped.

### Affected Areas
- `src/components/local/LogoUpload.tsx` — shared upload behavior, local preview, loading feedback, and error handling.
- `src/components/local/onboarding/OnboardingForm.tsx` — onboarding submit gating depends only on `hasLogo`, not upload-in-flight state.
- `src/components/local/dashboard/perfil/EditPerfilForm.tsx` — profile edit can save while upload is still running.
- `src/server/services/localApiService.ts` — image optimization policy and persistence behavior.
- `src/app/api/upload/logo/route.ts` — upload endpoint used by both flows.
- `src/app/api/locales/[id]/logo/route.ts` — proxy path for base64 logos / cache behavior divergence.
- `src/app/onboarding/page.tsx` and `src/app/dashboard/perfil/page.tsx` — onboarding passes raw DB logo URL, profile edit passes proxied/versioned URL.
- `src/app/dashboard/page.tsx`, `src/app/beneficio/[id]/page.tsx`, `src/components/public-benefits/PublicBenefitCardCompact.tsx`, `src/components/cliente/beneficios/LocalesMap.tsx`, `src/components/cliente/beneficio/MisBeneficiosList.tsx` — current square/circle `object-cover` rendering that makes wide/tall logos look over-zoomed.

### Approaches
1. **State-only resilience pass** — keep current storage model and fix interaction flow.
   - Pros: Smallest scope; no schema changes; directly addresses race condition and unclear feedback.
   - Cons: Rectangular logos still need a rendering adjustment elsewhere; persisted metadata remains opaque.
   - Effort: Low

2. **Shared logo field model** — make upload state explicit in parent forms and standardize preview/render entry points.
   - Pros: Fixes race condition cleanly in onboarding and profile edit; enables clear submit disabling, status text, and consistent error handling; reduces divergence between raw/proxied URLs.
   - Cons: Slightly broader refactor across forms and display entry points.
   - Effort: Medium

3. **Logo metadata expansion** — persist width/height/bytes plus render mode hints.
   - Pros: Precise analytics and conditional rendering by aspect ratio; easier operational inspection later.
   - Cons: Requires schema/API changes, backfill strategy, and more surface area than this bug really needs.
   - Effort: High

### Recommendation
Choose **Approach 2** with a lightweight rendering fix from Approach 1.

Recommended shape:
- Promote upload state from `LogoUpload` into the parent form contract: `idle | uploading | uploaded | error` plus current logo URL.
- Disable submit while upload is in progress and expose visible, non-hover-only progress text with `aria-live`.
- Replace `alert()` error handling with inline field-level feedback so preview, error, and submit state stay coherent.
- Unify onboarding/profile edit to use the same resolved logo source pattern after upload success.
- For display, keep the square/circle shell but switch business-logo image treatment from `object-cover` to a contained presentation (`object-contain` with inner padding/background), at least in edit/onboarding and the main public/local cards. This respects rectangular brand marks without distorting them.

This solves the real failure mode WITHOUT paying schema-migration cost. If later the team wants operational reporting on real stored dimensions/weights, that can be a follow-up change.

### Risks
- Changing shared logo rendering from `cover` to `contain` will visually affect multiple surfaces; some screens may need per-surface padding tuning so logos do not feel too small.
- If submit disabling is implemented only in one form, the race condition will survive in the other because upload and profile save are currently separate requests.
- Standardizing on the proxy logo route may slightly change caching behavior for blob-backed images and should be checked on dashboard/public surfaces.
- There is no persisted metadata today, so exact historical stored dimensions/weights cannot be queried from Prisma alone; for blob-backed assets they would need runtime inspection, not just code changes.

### Ready for Proposal
Yes — propose a focused change that introduces shared upload-status state, accessible inline feedback, submit blocking during upload, and contained rendering for non-square logos.
