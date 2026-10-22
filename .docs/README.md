# YouTub.ext — YouTube Extension

<div align="center">
  <img src="../public/assets/logo.svg" alt="YouTub.ext logo" width="160">
  <p><strong>More control. Better YouTube.</strong></p>
</div>

Enhance your YouTube experience with customizable intro and outro skipping and nonstop playback. Take control of how you watch with automatic skipping and personalized playback preferences.

A minimal Chrome / Edge extension with separate Intro and Outro durations: 5, 10, 30, 60 seconds, or a custom value via **+**. Each section can be turned off. Appearance follows your system by default, with Light and Dark overrides.

## Build

```sh
npm install
npm run build
```

Builds go into `dist/youtub-ext-v<version>/`, currently `dist/youtub-ext-v1.0.0/`. Building the same version replaces only that version's folder; other versions are preserved. For a new release, update the version in `package.json`, `package-lock.json`, and `public/manifest.json` before building. The build checks that the package and manifest versions match.

Open `chrome://extensions` (or `edge://extensions`), enable Developer mode, choose **Load unpacked**, and select `dist/youtub-ext-v1.0.0` (or the folder for your release version). Refresh existing YouTube tabs after installing.

Each build also creates `release/youtub-ext-v<version>.zip`, currently `release/youtub-ext-v1.0.0.zip`. The ZIP contains the built extension with `manifest.json` at its root, ready for Chrome Web Store upload. Rebuilding replaces only that version's ZIP and preserves other releases. Build tooling requires Node.js 22 or newer.

## Behavior

Settings sync through browser storage and apply to open YouTube tabs. Intro defaults to 5 seconds; Outro starts disabled. Existing saved durations are preserved. Intro skips once per video; Outro seeks to the end, allowing YouTube's usual autoplay behavior. Manual seeking back remains possible after a skip. Skipping pauses during detected ads. Live streams, Shorts, and videos whose duration is no greater than the combined skip durations are left alone.

**Non stop playing** defaults to enabled. It clicks the confirmation for the English “Video paused. Continue watching?” dialog as soon as the visible, enabled button is detected. A DOM observer watches popup changes without polling or intentional delays. Unchecking the option disconnects that observer. Other confirmation dialogs and manual pauses are left alone. Browser scheduling and YouTube playback handling determine the actual resume time; uninterrupted playback cannot be guaranteed. Other interface languages are not currently supported for prompt detection.

## Structure

- `src/features/settings.ts`: preferences and validation
- `src/features/content.ts`: YouTube playback behavior
- `src/features/nonstop.ts`: continue-watching confirmation
- `src/popup/main.ts`: popup controls
- `public/assets`: styles and graphics
- `public`: extension manifest and popup markup
- `scripts/build.mjs`: TypeScript bundling and static asset copy

No remote scripts, analytics, or runtime dependencies.

## Changelog

See the [changelog](../CHANGELOG.md) for version history.

## License and credits

**Proprietary — All rights reserved.**

Developed by **Gautam Ankoji** under **SECTECT**.

The original project is owned by SECTECT. Anyone may fork, build, modify, and submit changes through the official repository under the [LICENSE](../LICENSE), without prior approval. Independent redistribution and reuse remain restricted. Contributors retain ownership of their work and grant SECTECT rights to incorporate it. Changes require maintainer review and validation; see [Contributing](../CONTRIBUTING.md). Third-party materials retain their own licenses.

YouTub.ext is an independent browser extension and is not affiliated with or endorsed by YouTube or Google.

[Back to project overview](../README.md)

Repository configuration and required settings: [GitHub setup](github.md).
