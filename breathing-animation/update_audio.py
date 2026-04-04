import os
import re

audio_class = """class AudioController {
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
            if(n.node.stop) { try { n.node.stop(); } catch(e){} }
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

    setPhaseTone(phaseName, duration) { this.setPhase(phaseName, duration); } // alias for angular

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
"""

def replace_audio_controller(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find 'class AudioController { ... }' or 'const audioController = { ... };'
    if 'class AudioController' in content:
        content = re.sub(r'class AudioController\s*\{.*?\n\}\nconst audioController = new AudioController\(\);', audio_class + '\nconst audioController = new AudioController();', content, flags=re.DOTALL)
        content = re.sub(r'class AudioController\s*\{.*?\}\n', audio_class + '\n', content, flags=re.DOTALL)
    elif 'const audioController = {' in content:
        content = re.sub(r'const audioController = \{.*?\n\};\n', audio_class + '\nconst audioController = new AudioController();\n', content, flags=re.DOTALL)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for framework in ['react/BreathingVisualizer.jsx', 'vue/BreathingVisualizer.vue', 'svelte/BreathingVisualizer.svelte', 'astro/BreathingVisualizer.astro', 'angular/breathing-visualizer.component.ts']:
    path = os.path.join(r"C:\Users\philg\OneDrive\Documents\Coding\mindfulbreathingvisualizer\mindful-breathing-visualizer\breathing-animation\frontend", framework)
    try:
        replace_audio_controller(path)
        print("Replaced AudioController in", framework)
    except Exception as e:
        print("Failed", framework, e)
