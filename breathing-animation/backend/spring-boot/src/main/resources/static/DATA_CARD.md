# Data Card: Mindful Breathing Algorithms

> This Data Card provides transparency into the "dataset" (algorithmic models, sensory constants, and audio frequencies) used throughout the Mindful Breathing Visualizer ecosystem.

---

## 1. Dataset Overview

### Dataset Name

Mindful Breathing Algorithms & Serene Palette v3.0

### Description

A collection of piece-wise mathematical functions, colorimetric definitions, and auditory frequency mappings designed to simulate Respiratory Sinus Arrhythmia (RSA) for stress reduction and biofeedback applications.

### Created By

Phil Gear (maintained by the Open Source Community)

### License

Creative Commons Attribution 4.0 International (CC BY 4.0)

---

## 2. Intended Use

### Primary Use Case

- **Digital Therapeutics**: To drive visual animations and audio synthesis in mental health applications.
- **Accessibility Benchmarking**: As a high-contrast, WCAG 2.2 compliant reference set for testing inclusive UI design with reduced motion preferences.
- **Biofeedback Synchronization**: To provide a standardized timing signal for synchronizing with heart rate variability (HRV) sensors.

### Out of Scope Use Cases

- **Medical Diagnosis**: This dataset is NOT a medical device and should not be used to diagnose respiratory conditions.
- **Clinical Treatment**: While based on research, this implementation has not undergone FDA trials.

---

## 3. Data Representation

### Mathematical Model (RSA Simulation)

The breathing cycle is modeled as a piece-wise function of time $t$ (seconds), simulating the natural acceleration/deceleration of RSA.

**Box Breathing (4-4-4-4):**

```match
f(t) = \begin{cases}
  0.5 - 0.5 \cos(\frac{\pi t}{4}) & 0 \le t < 4 \quad (\text{Inhale}) \\
  1 & 4 \le t < 8 \quad (\text{Hold}) \\
  0.5 + 0.5 \cos(\frac{\pi (t-8)}{4}) & 8 \le t < 12 \quad (\text{Exhale}) \\
  0 & 12 \le t < 16 \quad (\text{Hold})
\end{cases}
```

### The Serene Palette™ (Visuals)

Strictly defined colors optimized for accessibility and calmness.

| State      | Hex       | RGB             | HSL              | Semantics                   |
| :--------- | :-------- | :-------------- | :--------------- | :-------------------------- |
| **Inhale** | `#34d399` | `52, 211, 153`  | `158°, 64%, 52%` | Growth, Oxygen, Energy      |
| **Hold**   | `#60a5fa` | `96, 165, 250`  | `213°, 94%, 68%` | Stability, Clarity, Pausing |
| **Exhale** | `#fb7185` | `251, 113, 133` | `351°, 95%, 71%` | Release, Warmth, Letting Go |

### Auditory Mapping (Sound)

Real-time synthesis mapping based on 150Hz-200Hz frequency range, known for relaxation.

- **Inhale**: 150Hz -> 200Hz (Sine Wave, Linear Ramp)
- **Hold**: Constant Tone (Phase Dependent)
- **Exhale**: 200Hz -> 150Hz (Sine Wave, Linear Ramp)

---

## 4. Provenance & Maintenance

### Sources

- **Seminal Research**: Bentley, T.G.K., et al. (2023). "Breathing Practices for Stress and Anxiety Reduction: Conceptual Framework of Implementation Guidelines." _Brain Sciences_, 13(12), 1612. [DOI: 10.3390/brainsci13121612](https://doi.org/10.3390/brainsci13121612).
- **SWEBOK v4**: Engineering alignment for requirements construction.
- **Nielsen Heuristics**: Usability alignment for status visibility.

### Maintenance Status

Start Date: 2024
Update Frequency: Semiannual (Major Releases)
Version: 3.0.0

### Contact

[GitHub Issues](https://github.com/philgear/mindful-breathing-visualizer/issues)

---

## 5. Deferral to Clinical Workflow (CoDoC Alignment)

This system is designed as a **Complementary Tool** only. It adheres to a strict "100% Deferral Policy" under the **CoDoC** (Complementarity-Driven Deferral to Clinical Workflow) framework.

### Protocol

- **AI Confidence Threshold**: 0% (System never assumes diagnostic authority).
- **Clinical Deferral**: The system unconditionally defers to human clinical judgment for all medical decisions, diagnoses, or treatment plans.
- **Alignment**: This policy aligns with the principles of complementarity-driven AI safety, ensuring the tool serves as a support mechanism rather than a replacement for professional care.

> _Reference: Ferrier, M., et al. (2023). "Complementarity-driven Deferral to Clinical Workflow." Google DeepMind / Google Research._

---

_Generated based on the Google Data Cards Playbook._
