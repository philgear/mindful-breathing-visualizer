<!-- PREAMBLE_START -->

> 🌿 **Math / Awk Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
>
> - **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> - **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> - **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.

<!-- PREAMBLE_END -->

# The Text Stream (Awk)

## SWEBOK v4 Alignment

- **KA 3 (Construction)**: **Tool Composition** (Unix Philosophy). A single-purpose filter that does one thing well.
- **KA 2 (Design)**: **Simplicity**. Leveraging the `BEGIN` block as a state machine.
- **KA 1 (Requirements)**: Adheres to the **Serene Palette** (TrueColor ANSI).

## Implementation

- `breath.awk`: A self-contained script using `system()` for timing calls.

## Running

```bash
awk -f breath.awk
```
