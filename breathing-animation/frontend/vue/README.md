<!-- PREAMBLE_START -->
> 🌿 **Frontend / Vue Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
> *   **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> *   **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> *   **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.
<!-- PREAMBLE_END -->

# Vue Breathing Component

This project is a Vue.js Single File Component (SFC) that visualizes mindful breathing techniques with **shape customization** and **immersive audio**.

## Features

-   **Three Shapes**: Circle, Square, Lotus.
-   **Audio Support**: Built-in `AudioController` for phase-synchronized tones.
-   **Accessibility**: ARIA-compliant status updates.
-   **Security**: Explicit prop validation and scoped styles.

## Usage

1. Copy `BreathingVisualizer.vue` into your Vue project (e.g., `src/components/`).
```vue
<template>
  <div id="app">
    <BreathingVisualizer />
  </div>
</template>

<script>
import BreathingVisualizer from './components/BreathingVisualizer.vue'

export default {
  name: 'App',
  components: {
    BreathingVisualizer
  }
}
</script>
```

## Dependencies

- `vue` (works with Vue 2 or 3)
