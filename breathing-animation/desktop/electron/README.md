<!-- PREAMBLE_START -->
> 🌿 **Desktop / Electron Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
> *   **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> *   **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> *   **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.
<!-- PREAMBLE_END -->

# Electron Breathing Visualizer

This directory contains a standalone desktop application for the breathing visualizer, built with Electron.

## Features

-   **Desktop Native**: Runs as a standalone window.
-   **Audio Support**: Integrated `AudioController` with system audio access.
-   **Shape Customization**: Full UI for selecting Circle, Square, or Lotus shapes.
-   **Security**:
    -   `contextIsolation: true`
    -   `nodeIntegration: false`
    -   Strict Content Security Policy (CSP).

## Usage

1.  `npm install`
2.  `npm start`
