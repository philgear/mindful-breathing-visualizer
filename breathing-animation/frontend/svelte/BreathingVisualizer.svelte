<script>
  import { onMount, onDestroy } from 'svelte';

  // SECURITY: Tamper-Proof Configuration
  // Sealed to prevent runtime modification
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
        Object.freeze({
          name: 'Inhale Left',
          duration: 4000,
          scale: 1.0,
          color: '#34d399',
          x: -50,
        }),
        Object.freeze({ name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 }),
        Object.freeze({
          name: 'Exhale Right',
          duration: 4000,
          scale: 1.0,
          color: '#fb7185',
          x: 50,
        }),
        Object.freeze({ name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 }),
        Object.freeze({
          name: 'Inhale Right',
          duration: 4000,
          scale: 1.0,
          color: '#34d399',
          x: 50,
        }),
        Object.freeze({ name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 }),
        Object.freeze({
          name: 'Exhale Left',
          duration: 4000,
          scale: 1.0,
          color: '#fb7185',
          x: -50,
        }),
        Object.freeze({ name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 }),
      ]),
    }),
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
    },
  };

  let selectedKey = 'box';
  let selectedShape = 'circle';
  let currentPhaseIndex = 0;
  let timer;
  let isMuted = false;

  // SECURITY: Fallback to safe default
  $: currentTechnique = TECHNIQUES[selectedKey] || TECHNIQUES['box'];
  $: currentPhase = currentTechnique.phases[currentPhaseIndex];
  $: borderRadius =
    selectedShape === 'circle'
      ? '50%'
      : selectedShape === 'lotus'
        ? '40% 60% 70% 30% / 40% 50% 60% 50%'
        : '12px';

  // We handle animation via CSS transitions reactively based on currentPhase
  $: transformStyle = `scale(${currentPhase.scale}) translateX(${currentPhase.x || 0}px)`;
  $: duration = currentPhase.duration;

  // Reactively set audio phase
  $: if (currentPhase) {
    audioController.setPhase(currentPhase.name, currentPhase.duration);
  }

  function runPhase() {
    clearTimeout(timer);
    // Explicitly set phase sound at start of timeout (handled by reactive block above generally,
    // but ensures immediate update if needed or timing alignment)

    timer = setTimeout(() => {
      currentPhaseIndex = (currentPhaseIndex + 1) % currentTechnique.phases.length;
      runPhase();
    }, currentPhase.duration);
  }

  function selectTechnique(key) {
    // SECURITY: Strict allowlist validation against frozen TECHNIQUES object
    if (Object.prototype.hasOwnProperty.call(TECHNIQUES, key)) {
      if (selectedKey === key) return;
      selectedKey = key;
      currentPhaseIndex = 0;
      runPhase();
    } else {
      console.warn(`Security Warning: Attempted to select invalid technique "${key}"`);
    }
  }

  function toggleMute() {
    isMuted = audioController.toggleMute();
  }

  onMount(() => {
    runPhase();
    audioController.startTone();
  });

  onDestroy(() => {
    clearTimeout(timer);
    audioController.stopTone();
  });
</script>

<div class="container">
  <h3>{currentTechnique.name}</h3>
  <button class="mute-btn" on:click={toggleMute}>
    {isMuted ? '🔇 Unmute' : '🔊 Mute'}
  </button>
  <div
    class="visualizer"
    style="transform: {transformStyle}; background-color: {currentPhase.color}; border-radius: {borderRadius}; transition: transform {duration}ms ease-in-out, background-color {duration}ms ease-in-out;"
    role="status"
    aria-live="polite"
    aria-label="Current phase: {currentPhase.name}"
  >
    {currentPhase.name}
  </div>

  <div class="controls">
    <label>
      Shape:
      <select
        bind:value={selectedShape}
        style="margin-left: 10px; padding: 5px; border-radius: 4px;"
      >
        <option value="circle">Circle</option>
        <option value="square">Square</option>
        <option value="lotus">Lotus</option>
      </select>
    </label>
  </div>

  <div class="controls">
    {#each Object.entries(TECHNIQUES) as [key, tech]}
      <button on:click={() => selectTechnique(key)} disabled={selectedKey === key}>
        {tech.name}
      </button>
    {/each}
  </div>
</div>

<style>
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

  h3 {
    color: #333;
    margin-bottom: 20px;
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
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    /* transition handled inline */
  }

  .controls {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    justify-content: center;
  }

  button {
    padding: 8px 16px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: white;
    cursor: pointer;
  }

  button:disabled {
    background: #e5e7eb;
    cursor: default;
  }

  button:hover:not(:disabled) {
    background: #f3f4f6;
  }

  .mute-btn {
    margin-bottom: 20px;
  }
</style>
