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

// Audio Logic (SWEBOK KA 2)
const AudioController = {
    ctx: null,
    gainNode: null,
    oscillator: null,
    isMuted: true, // Default to muted for Autoplay Policy

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.ctx.createGain();
            this.gainNode.connect(this.ctx.destination);
            this.gainNode.gain.value = 0;
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.init(); // Ensure context is ready on user interaction
        return this.isMuted;
    },

    playTone(phaseName) {
        if (this.isMuted || !this.ctx) return;

        const now = this.ctx.currentTime;
        // SWEBOK KA 2: 150Hz - 200Hz Ramp
        const startFreq = 150;
        const endFreq = 200;
        const duration = 1.0; // Short beep/ramp

        if (!this.oscillator) {
            this.oscillator = this.ctx.createOscillator();
            this.oscillator.type = 'sine';
            this.oscillator.connect(this.gainNode);
            this.oscillator.start();
        }

        this.oscillator.frequency.cancelScheduledValues(now);
        this.gainNode.gain.cancelScheduledValues(now);

        const lower = phaseName.toLowerCase();

        // Volume Envelope
        this.gainNode.gain.setValueAtTime(0, now);
        this.gainNode.gain.linearRampToValueAtTime(0.1, now + 0.1);
        this.gainNode.gain.linearRampToValueAtTime(0, now + duration);

        if (lower.includes('inhale')) {
            this.oscillator.frequency.setValueAtTime(startFreq, now);
            this.oscillator.frequency.linearRampToValueAtTime(endFreq, now + duration);
        } else if (lower.includes('exhale')) {
            this.oscillator.frequency.setValueAtTime(endFreq, now);
            this.oscillator.frequency.linearRampToValueAtTime(startFreq, now + duration);
        } else {
            // Hold - slight constant tone
            this.oscillator.frequency.setValueAtTime(175, now);
        }
    }
};

const visualizer = document.getElementById('visualizer');
const phaseNameEl = document.getElementById('phase-name');
const techniqueNameEl = document.getElementById('technique-name');
const buttons = document.querySelectorAll('.controls button[data-technique]');
const muteBtn = document.getElementById('muteBtn');

function updatePhase() {
    const technique = TECHNIQUES[currentTechniqueKey];
    const phase = technique.phases[currentPhaseIndex];

    if (visualizer && phaseNameEl) {
        phaseNameEl.textContent = phase.name;
        visualizer.style.transform = `scale(${phase.scale}) translateX(${phase.x || 0}px)`;
        visualizer.style.backgroundColor = phase.color;
        visualizer.style.transition = `transform ${phase.duration}ms ease-in-out, background-color ${phase.duration}ms ease-in-out`;

        // Trigger Audio
        AudioController.playTone(phase.name);
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
    // Mute Button Logic
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            const isMuted = AudioController.toggleMute();
            muteBtn.textContent = isMuted ? '🔊 Unmute' : '🔇 Mute';
        });
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target;
            if (target.dataset.technique) {
                setTechnique(target.dataset.technique);
            }
        });
    });

    // Start
    updatePhase();
});
