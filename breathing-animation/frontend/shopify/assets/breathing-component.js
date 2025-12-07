class BreathingVisualizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentPhase = 'inhale';
        this.phaseDurations = {
            inhale: 4000,
            hold: 4000,
            exhale: 4000
        };
    }

    connectedCallback() {
        this.render();
        this.startAnimation();
    }

    render() {
        const style = `
            :host {
                display: block;
                font-family: 'Arial', sans-serif;
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
                background-color: #34d399; /* Inhale color */
                transition: transform 4s ease, background-color 4s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .inhale { transform: scale(1.5); background-color: #34d399; }
            .hold { transform: scale(1.5); background-color: #60a5fa; }
            .exhale { transform: scale(1); background-color: #fb7185; }
            .hold-empty { transform: scale(1); background-color: #60a5fa; }
        `;

        this.shadowRoot.innerHTML = `
            <style>${style}</style>
            <div class="container">
                <h3>Breathing Visualizer (Web Component)</h3>
                <div class="visualizer" id="visualizer">Inhale</div>
                <div id="status">Inhale...</div>
            </div>
        `;
    }

    startAnimation() {
        this.visualizer = this.shadowRoot.getElementById('visualizer');
        this.status = this.shadowRoot.getElementById('status');
        this.animate();
    }

    animate() {
        // Simple Box Breathing loop
        this.setPhase('inhale', 'Inhale', 4000, () => {
            this.setPhase('hold', 'Hold', 4000, () => {
                this.setPhase('exhale', 'Exhale', 4000, () => {
                    this.setPhase('hold-empty', 'Hold', 4000, () => {
                        this.animate();
                    });
                });
            });
        });
    }

    setPhase(phaseClass, text, duration, nextCallback) {
        this.visualizer.className = `visualizer ${phaseClass}`;
        this.visualizer.textContent = text;
        this.status.textContent = text;

        // Dynamic transition adjustment if needed, currently CSS is fixed 4s

        setTimeout(nextCallback, duration);
    }
}

customElements.define('breathing-visualizer', BreathingVisualizer);
