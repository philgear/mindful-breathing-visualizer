<!-- PREAMBLE_START -->

> 🌿 **Math / Zig Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
>
> - **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> - **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> - **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.

<!-- PREAMBLE_END -->

# The Modern System (Zig)

## SWEBOK v4 Alignment

- **KA 3 (Construction)**: **Safety** and **Explicitness**. "No hidden allocations" ensures predictable resource usage.
- **KA 2 (Design)**: **Comptime** Logic moves validation from runtime to build-time (Shift Left).
- **KA 1 (Requirements)**: Adheres to the **Serene Palette** (TrueColor ANSI).

## Implementation

- `breath.zig`: Uses `comptime` structs for the palette and `std.time` for type-safe nanosecond timing.

## Running

```bash
zig run breath.zig
```
