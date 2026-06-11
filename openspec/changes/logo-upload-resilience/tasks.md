# Tasks: Logo Upload Resilience

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 320-480 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 upload/source contract -> PR 2 form wiring -> PR 3 display polish + verification |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Shared upload/source contract | PR 1 | API + helper base; tests/docs stay with route/helper |
| 2 | Merchant form resilience | PR 2 | Depends on PR 1; onboarding + perfil submit gating |
| 3 | Logo rendering regression pass | PR 3 | Depends on PR 2 only for shared primitive reuse |

## Phase 1: Foundation

- [x] 1.1 Add `src/lib/localLogoSource.ts` to build normalized merchant logo display URLs from `localId` + stored `logoUrl`, reusing `logoVersion`.
- [x] 1.2 Update `src/app/api/upload/logo/route.ts` and `src/server/services/localApiService.ts` so successful uploads return both persisted `url` and resolved `displayUrl`.
- [x] 1.3 Refactor `src/components/local/LogoUpload.tsx` into a controlled field contract with `LogoFieldState`, start/success/error callbacks, inline `aria-live` feedback, and no `alert()` fallback.

## Phase 2: Merchant Form Wiring

- [x] 2.1 Update `src/app/onboarding/page.tsx` and `src/components/local/onboarding/OnboardingForm.tsx` to seed normalized logo state, revert previews on failure, and disable submit while upload is `uploading` or `error`.
- [x] 2.2 Update `src/app/dashboard/perfil/page.tsx` and `src/components/local/dashboard/perfil/EditPerfilForm.tsx` to reuse the same `LogoFieldState` flow and block save until the logo field is settled.
- [x] 2.3 Keep merchant form copy specific: required-state, pending-state, and constraint/error messages must remain inline and usable without hover.

## Phase 3: Display Presentation

- [x] 3.1 Create a small reusable logo-frame primitive under `src/components/ui/` for square/circle shells with semantic background tokens, padding, initials fallback, and `object-contain`.
- [x] 3.2 Replace cropped logo rendering in `src/app/dashboard/page.tsx` with the shared logo-frame primitive and normalized merchant display source.
- [x] 3.3 Replace cropped logo rendering in `src/components/public-benefits/PublicBenefitCardCompact.tsx` and `src/app/beneficio/[id]/page.tsx` so wide/tall marks remain legible.

## Phase 4: Verification

- [ ] 4.1 Manually verify spec scenarios: pending upload blocks submit, failed upload reverts preview, successful upload shows the same saved logo on onboarding, perfil, and dashboard.
- [ ] 4.2 Manually verify rectangular logo presentation on dashboard summary, public benefit card, and benefit detail using wide and tall sample logos.
- [ ] 4.3 Run `npm run lint` and `npm run build`, then update this file during apply with completed checkboxes and any deferred out-of-scope surfaces.

> Follow-up apply note (2026-06-10): `npm run build` passes after the deferred-persistence/logo-frame refinement. `npm run lint` is still blocked by pre-existing repo issues in `src/components/cliente/beneficios/BeneficiosViewToggle.tsx`, `src/components/public-benefits/PublicBenefitsFilters.tsx`, and the warning in `src/components/local/dashboard/dashboardNavConfig.ts`.
