//web/js/src/breathing.js

/* global I18n */
(function () {
  // ===================================
  // Audio Controller (Private to IIFE)
  // ===================================
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
        if (n.node.stop) { try { n.node.stop(); } catch { /* ignore */ } }
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
      if (
        typeof navigator !== 'undefined' &&
        navigator.vibrate &&
        (!navigator.userActivation || navigator.userActivation.hasBeenActive)
      ) {
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

    setPhaseTone(phaseName, duration) { this.setPhase(phaseName, duration); }

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

  // Instantiate audio controller
  const audioController = new AudioController();

  // ===================================
  // Base class for all breathing exercises
  // ===================================
  class BreathingExercise {
    constructor(animationContainer, options) {
      this.animationContainer = animationContainer;
      this.options = options;
      this.animationElement = null;
      this.timerId = null;
      this.phaseDurations = null;
      this.currentPhase = null;
      this.phaseDeadline = null;
      this.isRunning = false;
      this.promptContainer = null;
      this.promptElement = null;
      this.rafId = null;
      this.announcerElement = null;
    }

    scheduleNextPhase(durationMs, nextPhaseFn) {
      const now = performance.now();
      if (this.phaseDeadline === null) {
        this.phaseDeadline = now + durationMs;
      } else {
        this.phaseDeadline += durationMs;
      }
      const delay = Math.max(0, this.phaseDeadline - now);
      this.timerId = setTimeout(() => {
        if (!this.isRunning) return;
        nextPhaseFn();
      }, delay);
    }

    setupAnimation() {
      // Clear previous content strictly
      while (this.animationContainer.firstChild) {
        this.animationContainer.removeChild(this.animationContainer.firstChild);
      }

      this.animationElement = document.createElement('div');
      // Safe class usage: using predefined prefix + validated/controlled input
      const safeStyle = ['circle', 'square', 'lotus', 'sun', 'star', 'flower', 'hexagon', 'turtle', 'alternate-nostril'].includes(
        this.options.animationStyle
      )
        ? this.options.animationStyle
        : 'circle';
      this.animationElement.className = safeStyle + '-animation';
      this.animationContainer.appendChild(this.animationElement);

      this.promptContainer = document.createElement('div');
      this.promptContainer.className = 'prompt-container';

      this.promptElement = document.createElement('div');
      this.promptElement.className = 'prompt-text';
      this.promptContainer.appendChild(this.promptElement);
      this.animationContainer.appendChild(this.promptContainer);

      // UX: Progress Bar (Moved to main container)
      this.progressBar = document.createElement('div');
      this.progressBar.className = 'progress-bar';
      this.progressFill = document.createElement('div');
      this.progressFill.className = 'progress-fill';
      this.progressBar.appendChild(this.progressFill);
      this.animationContainer.appendChild(this.progressBar);

      this.announcerElement = document.getElementById('a11y-announcer');
    }

    announce(text) {
      if (this.announcerElement) {
        this.announcerElement.textContent = text;
      }
    }

    start() {
      throw new Error('start() method must be implemented in the subclass');
    }

    stop() {
      const wasRunning = this.isRunning;
      this.isRunning = false;
      this.phaseDeadline = null;
      clearTimeout(this.timerId);
      if (
        wasRunning &&
        typeof navigator !== 'undefined' &&
        navigator.vibrate &&
        (!navigator.userActivation || navigator.userActivation.hasBeenActive)
      ) {
        navigator.vibrate(0);
      }
      if (this.animationElement) {
        this.animationElement.classList.remove('inhale', 'exhale', 'hold', 'holdAfterExhale');
        // Remove custom properties
        this.animationContainer.style.removeProperty('--current-duration'); // Updated to container
      }
      if (this.promptElement) {
        this.promptElement.textContent = '';
        this.promptElement.className = 'prompt-text';
        this.promptContainer.className = 'prompt-container'; // Reset classes
      }
      if (this.progressBar) {
        this.progressBar.className = 'progress-bar';
      }
      document.title = 'Mindful Breathing Visualizer'; // UX: Reset Title
    }

    getPhaseDurations(inhaleTime, holdTime, exhaleTime) {
      // Ensure inputs are valid numbers (preserve explicit holdTime = 0)
      const parsedInhale = Number(inhaleTime);
      const parsedHold = Number(holdTime);
      const parsedExhale = Number(exhaleTime);
      const i = Math.max(1, Math.min(60, Number.isFinite(parsedInhale) && inhaleTime !== '' ? parsedInhale : 4));
      const h = Math.max(0, Math.min(60, Number.isFinite(parsedHold) && holdTime !== '' ? parsedHold : 4));
      const e = Math.max(1, Math.min(60, Number.isFinite(parsedExhale) && exhaleTime !== '' ? parsedExhale : 4));
      return {
        inhaleDuration: i * 1000,
        holdDuration: h * 1000,
        exhaleDuration: e * 1000,
      };
    }

    // Helper to set transition info on CSS variables
    setTransitionDuration(durationMs) {
      if (this.animationContainer) {
        // UX: Set on container so siblings can access it
        this.animationContainer.style.setProperty('--current-duration', durationMs / 1000 + 's');
      }
    }
  }

  // ===================================
  // Subclass for Box Breathing
  // ===================================
  class BoxBreathing extends BreathingExercise {
    constructor(animationContainer, options) {
      super(animationContainer, options);
      this.setupAnimation();
    }

    start(inhaleTime, holdTime, exhaleTime) {
      this.phaseDurations = this.getPhaseDurations(inhaleTime, holdTime, exhaleTime);
      this.currentPhase = 'inhale';
      this.phaseDeadline = null;
      this.isRunning = true;
      audioController.startTone();
      this.animate();
    }

    stop() {
      super.stop();
      audioController.stopTone();
    }

    animate() {
      if (!this.isRunning) return;
      // Reset classes
      this.animationElement.classList.remove('inhale', 'exhale', 'hold', 'holdAfterExhale');
      this.progressBar.className = 'progress-bar';

      // Read durations safely
      const { inhaleDuration, holdDuration, exhaleDuration } = this.phaseDurations;

      // UX: Force reflow for progress bar animation restart
      void this.progressFill.offsetWidth;

      if (this.currentPhase === 'inhale') {
        this.setTransitionDuration(inhaleDuration);
        this.animationElement.classList.add('inhale');
        this.progressBar.classList.add('inhale');
        const text =
          typeof I18n !== 'undefined' ? I18n.t('phases.inhale') : { label: 'Inhale', emoji: '' };
        this.promptElement.textContent = text.label;
        document.title = `${text.label}`;
        this.announce(text.label);
        audioController.setPhase('inhale', inhaleDuration);

        this.scheduleNextPhase(inhaleDuration, () => {
          this.currentPhase = holdDuration > 0 ? 'hold' : 'exhale';
          this.animate();
        });
      } else if (this.currentPhase === 'hold') {
        this.setTransitionDuration(holdDuration);
        this.animationElement.classList.add('hold');
        this.progressBar.classList.add('hold');
        const text =
          typeof I18n !== 'undefined' ? I18n.t('phases.hold') : { label: 'Hold', emoji: '' };
        this.promptElement.textContent = text.label;
        document.title = `${text.label}`;
        this.announce(text.label);
        audioController.setPhase('hold', holdDuration);

        this.scheduleNextPhase(holdDuration, () => {
          this.currentPhase = 'exhale';
          this.animate();
        });
      } else if (this.currentPhase === 'exhale') {
        this.setTransitionDuration(exhaleDuration);
        this.animationElement.classList.add('exhale');
        this.progressBar.classList.add('exhale');
        const text =
          typeof I18n !== 'undefined' ? I18n.t('phases.exhale') : { label: 'Exhale', emoji: '' };
        this.promptElement.textContent = text.label;
        document.title = `${text.label}`;
        this.announce(text.label);
        audioController.setPhase('exhale', exhaleDuration);

        this.scheduleNextPhase(exhaleDuration, () => {
          this.currentPhase = holdDuration > 0 ? 'holdAfterExhale' : 'inhale';
          this.animate();
        });
      } else if (this.currentPhase === 'holdAfterExhale') {
        this.setTransitionDuration(holdDuration);
        this.animationElement.classList.add('holdAfterExhale');
        this.progressBar.classList.add('holdAfterExhale');
        const text =
          typeof I18n !== 'undefined' ? I18n.t('phases.hold') : { label: 'Hold', emoji: '' };
        this.promptElement.textContent = text.label;
        document.title = `${text.label}`;
        this.announce(text.label);
        audioController.setPhase('holdAfterExhale', holdDuration);

        this.scheduleNextPhase(holdDuration, () => {
          this.currentPhase = 'inhale';
          this.animate();
        });
      }
    }
  }

  // ===================================
  // Subclass for Diaphragmatic Breathing
  // ===================================
  class DiaphragmaticBreathing extends BreathingExercise {
    constructor(animationContainer, options) {
      super(animationContainer, options);
      this.setupAnimation();
    }

    start(inhaleTime, holdTime, exhaleTime) {
      this.phaseDurations = this.getPhaseDurations(inhaleTime, holdTime, exhaleTime);
      this.currentPhase = 'inhale';
      this.phaseDeadline = null;
      this.isRunning = true;
      audioController.startTone();
      this.animate();
    }

    stop() {
      super.stop();
      audioController.stopTone();
    }

    animate() {
      if (!this.isRunning) return;
      this.animationElement.classList.remove('inhale', 'exhale', 'hold');
      this.progressBar.className = 'progress-bar';

      // UX: Force reflow
      void this.progressFill.offsetWidth;

      const { inhaleDuration, holdDuration, exhaleDuration } = this.phaseDurations;

      if (this.currentPhase === 'inhale') {
        this.setTransitionDuration(inhaleDuration);
        this.animationElement.classList.add('inhale');
        this.progressBar.classList.add('inhale');
        const text =
          typeof I18n !== 'undefined' ? I18n.t('phases.inhale') : { label: 'Inhale', emoji: '' };
        this.promptElement.textContent = text.label;
        document.title = `${text.label}`;
        this.announce(text.label);
        audioController.setPhase('inhale', inhaleDuration);

        this.scheduleNextPhase(inhaleDuration, () => {
          this.currentPhase = holdDuration > 0 ? 'hold' : 'exhale';
          this.animate();
        });
      } else if (this.currentPhase === 'hold') {
        this.setTransitionDuration(holdDuration);
        this.animationElement.classList.add('hold');
        this.progressBar.classList.add('hold');
        const text =
          typeof I18n !== 'undefined' ? I18n.t('phases.hold') : { label: 'Hold', emoji: '' };
        this.promptElement.textContent = text.label;
        document.title = `${text.label}`;
        this.announce(text.label);
        audioController.setPhase('hold', holdDuration);

        this.scheduleNextPhase(holdDuration, () => {
          this.currentPhase = 'exhale';
          this.animate();
        });
      } else if (this.currentPhase === 'exhale') {
        this.setTransitionDuration(exhaleDuration);
        this.animationElement.classList.add('exhale');
        this.progressBar.classList.add('exhale');
        const text =
          typeof I18n !== 'undefined' ? I18n.t('phases.exhale') : { label: 'Exhale', emoji: '' };
        this.promptElement.textContent = text.label;
        document.title = `${text.label}`;
        this.announce(text.label);
        audioController.setPhase('exhale', exhaleDuration);

        this.scheduleNextPhase(exhaleDuration, () => {
          this.currentPhase = 'inhale';
          this.animate();
        });
      }
    }
  }

  // ===================================
  // Subclass for Alternate Nostril Breathing
  // ===================================
  class AlternateNostrilBreathing extends BreathingExercise {
    constructor(animationContainer, options) {
      super(animationContainer, options);
      this.side = 'left'; // Start with inhaling left
      // Force the correct visual form for this exercise ("Form follows function")
      this.options.animationStyle = 'alternate-nostril';
      this.setupAnimation();
    }

    start(inhaleTime, holdTime, exhaleTime) {
      this.phaseDurations = this.getPhaseDurations(inhaleTime, holdTime, exhaleTime);
      this.currentPhase = 'inhale';
      this.phaseDeadline = null;
      this.isRunning = true;
      audioController.startTone();
      this.animate();
    }

    stop() {
      super.stop();
      audioController.stopTone();
    }

    animate() {
      if (!this.isRunning) return;
      this.animationElement.classList.remove(
        'inhale',
        'exhale',
        'hold',
        'holdAfterExhale',
        'left',
        'right'
      );
      this.progressBar.className = 'progress-bar';

      // UX: Force reflow
      void this.progressFill.offsetWidth;

      const { inhaleDuration, holdDuration, exhaleDuration } = this.phaseDurations;

      // Side logic variables
      const startSide = this.side; // 'left' or 'right'
      const endSide = this.side === 'left' ? 'right' : 'left';

      if (this.currentPhase === 'inhale') {
        this.setTransitionDuration(inhaleDuration);
        this.animationElement.classList.add('inhale', startSide);
        this.progressBar.classList.add('inhale');

        const text =
          typeof I18n !== 'undefined' ? I18n.t('phases.inhale') : { label: 'Inhale', emoji: '' };
        const sideText =
          typeof I18n !== 'undefined'
            ? I18n.t(`ui.${startSide}`)
            : startSide === 'left'
              ? 'Left'
              : 'Right';

        const promptLabel = `${text.label} (${sideText})`;
        this.promptElement.textContent = promptLabel;
        document.title = promptLabel;
        this.announce(promptLabel);
        audioController.setPhase('inhale', inhaleDuration);

        this.scheduleNextPhase(inhaleDuration, () => {
          this.currentPhase = holdDuration > 0 ? 'hold' : 'exhale';
          this.animate();
        });
      } else if (this.currentPhase === 'hold') {
        this.setTransitionDuration(holdDuration);
        // Move Inside: Animate from startSide to endSide
        this.animationElement.classList.add('hold', endSide);
        this.progressBar.classList.add('hold');

        const text =
          typeof I18n !== 'undefined' ? I18n.t('phases.hold') : { label: 'Hold', emoji: '' };
        this.promptElement.textContent = text.label;
        document.title = `${text.label}`;
        this.announce(text.label);
        audioController.setPhase('hold', holdDuration);

        this.scheduleNextPhase(holdDuration, () => {
          this.currentPhase = 'exhale';
          this.animate();
        });
      } else if (this.currentPhase === 'exhale') {
        this.setTransitionDuration(exhaleDuration);
        this.animationElement.classList.add('exhale', endSide);
        this.progressBar.classList.add('exhale');

        const text =
          typeof I18n !== 'undefined' ? I18n.t('phases.exhale') : { label: 'Exhale', emoji: '' };
        const sideText =
          typeof I18n !== 'undefined'
            ? I18n.t(`ui.${endSide}`)
            : endSide === 'left'
              ? 'Left'
              : 'Right';

        const promptLabel = `${text.label} (${sideText})`;
        this.promptElement.textContent = promptLabel;
        document.title = promptLabel;
        this.announce(promptLabel);
        audioController.setPhase('exhale', exhaleDuration);

        this.scheduleNextPhase(exhaleDuration, () => {
          if (holdDuration > 0) {
            this.currentPhase = 'holdAfterExhale';
          } else {
            this.currentPhase = 'inhale';
            this.side = endSide;
          }
          this.animate();
        });
      } else if (this.currentPhase === 'holdAfterExhale') {
        this.setTransitionDuration(holdDuration);
        // Stay on endSide
        this.animationElement.classList.add('holdAfterExhale', endSide);
        this.progressBar.classList.add('holdAfterExhale');
        const text =
          typeof I18n !== 'undefined' ? I18n.t('phases.hold') : { label: 'Hold', emoji: '' };
        this.promptElement.textContent = text.label;
        document.title = `${text.label}`;
        this.announce(text.label);
        audioController.setPhase('holdAfterExhale', holdDuration);

        this.scheduleNextPhase(holdDuration, () => {
          this.currentPhase = 'inhale';
          // Swap side for next inhale logic to pick up
          this.side = endSide;
          this.animate();
        });
      }
    }
  }

  // ===================================
  // Subclass for 4-7-8 Breathing
  // ===================================
  class FourSevenEightBreathing extends BreathingExercise {
    constructor(animationContainer, options) {
      super(animationContainer, options);
      this.setupAnimation();
    }

    start(inhaleTime, holdTime, exhaleTime) {
      this.phaseDurations = this.getPhaseDurations(inhaleTime, holdTime, exhaleTime);
      this.currentPhase = 'inhale';
      this.phaseDeadline = null;
      this.isRunning = true;
      audioController.startTone();
      this.animate();
    }

    stop() {
      super.stop();
      audioController.stopTone();
    }

    animate() {
      if (!this.isRunning) return;
      this.animationElement.classList.remove('inhale', 'exhale', 'hold');
      this.progressBar.className = 'progress-bar';

      // UX: Force reflow
      void this.progressFill.offsetWidth;

      const { inhaleDuration, holdDuration, exhaleDuration } = this.phaseDurations;

      if (this.currentPhase === 'inhale') {
        this.setTransitionDuration(inhaleDuration);
        this.animationElement.classList.add('inhale');
        this.progressBar.classList.add('inhale');
        const text =
          typeof I18n !== 'undefined' ? I18n.t('phases.inhale') : { label: 'Inhale', emoji: '' };
        this.promptElement.textContent = text.label;
        document.title = `${text.label}`;
        this.announce(text.label);
        audioController.setPhase('inhale', inhaleDuration);

        this.scheduleNextPhase(inhaleDuration, () => {
          this.currentPhase = holdDuration > 0 ? 'hold' : 'exhale';
          this.animate();
        });
      } else if (this.currentPhase === 'hold') {
        this.setTransitionDuration(holdDuration);
        this.animationElement.classList.add('hold');
        this.progressBar.classList.add('hold');
        const text =
          typeof I18n !== 'undefined' ? I18n.t('phases.hold') : { label: 'Hold', emoji: '' };
        this.promptElement.textContent = text.label;
        document.title = `${text.label}`;
        this.announce(text.label);
        audioController.setPhase('hold', holdDuration);

        this.scheduleNextPhase(holdDuration, () => {
          this.currentPhase = 'exhale';
          this.animate();
        });
      } else if (this.currentPhase === 'exhale') {
        this.setTransitionDuration(exhaleDuration);
        this.animationElement.classList.add('exhale');
        this.progressBar.classList.add('exhale');
        const text =
          typeof I18n !== 'undefined' ? I18n.t('phases.exhale') : { label: 'Exhale', emoji: '' };
        this.promptElement.textContent = text.label;
        document.title = `${text.label}`;
        this.announce(text.label);
        audioController.setPhase('exhale', exhaleDuration);

        this.scheduleNextPhase(exhaleDuration, () => {
          // 4-7-8 loops directly back to Inhale (no hold empty)
          this.currentPhase = 'inhale';
          this.animate();
        });
      }
    }
  }

  // ===================================
  // DOM Manipulation and Logic
  // ===================================

  function registerOfflineServiceWorker() {
    if (
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || window.location.protocol === 'http:')
    ) {
      const register = () => {
        const swMeta = document.querySelector('meta[name="sw-path"]');
        const swPath = swMeta && swMeta.content ? swMeta.content : 'sw.js';
        navigator.serviceWorker.register(swPath).catch((err) => {
          console.warn('ServiceWorker registration failed:', err);
        });
      };
      if (document.readyState === 'complete') {
        register();
      } else {
        window.addEventListener('load', register, { once: true });
      }
    }
  }

  registerOfflineServiceWorker();

  function populateSelectOptions(selectElement, maxValue, minValue = 1) {
    if (!selectElement) return;
    selectElement.textContent = '';
    for (let i = minValue; i <= maxValue; i++) {
      const option = document.createElement('option');
      option.value = String(i);
      option.text = String(i);
      selectElement.appendChild(option);
    }
  }

  function setDefaultSelectValues(
    inhaleId,
    holdId,
    exhaleId,
    sessionId,
    inhaleVal,
    holdVal,
    exhaleVal,
    sessionVal
  ) {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    setVal(inhaleId, inhaleVal);
    setVal(holdId, holdVal);
    setVal(exhaleId, exhaleVal);
    setVal(sessionId, sessionVal);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (typeof I18n !== 'undefined') {
      await I18n.init();
    }

    const animationContainer = document.getElementById('animation-container');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const exerciseSelect = document.getElementById('exerciseSelect');
    const inhaleTimeSelect = document.getElementById('inhaleTime');
    const holdTimeSelect = document.getElementById('holdTime');
    const exhaleTimeSelect = document.getElementById('exhaleTime');
    const sessionDurationSelect = document.getElementById('sessionDuration');
    const animationStyleSelect = document.getElementById('animationStyle');
    const instructionsToggle = document.getElementById('instructionsToggle');
    const instructionsContainer = document.getElementById('instructions-container');
    const timerDisplay = document.getElementById('timerDisplay');
    const muteBtn = document.getElementById('muteButton');

    let currentExercise = null;
    let sessionTimer = null;

    // Populate selects (Hold supports 0s for Diaphragmatic Breathing)
    populateSelectOptions(inhaleTimeSelect, 10, 1);
    populateSelectOptions(holdTimeSelect, 10, 0);
    populateSelectOptions(exhaleTimeSelect, 10, 1);
    populateSelectOptions(sessionDurationSelect, 60, 1);

    // Exercise Definitions
    const exerciseClasses = Object.freeze({
      boxBreathing: BoxBreathing,
      fourSevenEight: FourSevenEightBreathing,
      diaphragmaticBreathing: DiaphragmaticBreathing,
      alternateNostrilBreathing: AlternateNostrilBreathing,
    });

    // Recommended Duration Defaults
    const exerciseDefaults = {
      boxBreathing: { inhale: '4', hold: '4', exhale: '4' },
      fourSevenEight: { inhale: '4', hold: '7', exhale: '8' },
      diaphragmaticBreathing: { inhale: '4', hold: '0', exhale: '6' },
      alternateNostrilBreathing: { inhale: '4', hold: '4', exhale: '4' },
    };

    // Defaults (Initial Load)
    setDefaultSelectValues(
      'inhaleTime',
      'holdTime',
      'exhaleTime',
      'sessionDuration',
      '4',
      '4',
      '4',
      '5'
    );

    // Initial setup check
    const safeKey = Object.keys(exerciseClasses).includes(exerciseSelect.value)
      ? exerciseSelect.value
      : 'boxBreathing';
    const ExerciseClass = exerciseClasses[safeKey];

    if (ExerciseClass) {
      currentExercise = new ExerciseClass(animationContainer, {
        animationStyle: animationStyleSelect.value,
      });
    }

    const instructions = Object.freeze({
      boxBreathing: `
                <h3>Box Breathing</h3>
                <ul>
                    <li><strong>Inhale</strong> slowly for 4 seconds.</li>
                    <li><strong>Hold</strong> your lungs full for 4 seconds.</li>
                    <li><strong>Exhale</strong> slowly for 4 seconds.</li>
                    <li><strong>Hold</strong> your lungs empty for 4 seconds.</li>
                </ul>
            `,
      fourSevenEight: `
                <h3>4-7-8 Relaxing Breath</h3>
                 <ul>
                    <li><strong>Inhale</strong> quietly through the nose for 4 seconds.</li>
                    <li><strong>Hold</strong> the breath for 7 seconds.</li>
                    <li><strong>Exhale</strong> forcefully through the mouth for 8 seconds.</li>
                </ul>
            `,
      diaphragmaticBreathing: `
                <h3>Diaphragmatic Breathing</h3>
                 <ul>
                    <li><strong>Inhale</strong> deeply through your nose, expanding your belly.</li>
                    <li><strong>Exhale</strong> slowly through your mouth, relaxing your belly.</li>
                </ul>
            `,
      alternateNostrilBreathing: `
                <h3>Alternate Nostril Breathing</h3>
                 <ul>
                    <li><strong>Inhale</strong> through the left nostril.</li>
                    <li><strong>Hold</strong> your breath.</li>
                    <li><strong>Exhale</strong> through the right nostril.</li>
                    <li>Repeat, alternating sides.</li>
                </ul>
            `,
    });

    function initExercise(event) {
      if (currentExercise) {
        currentExercise.stop();
      }

      // Safe lookup
      const key = exerciseSelect.value;
      const safeKey = Object.keys(exerciseClasses).includes(key) ? key : 'boxBreathing';
      const ExerciseClass = exerciseClasses[safeKey];

      if (ExerciseClass) {
        currentExercise = new ExerciseClass(animationContainer, {
          animationStyle: animationStyleSelect.value,
        });
      }

      // DYNAMIC UPDATE: Set defaults if triggered by change event
      if (event && event.type === 'change' && exerciseDefaults[safeKey]) {
        const defaults = exerciseDefaults[safeKey];
        inhaleTimeSelect.value = defaults.inhale;
        holdTimeSelect.value = defaults.hold;
        exhaleTimeSelect.value = defaults.exhale;
      }

      instructionsContainer.innerHTML = instructions[safeKey] || '';
      if (instructionsToggle) {
        const isExpanded = !instructionsContainer.classList.contains('hidden');
        instructionsToggle.setAttribute('aria-expanded', String(isExpanded));
      }
    }

    // Initial setup
    initExercise(); // No event, keeps initial defaults

    if (instructionsToggle && instructionsContainer) {
      instructionsToggle.addEventListener('click', () => {
        instructionsContainer.classList.toggle('hidden');
        const isExpanded = !instructionsContainer.classList.contains('hidden');
        instructionsToggle.setAttribute('aria-expanded', String(isExpanded));
      });
    }

    // Listeners
    exerciseSelect.addEventListener('change', initExercise);
    const soundscapeSelect = document.getElementById('soundscape');
    if (soundscapeSelect) {
      soundscapeSelect.addEventListener('change', () => {
        audioController.setSoundscape(soundscapeSelect.value);
      });
    }
    animationStyleSelect.addEventListener('change', () => {
      if (currentExercise) {
        currentExercise.options.animationStyle = animationStyleSelect.value;
        currentExercise.setupAnimation();
      }
    });

    startButton.addEventListener('click', () => {
      const inhaleTime = parseInt(inhaleTimeSelect.value, 10);
      const holdTime = parseInt(holdTimeSelect.value, 10);
      const exhaleTime = parseInt(exhaleTimeSelect.value, 10);
      const sessionDuration = parseInt(sessionDurationSelect.value, 10);

      if (currentExercise) {
        currentExercise.start(inhaleTime, holdTime, exhaleTime);
      }

      startSessionTimer(sessionDuration);

      // UI State
      startButton.classList.add('hidden');
      stopButton.classList.remove('hidden');

      // UX: Focus Mode
      document.body.classList.add('focus-mode'); // Enable Focus

      document.querySelectorAll('.settings-group').forEach((el) => el.classList.add('fade-out'));
      document.querySelectorAll('.settings-group select').forEach((el) => (el.disabled = true));
      instructionsContainer.classList.add('fade-out');
    });

    stopButton.addEventListener('click', () => {
      stopSession();
    });

    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = audioController.toggleMute();
        muteBtn.textContent = isMuted ? '🔇 Muted' : '🔊 Sound On';
      });
    }

    // Dark Mode Logic (syncs with OS prefers-color-scheme and supports explicit Light/Dark override)
    const darkModeBtn = document.getElementById('darkModeButton');
    if (darkModeBtn) {
      const prefersDarkQuery =
        typeof window.matchMedia === 'function'
          ? window.matchMedia('(prefers-color-scheme: dark)')
          : null;

      const isCurrentlyDark = () => {
        if (document.body.classList.contains('dark-mode')) return true;
        if (document.body.classList.contains('light-mode')) return false;
        return Boolean(prefersDarkQuery && prefersDarkQuery.matches);
      };

      const syncDarkModeLabel = () => {
        darkModeBtn.textContent = isCurrentlyDark() ? '☀️ Light Mode' : '🌙 Dark Mode';
      };

      syncDarkModeLabel();

      darkModeBtn.addEventListener('click', () => {
        const nextDark = !isCurrentlyDark();
        document.body.classList.toggle('dark-mode', nextDark);
        document.body.classList.toggle('light-mode', !nextDark);
        syncDarkModeLabel();
      });
    }
    // Dynamic Favicon Helper
    function updateFavicon(phase) {
      const faviconLink = document.getElementById('dynamic-favicon');
      if (!faviconLink) return;

      let iconName = 'favicon-default.png';
      if (phase === 'inhale') iconName = 'favicon-inhale.png';
      else if (phase === 'hold' || phase === 'holdAfterExhale') iconName = 'favicon-hold.png';
      else if (phase === 'exhale') iconName = 'favicon-exhale.png';

      faviconLink.href = `assets/favicons/${iconName}`;
    }

    // Sync Dynamic Favicon on phase transitions (haptics handled inside AudioController.doHaptic)
    const originalSetPhase = audioController.setPhase.bind(audioController);
    audioController.setPhase = function (phase, duration) {
      originalSetPhase(phase, duration);
      updateFavicon(phase);
    };

    function stopSession() {
      if (currentExercise) {
        currentExercise.stop();
      }
      updateFavicon('default');
      clearInterval(sessionTimer);
      sessionTimer = null;

      // UX: Disable Focus Mode
      document.body.classList.remove('focus-mode');
      document.title = 'Mindful Breathing Visualizer';

      document.getElementById('startButton').classList.remove('hidden');
      document.getElementById('stopButton').classList.add('hidden');

      document.getElementById('timerDisplay').textContent = '';
      document.querySelectorAll('.settings-group').forEach((el) => el.classList.remove('fade-out'));
      document.querySelectorAll('.settings-group select').forEach((el) => (el.disabled = false));
      instructionsContainer.classList.remove('fade-out');
    }

    function startSessionTimer(durationMinutes) {
      clearInterval(sessionTimer);
      const endTime = performance.now() + durationMinutes * 60 * 1000;

      const updateTimer = () => {
        const remainingMs = Math.max(0, endTime - performance.now());
        const secondsLeft = Math.ceil(remainingMs / 1000);
        const m = Math.floor(secondsLeft / 60);
        const s = secondsLeft % 60;
        timerDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

        if (remainingMs <= 0) {
          stopSession();
        }
      };

      updateTimer();
      sessionTimer = setInterval(updateTimer, 250);
    }
  });
})();
