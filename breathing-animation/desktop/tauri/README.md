<!-- PREAMBLE_START -->

> 🌿 **Desktop / Tauri Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
>
> - **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> - **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> - **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.

<!-- PREAMBLE_END -->

# Desktop Packaging (Tauri / Linux)

This pillar wraps the **Frontend** (`vanilla-js`) in a **Rust** container using **Tauri v2**.
It targets **Linux Desktop** users, providing native `.deb` and `.AppImage` support.

## Prerequisites

- **Rust**: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **Tauri CLI**: `cargo install tauri-cli`
- **System Deps**: `sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev`

## Building for Debian/Ubuntu (.deb)

To create a `.deb` package that can be installed with `apt` or `dpkg`:

```bash
cd src-tauri
cargo tauri build
```

The output will be in `src-tauri/target/release/bundle/deb/`.

## Creating a Flatpak

The easiest way to Flatpak a Tauri app is using `flatpak-builder`.

1.  **Manifest**: Create `com.philgear.mindful-breathing.yml`.
2.  **Wrapper**: Use the `cargo-bundle` feature or simply point the Flatpak manifest to the release binary.

_Note: For official Flathub distribution, see [Tauri Flatpak Guide](https://tauri.app/v1/guides/distribution/flatpak)._
