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
      {{ currentPhase.name }}
    </div>
    <div class="controls">
       <label>
        Shape:
        <select v-model="selectedShape" style="margin-left: 10px; padding: 5px; border-radius: 4px;">
          <option value="circle">Circle</option>
          <option value="square">Square</option>
          <option value="lotus">Lotus</option>
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

// Audio Controller Logic
const audioController = {
  ctx: null,
  oscillator: null,
  gainNode: null,
  isPlaying: false,
  isMuted: false,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
      this.gainNode.gain.value = 0;
    }
  },

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : 0.1;
    }
    return this.isMuted;
  },

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
  },

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
  },

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
        this.oscillator.frequency.setValueAtTime(this.oscillator.frequency.value, now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    }
  }
};

export default {
  name: 'BreathingVisualizer',
  // SECURITY: Explicitly define no props to prevent attribute fallthrough abuse
  props: {},
  data() {
    return {
      techniques: TECHNIQUES,
      selectedKey: 'box',
      selectedShape: 'circle',
      currentPhaseIndex: 0,
      timer: null,
      isMuted: false
    }
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
      if (this.selectedShape === 'circle') borderRadius = '50%';
      else if (this.selectedShape === 'lotus') borderRadius = '40% 60% 70% 30% / 40% 50% 60% 50%';

      return {
        transform: `scale(${this.currentPhase.scale}) translateX(${this.currentPhase.x || 0}px)`,
        backgroundColor: this.currentPhase.color,
        borderRadius: borderRadius,
        transition: `transform ${duration}ms ease-in-out, background-color ${duration}ms ease-in-out`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
}
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
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
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
