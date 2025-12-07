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
