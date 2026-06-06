import React, { useState, useEffect, useRef } from 'react';

// SECURITY: Freeze configuration to prevent tampering
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

const audioController = new AudioController();

const BreathingVisualizer = () => {
  const [selectedTechnique, setSelectedTechnique] = useState('box');
  const [selectedShape, setSelectedShape] = useState('circle');
  const [soundscape, setSoundscape] = useState('sine');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const timeoutRef = useRef(null);

  // SECURITY: Safe property access
  const technique = TECHNIQUES[selectedTechnique] || TECHNIQUES['box'];
  const phase = technique.phases[currentPhaseIndex];

  useEffect(() => {
    // Init Audio on first interaction (simulated here by start)
    audioController.startTone();

    return () => {
      audioController.stopTone();
    };
  }, []);

  useEffect(() => {
    // Update Audio for new phase
    audioController.setPhase(phase.name, phase.duration);
  }, [phase]);

  useEffect(() => {
    audioController.setSoundscape(soundscape);
  }, [soundscape]);

  useEffect(() => {
    // Clear existing timeout when technique changes
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrentPhaseIndex(0);
    // Restart tone context if needed
    audioController.startTone();
  }, [selectedTechnique]);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setCurrentPhaseIndex((prev) => (prev + 1) % technique.phases.length);
    }, phase.duration);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentPhaseIndex, selectedTechnique, phase.duration, technique.phases.length]);

  const handleMuteToggle = () => {
    const muted = audioController.toggleMute();
    setIsMuted(muted);
  };

  const isHold = phase.name.toLowerCase().includes('hold');
  const isExhale = phase.name.toLowerCase().includes('exhale');
  const isInhale = phase.name.toLowerCase().includes('inhale');

  // Computed Shape Properties
  let borderRadius = '50%';
  let clipPath = 'none';
  let background = 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)';
  let filter = 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.04))';
  let rotate = '0deg';

  if (selectedShape === 'square') {
    borderRadius = '36px'; // Squircle
  } else if (selectedShape === 'lotus') {
    borderRadius = '50% 0 50% 0';
    rotate = '45deg';
  } else if (selectedShape === 'star') {
    borderRadius = '0';
    clipPath = 'polygon(50% 0%, 58% 31%, 85% 15%, 69% 42%, 100% 50%, 69% 58%, 85% 85%, 58% 69%, 50% 100%, 42% 69%, 15% 85%, 31% 58%, 0% 50%, 31% 42%, 15% 15%, 42% 31%)';
  } else if (selectedShape === 'flower') {
    borderRadius = '50%';
    clipPath = 'polygon(50% 0%, 62% 12%, 78% 7%, 82% 22%, 96% 26%, 91% 41%, 100% 50%, 91% 59%, 96% 74%, 82% 78%, 78% 93%, 62% 88%, 50% 100%, 38% 88%, 22% 93%, 18% 78%, 4% 74%, 9% 59%, 0% 50%, 9% 41%, 4% 26%, 18% 22%, 22% 7%, 38% 12%)';
  } else if (selectedShape === 'hexagon') {
    borderRadius = '0';
    clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
  } else if (selectedShape === 'sun') {
    borderRadius = '0';
    clipPath = 'polygon(50% 0%, 54% 12%, 67% 6%, 67% 20%, 80% 20%, 76% 33%, 90% 37%, 82% 48%, 90% 63%, 76% 67%, 80% 80%, 67% 80%, 67% 94%, 54% 88%, 50% 100%, 46% 88%, 33% 94%, 33% 80%, 20% 80%, 24% 67%, 10% 63%, 18% 48%, 10% 37%, 24% 33%, 20% 20%, 33% 20%, 33% 6%, 46% 12%)';
  }

  if (selectedShape !== 'turtle') {
    if (isHold) {
      background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
      filter = 'drop-shadow(0 10px 20px rgba(15, 23, 42, 0.15))';
      if (selectedShape === 'sun') {
        background = 'radial-gradient(circle, #cbd5e1 0%, #475569 100%)';
        filter = 'drop-shadow(0 0 20px rgba(148, 163, 184, 0.4))';
      }
    } else {
      background = 'linear-gradient(135deg, #ea5b0c 0%, #ff7e47 100%)';
      filter = isExhale
        ? 'drop-shadow(0 4px 10px rgba(234, 91, 12, 0.15))'
        : 'drop-shadow(0 10px 20px rgba(234, 91, 12, 0.25))';
      if (selectedShape === 'sun') {
        background = 'radial-gradient(circle, #fef08a 0%, #f97316 60%, #ea5b0c 100%)';
        filter = isExhale
          ? 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.3))'
          : 'drop-shadow(0 0 25px rgba(251, 191, 36, 0.6))';
        if (isInhale) rotate = '15deg';
      } else if (selectedShape === 'flower') {
        background = 'radial-gradient(circle, #fcd34d 0%, #ea5b0c 100%)';
        if (isInhale) rotate = '30deg';
      } else if (selectedShape === 'hexagon') {
        background = 'linear-gradient(135deg, #ea5b0c 0%, #b45309 100%)';
        if (isInhale) rotate = '60deg';
      } else if (selectedShape === 'star') {
        rotate = '45deg';
      }
    }
  }

  // Target Guide details
  let guideBorder = '1.5px dashed rgba(234, 91, 12, 0.2)';
  let guideBg = 'transparent';
  if (clipPath !== 'none') {
    guideBorder = 'none';
    guideBg = 'rgba(234, 91, 12, 0.05)';
  }
  if (selectedShape === 'turtle') {
    guideBorder = '1.5px dashed rgba(52, 211, 153, 0.4)';
    guideBg = 'rgba(52, 211, 153, 0.03)';
  }

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: '#f0f4f8',
      borderRadius: '12px',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: '#1e293b'
    },
    animationContainer: {
      position: 'relative',
      width: '200px',
      height: '200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    targetGuide: {
      position: 'absolute',
      width: '180px',
      height: '180px',
      border: guideBorder,
      backgroundColor: guideBg,
      borderRadius: selectedShape === 'turtle' ? '0' : borderRadius,
      clipPath: selectedShape === 'turtle' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' : clipPath,
      transform: `rotate(${rotate})`,
      pointerEvents: 'none',
      zIndex: 0,
      opacity: 0.8,
      transition: 'all 0.5s ease'
    },
    visualizer: {
      width: '120px',
      height: '120px',
      borderRadius: borderRadius,
      clipPath: clipPath,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: selectedShape === 'turtle' ? 'transparent' : 'white',
      fontSize: selectedShape === 'turtle' ? '80px' : 'inherit',
      fontWeight: 'bold',
      transition: isHold
        ? `background-color ${phase.duration}ms cubic-bezier(0.37, 0, 0.63, 1)`
        : `transform ${phase.duration}ms cubic-bezier(0.37, 0, 0.63, 1), background-color ${phase.duration}ms cubic-bezier(0.37, 0, 0.63, 1)`,
      transform: `scale(${phase.scale}) translateX(${phase.x || 0}px) rotate(${rotate})`,
      background: selectedShape === 'turtle' ? 'transparent' : background,
      filter: selectedShape === 'turtle' ? 'none' : filter,
      zIndex: 1
    },
    controls: {
      marginTop: '20px',
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    muteBtn: {
      padding: '8px 16px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      background: 'white',
      cursor: 'pointer',
      marginBottom: '10px'
    }
  };

  // SECURITY: Explicitly ignore passed props to prevent undefined behavior
  // This component is self-contained and manages its own state.

  return (
    <div style={styles.container}>
      <h3>{technique.name}</h3>
      <button style={styles.muteBtn} onClick={handleMuteToggle} aria-pressed={isMuted}>
        {isMuted ? '🔇 Unmute' : '🔊 Mute'}
      </button>

      <div style={styles.animationContainer}>
        <div style={styles.targetGuide} />
        <div
          style={styles.visualizer}
          role="status"
          aria-live="polite"
          aria-label={`Current phase: ${phase.name}`}
        >
          {selectedShape === 'turtle' ? '🐢' : phase.name}
        </div>
      </div>

      <div style={styles.controls}>
        <label>
          Shape:
          <select
            value={selectedShape}
            onChange={(e) => setSelectedShape(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', borderRadius: '4px' }}
          >
            <option value="circle">Circle</option>
            <option value="square">Square</option>
            <option value="lotus">Lotus</option>
            <option value="star">Star</option>
            <option value="flower">Flower</option>
            <option value="hexagon">Hexagon</option>
            <option value="turtle">Turtle</option>
            <option value="sun">Sun (Nature)</option>
          </select>
        </label>
        <label style={{ marginLeft: '10px' }}>
          Soundscape:
          <select
            value={soundscape}
            onChange={(e) => setSoundscape(e.target.value)}
            style={{ marginLeft: '5px', padding: '5px', borderRadius: '4px' }}
          >
            <option value="sine">Pure Tone (Legacy)</option>
            <option value="binaural">Singing Bowl (Binaural)</option>
            <option value="ocean">Ocean Waves (Brown Noise)</option>
            <option value="harmonic">Harmonic Swell</option>
          </select>
        </label>
      </div>

      <div style={styles.controls} role="group" aria-label="Breathing technique selection">
        {Object.entries(TECHNIQUES).map(([key, t]) => (
          <button
            key={key}
            onClick={() => setSelectedTechnique(key)}
            disabled={selectedTechnique === key}
            aria-pressed={selectedTechnique === key}
            style={{
              padding: '8px 16px',
              background: selectedTechnique === key ? '#e2e8f0' : 'white',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: selectedTechnique === key ? 'default' : 'pointer'
            }}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BreathingVisualizer;
