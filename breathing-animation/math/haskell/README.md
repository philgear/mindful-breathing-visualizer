<!-- PREAMBLE_START -->
> 🌿 **Math / Haskell Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
> *   **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> *   **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> *   **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.
<!-- PREAMBLE_END -->

# The Pure Breath (Haskell)

## SWEBOK v4 Alignment
*   **KA 3 (Construction)**: Enforces **Separation of Concerns** via Monadic encapsulation (Pure Logic vs. `IO` Runtime).
*   **KA 2 (Design)**: Mathematical purity ensures the breathing cycle is **Testable** and **Deterministic**.
*   **KA 1 (Requirements)**: Adheres to the **Serene Palette** (TrueColor ANSI).

## Implementation
*   `Breathing.hs`: `eternalBreath` is a pure infinite list. The `main` function is the impure runtime.

## Running
```bash
runhaskell Breathing.hs
```
