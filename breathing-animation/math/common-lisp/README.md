<!-- PREAMBLE_START -->
> 🌿 **Math / Common-lisp Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
> *   **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> *   **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> *   **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.
<!-- PREAMBLE_END -->

# The Symbolic Breath (Common Lisp)

## SWEBOK v4 Alignment
*   **KA 3 (Construction)**: Demonstrates **Metalinguistic Abstraction** via Macros (SICP 4.1).
*   **KA 2 (Design)**: Adheres to the **Serene Palette** (TrueColor ANSI) embedded in data structures.
*   **KA 1 (Requirements)**: Consistent 4-7-8 timing utilizing `LOOP`.

## Implementation
*   `breathing.lisp`: Defines the `(with-phase ...)` macro to treat the breathing pattern as a domain-specific language (DSL).

## Running
```bash
sudo apt install sbcl
sbcl --script breathing.lisp
```
