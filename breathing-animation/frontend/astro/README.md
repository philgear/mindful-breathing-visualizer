<!-- PREAMBLE_START -->
> 🌿 **Frontend / Astro Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
> *   **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> *   **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> *   **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.
<!-- PREAMBLE_END -->

# Breathing Visualizer (Astro)
This project is an Astro component that visualizes mindful breathing techniques with **shape customization** and **immersive audio**.

## Features

-   **Three Shapes**: Circle, Square, Lotus.
-   **Audio Support**: Client-side hydration for Web Audio API.
-   **Accessibility**: Semantic HTML structure.
-   **Performance**: Zero-JS initial render (interactive island).

## Usage

Import the component in your Astro page:

```astro
---
import BreathingVisualizer from '../path/to/BreathingVisualizer.astro';
---

<BreathingVisualizer />
```

## Features
- **Box Breathing**: 4s Inhale, 4s Hold, 4s Exhale, 4s Hold
- **4-7-8 Relax**: 4s Inhale, 7s Hold, 8s Exhale
- **Diaphragmatic**: 5s Inhale, 5s Exhale
