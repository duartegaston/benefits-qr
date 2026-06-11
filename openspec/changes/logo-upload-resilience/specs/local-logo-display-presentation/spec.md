# local-logo-display-presentation Specification

## Purpose

Define how business logos are visibly presented inside fixed UI shells.

## Requirements

### Requirement: Non-square logos stay legible inside fixed shells

The system MUST present local logos inside square or circular shells without default cropping that hides meaningful parts of rectangular brand marks.

#### Scenario: Wide logo in merchant surface

- GIVEN a local has a wide rectangular logo
- WHEN the logo is shown in onboarding preview, profile edit, or dashboard business summary
- THEN the full mark remains visible within the shell
- AND the shell uses padding or background treatment rather than zoom-cropping the image

#### Scenario: Wide logo in public benefit card

- GIVEN a local has a wide rectangular logo
- WHEN a customer sees a public benefit card for that local
- THEN the logo remains recognizable without distortion or forced square crop

### Requirement: User-visible upload constraints are explained inline

The system MUST surface user-visible acceptance constraints when they are violated, including unsupported image types, files over 10 MB, and images that cannot be reduced to the accepted optimized size.

#### Scenario: Unsupported or oversized file is rejected

- GIVEN a local selects a file outside the accepted constraints
- WHEN the upload is rejected
- THEN the logo field explains the reason inline in plain language
- AND the local can immediately choose another file without leaving the form
