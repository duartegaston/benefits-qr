## Exploration: Logo Image Framing — Rectangle Fit and Crop Behavior

### Current State

The codebase recently committed three changes (`392303e`, `23eee80`, `afb4497`) under the `logo-upload-resilience` SDD change that:

1. **Fixed the race condition**: Logo upload is now a controlled field owned by parent forms. The file is sent as part of the multipart `PATCH /api/local/me` submit, so "save" and "upload" happen atomically — no more premature-save bug.
2. **Introduced `LogoFrame`**: A shared component (`src/components/ui/LogoFrame.tsx`) that renders logos with `object-contain` instead of `object-cover`, inside a colored square/round shell with dynamic inset padding.
3. **Introduced `getContainedLogoPaddingClass`** (`src/lib/logoPresentation.ts`): Measures the image's natural aspect ratio on load and applies CSS padding tiers:
   - Ratio < 1.08 → `p-0.5` (near-square, minimal inset)
   - Ratio < 1.35 → `p-1`
   - Ratio < 1.8 → `p-1.5`
   - Ratio >= 1.8 → `p-2` (very wide/tall, maximum inset)

**The user reports two problems with the current result:**

- **Rectangular images still appear "zoomed/cropped poorly"**: The `object-contain` + dynamic padding approach works for near-square images, but for genuinely rectangular logos (wide banners, tall wordmarks), even the maximum `p-2` (8px) inset may not be enough, and the image can look small with disproportionate whitespace, or still feel pinched.
- **Square images no longer fit naturally; it feels like a "container inside a container"**: For near-square images, the `p-0.5` to `p-1` padding creates a visible nested-box effect — there's the outer colored shell, then a padded inner region, then the image. The double framing is aesthetically jarring.

**Surfaces still using `object-cover`** (not yet converted to `LogoFrame`):
- `MisBeneficiosList.tsx` — 36×36px square, `object-cover` (crops rectangular logos)
- `LocalesMap.tsx` — 48×48px circle, `object-cover` (heavily crops rectangular logos)

**Backend optimization** (`optimizeLogoFile` in `localApiService.ts`):
- Resizes with `sharp` using `resize(dimension, dimension, { fit: "inside", withoutEnlargement: true })`
- Iterates 9 size steps from 512px down to 96px
- Converts to WebP, iterates quality from 82 down to 28
- Max output: 200KB
- Always resizes to a **square** bounding box (same width x height), keeping the image's own aspect ratio within that box

### Affected Areas

- `src/components/ui/LogoFrame.tsx` — shared display component; contains the `object-contain` + padding logic that creates the double-container feel
- `src/lib/logoPresentation.ts` — `getContainedLogoPaddingClass()` padding tier function used by both `LogoFrame` and `LogoUpload`
- `src/components/local/LogoUpload.tsx` — preview uses same padding pattern as `LogoFrame`; this is where the user interacts with their logo before saving
- `src/components/local/onboarding/OnboardingForm.tsx` — parent form for onboarding flow; owns `LogoFieldState`
- `src/components/local/dashboard/perfil/EditPerfilForm.tsx` — parent form for profile edit flow; owns `LogoFieldState`
- `src/server/services/localApiService.ts` — server-side `optimizeLogoFile` that resizes to square bounding box with `fit: "inside"`
- `src/app/dashboard/page.tsx` — dashboard displays logo via `LogoFrame`
- `src/app/beneficio/[id]/page.tsx` — benefit detail displays logo via `LogoFrame`
- `src/components/public-benefits/PublicBenefitCardCompact.tsx` — compact card displays logo via `LogoFrame`
- `src/components/cliente/beneficio/MisBeneficiosList.tsx` — not yet using `LogoFrame`, still uses `object-cover` on a small 36px square
- `src/components/cliente/beneficios/LocalesMap.tsx` — map marker still uses `object-cover` on a 48px circle

### Approaches

#### 1. Minimal CSS Adjustment — Remove Inner Padding Shell, Use Background Color Inset

- **Description**: Revert the dynamic padding approach. Instead, keep `object-contain` but remove the inner `<span>` padding wrapper entirely. Let the image fill the full frame. For the "container" problem: change the outer `LogoFrame` shell from having a visible background that creates the nested-box feel to a transparent or matching-background shell. For rectangular logos, accept that they will have slight letterboxing equal to their aspect-ratio mismatch, but without the explicit "framed print" effect. Alternatively, slightly increase the outer container's background color contrast so the letterbox area reads as intentional. Square images will feel natural again — no visible inner frame.

- **Pros**:
  - Smallest change (affects only `LogoFrame.tsx` and `logoPresentation.ts`)
  - Fixes the "container inside a container" feel for square images immediately
  - No new dependencies
  - No data model or backend changes
  - Rectangular images still show fully (no crop) — just with transparent/colored letterboxing

- **Cons**:
  - Rectangular images will still look "small" in the frame for extreme ratios (e.g., 4:1 banner logos) because `object-contain` scales to fit both dimensions
  - No user agency — the app decides how the image fits, not the merchant
  - Letterbox areas may look odd if the background color doesn't harmonize with the image

- **Effort**: Low (1-2 files, CSS/component tweak)

#### 2. Instagram-like Manual Framing / Crop Flow

- **Description**: Add an interactive post-selection step in `LogoUpload` (or a new modal/overlay) where, after picking a file, the merchant sees the image inside the actual frame shape used by the app (rounded square) and can drag/scale/reposition it within the frame. This is the "adjustment" or "crop" step common in social apps. The adjusted frame position (offset + scale) would be saved as part of the logo data, or the image could be server-cropped to the viewport before storage.

