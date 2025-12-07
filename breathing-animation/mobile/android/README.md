# Kotlin (Android) Breathing Visualizer

This directory contains a Jetpack Compose implementation of the breathing animation, featuring **Native Audio** and **Shape Customization**.

## Features

-   **Three Shapes**: Circle, Square, Lotus (`RoundedCornerShape`).
-   **Native Audio**: Low-latency PCM synthesis using `AudioTrack` and `AudioController.kt`.
-   **Architecture**: Implements rigorous state management (Immutability/Frozen Config).
-   **Performance**: Smooth 60fps animations with Compose.

## Usage

1. Open Android Studio and create a new **Empty Compose Activity** project.
2. Copy `BreathingScreen.kt` into your source set.
3. Call `BreathingScreen()` from your `MainActivity`.

## Dependencies

- Jetpack Compose UI
- Material Design
