<!-- PREAMBLE_START -->
> 🌿 **Mobile / Flutter Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
> *   **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> *   **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> *   **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.
<!-- PREAMBLE_END -->

# Flutter Breathing Visualizer

This directory contains a Flutter implementation of the breathing animation, serving as a cross-platform bridge with **Native Audio**.

## Features

-   **Three Shapes**: Circle, Square, Lotus (`BoxDecoration`).
-   **Audio Bridge**: Uses `MethodChannel` (`com.philgear.breathing/audio`) to drive native Android/iOS audio engines.
-   **Security**: Minimal dependencies approach.
-   **Consistency**: Pixel-perfect match with web and native implementations.

## Usage

1. Initialize a new Flutter project: `flutter create my_breathing_app`
2. Replace `lib/main.dart` with the file in this directory.
3. Run: `flutter run`

## Dependencies

- Flutter SDK
