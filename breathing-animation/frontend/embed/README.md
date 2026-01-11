<!-- PREAMBLE_START -->
> 🌿 **Frontend / Embed Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
> *   **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> *   **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> *   **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.
<!-- PREAMBLE_END -->

# Mindful Breathing Integration (Universal)

To add the Mindful Breathing widget to any platform (Ghost, Webflow, Squarespace, custom HTML), simply copy and paste the following snippet.

## Universal Snippet

```html
<!-- Load the Web Component -->
<script src="https://philgear.github.io/mindful-breathing-visualizer/frontend/web-components/breathing-component.js"></script>

<!-- Place the widget where you want it to appear -->
<breathing-visualizer></breathing-visualizer>
```

## Secure Iframe (Recommended)

For better isolation and security, use an iframe with sandbox attributes:

```html
<iframe 
    src="https://philgear.github.io/mindful-breathing-visualizer/frontend/embed/secure-widget.html" 
    width="400" 
    height="400" 
    style="border:none;"
    sandbox="allow-scripts allow-same-origin"
    title="Mindful Breathing Visualizer">
</iframe>
```

## Platform Specific Instructions

### Ghost (Code Injection)
1. Go to **Settings > Code Injection**.
2. Add the `<script>` tag to the **Site Header**.
3. In any post or page, add an HTML card and paste `<breathing-visualizer></breathing-visualizer>`.

### Webflow / Squarespace
1. Add an **Embed Code** block.
2. Paste the full snippet above.

### Notion
1. Use the hosted URL in an Embed block: `https://philgear.github.io/mindful-breathing-visualizer/frontend/vanilla-js/public/index.html` (Assuming hosted).
2. Alternatively, use a Notion Widget tool pointing to that URL.
