const TECHNIQUES = {
  box: {
    name: 'Box Breathing',
    phases: [
      { name: 'Inhale', duration: 4000, scale: 1.5, color: '#34d399', x: 0 },
      { name: 'Hold', duration: 4000, scale: 1.5, color: '#60a5fa', x: 0 },
      { name: 'Exhale', duration: 4000, scale: 1.0, color: '#fb7185', x: 0 },
      { name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 },
    ],
  },
  diaphragmatic: {
    name: 'Diaphragmatic',
    phases: [
      { name: 'Inhale', duration: 5000, scale: 1.5, color: '#34d399', x: 0 },
      { name: 'Exhale', duration: 5000, scale: 1.0, color: '#fb7185', x: 0 },
    ],
  },
  alternate: {
    name: 'Alternate Nostril',
    phases: [
      { name: 'Inhale Left', duration: 4000, scale: 1.0, color: '#34d399', x: -50 },
      { name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 },
      { name: 'Exhale Right', duration: 4000, scale: 1.0, color: '#fb7185', x: 50 },
      { name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 },
      { name: 'Inhale Right', duration: 4000, scale: 1.0, color: '#34d399', x: 50 },
      { name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 },
      { name: 'Exhale Left', duration: 4000, scale: 1.0, color: '#fb7185', x: -50 },
      { name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 },
    ],
  },
};

let currentTechniqueKey = 'box';
let currentPhaseIndex = 0;
let timeoutId = null;
let currentShape = 'circle';

const visualizer = document.getElementById('visualizer');
const phaseNameEl = document.getElementById('phase-name');
const techniqueNameEl = document.getElementById('technique-name');
const buttons = document.querySelectorAll('.controls button');

// Audio Controller Class
class AudioController {
  constructor() {
    this.ctx = null;
    this.oscillator = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
      this.gainNode.gain.value = 0;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : 0.1;
    }
    return this.isMuted;
  }

  startTone() {
    if (this.isMuted) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.oscillator) this.oscillator.stop();

    this.oscillator = this.ctx.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = 150;
    this.oscillator.connect(this.gainNode);
    this.oscillator.start();
    this.isPlaying = true;

    this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 1);
  }

  stopTone() {
    if (this.oscillator && this.isPlaying) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(0, now + 1);

      setTimeout(() => {
        if (this.oscillator) {
          this.oscillator.stop();
          this.oscillator = null;
        }
      }, 1000);
      this.isPlaying = false;
    }
  }

  setPhase(phaseName, duration) {
    if (this.isMuted || !this.isPlaying || !this.ctx) return;
    const now = this.ctx.currentTime;
    const rampTime = duration / 1000;

    this.oscillator.frequency.cancelScheduledValues(now);
    this.gainNode.gain.cancelScheduledValues(now);

    const isInhale = phaseName.toLowerCase().includes('inhale');
    const isExhale = phaseName.toLowerCase().includes('exhale');

    if (isInhale) {
      this.oscillator.frequency.setValueAtTime(150, now);
      this.oscillator.frequency.linearRampToValueAtTime(200, now + rampTime);
      this.gainNode.gain.setValueAtTime(0.1, now);
      this.gainNode.gain.linearRampToValueAtTime(0.2, now + rampTime);
    } else if (isExhale) {
      this.oscillator.frequency.setValueAtTime(200, now);
      this.oscillator.frequency.linearRampToValueAtTime(150, now + rampTime);
      this.gainNode.gain.setValueAtTime(0.2, now);
      this.gainNode.gain.linearRampToValueAtTime(0.1, now + rampTime);
    } else {
      // Hold
      this.oscillator.frequency.setValueAtTime(this.oscillator.frequency.value, now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    }
  }
}

const audioController = new AudioController();

