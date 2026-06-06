<template>
  <div class="container">
    <h3>{{ currentTechnique.name }}</h3>
    <button class="mute-btn" @click="toggleMute">
      {{ isMuted ? '🔇 Unmute' : '🔊 Mute' }}
    </button>
    <div
      class="visualizer"
      :style="visualizerStyle"
      role="status"
      aria-live="polite"
      :aria-label="'Current phase: ' + currentPhase.name"
    >
      {{ selectedShape === 'turtle' ? '🐢' : currentPhase.name }}
    </div>
    <div class="controls">
      <label>
        Shape:
        <select v-model="selectedShape" style="margin-left: 10px; padding: 5px; border-radius: 4px;">
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
        <select v-model="soundscape" style="margin-left: 5px; padding: 5px; border-radius: 4px;">
          <option value="sine">Pure Tone (Legacy)</option>
          <option value="binaural">Singing Bowl (Binaural)</option>
          <option value="ocean">Ocean Waves (Brown Noise)</option>
          <option value="harmonic">Harmonic Swell</option>
        </select>
      </label>
    </div>
    <div class="controls">
      <button
        v-for="(tech, key) in techniques"
        :key="key"
        @click="selectTechnique(key)"
        :disabled="selectedKey === key"
      >
        {{ tech.name }}
      </button>
    </div>
  </div>
</template>

<script>
// SECURITY: Tamper-Proof Configuration
// Sealed Object to prevent runtime modification
const TECHNIQUES = Object.freeze({
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

// Audio Controller Class
class AudioController {
  constructor() {
    this.ctx = null; this.masterGain = null; this.nodes = [];
    this.isPlaying = false; this.isMuted = false; this.soundscape = 'sine';
  }

  setSoundscape(type) {
    if (this.soundscape === type) return;
    this.soundscape = type;
    if (this.isPlaying) {
      this.stopTone();
      setTimeout(() => this.startTone(), 50);
    }
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
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
      if (n.node.stop) { try { n.node.stop(); } catch(e){} }
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
  
  doHaptic(phaseName, duration) {
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

  setPhase(phaseName, duration) {
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

export default {
  name: 'BreathingVisualizer',
  // SECURITY: Explicitly define no props to prevent attribute fallthrough abuse
  props: {},
  data() {
    return {
      techniques: TECHNIQUES,
      selectedKey: 'box',
      selectedShape: 'circle',
      soundscape: 'sine',
      currentPhaseIndex: 0,
      timer: null,
      isMuted: false
    };
  },
  computed: {
    currentTechnique() {
      // SECURITY: Fallback to safe default if key is invalid
      return this.techniques[this.selectedKey] || this.techniques['box'];
    },
    currentPhase() {
      return this.currentTechnique.phases[this.currentPhaseIndex];
    },
    visualizerStyle() {
      const duration = this.currentPhase.duration;
      let borderRadius = '12px';
      if (['circle', 'flower'].includes(this.selectedShape)) { borderRadius = '50%'; }
      else if (this.selectedShape === 'lotus') borderRadius = '40% 60% 70% 30% / 40% 50% 60% 50%';
      else if (this.selectedShape === 'star') borderRadius = '0';
      else if (this.selectedShape === 'hexagon') borderRadius = '25%';
      
      let t = `scale(${this.currentPhase.scale}) translateX(${this.currentPhase.x || 0}px)`;
      if (this.selectedShape === 'star') t += ' rotate(45deg)';

      return {
        transform: t,
        backgroundColor: this.selectedShape === 'turtle' ? 'transparent' : this.currentPhase.color,
        color: this.selectedShape === 'turtle' ? 'transparent' : 'white',
        fontSize: this.selectedShape === 'turtle' ? '80px' : 'inherit',
        borderRadius: borderRadius,
        transition: this.currentPhase.name.toLowerCase().includes('hold')
          ? `background-color ${duration}ms cubic-bezier(0.37, 0, 0.63, 1)`
          : `transform ${duration}ms cubic-bezier(0.37, 0, 0.63, 1), background-color ${duration}ms cubic-bezier(0.37, 0, 0.63, 1)`,
        boxShadow: this.selectedShape === 'turtle' ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      };
    }
  },
  mounted() {
    this.runPhase();
    audioController.startTone();
  },
  beforeDestroy() {
    clearTimeout(this.timer);
    audioController.stopTone();
  },
  watch: {
    currentPhase(newPhase) {
      audioController.setPhase(newPhase.name, newPhase.duration);
    },
    soundscape(newVal) {
      audioController.setSoundscape(newVal);
    }
  },
  methods: {
    selectTechnique(key) {
      if (this.selectedKey === key) return;

      // SECURITY: Validate key existence
      if (this.techniques[key]) {
        this.selectedKey = key;
        this.currentPhaseIndex = 0;
        clearTimeout(this.timer);
        this.runPhase();
        // Restart audio context implicitly handled by watch or kept alive
      } else {
        console.warn('Invalid technique selected');
      }
    },
    runPhase() {
      const duration = this.currentPhase.duration;
      // Trigger audio update for initial phase
      audioController.setPhase(this.currentPhase.name, duration);

      this.timer = setTimeout(() => {
        this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.currentTechnique.phases.length;
        this.runPhase();
      }, duration);
    },
    toggleMute() {
      this.isMuted = audioController.toggleMute();
    }
  }
};
</script>

<style scoped>
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
  color: #1e293b;
  text-align: center;
}

.visualizer {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
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
</style>
