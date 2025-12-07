import { Component, OnInit, OnDestroy } from '@angular/core';

// SECURITY: Configuration outside class and frozen
const TECHNIQUES: any = Object.freeze({
  box: Object.freeze({
    name: 'Box Breathing',
    phases: Object.freeze([
      Object.freeze({ name: 'Inhale', duration: 4000, scale: 1.5, color: '#34d399', x: 0 }),
      Object.freeze({ name: 'Hold', duration: 4000, scale: 1.5, color: '#60a5fa', x: 0 }),
      Object.freeze({ name: 'Exhale', duration: 4000, scale: 1.0, color: '#fb7185', x: 0 }),
      Object.freeze({ name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 })
    ])
  }),
  diaphragmatic: Object.freeze({
    name: 'Diaphragmatic',
    phases: Object.freeze([
      Object.freeze({ name: 'Inhale', duration: 5000, scale: 1.5, color: '#34d399', x: 0 }),
      Object.freeze({ name: 'Exhale', duration: 5000, scale: 1.0, color: '#fb7185', x: 0 })
    ])
  }),
  alternate: Object.freeze({
    name: 'Alternate Nostril',
    phases: Object.freeze([
      Object.freeze({ name: 'Inhale Left', duration: 4000, scale: 1.0, color: '#34d399', x: -50 }),
      Object.freeze({ name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 }),
      Object.freeze({ name: 'Exhale Right', duration: 4000, scale: 1.0, color: '#fb7185', x: 50 }),
      Object.freeze({ name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 }),
      Object.freeze({ name: 'Inhale Right', duration: 4000, scale: 1.0, color: '#34d399', x: 50 }),
      Object.freeze({ name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 }),
      Object.freeze({ name: 'Exhale Left', duration: 4000, scale: 1.0, color: '#fb7185', x: -50 }),
      Object.freeze({ name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 })
    ])
  })
});

@Component({
  selector: 'app-breathing-visualizer',
  template: `
    <div class="container">
      <h3>{{ currentTechnique.name }}</h3>
      <button class="mute-btn" (click)="toggleMute()">
        {{ isMuted ? '🔇 Unmute' : '🔊 Mute' }}
      </button>

      <div 
        class="visualizer" 
        [style.transform]="'scale(' + currentPhase.scale + ') translateX(' + (currentPhase.x || 0) + 'px)'"
        [style.background-color]="currentPhase.color"
        [style.border-radius]="borderRadius"
        [style.transition]="'transform ' + currentPhase.duration + 'ms ease-in-out, background-color ' + currentPhase.duration + 'ms ease-in-out'"
        role="status"
        aria-live="polite"
        [attr.aria-label]="'Current phase: ' + currentPhase.name"
      >
        {{ currentPhase.name }}
      </div>
      <div class="controls">
        <label>
            Shape: 
            <select (change)="setShape($event)" style="margin-left: 10px; padding: 5px; border-radius: 4px;">
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="lotus">Lotus</option>
            </select>
        </label>
      </div>
      <div class="controls">
          <button *ngFor="let key of objectKeys" (click)="selectTechnique(key)" [disabled]="selectedKey === key">
            {{ techniques[key].name }}
          </button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: #f0f4f8;
      border-radius: 12px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      text-align: center;
      color: #1e293b;
    }
    .visualizer {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      transition: transform 4s ease, background-color 4s ease;
      margin: 20px;
    }
    .controls {
        display: flex;
        gap: 10px;
        margin-top: 20px;
        justify-content: center;
        flex-wrap: wrap;
    }
    button {
      padding: 8px 16px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: white;
      cursor: pointer;
    }
    button:disabled {
      background: #e2e8f0;
      cursor: default;
    }
    .mute-btn {
        margin-bottom: 20px;
    }
  `]
})
export class BreathingVisualizerComponent implements OnInit, OnDestroy {
  // Read-only reference
  techniques: any = TECHNIQUES;

  selectedKey: string = 'box';
  selectedShape: string = 'circle';
  currentPhaseIndex: number = 0;
  timer: any;
  isMuted: boolean = false;

  // Audio Context
  private ctx: any;
  private oscillator: any;
  private gainNode: any;
  private isPlaying: boolean = false;

  get currentTechnique() {
    // SECURITY: Safe fallback
    return this.techniques[this.selectedKey] || this.techniques['box'];
  }

  get currentPhase() {
    return this.currentTechnique.phases[this.currentPhaseIndex];
  }

  get objectKeys() {
    return Object.keys(this.techniques);
  }

  get borderRadius() {
    if (this.selectedShape === 'circle') return '50%';
    if (this.selectedShape === 'lotus') return '40% 60% 70% 30% / 40% 50% 60% 50%';
    return '12px'; // Square/Rounded
  }

  ngOnInit() {
    this.runPhase();
    this.startTone();
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
    this.stopTone();
  }

  selectTechnique(key: string) {
    if (this.selectedKey === key) return;

    // SECURITY: Validate key
    if (this.techniques[key]) {
      this.selectedKey = key;
      this.currentPhaseIndex = 0;
      clearTimeout(this.timer);
      this.runPhase();
    }
  }

  setShape(event: any) {
    this.selectedShape = event.target.value;
  }

  runPhase() {
    const duration = this.currentPhase.duration;
    this.setPhaseTone(this.currentPhase.name, duration);

    this.timer = setTimeout(() => {
      this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.currentTechnique.phases.length;
      this.runPhase();
    }, duration);
  }

  // Audio Logic
  initAudio() {
    if (!this.ctx) {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
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
  }

  startTone() {
    if (this.isMuted) return;
    this.initAudio();
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

  setPhaseTone(phaseName: string, duration: number) {
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
      this.oscillator.frequency.setValueAtTime(this.oscillator.frequency.value, now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    }
  }
}
