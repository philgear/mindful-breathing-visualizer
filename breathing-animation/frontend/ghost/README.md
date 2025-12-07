
# Mindful Breathing Ghost Integration

To integrate the Mindful Breathing Visualizer into a Ghost publication, you can use the Code Injection feature or a custom HTML card.

## 1. Global Injection (Site Header)

Go to **Settings** -> **Code Injection** -> **Site Header** and add:

```html
<!-- Load the Visualizer Component -->
<script type="module" src="https://philgear.github.io/mindful-breathing-visualizer/frontend/web-components/breathing-component.js"></script>

<!-- Security: Content Security Policy -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self' https://philgear.github.io; style-src 'self' 'unsafe-inline';">
```

## 2. Usage in Posts

In any post, add a generic **HTML Card** and insert:

```html
<div class="breathing-widget-container" style="text-align: center; margin: 2em 0;">
    <breathing-visualizer technique="box"></breathing-visualizer>
</div>
```

## 3. Security Notes

-   **CSP**: The CSP meta tag above can be made stricter. The visualizer now uses CSS variables for animations, reducing the need for `style-src 'unsafe-inline'` for transitions, though some dynamic styling might still require it depending on strictness. Ideally: `style-src 'self' 'unsafe-inline'`.
-   **Isolation**: The JavaScript code is wrapped in an IIFE (Immediately Invoked Function Expression) to prevent polluting the global namespace.
-   **Validation**: Input times are validated to be within reasonable bounds (1-60s) to prevent potential DoS or UI breaking behaviors.
