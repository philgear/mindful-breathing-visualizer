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
