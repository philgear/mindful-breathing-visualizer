<!-- PREAMBLE_START -->

> 🌿 **Mobile / Android Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
>
> - **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> - **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> - **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.

<!-- PREAMBLE_END -->

# Kotlin (Android) Breathing Visualizer

This directory contains a Jetpack Compose implementation of the breathing animation, featuring **Native Audio** and **Shape Customization**.

## Features

- **Three Shapes**: Circle, Square, Lotus (`RoundedCornerShape`).
- **Native Audio**: Low-latency PCM synthesis using `AudioTrack` and `AudioController.kt`.
- **Architecture**: Implements rigorous state management (Immutability/Frozen Config).
- **Performance**: Smooth 60fps animations with Compose.

## Usage

1. Open Android Studio and create a new **Empty Compose Activity** project.
2. Copy `BreathingScreen.kt` into your source set.
3. Call `BreathingScreen()` from your `MainActivity`.

## Dependencies

- Jetpack Compose UI
- Material Design