- **Pros**:
  - Gives the merchant full control over how their logo appears in the app
  - Eliminates "surprise" framing — what they see is what they get
  - Works great for rectangular logos because the user can choose which part matters most
  - Square logos still feel natural — no inner container, just a clean 1:1 square
  - Professional UX that matches user expectations from Instagram, WhatsApp, etc.

- **Cons**:
  - Requires a new dependency or custom implementation for the crop/adjust UI (e.g., `react-image-crop`, `react-easy-crop`, or custom canvas-based)
  - Increases upload flow complexity significantly — introduces a new UI step between file selection and form submit
  - Must decide persistence strategy: store just crop metadata (offset/scale), or actually crop the image server-side and store the cropped result
  - Crop metadata requires a Prisma schema change (2-4 new columns: `logoCropX`, `logoCropY`, `logoScale`, maybe `logoFrameAspect`) or a JSON column, plus migration and backfill for existing logos
  - Every logo rendering surface must now apply the crop metadata — if stored separately, every query touching `Local.logoUrl` also needs the crop fields
  - Mobile UX for drag/zoom/pinch gestures needs careful testing
  - If the crop is applied server-side, the original image is lost — user can't re-adjust later without re-uploading
  - If crop metadata is stored, all display surfaces (`LogoFrame`, `MisBeneficiosList`, `LocalesMap`, `PublicBenefitCardCompact`, benefit detail, dashboard) must read and apply it, or the crop only applies to the upload preview (inconsistent)

- **Effort**: Medium-High (new dependency, new UI component, schema change, migration, multiple rendering surface updates)

#### 3. Hybrid — CSS-Fix for Squares + Constrained Smart-Fit for Rectangles (Recommended)

- **Description**: Fix the "container inside container" feel for square/near-square images by eliminating the inner padding wrapper. Instead, apply a subtle, consistent background tint behind the image directly inside the outer shell (no nested `<span>` with padding). For rectangular images, instead of the current dynamic padding tiers, use a more sophisticated fit approach:
  - Near-square (ratio < 1.2): `object-contain` with no inner frame/padding — the image fills essentially edge-to-edge, with the outer shell's background showing through as natural letterboxing
  - Moderate rectangles (1.2–2.0): `object-contain` with the outer shell's background, potentially with a subtle `bg-surface-muted/70` or similar background treatment so the letterbox reads as intentional negative space, not "a missing image area"
  - Extreme rectangles (> 2.0): Could softly darken the shell background or apply `mix-blend-mode: multiply` to create visual cohesion between the logo and the letterbox area, OR server-side center-crop to a maximum aspect ratio (e.g., cap at 4:3 or 16:9) during optimization

- **Pros**:
  - Fixes the double-container problem for square images — they'll look flush and natural
  - Rectangular logos get contained treatment without the nested-box feel
  - No new dependencies, no schema changes, no UX flow changes
  - All existing code paths (onboarding, profile, public cards, dashboard) benefit immediately
  - Can be applied to the remaining `object-cover` surfaces (`MisBenefitList`, `LocalesMap`) in the same pass
  - The extreme-ratio server-side soft-crop is an optional future enhancement — doesn't block this iteration

- **Cons**:
  - For wildly rectangular logos (4:1), `object-contain` still produces significant letterboxing — but at least it won't feel like nested containers
  - No user control over framing — the app decides, not the merchant
  - The server-side soft-crop for extreme ratios is an optional follow-up that would need separate testing

- **Effort**: Low-Medium (2-3 component files, CSS/layout changes, no schema/backend changes)

### Recommendation

**Recommend Approach 3 (Hybrid — CSS-Fix for Squares + Smart-Fit for Rectangles)**.

The current `object-contain` + inner padding wrapper creates a visual "container inside a container" — a nested frame that looks artificial especially for square images. The fix is straightforward: eliminate the inner `<span>` padding wrapper in `LogoFrame` and `LogoUpload`, and instead let `object-contain` work naturally with the outer shell's background as implicit letterboxing. For square images, this means edge-to-edge rendering. For rectangular images, the outer shell's matching background color provides natural negative space without a double-border effect.

The Instagram-like crop flow (Approach 2) is a valuable future enhancement but significantly over-scopes the current complaint. It would require a new dependency, schema changes, migration, and coordination across all rendering surfaces. The double-container problem is purely a CSS/layout issue that can be solved without those costs.

If the merchant later wants manual positioning, it can be a separate SDD change that adds a crop step to the upload flow — but the current visual problem needs solving first, independently.

### Risks

- **Visual regression across surfaces**: Removing the padding wrapper changes how ALL logos look on all surfaces that use `LogoFrame` (dashboard, public cards, benefit detail). Each surface needs a manual visual check with both square and rectangular logos.
- **Remaining `object-cover` surfaces**: `MisBeneficiosList` and `LocalesMap` still use `object-cover` and are not under the `LogoFrame` umbrella. If this change leaves them inconsistent, rectangular logos will still be cropped on those two surfaces. These should be migrated to `LogoFrame` (or given equivalent treatment) in the same or a closely following change.
- **Background color harmony**: The letterbox background must work well with the logo. Using `bg-surface-muted/70` (already in `LogoFrame`) should work for most cases, but transparent/logo-with-white-background logos may show a subtle color mismatch. This needs manual verification.
- **Server-side aspect ratio capping is an optional enhancement**: Capping extreme ratios during `optimizeLogoFile` (e.g., center-cropping to max 3:1) would reduce extreme letterboxing but discards image data. This is a policy decision better deferred to a follow-up change after the immediate visual problem is fixed.

### Ready for Proposal

Yes — the problem and recommended approach are clear. A proposal should scope the CSS/layout fix to `LogoFrame`, `LogoUpload`, and migration of the remaining `object-cover` surfaces to `LogoFrame`, with optional soft-crop as a follow-up.