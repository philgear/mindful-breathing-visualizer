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
