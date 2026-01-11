<!-- PREAMBLE_START -->
> 🌿 **Math / Clojure Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
> *   **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> *   **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> *   **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.
<!-- PREAMBLE_END -->

# The Recursive Breath (Clojure)

## SWEBOK v4 Alignment
*   **KA 3 (Construction)**: Enforces **Immutability** and **Tail Recursion** (`recur`) for robust state management.
*   **KA 2 (Design)**: The Breath Cycle is defined as a persistent Vector of Maps, ensuring **Data Integrity**.
*   **KA 1 (Requirements)**: Adheres to the **Serene Palette** (TrueColor JVM Output).

## Implementation
*   `breathing.clj`: Uses `cycle` (lazy sequence) and `loop/recur` to model the infinite breath without stack overflow.

## Running
```bash
sudo apt install clojure
clojure -M breathing.clj
```
