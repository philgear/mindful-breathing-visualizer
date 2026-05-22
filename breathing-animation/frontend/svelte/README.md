<!-- PREAMBLE_START -->

> 🌿 **Frontend / Svelte Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
>
> - **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> - **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> - **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.

<!-- PREAMBLE_END -->

# Svelte Breathing Visualizer

This project is a Svelte component that visualizes mindful breathing techniques with **shape customization** and **immersive audio**.

## Features

- **Three Shapes**: Circle, Square, Lotus.
- **Audio Support**: Native Web Audio API integration.
- **Accessibility**: Polished ARIA live regions for screen readers.
- **Security**: Immutable configuration patterns (`Object.freeze`).

## Usage

1.  Copy `BreathingVisualizer.svelte` into your Svelte project.
2.  Import and use it:

```svelte
<script>
  import BreathingVisualizer from './BreathingVisualizer.svelte';
</script>

<BreathingVisualizer />
```
