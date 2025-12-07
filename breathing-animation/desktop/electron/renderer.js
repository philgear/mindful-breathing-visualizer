const TECHNIQUES = {
    box: {
        name: 'Box Breathing',
        phases: [
            { name: 'Inhale', duration: 4000, scale: 1.5, color: '#34d399', x: 0 },
            { name: 'Hold', duration: 4000, scale: 1.5, color: '#60a5fa', x: 0 },
            { name: 'Exhale', duration: 4000, scale: 1.0, color: '#fb7185', x: 0 },
            { name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 }
        ]
    },
    diaphragmatic: {
        name: 'Diaphragmatic',
        phases: [
            { name: 'Inhale', duration: 5000, scale: 1.5, color: '#34d399', x: 0 },
            { name: 'Exhale', duration: 5000, scale: 1.0, color: '#fb7185', x: 0 }
        ]
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
            { name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 }
        ]
    }
};

let currentTechniqueKey = 'box';
let currentPhaseIndex = 0;
let timeoutId = null;

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
        phaseNameEl.textContent = phase.name;
        visualizer.style.transform = `scale(${phase.scale}) translateX(${phase.x || 0}px)`;
        visualizer.style.backgroundColor = phase.color;
        visualizer.style.transition = `transform ${phase.duration}ms ease-in-out, background-color ${phase.duration}ms ease-in-out`;

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
    buttons.forEach(btn => {
        btn.disabled = btn.dataset.technique === key;
    });

    updatePhase();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    buttons.forEach(btn => {
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
            const shape = e.target.value;
            let borderRadius = '12px';
            if (shape === 'circle') borderRadius = '50%';
            else if (shape === 'lotus') borderRadius = '40% 60% 70% 30% / 40% 50% 60% 50%';

            if (visualizer) visualizer.style.borderRadius = borderRadius;
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
