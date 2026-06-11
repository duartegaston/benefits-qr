# local-logo-source-resolution Specification

## Purpose

Define the observable source consistency of a saved local logo.

## Requirements

### Requirement: Saved logos resolve consistently across local surfaces

The system MUST resolve a successfully saved logo through one stable display source pattern so onboarding, profile edit, and post-save merchant views show the same current logo.

#### Scenario: Same saved logo appears after onboarding upload

- GIVEN a local uploads a logo successfully during onboarding
- WHEN the local continues to dashboard or later opens profile edit
- THEN each surface shows the same current logo asset
- AND no surface shows a stale pre-upload version

#### Scenario: Same saved logo appears after profile replacement

- GIVEN a local replaces an existing logo from profile edit
- WHEN the save completes and the dashboard is refreshed
- THEN the updated logo is shown in profile edit and dashboard entry surfaces
- AND the local does not see raw-storage-specific differences between those surfaces
