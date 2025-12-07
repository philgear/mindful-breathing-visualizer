interface BreathingOptions {
    animationStyle: 'circle' | 'square' | 'lotus' | 'sun' | 'alternate-nostril';
}

interface PhaseDurations {
    inhaleDuration: number;
    holdDuration: number;
    exhaleDuration: number;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'holdAfterExhale';

abstract class BreathingExercise {
    protected animationContainer: HTMLElement;
    protected options: BreathingOptions;
    protected animationElement: HTMLElement | null = null;
    protected timerId: number | null = null;
    protected phaseDurations: PhaseDurations | null = null;
    protected currentPhase: BreathingPhase | null = null;
    protected promptContainer: HTMLElement | null = null;
    protected promptElement: HTMLElement | null = null;

    constructor(animationContainer: HTMLElement, options: BreathingOptions) {
        this.animationContainer = animationContainer;
        this.options = options;
    }

    setupAnimation(): void {
        this.animationContainer.innerHTML = '';
        this.animationElement = document.createElement('div');
        this.animationElement.classList.add(this.options.animationStyle + '-animation');
        this.animationContainer.appendChild(this.animationElement);

        this.promptContainer = document.createElement('div');
        this.promptContainer.classList.add('prompt-container');

        this.promptElement = document.createElement('div');
        this.promptElement.classList.add('prompt-text');
        this.promptContainer.appendChild(this.promptElement);

        this.animationContainer.appendChild(this.promptContainer);
    }

    abstract start(inhaleTime: number, holdTime: number, exhaleTime: number): void;

    stop(): void {
        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        if (this.animationElement) {
            this.animationElement.classList.remove('inhale', 'exhale', 'hold', 'holdAfterExhale');
            this.animationElement.style.transform = '';
            // Reset transition
            this.animationElement.style.transition = '';
        }
        if (this.promptElement) {
            this.promptElement.textContent = '';
            this.promptElement.className = 'prompt-text';
        }
    }

    protected getPhaseDurations(inhaleTime: number, holdTime: number, exhaleTime: number): PhaseDurations {
        return {
            inhaleDuration: inhaleTime * 1000,
            holdDuration: holdTime * 1000,
            exhaleDuration: exhaleTime * 1000
        };
    }

    protected applyTransform(scale?: number, translateX: number = 0): void {
        if (!this.animationElement) return;

        let transform = '';
        if (this.options.animationStyle === 'lotus') {
            transform += 'rotate(45deg) ';
        }

        if (scale !== undefined) {
            transform += `scale(${scale}) `;
        }

        if (translateX !== 0) {
            transform += `translateX(${translateX}px) `;
        }

        this.animationElement.style.transform = transform.trim();
    }
}

class BoxBreathing extends BreathingExercise {
    constructor(animationContainer: HTMLElement, options: BreathingOptions) {
        super(animationContainer, options);
        this.setupAnimation();
    }

    start(inhaleTime: number, holdTime: number, exhaleTime: number): void {
        // SECURITY: Input Validation & DoS Prevention.
        // Ensures duration values are within safe bounds to prevent UI freezes or crashes.
        if (inhaleTime <= 0 || holdTime < 0 || exhaleTime <= 0) {
            console.error('Invalid duration: Timing must be positive.');
            return;
        }
        if (inhaleTime > 60 || holdTime > 60 || exhaleTime > 60) {
            console.error('DoS Prevention: Duration limited to 60s.');
            return;
        }

        this.phaseDurations = this.getPhaseDurations(inhaleTime, holdTime, exhaleTime);
        this.currentPhase = 'inhale';
        this.animate();
    }

    private animate = (): void => {
        if (!this.animationElement || !this.promptElement || !this.phaseDurations) return;

        this.animationElement.classList.remove('inhale', 'exhale', 'hold', 'holdAfterExhale');

        if (this.currentPhase === 'inhale') {
            this.animationElement.classList.add('inhale');
            this.promptElement.textContent = 'Inhale';

            const duration = this.phaseDurations.inhaleDuration / 1000;
            this.animationElement.style.transition = `transform ${duration}s ease, background-color ${duration}s ease, box-shadow ${duration}s ease`;

            this.applyTransform(1.5);

            this.timerId = window.setTimeout(() => {
                this.currentPhase = 'hold';
                this.animate();
            }, this.phaseDurations.inhaleDuration);

        } else if (this.currentPhase === 'hold') {
            this.animationElement.classList.add('hold');
            this.promptElement.textContent = 'Hold';

            const duration = this.phaseDurations.holdDuration / 1000;
            this.animationElement.style.transition = `background-color ${duration}s ease, box-shadow ${duration}s ease`;

            this.timerId = window.setTimeout(() => {
                this.currentPhase = 'exhale';
                this.animate();
            }, this.phaseDurations.holdDuration);

        } else if (this.currentPhase === 'exhale') {
            this.animationElement.classList.add('exhale');
            this.promptElement.textContent = 'Exhale';

            const duration = this.phaseDurations.exhaleDuration / 1000;
            this.animationElement.style.transition = `transform ${duration}s ease, background-color ${duration}s ease, box-shadow ${duration}s ease`;

            this.applyTransform(1);

            this.timerId = window.setTimeout(() => {
                this.currentPhase = 'holdAfterExhale';
                this.animate();
            }, this.phaseDurations.exhaleDuration);

        } else if (this.currentPhase === 'holdAfterExhale') {
            this.animationElement.classList.add('holdAfterExhale');
            this.promptElement.textContent = 'Hold';

            const duration = this.phaseDurations.holdDuration / 1000;
            this.animationElement.style.transition = `background-color ${duration}s ease, box-shadow ${duration}s ease`;

            this.timerId = window.setTimeout(() => {
                this.currentPhase = 'inhale';
                this.animate();
            }, this.phaseDurations.holdDuration);
        }
    };
}
