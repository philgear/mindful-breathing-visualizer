# Changelog

## [2026-05-21] - DOI Breathing Animation Alignment & Compliance Audit

### Added
- **Licensing Compliance Audit**: Formally scanned and removed all GPL-licensed libraries/packages from the project dependencies, ensuring a fully permissive ecosystem (MIT/CC-BY-4.0).
- **Playwright Configuration**: Added root configuration for Playwright E2E testing to isolate test runs and resolve unit test overlaps.
- **Security scan workflows & SBOM**: Added GitHub Actions CI workflows, ESLint security plugin, and automatic Software Bill of Materials (SBOM) generation via CycloneDX.

### Changed
- **Scientific Animation Standards**: Aligned breathing scale animation timing curves with the piecewise cosine respiratory function $f(t) = 0.5 - 0.5 \cos(\frac{\pi t}{\text{duration}})$ from the Bentley et al. (2023) guidelines.
  - Implemented exact `cubic-bezier(0.37, 0, 0.63, 1)` easing transitions (equivalent to `easeInOutSine`) across CSS, JS/TS frameworks, and native mobile/desktop platforms.
- **Scale-Preserved Hold States**: Ensured breath hold states completely freeze the lung scale transition (scale static, transitioning only background colors).
- **Extended Defaults**: Shifted default session duration lengths to a minimum of 5 minutes across visualizer applications.

## [2026-04-01] - Animation & Aesthetic Overhaul

### Added
- **Vestibular Accessibility**: Implemented comprehensive `@media (prefers-reduced-motion: reduce)` fallbacks across all 5 primary styling implementations to disable aggressive `scale()` and translation transforms, substituting them with gentle opacity fades for users with motion sensitivity.
- **Geometric Lotus**: Restored the crisp overlapping 3-petal 60/120 degree geometric form for the Lotus visualization in Vanilla JS and Docs.
- **Subconscious Pulsing**: Added an ultra-subtle 4-second opacity pulse to visually signify active focus without breaking the minimalist aesthetic during breath holds.

### Changed
- **Organic Easing**: Replaced rigid linear and material timing functions with a natural sine curve (`cubic-bezier(0.42, 0, 0.58, 1)`) across Web, Docs, and Extensions for more realistic lung expansion simulation.
- **Hold States**: Maintained explicit state scaling (`transform: scale(1.5)` and `scale(0.8)`) during `hold` and `holdAfterExhale` phases to ensure visualizations don't erroneously snap to neutral mid-exercise.

### Fixed
- **Alternate Nostril Timing**: Fixed a bug where the left/right active indicators were hardcoded to a 0.3-second transition instead of smoothly swelling across the entire dynamic breath interval.
- **Progress Bar States**: Synchronized progress bar layout and CSS transitions with hold states in Vanilla JS implementations.

## [2026-01-11] - SWEBOK v4 Compliance Upgrade

### Added

- **Ecosystem Expansion**: Added 6 new pillars (`Lua`, `R`, `Julia`, `Perl`, `Kubernetes`, `Notebooks`) reaching a total of 39 supported implementations.
- **Infrastructure**: Added `infrastructure/kubernetes` with production-ready `deployment.yaml`, `service.yaml`, and `Dockerfile`.
- **Math/Scientific**: Added `math/r` (R Script), `math/julia` (Julia Script), and `cli/lua` (Lua CLI).
- **Legacy Scripting**: Added `cli/perl` for compliance verification in legacy environments.
- **Mobile**: formally audited and verified standalone Native Android (Kotlin) and Native iOS (Swift) implementations alongside Flutter.

### Changed

- **Visual Standards (KA 2.1)**: All 39 pillars now strictly enforce the **Serene Palette** (Emerald `#34d399`, Blue `#60a5fa`, Rose `#fb7185`).
  - Upgraded JAX, LaTeX, Wolfram, and Notebooks to use precise hex/RGB values.
  - Upgraded all CLI tools (Bash, Python, Ruby, C++, Rust, Go, Java, Lua, Perl) to use ANSI TrueColor escape codes.
- **Audio Feedback (KA 2)**: Implemented standardized audio feedback across all compatible platforms.
  - **Web**: 150Hz sine wave via `AudioContext` with smooth gain ramps.
  - **Native Mobile**: 150Hz tone synthesis via `AudioTrack` (Android) and `AVAudioSourceNode` (iOS).
  - **CLI/Scientific**: System beep (`\7`) signaling for phase transitions.
- **Vanilla JS**: Completely rewrote `frontend/vanilla-js` to remove unauthorized React dependencies and implement a pure, compliant ES6+ solution.

### Fixed

- **Jupyter Notebooks**: Corrected hardcoded `indigo` color in `breathing_visualization.ipynb` to match Serene Blue.
- **Web Components**: Fixed standard compliance for `breathing-component.js` audio Context handling.

## [2025-12-XX] - Initial Polyglot Release

- Initial release of Frontend, Backend, and Core CLI pillars.
