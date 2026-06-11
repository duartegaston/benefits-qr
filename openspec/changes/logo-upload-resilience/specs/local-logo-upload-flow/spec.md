# local-logo-upload-flow Specification

## Purpose

Define observable logo-upload behavior for local onboarding and profile edit.

## Requirements

### Requirement: Submit waits for settled logo upload

The system MUST treat logo upload as a field state shared with onboarding and profile forms, and MUST block submit while the latest logo selection is still uploading or has ended in upload error.

#### Scenario: Pending upload blocks progression

- GIVEN a local selected a new logo and the upload is still in progress
- WHEN the onboarding or profile form is visible
- THEN the primary submit action is disabled
- AND the form shows that logo upload is still pending

#### Scenario: Failed upload blocks save until resolved

- GIVEN the latest logo upload failed
- WHEN the local stays on the form
- THEN the primary submit action remains disabled
- AND the form requires a successful retry or another valid selection before continuing

### Requirement: Logo upload feedback is inline and accessible

The system MUST provide inline status and error feedback for logo upload, and MUST NOT rely on browser alerts as the only feedback channel.

#### Scenario: Upload status is announced in place

- GIVEN a local starts uploading a logo
- WHEN the field state changes to uploading or uploaded
- THEN the logo field shows visible status text near the control
- AND status changes are announced through a polite live region

#### Scenario: Upload error preserves a coherent field state

- GIVEN the upload endpoint rejects the selected file or processing fails
- WHEN the error is returned
- THEN the field shows the returned constraint or failure message inline
- AND the preview falls back to the last saved logo or initials instead of leaving a misleading temporary preview
