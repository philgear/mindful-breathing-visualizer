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

class BreathingVisualizer extends HTMLElement {
    constructor() {
        super();
        // SECURITY: Shadow DOM (open) used for style isolation.
        // While 'open' allows JS access, it prevents accidental CSS leakage from the global scope.
        this.attachShadow({ mode: 'open' });
        this.currentTechnique = 'box';
        this.phaseIndex = 0;
        this.timer = null;
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
                background: #f0f4f8;
                border-radius: 12px;
                text-align: center;
            }
            .visualizer {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background-color: #34d399;
                transition: transform 4s ease-in-out, background-color 4s ease-in-out, margin-left 4s ease-in-out;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                position: relative;
            }
            /* Techniques mapping */
            .inhale { transform: scale(1.5); background-color: #34d399; }
            .hold { transform: scale(1.5); background-color: #60a5fa; }
            .exhale { transform: scale(1); background-color: #fb7185; }
            
            /* Alternate Nostril offsets using margin or transform logic */
            .inhale-left { transform: scale(1.0) translateX(-50px); background-color: #34d399; }
            .exhale-right { transform: scale(1.0) translateX(50px); background-color: #fb7185; }
            .inhale-right { transform: scale(1.0) translateX(50px); background-color: #34d399; }
            .exhale-left { transform: scale(1.0) translateX(-50px); background-color: #fb7185; }
        `;

        // SECURITY: Use textContent for user-derived values (though techniques name is trusted here)
        this.shadowRoot.innerHTML = `
            <style>${style}</style>
            <div class="container">
                <h3 id="label"></h3>
                <div class="visualizer" id="visualizer">Ready</div>
                <div id="status">Begin...</div>
            </div>
        `;

        this.visualizerEl = this.shadowRoot.querySelector('#visualizer');
        this.statusEl = this.shadowRoot.querySelector('#status');
        this.labelEl = this.shadowRoot.querySelector('#label');

        // Initial text set safely
        this.labelEl.textContent = TECHNIQUES[this.currentTechnique].name;
    }

    runAnimation() {
        if (!this.visualizerEl) return;

        const technique = TECHNIQUES[this.currentTechnique];
        this.labelEl.textContent = technique.name;

        const phase = technique.phases[this.phaseIndex];

        // Update Visuals
        // Reset classes
        this.visualizerEl.className = 'visualizer';
        // Add specific class after a tick to trigger transition
        requestAnimationFrame(() => {
            this.visualizerEl.classList.add(phase.className);
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