function updatePhase() {
  const technique = TECHNIQUES[currentTechniqueKey];
  const phase = technique.phases[currentPhaseIndex];

  if (visualizer && phaseNameEl) {
    const phaseNameLower = phase.name.toLowerCase();
    const isInhale = phaseNameLower.includes('inhale');
    const isExhale = phaseNameLower.includes('exhale');
    const isHold = phaseNameLower.includes('hold');

    // Determine shape styling
    let borderRadius = '50%';
    let clipPath = 'none';
    let background = 'var(--inactive-gradient)';
    let filter = 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.04))';
    let rotate = '0deg';

    if (currentShape === 'square') {
      borderRadius = '36px'; // Squircle
    } else if (currentShape === 'lotus') {
      borderRadius = '50% 0 50% 0';
      rotate = '45deg';
    } else if (currentShape === 'star') {
      borderRadius = '0';
      clipPath = 'polygon(50% 0%, 58% 31%, 85% 15%, 69% 42%, 100% 50%, 69% 58%, 85% 85%, 58% 69%, 50% 100%, 42% 69%, 15% 85%, 31% 58%, 0% 50%, 31% 42%, 15% 15%, 42% 31%)';
    } else if (currentShape === 'flower') {
      borderRadius = '50%';
      clipPath = 'polygon(50% 0%, 62% 12%, 78% 7%, 82% 22%, 96% 26%, 91% 41%, 100% 50%, 91% 59%, 96% 74%, 82% 78%, 78% 93%, 62% 88%, 50% 100%, 38% 88%, 22% 93%, 18% 78%, 4% 74%, 9% 59%, 0% 50%, 9% 41%, 4% 26%, 18% 22%, 22% 7%, 38% 12%)';
    } else if (currentShape === 'hexagon') {
      borderRadius = '0';
      clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
    } else if (currentShape === 'sun') {
      borderRadius = '0';
      clipPath = 'polygon(50% 0%, 54% 12%, 67% 6%, 67% 20%, 80% 20%, 76% 33%, 90% 37%, 82% 48%, 90% 63%, 76% 67%, 80% 80%, 67% 80%, 67% 94%, 54% 88%, 50% 100%, 46% 88%, 33% 94%, 33% 80%, 20% 80%, 24% 67%, 10% 63%, 18% 48%, 10% 37%, 24% 33%, 20% 20%, 33% 20%, 33% 6%, 46% 12%)';
    }

    if (currentShape !== 'turtle') {
      if (isHold) {
        background = 'var(--hold-gradient)';
        filter = 'drop-shadow(0 10px 20px rgba(15, 23, 42, 0.15))';
        if (currentShape === 'sun') {
          background = 'radial-gradient(circle, #cbd5e1 0%, #475569 100%)';
          filter = 'drop-shadow(0 0 20px rgba(148, 163, 184, 0.4))';
        } else if (currentShape === 'flower') {
          background = 'radial-gradient(circle, #cbd5e1 0%, #1e293b 100%)';
        }
      } else {
        background = 'var(--active-gradient)';
        filter = isExhale
          ? 'drop-shadow(0 4px 10px rgba(234, 91, 12, 0.15))'
          : 'drop-shadow(0 10px 20px rgba(234, 91, 12, 0.25))';
        if (currentShape === 'sun') {
          background = 'radial-gradient(circle, #fef08a 0%, #f97316 60%, #ea5b0c 100%)';
          filter = isExhale
            ? 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.3))'
            : 'drop-shadow(0 0 25px rgba(251, 191, 36, 0.6))';
          if (isInhale) rotate = '15deg';
        } else if (currentShape === 'flower') {
          background = 'radial-gradient(circle, #fcd34d 0%, #ea5b0c 100%)';
          if (isInhale) rotate = '30deg';
        } else if (currentShape === 'hexagon') {
          background = 'linear-gradient(135deg, #ea5b0c 0%, #b45309 100%)';
          if (isInhale) rotate = '60deg';
        } else if (currentShape === 'star') {
          rotate = '45deg';
        }
      }
    }

    // Set content (Turtle or text)
    if (currentShape === 'turtle') {
      phaseNameEl.textContent = '🐢';
      phaseNameEl.style.fontSize = '80px';
      phaseNameEl.style.display = 'block';
      phaseNameEl.style.color = 'initial';
      phaseNameEl.style.textShadow = 'none';
      visualizer.style.background = 'transparent';
      visualizer.style.filter = 'none';
      visualizer.style.borderRadius = '0';
      visualizer.style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'; // Faint shell shape
    } else {
      phaseNameEl.textContent = phase.name;
      phaseNameEl.style.fontSize = '14px';
      phaseNameEl.style.color = 'white';
      phaseNameEl.style.textShadow = 'none';
      visualizer.style.background = background;
      visualizer.style.filter = filter;
      visualizer.style.borderRadius = borderRadius;
      visualizer.style.clipPath = clipPath;
    }

    // Dynamic scale and translate transforms
    let currentScale = phase.scale;
    if (isExhale) {
      currentScale = 0.8;
    } else if (isHold && phase.scale === 1.0) {
      // Hold after exhale
      currentScale = 0.8;
    }
    visualizer.style.transform = `scale(${currentScale}) translateX(${phase.x || 0}px) rotate(${rotate})`;

    if (isHold) {
      visualizer.style.transition = `background-color ${phase.duration}ms cubic-bezier(0.37, 0, 0.63, 1)`;
    } else {
      visualizer.style.transition = `transform ${phase.duration}ms cubic-bezier(0.37, 0, 0.63, 1), background-color ${phase.duration}ms cubic-bezier(0.37, 0, 0.63, 1)`;
    }

    // Update Target Guide Styles
    const targetGuide = document.getElementById('target-guide');
    if (targetGuide) {
      let guideBorder = '1.5px dashed rgba(234, 91, 12, 0.2)';
      let guideBg = 'transparent';
      let guideClipPath = clipPath;
      let guideBorderRadius = borderRadius;
      let guideRotate = rotate;

      if (clipPath !== 'none') {
        guideBorder = 'none';
        guideBg = 'rgba(234, 91, 12, 0.05)';
      }
      if (currentShape === 'sun') {
        guideBg = 'rgba(251, 191, 36, 0.08)';
      }

      if (currentShape === 'turtle') {
        guideBorder = '1.5px dashed rgba(52, 211, 153, 0.4)';
        guideBg = 'rgba(52, 211, 153, 0.03)';
        guideBorderRadius = '0';
        guideClipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
        guideRotate = '0deg';
      }

      targetGuide.style.border = guideBorder;
      targetGuide.style.backgroundColor = guideBg;
      targetGuide.style.borderRadius = guideBorderRadius;
      targetGuide.style.clipPath = guideClipPath;
      targetGuide.style.transform = `rotate(${guideRotate})`;
    }

    // A11y
    visualizer.setAttribute('aria-label', `Current phase: ${phase.name}`);

    // Audio
    audioController.setPhase(phase.name, phase.duration);
  }

  // Schedule next phase
  timeoutId = setTimeout(() => {
    currentPhaseIndex = (currentPhaseIndex + 1) % technique.phases.length;
    updatePhase();
  }, phase.duration);
}

function setTechnique(key) {
  if (timeoutId) clearTimeout(timeoutId);

  currentTechniqueKey = key;
  currentPhaseIndex = 0;

  const technique = TECHNIQUES[key];
  if (techniqueNameEl) techniqueNameEl.textContent = technique.name;

  // Update buttons state
  buttons.forEach((btn) => {
    btn.disabled = btn.dataset.technique === key;
  });

  updatePhase();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.target;
      if (target.dataset.technique) {
        setTechnique(target.dataset.technique);
      }
    });
  });

  // Shape selection logic
  const shapeSelect = document.getElementById('shape-select');
  if (shapeSelect) {
    shapeSelect.addEventListener('change', (e) => {
      currentShape = e.target.value;
      // Immediately refresh styles
      if (timeoutId) clearTimeout(timeoutId);
      updatePhase();
    });
  }

  // Mute Logic
  const muteBtn = document.getElementById('mute-btn');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      const isMuted = audioController.toggleMute();
      muteBtn.textContent = isMuted ? '🔇 Unmute' : '🔊 Mute';
    });
  }

  // Start
  updatePhase();
  audioController.startTone();
});
