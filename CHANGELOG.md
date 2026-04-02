# Changelog

All notable changes to the **Mindful Breathing Visualizer** project will be documented in this file.

## [3.1.0] - 2026-04-01 - Animation & Aesthetic Overhaul

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

## [3.0.0] - 2026-01-11 - SWEBOK v4 Compliance Upgrade

### Added
- **Ecosystem Expansion**: Added 6 new pillars (`Lua`, `R`, `Julia`, `Perl`, `Kubernetes`, `Notebooks`) reaching a total of 39 supported implementations.
- **Infrastructure**: Added `infrastructure/kubernetes` with production-ready `deployment.yaml`, `service.yaml`, and `Dockerfile`.
- **Math/Scientific**: Added `math/r` (R Script), `math/julia` (Julia Script), and `cli/lua` (Lua CLI).
- **Legacy Scripting**: Added `cli/perl` for legacy audit compliance.
- **Mobile Audit**: Formally verified Native Android (Kotlin) and Native iOS (Swift) as standalone compliant pillars.

### Changed
- **Visual Standards (KA 2.1)**: Strictly enforced the **Serene Palette** (Emerald `#34d399`, Blue `#60a5fa`, Rose `#fb7185`) across all 39 pillars.
    - Patched JAX, LaTeX, Wolfram, and Notebooks to use precise hex/RGB values.
    - Updated all CLI tools (Bash, Python, Ruby, C++, Rust, Go, Java, Lua, Perl) to use ANSI TrueColor.
- **Audio Feedback (KA 2)**: Standardized 150Hz audio feedback.
    - **Web**: 150Hz sine wave via `AudioContext`.
    - **Native Mobile**: `AudioTrack` (Android) and `AVAudioSourceNode` (iOS).
    - **CLI/Sci**: System beep (`\7`) signaling.
- **Vanilla JS**: Rewrote `frontend/vanilla-js` to strictly adhere to ES6+ standards without React dependencies.

### Fixed
- **Jupyter Notebooks**: Corrected hardcoded `indigo` color in `breathing_visualization.ipynb` to match Serene Blue.
- **Web Components**: Fixed standard compliance for `breathing-component.js`.

## [2.1.0] - 2025-12-07

### Added

#### 🎵 Immersive Audio & Accessibility
-   **Web Audio API**: Integrated real-time sine wave synthesis (150Hz-200Hz) across all frontend frameworks (Vanilla JS, React, Vue, Svelte, Angular, Astro).
-   **Native Mobile Audio**:
    -   **Android**: Implemented `AudioTrack` PCM synthesis in Kotlin.
    -   **iOS**: Implemented `AVAudioSourceNode` synthesis in Swift.
    -   **Flutter**: Added `MethodChannel` bridge to drive native audio engines.
-   **Desktop Audio**: Extended audio support to Electron and Obsidian plugins.
-   **Accessibility**: Added ARIA `role="status"`, `aria-live="polite"`, and dynamic labels to all visualizers.

#### 🎨 Shape Customization
-   **New Shapes**: Users can now select between **Circle**, **Square**, and **Lotus**.
-   **Cross-Platform**: Shape logic ported to:
    -   **CSS** (`border-radius`) for all Web frameworks.
    -   **Jetpack Compose** (`RoundedCornerShape`) for Android.
    -   **SwiftUI** (`Path`) for iOS.
    -   **Flutter** (`BoxDecoration`).

#### 🌍 Ecosystem Expansion
-   **Frontend Frameworks**: Added reference implementations for **React**, **Vue**, **Angular**, **Svelte**, **Astro**, **Web Components**, **Ghost CMS**, and **Shopify**.
-   **System & CLI**: Added native implementations in **Rust**, **Go**, **C++**, **Python**, **Java**, **Ruby**, and **WebAssembly**.
-   **Backend Integrations**: Added support for **Spring Boot**, **WordPress**, **Drupal**, **Moodle**, and **MCP Server** (Node.js).
-   **Math & Science**: Added breathing logic models in **JAX** (ML), **LaTeX** (TikZ), **Wolfram** Language, and a **Jupyter Notebook** (`breathing_visualization.ipynb`).
-   **Creative Coding**: Added **P5.js** particle visualization.

#### ✨ Final Polish
-   **Manual Dark Mode**: Added toggle button in Vanilla JS for user-controlled theming.
-   **Haptic Feedback**: Added gentle vibration patterns (200ms Inhale / 100ms Exhale) for mobile tactile immersion.
-   **Portfolio Landing Page**: Created a root `index.html` dashboard to showcase the entire Project Ecosystem.

### Changed
-   **Branding**: Replaced "Zen Terminal" with "Mindful Terminal" and "Zenith Palette" with "Serene Palette" to align with neutral tone guidelines.
-   **Documentation**: Massive consistency update across 10+ `README.md` files to reflect current feature set.

### Fixed
-   **Linting**: Resolved TypeScript errors in Astro and Svelte components.
-   **Consistency**: Aligned color palettes (Emerald/Blue/Rose) across CLI, Web, and Mobile.
