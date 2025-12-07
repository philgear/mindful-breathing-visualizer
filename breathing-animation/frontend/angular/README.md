# Angular Breathing Component

This project is an Angular component that visualizes mindful breathing techniques with **shape customization** and **immersive audio**.

## Features

-   **Three Shapes**: Circle, Square, Lotus.
-   **Audio Support**: `AudioController` service integration.
-   **Accessibility**: Angular bindings for `aria-label` and `role`.
-   **Security**: Strict Type Safety and frozen configuration objects.

## Usage

1. Copy `breathing-visualizer.component.ts` into your Angular project (e.g., `src/app/`).
2. Declare it in your `app.module.ts`:

```typescript
import { BreathingVisualizerComponent } from './breathing-visualizer.component';

@NgModule({
  declarations: [
    BreathingVisualizerComponent
    // ...
  ],
  // ...
})
export class AppModule { }
```

3. Use it in your template:

```html
<app-breathing-visualizer></app-breathing-visualizer>
```

## Dependencies

- `@angular/core`
- `@angular/common`
