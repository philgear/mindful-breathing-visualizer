import { Component, OnInit, OnDestroy } from '@angular/core';

// SECURITY: Configuration outside class and frozen
const TECHNIQUES: any = Object.freeze({
  box: Object.freeze({
    name: 'Box Breathing',
    phases: Object.freeze([
      Object.freeze({ name: 'Inhale', duration: 4000, scale: 1.5, color: '#34d399', x: 0 }),
      Object.freeze({ name: 'Hold', duration: 4000, scale: 1.5, color: '#60a5fa', x: 0 }),
      Object.freeze({ name: 'Exhale', duration: 4000, scale: 1.0, color: '#fb7185', x: 0 }),
      Object.freeze({ name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 }),
    ]),
  }),
  diaphragmatic: Object.freeze({
    name: 'Diaphragmatic',
    phases: Object.freeze([
      Object.freeze({ name: 'Inhale', duration: 5000, scale: 1.5, color: '#34d399', x: 0 }),
      Object.freeze({ name: 'Exhale', duration: 5000, scale: 1.0, color: '#fb7185', x: 0 }),
    ]),
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
      Object.freeze({ name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 }),
    ]),
  }),
});

class AudioController {
    ctx: any = null; masterGain: any = null; nodes: any[] = [];
    isPlaying = false; isMuted = false; soundscape = 'sine';

