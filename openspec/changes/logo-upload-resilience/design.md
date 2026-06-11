# Design: Logo Upload Resilience

## Technical Approach

Make logo upload a form-owned field workflow instead of a self-contained widget. `LogoUpload` keeps file picking and request execution, while onboarding and profile forms own a shared `LogoFieldState` used for preview source, inline feedback, and submit gating. Merchant-owned screens will resolve logos through the existing `/api/locales/[id]/logo` entry point with versioned cache busting; public/client cards keep their current raw source contract for now. Non-square logo presentation will move from `object-cover` to contained rendering on the main merchant/public cards so rectangular brand marks stop being cropped.

## Architecture Decisions

| Area | Choice | Alternatives considered | Rationale |
|------|--------|-------------------------|-----------|
| Upload ownership | Parent forms own `LogoFieldState` (`idle | uploading | uploaded | error`) and pass state/callbacks into `LogoUpload`. | Keep upload state local to `LogoUpload`. | Submit disabling and field-level errors must coordinate with the form; local-only state caused the race. |
| Source resolution | Add a shared server/helper path to build versioned proxy URLs when `localId` and stored `logoUrl` are known; upload success returns the resolved display URL. | Keep mixing raw DB URLs and proxied URLs. | The current onboarding/profile mismatch creates stale or divergent previews after upload. |
| Rendering | Introduce a small reusable logo-frame primitive for square/circle shells with `object-contain`, inner padding, and existing semantic background tokens. | Patch each `<img>` inline or keep `object-cover`. | A shared primitive keeps fallback initials and sizing consistent while avoiding raw color literals and repeated crop logic. |
| Scope control | Defer Prisma metadata, Sharp policy changes, and broad public-feed contract expansion. | Add dimensions/aspect metadata now. | The bug is coordination + presentation, not storage analytics; schema work would widen risk for little user value. |

## Data Flow

```text
User selects file
  -> LogoUpload sets parent state to uploading
  -> POST /api/upload/logo
  -> uploadLogoFlow optimizes + persists raw logoUrl
  -> route resolves displayUrl (/api/locales/:id/logo?v=hash)
  -> parent state = uploaded(displayUrl)
  -> form submit enabled

Failure path:
  select file -> uploading -> API error -> parent state = error
  -> preview reverts to last persisted displayUrl
  -> inline aria-live message shown
  -> submit stays disabled until retry succeeds or the error is cleared by a new selection
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/local/LogoUpload.tsx` | Modify | Convert to controlled upload field with accessible status/error UI and no `alert()`. |
| `src/components/local/onboarding/OnboardingForm.tsx` | Modify | Own `LogoFieldState`, require resolved logo before submit, and gate submit on upload/error state. |
| `src/components/local/dashboard/perfil/EditPerfilForm.tsx` | Modify | Reuse the same logo-field contract and disable save while upload is unresolved. |
| `src/app/api/upload/logo/route.ts` | Modify | Return resolved display URL in addition to successful persistence. |
| `src/lib/logoVersion.ts` + `src/lib/localLogo*.ts` | Modify/Create | Centralize versioned proxy-source resolution for merchant-owned surfaces. |
| `src/app/onboarding/page.tsx` / `src/app/dashboard/perfil/page.tsx` / `src/app/dashboard/page.tsx` | Modify | Seed forms/cards with the normalized display source. |
| `src/components/public-benefits/PublicBenefitCardCompact.tsx` / `src/app/beneficio/[id]/page.tsx` | Modify | Adopt contained logo rendering on priority customer-facing cards. |

## Interfaces / Contracts

```ts
type LogoUploadStatus = "idle" | "uploading" | "uploaded" | "error";

type LogoFieldState = {
  src: string | null;           // current display source
  persistedSrc: string | null;  // last successful source for revert
  status: LogoUploadStatus;
  message: string | null;
};

type UploadLogoResponse = {
  url: string;          // persisted raw URL (backward-safe)
  displayUrl: string;   // normalized UI source
};
```

`LogoUpload` should emit start/success/error transitions; parent forms derive `submitDisabled` instead of duplicating upload booleans.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|--------------|----------|
| Component/manual | Uploading disables submit, error reverts preview, success restores submit | Manual browser verification in onboarding and profile edit. |
| Integration | `/api/upload/logo` returns `displayUrl`; proxy route still serves base64 and redirects blob URLs | Route-level checks plus targeted fetch verification. |
| Regression UI | Rectangular logos on dashboard/public detail/card no longer crop | Manual visual check with wide and tall sample logos. |
| Repo validation | No type/build regressions | `npm run lint` and `npm run build`. |

## Migration / Rollout

No migration required. Ship as a focused UI/API refinement.

## Non-Goals

- No Prisma schema expansion for logo metadata.
- No Sharp optimization-policy rewrite.
- No full sweep of every logo surface (map markers and customer history avatars can follow later if needed).

## Open Questions

- [ ] Confirm whether the customer history avatar should stay out of scope for this change to keep review size down.
