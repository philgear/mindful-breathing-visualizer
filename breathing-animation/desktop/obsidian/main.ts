import { App, Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf } from 'obsidian';

const VIEW_TYPE_BREATHING = "breathing-view";

// SECURITY: Frozen configuration for tamper-proofing
const TECHNIQUES: Record<string, any> = Object.freeze({
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
    ctx: AudioContext | null = null;
    oscillator: OscillatorNode | null = null;
    gainNode: GainNode | null = null;
    isPlaying: boolean = false;
    isMuted: boolean = false;

    init() {
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
        return this.isMuted;
    }

    startTone() {
        if (this.isMuted) return;
        this.init();
        if (this.ctx?.state === 'suspended') this.ctx.resume();
        if (this.oscillator) this.oscillator.stop();

        if (this.ctx && this.gainNode) {
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
    }

    stopTone() {
        if (this.oscillator && this.isPlaying && this.ctx && this.gainNode) {
            const now = this.ctx.currentTime;
            this.gainNode.gain.cancelScheduledValues(now);
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
            this.gainNode.gain.linearRampToValueAtTime(0, now + 1);

            window.setTimeout(() => {
                if (this.oscillator) {
                    this.oscillator.stop();
                    this.oscillator = null;
                }
            }, 1000);
            this.isPlaying = false;
        }
    }

    setPhase(phaseName: string, duration: number) {
        if (this.isMuted || !this.isPlaying || !this.ctx || !this.oscillator || !this.gainNode) return;
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

export default class MindfulBreathingPlugin extends Plugin {
    async onload() {
        this.registerView(
            VIEW_TYPE_BREATHING,
            (leaf: WorkspaceLeaf) => new BreathingView(leaf)
        );

        this.addRibbonIcon('wind', 'Open Breathing Visualizer', () => {
            this.activateView();
        });

        this.addCommand({
            id: 'open-breathing-visualizer',
            name: 'Open Breathing Visualizer',
            callback: () => {
                this.activateView();
            }
        });
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_BREATHING);

        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            leaf = workspace.getRightLeaf(false);
            if (leaf) await leaf.setViewState({ type: VIEW_TYPE_BREATHING, active: true });
        }

        if (leaf) workspace.revealLeaf(leaf);
    }
}

class BreathingView extends ItemView {
    timer: number | null = null;
    audioController: AudioController;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        this.audioController = new AudioController();
    }

    getViewType() {
        return VIEW_TYPE_BREATHING;
    }

    getDisplayText() {
        return "Mindful Breathing";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl("h4", { text: "Mindful Breathing - Standardized" });

        // Mute Button
        const muteBtn = container.createEl("button", { text: "🔊 Mute" });
        muteBtn.style.marginBottom = "20px";
        muteBtn.addEventListener("click", () => {
            const isMuted = this.audioController.toggleMute();
            muteBtn.textContent = isMuted ? "🔇 Unmute" : "🔊 Mute";
        });

        const techniqueSelect = container.createEl("select");
        techniqueSelect.style.display = "block";
        techniqueSelect.style.marginBottom = "10px";

        Object.keys(TECHNIQUES).forEach(key => {
            const option = techniqueSelect.createEl("option", { text: TECHNIQUES[key].name });
            option.value = key;
        });

        // Shape Select
        const shapeSelect = container.createEl("select");
        shapeSelect.style.marginLeft = "10px";
        ["Circle", "Square", "Lotus"].forEach(shape => {
            const option = shapeSelect.createEl("option", { text: shape });
            option.value = shape.toLowerCase();
        });

        const visualizer = container.createEl("div", { cls: "breathing-visualizer" });
        visualizer.style.width = "100px";
        visualizer.style.height = "100px";
        visualizer.style.borderRadius = "50%";
        visualizer.style.backgroundColor = "#34d399"; // default
        visualizer.style.margin = "20px auto";
        // Transition property will be updated dynamically based on phase duration
        visualizer.style.transition = "transform 4s ease-in-out, background-color 4s ease-in-out";
        visualizer.style.display = "flex";
        visualizer.style.alignItems = "center";
        visualizer.style.justifyContent = "center";
        visualizer.style.color = "white";
        visualizer.style.fontWeight = "bold";

        // A11y Attributes
        visualizer.setAttribute("role", "status");
        visualizer.setAttribute("aria-live", "polite");

        const status = container.createEl("p", { text: "Ready" });
        status.style.textAlign = "center";

        // Initial start
        this.startAnimation(visualizer, status, 'box');
        this.audioController.startTone();

        techniqueSelect.addEventListener("change", (e) => {
            const target = e.target as HTMLSelectElement;
            this.startAnimation(visualizer, status, target.value);
        });

        shapeSelect.addEventListener("change", (e) => {
            const target = e.target as HTMLSelectElement;
            const shape = target.value;
            let borderRadius = '12px';
            if (shape === 'circle') borderRadius = '50%';
            else if (shape === 'lotus') borderRadius = '40% 60% 70% 30% / 40% 50% 60% 50%';
            visualizer.style.borderRadius = borderRadius;
        });
    }

    startAnimation(el: HTMLElement, textEl: HTMLElement, techniqueKey: string) {
        if (this.timer) clearTimeout(this.timer);

        // SECURITY: Safe lookup with fallback prevents undefined internal state.
        const technique = TECHNIQUES[techniqueKey] || TECHNIQUES['box'];

        let i = 0;
        const run = () => {
            // SECURITY: Bounds check
            if (i >= technique.phases.length) i = 0;

            const p = technique.phases[i];

            // Apply styles
            el.style.transform = `scale(${p.scale}) translateX(${p.x || 0}px)`;
            el.style.backgroundColor = p.color;
            // Update transition to match current phase duration
            el.style.transition = `transform ${p.duration}ms ease-in-out, background-color ${p.duration}ms ease-in-out`;

            // A11y Update
            el.setAttribute("aria-label", `Current phase: ${p.name}`);

            textEl.textContent = p.name;

            // Audio Update
            this.audioController.setPhase(p.name, p.duration);

            this.timer = window.setTimeout(() => {
                i++;
                run();
            }, p.duration);
        };

        run();
    }

    async onClose() {
        if (this.timer) clearTimeout(this.timer);
        this.audioController.stopTone();
    }
}