    setSoundscape(type: string) {
        if (this.soundscape === type) return;
        this.soundscape = type;
        if (this.isPlaying) {
            this.stopTone();
            setTimeout(() => this.startTone(), 50);
        }
    }
    init() {
        if (!this.ctx) {
            this.ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain(); this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = 0;
        }
    }
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            if (this.masterGain) this.masterGain.gain.value = 0;
        } else {
            if (this.isPlaying && this.masterGain) this.masterGain.gain.value = 0.1;
        }
        return this.isMuted;
    }
    cleanupNodes() {
        this.nodes.forEach(n => {
            if(n.node.stop) { try { n.node.stop(); } catch { /* ignore */ } }
            n.node.disconnect();
        });
        this.nodes = [];
    }
    startTone() {
        if (this.isMuted) return;
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.cleanupNodes();
        const now = this.ctx.currentTime;
        if (this.soundscape === 'sine') {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine'; osc.frequency.value = 150;
            osc.connect(this.masterGain); osc.start();
            this.nodes.push({ type: 'osc', node: osc });
            this.masterGain.gain.setValueAtTime(0, now);
            this.masterGain.gain.linearRampToValueAtTime(0.1, now + 1);
        } else if (this.soundscape === 'binaural') {
            const oscL = this.ctx.createOscillator(); const oscR = this.ctx.createOscillator();
            const merger = this.ctx.createChannelMerger(2);
            oscL.type = 'sine'; oscR.type = 'sine';
            oscL.frequency.value = 150; oscR.frequency.value = 154;
            oscL.connect(merger, 0, 0); oscR.connect(merger, 0, 1);
            merger.connect(this.masterGain);
            oscL.start(); oscR.start();
            this.nodes.push({ type: 'oscL', node: oscL }); this.nodes.push({ type: 'oscR', node: oscR });
            this.masterGain.gain.setValueAtTime(0, now);
            this.masterGain.gain.linearRampToValueAtTime(0.15, now + 1);
        } else if (this.soundscape === 'harmonic') {
            const oscBase = this.ctx.createOscillator(); const oscHarmonic = this.ctx.createOscillator();
            const gainHarmonic = this.ctx.createGain();
            oscBase.type = 'sine'; oscHarmonic.type = 'triangle';
            oscBase.frequency.value = 150; oscHarmonic.frequency.value = 150 * 1.5;
            oscBase.connect(this.masterGain); oscHarmonic.connect(gainHarmonic); gainHarmonic.connect(this.masterGain);
            gainHarmonic.gain.value = 0;
            oscBase.start(); oscHarmonic.start();
            this.nodes.push({ type: 'oscBase', node: oscBase });
            this.nodes.push({ type: 'oscHarmonic', node: oscHarmonic });
            this.nodes.push({ type: 'gainHarmonic', node: gainHarmonic });
            this.masterGain.gain.setValueAtTime(0, now);
            this.masterGain.gain.linearRampToValueAtTime(0.1, now + 1);
        } else if (this.soundscape === 'ocean') {
            const bufferSize = this.ctx.sampleRate * 2;
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }
            const noiseNode = this.ctx.createBufferSource();
            noiseNode.buffer = noiseBuffer; noiseNode.loop = true;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass'; filter.frequency.value = 400;
            noiseNode.connect(filter); filter.connect(this.masterGain); noiseNode.start();
            this.nodes.push({ type: 'noise', node: noiseNode }); this.nodes.push({ type: 'filter', node: filter });
            this.masterGain.gain.setValueAtTime(0, now);
            this.masterGain.gain.linearRampToValueAtTime(0.2, now + 1);
        }
        this.isPlaying = true;
    }
    stopTone() {
        if (this.isPlaying && this.masterGain) {
            const now = this.ctx.currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            this.masterGain.gain.linearRampToValueAtTime(0, now + 1);
            setTimeout(() => { this.cleanupNodes(); }, 1000);
            this.isPlaying = false;
        }
    }
    doHaptic(phaseName: string, duration: number) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const p = phaseName.toLowerCase();
            if (p.includes('inhale') || p.includes('exhale')) {
                const pattern = [];
                const loops = Math.floor(duration / 150);
                for(let i=0; i<loops; i++) { pattern.push(50, 100); }
                navigator.vibrate(pattern);
            } else {
                const pattern = [];
                const loops = Math.floor(duration / 1000);
                for(let i=0; i<loops; i++) { pattern.push(50, 100, 50, 800); }
                navigator.vibrate(pattern);
            }
        }
    }
    setPhaseTone(phaseName: string, duration: number) {
        this.doHaptic(phaseName, duration);
        if (this.isMuted || !this.isPlaying || !this.ctx) return;
        const now = this.ctx.currentTime;
        const rampTime = duration / 1000;
        const p = phaseName.toLowerCase();
        const isInhale = p.includes('inhale');
        const isExhale = p.includes('exhale');
        if (this.masterGain) this.masterGain.gain.cancelScheduledValues(now);

        if (this.soundscape === 'sine') {
            const osc = this.nodes.find(n => n.type === 'osc')?.node;
            if (!osc) return;
            osc.frequency.cancelScheduledValues(now);
            if (isInhale) {
                osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(200, now + rampTime);
                this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now); this.masterGain.gain.linearRampToValueAtTime(0.2, now + rampTime);
            } else if (isExhale) {
                osc.frequency.setValueAtTime(osc.frequency.value, now); osc.frequency.linearRampToValueAtTime(150, now + rampTime);
                this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now); this.masterGain.gain.linearRampToValueAtTime(0.1, now + rampTime);
            } else {
                osc.frequency.setValueAtTime(osc.frequency.value, now); this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            }
        } else if (this.soundscape === 'binaural') {
            const oscL = this.nodes.find(n => n.type === 'oscL')?.node; const oscR = this.nodes.find(n => n.type === 'oscR')?.node;
            if (!oscL || !oscR) return;
            oscL.frequency.cancelScheduledValues(now); oscR.frequency.cancelScheduledValues(now);
            if (isInhale) {
                oscL.frequency.setValueAtTime(150, now); oscL.frequency.linearRampToValueAtTime(180, now + rampTime);
                oscR.frequency.setValueAtTime(154, now); oscR.frequency.linearRampToValueAtTime(188, now + rampTime); 
                this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now); this.masterGain.gain.linearRampToValueAtTime(0.25, now + rampTime);
            } else if (isExhale) {
                oscL.frequency.setValueAtTime(oscL.frequency.value, now); oscL.frequency.linearRampToValueAtTime(150, now + rampTime);
                oscR.frequency.setValueAtTime(oscR.frequency.value, now); oscR.frequency.linearRampToValueAtTime(152, now + rampTime); 
                this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now); this.masterGain.gain.linearRampToValueAtTime(0.15, now + rampTime);
            } else {
                oscL.frequency.setValueAtTime(oscL.frequency.value, now); oscR.frequency.setValueAtTime(oscR.frequency.value, now);
                this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            }
        } else if (this.soundscape === 'harmonic') {
            const oscBase = this.nodes.find(n => n.type === 'oscBase')?.node; const oscH = this.nodes.find(n => n.type === 'oscHarmonic')?.node; const gainH = this.nodes.find(n => n.type === 'gainHarmonic')?.node;
            if (!oscBase || !oscH || !gainH) return;
            oscBase.frequency.cancelScheduledValues(now); oscH.frequency.cancelScheduledValues(now); gainH.gain.cancelScheduledValues(now);
            if (isInhale) {
                oscBase.frequency.setValueAtTime(150, now); oscBase.frequency.linearRampToValueAtTime(200, now + rampTime);
                oscH.frequency.setValueAtTime(150 * 1.5, now); oscH.frequency.linearRampToValueAtTime(200 * 1.5, now + rampTime);
                gainH.gain.setValueAtTime(0, now); gainH.gain.linearRampToValueAtTime(0.08, now + rampTime); 
            } else if (isExhale) {
                oscBase.frequency.setValueAtTime(oscBase.frequency.value, now); oscBase.frequency.linearRampToValueAtTime(150, now + rampTime);
                oscH.frequency.setValueAtTime(oscH.frequency.value, now); oscH.frequency.linearRampToValueAtTime(150 * 1.5, now + rampTime);
                gainH.gain.setValueAtTime(gainH.gain.value, now); gainH.gain.linearRampToValueAtTime(0, now + rampTime);
            } else {
                oscBase.frequency.setValueAtTime(oscBase.frequency.value, now); oscH.frequency.setValueAtTime(oscH.frequency.value, now); gainH.gain.setValueAtTime(gainH.gain.value, now);
            }
        } else if (this.soundscape === 'ocean') {
            const filter = this.nodes.find(n => n.type === 'filter')?.node;
            if (!filter) return;
            filter.frequency.cancelScheduledValues(now);
            if (isInhale) {
                filter.frequency.setValueAtTime(400, now); filter.frequency.exponentialRampToValueAtTime(1200, now + rampTime); 
                this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now); this.masterGain.gain.linearRampToValueAtTime(0.25, now + rampTime);
            } else if (isExhale) {
                filter.frequency.setValueAtTime(filter.frequency.value, now); filter.frequency.exponentialRampToValueAtTime(400, now + rampTime); 
                this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now); this.masterGain.gain.linearRampToValueAtTime(0.15, now + rampTime);
            } else {
                filter.frequency.setValueAtTime(filter.frequency.value, now); this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            }
        }
    }
}
const audioController = new AudioController();

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
        [style.transform]="transformStyle"
        [style.background-color]="backgroundColor"
        [style.color]="fontColor"
        [style.font-size]="fontSize"
        [style.box-shadow]="boxShadow"
        [style.border-radius]="borderRadius"
        [style.transition]="transitionStyle"
        role="status"
        aria-live="polite"
        [attr.aria-label]="'Current phase: ' + currentPhase.name"
      >
        {{ selectedShape === 'turtle' ? '🐢' : currentPhase.name }}
      </div>
      <div class="controls">
        <label>
          Shape:
          <select (change)="setShape($event)" style="margin-left: 10px; padding: 5px; border-radius: 4px;">
            <option value="circle">Circle</option>
            <option value="square">Square</option>
            <option value="lotus">Lotus</option>
            <option value="star">Star</option>
            <option value="flower">Flower</option>
            <option value="hexagon">Hexagon</option>
            <option value="turtle">Turtle</option>
          </select>
        </label>
        <label style="margin-left: 10px;">
          Soundscape:
          <select (change)="setSoundscape($event)" style="margin-left: 5px; padding: 5px; border-radius: 4px;">
            <option value="sine">Pure Tone (Legacy)</option>
            <option value="binaural">Singing Bowl (Binaural)</option>
            <option value="ocean">Ocean Waves (Brown Noise)</option>
            <option value="harmonic">Harmonic Swell</option>
          </select>
        </label>
      </div>
      <div class="controls">
        <button
          *ngFor="let key of objectKeys"
          (click)="selectTechnique(key)"
          [disabled]="selectedKey === key"
        >
          {{ techniques[key].name }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: #f0f4f8;
        border-radius: 12px;
        font-family:
          'Inter',
          system-ui,
          -apple-system,
          sans-serif;
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
        transition:
          transform 4s cubic-bezier(0.37, 0, 0.63, 1),
          background-color 4s cubic-bezier(0.37, 0, 0.63, 1);
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
    `,
  ],
})
export class BreathingVisualizerComponent implements OnInit, OnDestroy {
  // Read-only reference
  techniques: any = TECHNIQUES;

  selectedKey: string = 'box';
  selectedShape: string = 'circle';
  currentPhaseIndex: number = 0;
  timer: any;
  isMuted: boolean = false;
  isPlaying: boolean = false;
  soundscape: string = 'sine';

  setSoundscape(event: any) {
    this.soundscape = event.target.value;
    audioController.setSoundscape(this.soundscape);
  }

  get objectKeys() {
    return Object.keys(this.techniques);
  }

  get currentTechnique() {
    // SECURITY: Safe fallback
    return this.techniques[this.selectedKey] || this.techniques['box'];
  }

  get currentPhase() {
    return this.currentTechnique.phases[this.currentPhaseIndex];
  }

  get transformStyle() {
    let t = `scale(${this.currentPhase.scale}) translateX(${this.currentPhase.x || 0}px)`;
    if (this.selectedShape === 'star') {
      t += ' rotate(45deg)';
    }
    return t;
  }

  get backgroundColor() {
    return this.selectedShape === 'turtle' ? 'transparent' : this.currentPhase.color;
  }

  get fontColor() {
    return this.selectedShape === 'turtle' ? 'transparent' : 'white';
  }

  get fontSize() {
    return this.selectedShape === 'turtle' ? '80px' : 'inherit';
  }

  get boxShadow() {
    return this.selectedShape === 'turtle' ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  }

  get borderRadius() {
    if (['circle', 'flower'].includes(this.selectedShape)) return '50%';
    if (this.selectedShape === 'lotus') return '40% 60% 70% 30% / 40% 50% 60% 50%';
    if (this.selectedShape === 'star') return '0';
    if (this.selectedShape === 'hexagon') return '25%';
    return '12px'; // Square/Rounded
  }

  get transitionStyle() {
    const duration = this.currentPhase.duration;
    if (this.currentPhase.name.toLowerCase().includes('hold')) {
      return `background-color ${duration}ms cubic-bezier(0.37, 0, 0.63, 1)`;
    }
    return `transform ${duration}ms cubic-bezier(0.37, 0, 0.63, 1), background-color ${duration}ms cubic-bezier(0.37, 0, 0.63, 1)`;
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
  initAudio() { }

  toggleMute() {
    this.isMuted = audioController.toggleMute();
  }

  startTone() {
    audioController.startTone();
    this.isPlaying = audioController.isPlaying;
  }

  stopTone() {
    audioController.stopTone();
    this.isPlaying = audioController.isPlaying;
  }

  setPhaseTone(phaseName: string, duration: number) {
    audioController.setPhaseTone(phaseName, duration);
  }
}
