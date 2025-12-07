# Storyblok Integration

To use the **Breathing Widget** in Storyblok:

1.  **Import Schema**:
    *   Go to your Storyblok Space.
    *   Go to **Components**.
    *   Click **...** (More) -> **Import/Export**.
    *   Paste the content of `breathing_widget.json`.
    *   This will create a new "Nestable" component called "Breathing Widget".

2.  **Frontend Implementation**:
    *   In your frontend (Next.js, Nuxt, Vue, etc.), create a component to render this block.
    *   It should accept the `blok` prop and map `blok.technique` to the actual `breathing-visualizer` web component.

## Example (Vue/Nuxt)

```vue
<template>
  <div v-editable="blok" class="py-8 text-center">
    <!-- Load custom element if not globally loaded -->
    <breathing-visualizer 
      :technique="blok.technique"
      :style="{ '--session-duration': blok.duration + 'm' }"
    ></breathing-visualizer>
  </div>
</template>

<script setup>
defineProps({ blok: Object })
</script>
```
