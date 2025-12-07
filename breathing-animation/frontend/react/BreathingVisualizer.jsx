import React, { useState, useEffect, useRef } from 'react';

// SECURITY: Freeze configuration to prevent tampering
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

// Audio Controller Class
class AudioController {
    constructor() {
        this.ctx = null;
        this.oscillator = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.isMuted = false;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
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
        return this.isMuted;
    }

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
            // Hold
            this.oscillator.frequency.setValueAtTime(this.oscillator.frequency.value, now);
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        }
    }
}

const audioController = new AudioController();

const BreathingVisualizer = () => {
    const [selectedTechnique, setSelectedTechnique] = useState('box');
    const [selectedShape, setSelectedShape] = useState('circle');
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const timeoutRef = useRef(null);

    // SECURITY: Safe property access
    const technique = TECHNIQUES[selectedTechnique] || TECHNIQUES['box'];
    const phase = technique.phases[currentPhaseIndex];

    useEffect(() => {
        // Init Audio on first interaction (simulated here by start)
        // Ideally should proceed user interaction, but we'll bind to start
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
        visualizer: {
            width: '100px',
            height: '100px',
            borderRadius: selectedShape === 'circle' ? '50%' : selectedShape === 'lotus' ? '40% 60% 70% 30% / 40% 50% 60% 50%' : '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            transition: `transform ${phase.duration}ms ease-in-out, background-color ${phase.duration}ms ease-in-out`,
            transform: `scale(${phase.scale}) translateX(${phase.x}px)`,
            backgroundColor: phase.color,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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

            <div
                style={styles.visualizer}
                role="status"
                aria-live="polite"
                aria-label={`Current phase: ${phase.name}`}
            >
                {phase.name}
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
