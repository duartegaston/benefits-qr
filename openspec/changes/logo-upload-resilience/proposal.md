# Proposal: Logo Upload Resilience

## Intent

Harden business logo handling so onboarding and profile edit cannot save while a logo upload is still unresolved, users get clear inline feedback, and non-square logos render safely without misleading crops. This addresses a real coordination bug while staying within current optimization/storage limits.

## Scope

### In Scope
- Make logo upload state explicit and shared with onboarding/profile forms.
- Block submit while logo upload is in flight or failed, with visible inline status/error feedback.
- Standardize the resolved logo source used after upload so preview/save/display behavior is consistent.
- Adjust key logo presentation surfaces to preserve rectangular brand marks inside fixed shells.

### Out of Scope
- Persisting logo metadata in Prisma (dimensions, bytes, aspect ratio).
- Replacing the current Sharp optimization pipeline or blob/base64 storage model.

## Capabilities

### New Capabilities
- `local-logo-upload-flow`: Covers upload state ownership, submit gating, retry-safe feedback, and success/error coordination across onboarding and profile edit.
- `local-logo-source-resolution`: Covers consistent post-upload logo URL resolution between raw storage values and the `/api/locales/[id]/logo` entry point.
- `local-logo-display-presentation`: Covers contained rendering rules for business logos shown inside square/circular UI shells.

### Modified Capabilities
- None.

## Approach

Adopt the exploration recommendation: move upload status beyond `LogoUpload` into parent form state, replace `alert()` with inline accessible feedback (`aria-live`), disable save until upload settles, and normalize key renderers toward contained logo treatment with padding/background instead of `object-cover`. Keep current optimization/storage behavior and document its limits rather than expanding schema now.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/local/LogoUpload.tsx` | Modified | Shared upload contract, preview/status/error UX |
| `src/components/local/onboarding/OnboardingForm.tsx` | Modified | Save gating and logo field feedback |
| `src/components/local/dashboard/perfil/EditPerfilForm.tsx` | Modified | Save gating and logo field feedback |
| `src/app/dashboard/perfil/page.tsx` | Modified | Consistent resolved logo source |
| `src/app/api/locales/[id]/logo/route.ts` | Modified | Normalized display entry point/caching review |
| `src/app/dashboard/page.tsx` / `src/components/public-benefits/PublicBenefitCardCompact.tsx` | Modified | Safer non-square logo presentation |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Logos feel too small after switching to contained rendering | Med | Tune per-surface padding and keep fallback initials |
| Divergent caching/proxy behavior after source unification | Med | Limit scope to key surfaces and verify refresh behavior |
| Upload-state fix applied unevenly across forms | Low | Treat onboarding and profile edit as one capability |

## Rollback Plan

Revert the shared upload-state contract and contained logo render changes, restoring prior local preview/submit behavior and previous image-fit rules. No schema or data rollback is required.

## Dependencies

- Existing `logo-upload-resilience` exploration artifact
- Current local auth-protected upload endpoint and `uploadLogoFlow`

## Success Criteria

- [ ] Onboarding and profile edit cannot submit while a logo upload is pending.
- [ ] Logo upload failures appear inline and keep preview/submit state coherent.
- [ ] Key merchant/public logo surfaces stop cropping rectangular logos by default.
- [ ] Proposal/spec work explicitly preserves current optimization/storage limits without schema expansion.
