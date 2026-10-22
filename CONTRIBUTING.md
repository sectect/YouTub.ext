# Contributing

YouTub.ext is proprietary software maintained by SECTECT with source available for community contributions. Anyone may fork, modify, and propose changes without prior approval under the [LICENSE](LICENSE). Contributors retain ownership of their work and grant SECTECT the rights described there.

## Changes

- Open a focused pull request for any fix or improvement. Discuss large changes in an issue first.
- Use TypeScript, clear names, and direct function calls. Add abstractions and comments only when they clarify the code.
- Keep playback logic in `src/features`, popup behavior in `src/popup`, and assets in `public/assets`.
- Preserve original attribution and third-party notices. Submit only code and assets you have permission to contribute.

## Validation

Use Node.js 22 or newer. Run `npm ci` and `npm test`. Add regression coverage for behavior changes where appropriate. Load the generated extension in Chrome or Edge and verify affected YouTube behavior; check light, dark, and system themes for UI changes.

Keep permissions minimal. Do not add secrets, tracking, remote executable code, or unrelated dependencies. Explain any new permission or dependency in the pull request.

## Review and merge

Describe the problem, resulting behavior, and verification. Include screenshots for visible changes and note limitations. Update documentation when behavior changes. Leave version changes and release artifacts to the maintainer unless requested.

A SECTECT maintainer must review changes and verify applicable checks before merging. Pull requests must not be merged with unresolved review findings or failed checks. This is the contribution policy; repository administrators must configure branch protection separately to enforce it.

Contact: [Gautam Ankoji](mailto:gautamankoji@gmail.com).
