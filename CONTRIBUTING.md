# Contributing to Mindful Breathing Visualizer

Welcome to the Mindful Breathing Visualizer project! We're building a cross-platform ecosystem to promote mindfulness through technology. Whether you're a web developer, mobile engineer, system programmer, or creative coder, there's a place for you here.

## 🌍 Project Ecosystem

This repository is a monorepo containing implementations across multiple domains:

| Domain | Tech Stack | Location |
| :--- | :--- | :--- |
| **Frontend** | React, Vue, Angular, Svelte, Astro, Vanilla JS | `breathing-animation/frontend/` |
| **Mobile** | Flutter, Kotlin (Android), Swift (iOS) | `breathing-animation/mobile/` |
| **Desktop** | Electron, Obsidian Plugin | `breathing-animation/desktop/` |
| **CLI / System** | Rust, Go, C++, Python, Ruby, Java | `breathing-animation/cli/` |
| **Backend** | PHP, Spring Boot, MCP Server | `breathing-animation/backend/` |

## 🚀 Getting Started

1.  **Fork & Clone**:
    ```bash
    git clone https://github.com/your-username/mindful-breathing-visualizer.git
    cd mindful-breathing-visualizer
    ```

2.  **Web Development**:
    This project uses **NPM Workspaces**.
    ```bash
    cd breathing-animation
    npm install
    npm run dev -w frontend/react  # Example: Run React app
    ```

3.  **Mobile Development**:
    *   **Android**: Open `breathing-animation/mobile/android` in Android Studio.
    *   **iOS**: Open `breathing-animation/mobile/ios` in Xcode.
    *   **Flutter**: Run `flutter run` in `breathing-animation/mobile/flutter`.

4.  **CLI / System**:
    *   **Go**: `go run .` in `breathing-animation/cli/go`.
    *   **Rust**: `cargo run` in `breathing-animation/cli/rust`.
    *   **Ruby**: `bundle exec mindful_breathing` in `breathing-animation/cli/ruby`.

## 🛡️ Security & Architecture Standards

We adhere to strict standards to ensure safety and stability.

1.  **Immutability**: Configuration objects should be deeply frozen.
    *   *JS*: Use `Object.freeze()`.
    *   *System*: Use `const`, `final`, or equivalent.
2.  **Context**: Read `.gemini` in the root for project-wide constants (colors, frequencies, shapes).
3.  **Isolation**: Each pillar must be self-contained. Do not rely on relative paths outside your module's root.
4.  **No "Zen"**: We use **"Mindful"** terminology. The color palette is **"Serene Palette"**.

## 🎨 Design System: The Serene Palette

*   **Primary (Emerald)**: `#34d399` (Usage: Inhale)
*   **Secondary (Blue)**: `#60a5fa` (Usage: Hold)
*   **Accent (Rose)**: `#fb7185` (Usage: Exhale)
*   **Typography**: Inter (UI), Outfit (Headings).

## 🤝 Submitting Changes

1.  Create a branch: `git checkout -b feature/amazing-feature`.
2.  Commit changes: `git commit -m "feat: Add amazing feature"`.
3.  Push: `git push origin feature/amazing-feature`.
4.  Open a Pull Request.

Thank you for breathing with us! 🧘‍♂️