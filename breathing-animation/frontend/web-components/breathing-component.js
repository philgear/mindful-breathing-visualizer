// SECURITY: Tamper-Proof Configuration
// Sealed Object to prevent runtime modification of techniques
const TECHNIQUES = Object.freeze({
    box: Object.freeze({
        name: 'Box Breathing',
        phases: Object.freeze([
            Object.freeze({ name: 'Inhale', text: 'Inhale', duration: 4000, className: 'inhale' }),
            Object.freeze({ name: 'Hold', text: 'Hold', duration: 4000, className: 'hold' }),
            Object.freeze({ name: 'Exhale', text: 'Exhale', duration: 4000, className: 'exhale' }),
            Object.freeze({ name: 'Hold', text: 'Hold', duration: 4000, className: 'hold' })
        ])
    }),
    diaphragmatic: Object.freeze({
        name: 'Diaphragmatic',
        phases: Object.freeze([
            Object.freeze({ name: 'Inhale', text: 'Inhale', duration: 5000, className: 'inhale' }),
            Object.freeze({ name: 'Exhale', text: 'Exhale', duration: 5000, className: 'exhale' })
        ])
    }),
    alternate: Object.freeze({
        name: 'Alternate Nostril',
        phases: Object.freeze([
            Object.freeze({ name: 'Inhale Left', text: 'Inhale Left', duration: 4000, className: 'inhale-left' }),
            Object.freeze({ name: 'Hold', text: 'Hold', duration: 4000, className: 'hold' }),
            Object.freeze({ name: 'Exhale Right', text: 'Exhale Right', duration: 4000, className: 'exhale-right' }),
            Object.freeze({ name: 'Hold', text: 'Hold', duration: 4000, className: 'hold' }),
            Object.freeze({ name: 'Inhale Right', text: 'Inhale Right', duration: 4000, className: 'inhale-right' }),
            Object.freeze({ name: 'Hold', text: 'Hold', duration: 4000, className: 'hold' }),
            Object.freeze({ name: 'Exhale Left', text: 'Exhale Left', duration: 4000, className: 'exhale-left' }),
            Object.freeze({ name: 'Hold', text: 'Hold', duration: 4000, className: 'hold' })
        ])
    })
});

