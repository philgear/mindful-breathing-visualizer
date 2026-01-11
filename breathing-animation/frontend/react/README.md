<!-- PREAMBLE_START -->
> 🌿 **Frontend / React Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
> *   **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> *   **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> *   **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.
<!-- PREAMBLE_END -->

# React Breathing Component

This project is a React-based component that visualizes mindful breathing techniques (Box, Diaphragmatic, Alternate Nostril) with **shape customization** and **immersive audio**.

## Features

-   **Three Shapes**: Circle, Square, Lotus (Selector included).
-   **Audio Support**: Real-time sine wave synthesis (150-200Hz) synchronizing with breath phases.
-   **Accessibility**: Full ARIA support (`role="status"`, `aria-live`) and keyboard navigation.
-   **Security**: Props validation and no dangerous `dangerouslySetInnerHTML`.

## Usage

1. Copy `BreathingVisualizer.jsx` into your React project.
2. Import and use it:

```jsx
import BreathingVisualizer from './BreathingVisualizer';

function App() {
  return (
    <div className="App">
      <BreathingVisualizer />
    </div>
  );
}
```

## Dependencies

- `react`
- `react-dom`
