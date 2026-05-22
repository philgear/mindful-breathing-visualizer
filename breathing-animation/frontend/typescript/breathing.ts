interface BreathingOptions {
  animationStyle: 'circle' | 'square' | 'lotus' | 'sun' | 'alternate-nostril';
}

interface PhaseDurations {
  inhaleDuration: number;
  holdDuration: number;
  exhaleDuration: number;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'holdAfterExhale';

class AudioController {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = true;

  constructor() {}

  init(): void {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
      this.gainNode.gain.value = 0;
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.startTone();
    } else {
      this.stopTone();
    }
    return this.isMuted;
  }

  startTone(): void {
    if (this.isMuted) return;
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    if (this.oscillator) this.oscillator.stop();

    if (!this.ctx || !this.gainNode) return;

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

  stopTone(): void {
    if (this.oscillator && this.isPlaying && this.ctx && this.gainNode) {
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

  setPhase(phaseName: BreathingPhase, durationMs: number): void {
    if (this.isMuted || !this.isPlaying || !this.ctx || !this.oscillator || !this.gainNode) return;
    const now = this.ctx.currentTime;
    const rampTime = durationMs / 1000;

    this.oscillator.frequency.cancelScheduledValues(now);
    this.gainNode.gain.cancelScheduledValues(now);

    const isInhale = phaseName === 'inhale';
    const isExhale = phaseName === 'exhale';

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

abstract class BreathingExercise {
  protected animationContainer: HTMLElement;
  protected options: BreathingOptions;
  protected animationElement: HTMLElement | null = null;
  protected timerId: number | null = null;
  protected phaseDurations: PhaseDurations | null = null;
  protected currentPhase: BreathingPhase | null = null;
  protected promptContainer: HTMLElement | null = null;
  protected promptElement: HTMLElement | null = null;
  protected audioController: AudioController;
  protected muteButton: HTMLButtonElement | null = null;

  constructor(animationContainer: HTMLElement, options: BreathingOptions) {
    this.animationContainer = animationContainer;
    this.options = options;
    this.audioController = new AudioController();
  }

  setupAnimation(): void {
    this.animationContainer.textContent = '';

    // Mute Button
    this.muteButton = document.createElement('button');
    this.muteButton.textContent = '🔊 Unmute Audio';
    this.muteButton.style.padding = '8px 16px';
    this.muteButton.style.marginBottom = '20px';
    this.muteButton.style.border = '1px solid #cbd5e1';
    this.muteButton.style.borderRadius = '8px';
    this.muteButton.style.background = 'white';
    this.muteButton.style.cursor = 'pointer';

    this.muteButton.addEventListener('click', () => {
      const isMuted = this.audioController.toggleMute();
      if (this.muteButton) {
        this.muteButton.textContent = isMuted ? '🔊 Unmute Audio' : '🔇 Mute Audio';
      }
      // Sync immediate audio
      if (!isMuted && this.currentPhase && this.phaseDurations) {
        // We don't have the exact remaining duration here easily without more state,
        // but we can trigger the phase sound.
        // Ideally we'd calculate remaining, but full duration is safe for a tone update.
        let duration = 0;
        if (this.currentPhase === 'inhale') duration = this.phaseDurations.inhaleDuration;
        else if (this.currentPhase === 'exhale') duration = this.phaseDurations.exhaleDuration;
        else duration = this.phaseDurations.holdDuration;

        this.audioController.setPhase(this.currentPhase, duration);
      }
    });

    this.animationContainer.appendChild(this.muteButton);

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
    this.audioController.stopTone();
  }

  protected getPhaseDurations(
    inhaleTime: number,
    holdTime: number,
    exhaleTime: number
  ): PhaseDurations {
    return {
      inhaleDuration: inhaleTime * 1000,
      holdDuration: holdTime * 1000,
      exhaleDuration: exhaleTime * 1000,
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
      this.audioController.setPhase('inhale', this.phaseDurations.inhaleDuration);

      const duration = this.phaseDurations.inhaleDuration / 1000;
      this.animationElement.style.transition = `transform ${duration}s cubic-bezier(0.37, 0, 0.63, 1), background-color ${duration}s cubic-bezier(0.37, 0, 0.63, 1), box-shadow ${duration}s cubic-bezier(0.37, 0, 0.63, 1)`;

      this.applyTransform(1.5);

      this.timerId = window.setTimeout(() => {
        this.currentPhase = 'hold';
        this.animate();
      }, this.phaseDurations.inhaleDuration);
    } else if (this.currentPhase === 'hold') {
      this.animationElement.classList.add('hold');
      this.promptElement.textContent = 'Hold';
      this.audioController.setPhase('hold', this.phaseDurations.holdDuration);

      const duration = this.phaseDurations.holdDuration / 1000;
      this.animationElement.style.transition = `background-color ${duration}s cubic-bezier(0.37, 0, 0.63, 1), box-shadow ${duration}s cubic-bezier(0.37, 0, 0.63, 1)`;

      this.timerId = window.setTimeout(() => {
        this.currentPhase = 'exhale';
        this.animate();
      }, this.phaseDurations.holdDuration);
    } else if (this.currentPhase === 'exhale') {
      this.animationElement.classList.add('exhale');
      this.promptElement.textContent = 'Exhale';
      this.audioController.setPhase('exhale', this.phaseDurations.exhaleDuration);

      const duration = this.phaseDurations.exhaleDuration / 1000;
      this.animationElement.style.transition = `transform ${duration}s cubic-bezier(0.37, 0, 0.63, 1), background-color ${duration}s cubic-bezier(0.37, 0, 0.63, 1), box-shadow ${duration}s cubic-bezier(0.37, 0, 0.63, 1)`;

      this.applyTransform(1);

      this.timerId = window.setTimeout(() => {
        this.currentPhase = 'holdAfterExhale';
        this.animate();
      }, this.phaseDurations.exhaleDuration);
    } else if (this.currentPhase === 'holdAfterExhale') {
      this.animationElement.classList.add('holdAfterExhale');
      this.promptElement.textContent = 'Hold';
      this.audioController.setPhase('hold', this.phaseDurations.holdDuration);

      const duration = this.phaseDurations.holdDuration / 1000;
      this.animationElement.style.transition = `background-color ${duration}s cubic-bezier(0.37, 0, 0.63, 1), box-shadow ${duration}s cubic-bezier(0.37, 0, 0.63, 1)`;

      this.timerId = window.setTimeout(() => {
        this.currentPhase = 'inhale';
        this.animate();
      }, this.phaseDurations.holdDuration);
    }
  };
}
