# Mindful Breathing Visualizer (v3.1.0)

<p align="center">
  <img src="breathing-animation/docs/videos/3.0.0/quick-demo.webp" alt="Mindful Breathing v3.1.0 Demo" width="100%">
</p>

<p align="center">
  <a href="https://github.com/philgear/mindful-breathing-visualizer/releases/tag/v3.1.0">
     <img src="https://img.shields.io/badge/Design-Less_But_Better-ea5b0c?style=for-the-badge" alt="Minimalist Design Approved">
  </a>
  <a href="LICENSE">
     <img src="https://img.shields.io/badge/License-CC_BY_4.0-60a5fa?style=for-the-badge" alt="License">
  </a>
  <a href="breathing-animation/docs/DATA_CARD.md">
     <img src="https://img.shields.io/badge/Data_Card-View_Dataset-60a5fa?style=for-the-badge&logo=google-cloud" alt="Data Card">
  </a>
</p>

---

## 🧘 Purpose & Audience
A scientifically-modeled, universally ported breathing tool designed to help you regain focus without context-switching. Whether you're a busy developer needing a quick terminal reset, a commuter using the responsive web app, or a biohacker tracking HRV rhythms, this tool serves as an immediate, privacy-first anchor for mindfulness. 

---

## 🌿 The Ecosystem (v3.1.0 "Sensory Expansion")
The **Mindful Breathing Visualizer** strictly follows a **"Less, but better"** design philosophy, yet scales across an incredible 39+ technological dimensions.

### Core Features
*   **Procedural Soundscapes**: Four diverse acoustic anchors, from simple Singing Bowl Binaural beats to dynamically filtered Ocean Brown Noise. 
*   **Geometric Shapes**: Mathematical and nature-inspired visual interfaces including the Octagram Star, Flower of Life, and the minimalist Turtle.
*   **Smart Durations**: Context-aware defaults (Box=4s, 4-7-8=4s/7s/8s, Diaphragmatic).
*   **Haptic Feedback**: Context-aware device vibration mapping natively to your rhythmic focus requirements.
*   **Pure Function**: A stripped-back monochromatic aesthetic with a single **International Orange** accent.

### Universal Availability
We have ported the exact algorithmic breathing logic to **every major stack** to prove that mindfulness belongs everywhere:
*   **Web & CMS:** Vanilla HTML/JS, React, Vue, Svelte, Angular, Astro, Shopify, Ghost
*   **Native & Desktop:** iOS (Swift), Android (Kotlin), Tauri, Electron, VSCode Plugin
*   **CLI & Scripting:** Rust (TUI), Go, Zig, Python, C++, Bash
*   **Math & Ops:** Julia, Wolfram Language, Docker, Kubernetes, Java Spring Boot

---

## 🛡️ The Science
Our timing implementations (5+ minute duration, guidance cues, slow pacing) natively adhere to the clinical framework established by **Bentley et al. (2023)**. 
Breathing logic is meticulously calculated using piece-wise functions simulating natural respiratory sinus arrhythmia (RSA). 

> *Source: "Breathing Practices for Stress and Anxiety Reduction" Brain Sci. 2023, 13, 1612. [DOI: 10.3390](https://doi.org/10.3390/brainsci13121612)*

---

## 🚀 Quick Start (Web)

The simplest way to use the breathing visualizer is directly in your browser:
```bash
open breathing-animation/frontend/vanilla-js/public/index.html
```

Or instantly deploy the full stack inside an isolated container:
```bash
docker build -t breathing-visualizer -f infrastructure/kubernetes/Dockerfile .
docker run -p 8080:80 breathing-visualizer
```
*(Check the respective repositories for specific CLI or Native Desktop instructions.)*

---

## 🤝 Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md).

<p align="center">
  <i>"Practicing mindfulness, one byte at a time."</i>
</p>
