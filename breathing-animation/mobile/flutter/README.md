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
