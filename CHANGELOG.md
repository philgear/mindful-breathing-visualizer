# Changelog

All notable changes to the **Mindful Breathing Visualizer** project will be documented in this file.

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