// Audio Controller Logic (Shared Standard)
class AudioController {
    constructor() {
        this.ctx = null;
        this.oscillator = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.isMuted = true; // Default to muted for autoplay policy
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
        if (!this.isMuted) {
            this.startTone(); // Ensure context is running on user interaction
        } else {
            this.stopTone();
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
        if (this.oscillator && this.isPlaying && this.ctx) {
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

class BreathingVisualizer extends HTMLElement {
    constructor() {
        super();
        // SECURITY: Shadow DOM (open) used for style isolation.
        // While 'open' allows JS access, it prevents accidental CSS leakage from the global scope.
        this.attachShadow({ mode: 'open' });
        this.currentTechnique = 'box';
        this.phaseIndex = 0;
        this.timer = null;
        this.audioController = new AudioController();
    }

    static get observedAttributes() {
        return ['technique'];
    }

    // SECURITY: Input Validation
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'technique' && oldValue !== newValue) {
            // Strict allowlist check
            if (TECHNIQUES[newValue]) {
                this.currentTechnique = newValue;
            } else {
                console.warn(`BreathingVisualizer: Warning - Invalid technique '${newValue}'. Defaulting to 'box'.`);
                this.currentTechnique = 'box';
            }

            this.phaseIndex = 0;
            if (this.timer) clearTimeout(this.timer);
            if (this.isConnected) this.runAnimation();
        }
    }

    connectedCallback() {
        this.render();
        this.runAnimation();
    }

    disconnectedCallback() {
        if (this.timer) clearTimeout(this.timer);
        this.audioController.stopTone();
    }

    render() {
        const style = `
            :host {
                display: block;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                color: #1e293b;
            }
            .container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 20px;
                padding: 20px;
                background: #f4f4f4;
                border: 1px solid #dcdcdc;
                border-radius: 0;
                text-align: center;
            }
            .visualizer {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background-color: #dcdcdc;
                transition: transform 4s cubic-bezier(0.4, 0.0, 0.2, 1), background-color 4s cubic-bezier(0.4, 0.0, 0.2, 1);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                box-shadow: none;
                position: relative;
            }
            .mute-btn {
                padding: 8px 16px;
                border: 1px solid #111111;
                border-radius: 2px;
                background: white;
                color: #111111;
                cursor: pointer;
                font-size: 0.9rem;
            }
            .mute-btn:hover {
                background: #111111;
                color: white;
            }
            /* Techniques mapping */
            .inhale { transform: scale(1.5); background-color: #ea5b0c; }
            .hold { transform: scale(1.5); background-color: #111111; }
            .exhale { transform: scale(1); background-color: #ea5b0c; }
            
            /* Alternate Nostril offsets using margin or transform logic */
            .inhale-left { transform: scale(1.0) translateX(-50px); background-color: #ea5b0c; }
            .exhale-right { transform: scale(1.0) translateX(50px); background-color: #ea5b0c; }
            .inhale-right { transform: scale(1.0) translateX(50px); background-color: #ea5b0c; }
            .exhale-left { transform: scale(1.0) translateX(-50px); background-color: #ea5b0c; }
        `;

        // SECURITY: Use textContent for user-derived values (though techniques name is trusted here)
        this.shadowRoot.innerHTML = `
            <style>${style}</style>
            <div class="container">
                <h3 id="label"></h3>
                <button id="muteBtn" class="mute-btn">🔊 Unmute Audio</button>
                <div class="visualizer" id="visualizer">Ready</div>
                <div id="status">Begin...</div>
            </div>
        `;

        this.visualizerEl = this.shadowRoot.querySelector('#visualizer');
        this.statusEl = this.shadowRoot.querySelector('#status');
        this.labelEl = this.shadowRoot.querySelector('#label');
        this.muteBtn = this.shadowRoot.querySelector('#muteBtn');

        // Initial text set safely
        this.labelEl.textContent = TECHNIQUES[this.currentTechnique].name;

        // Bind Mute Toggle
        this.muteBtn.addEventListener('click', () => {
            const isMuted = this.audioController.toggleMute();
            this.muteBtn.textContent = isMuted ? '🔊 Unmute Audio' : '🔇 Mute Audio';

            // Force phase update to start sound immediately if unmuted
            if (!isMuted) {
                const technique = TECHNIQUES[this.currentTechnique];
                const phase = technique.phases[this.phaseIndex];
                this.audioController.setPhase(phase.name, phase.duration);
            }
        });
    }

    runAnimation() {
        if (!this.visualizerEl) return;

        const technique = TECHNIQUES[this.currentTechnique];
        this.labelEl.textContent = technique.name;

        const phase = technique.phases[this.phaseIndex];

        // Update Audio
        this.audioController.setPhase(phase.name, phase.duration);

        // Update Visuals
        // Reset classes
        this.visualizerEl.className = 'visualizer';
        // Add specific class after a tick to trigger transition
        requestAnimationFrame(() => {
            if (this.visualizerEl) this.visualizerEl.classList.add(phase.className);
        });

        // Update Text
        this.visualizerEl.textContent = phase.text;
        this.statusEl.textContent = phase.text;

        // Ensure transition duration matches phase duration
        this.visualizerEl.style.transitionDuration = `${phase.duration}ms`;

        // Schedule next phase
        this.timer = setTimeout(() => {
            this.phaseIndex = (this.phaseIndex + 1) % technique.phases.length;
            this.runAnimation();
        }, phase.duration);
    }
}

customElements.define('breathing-visualizer', BreathingVisualizer);
