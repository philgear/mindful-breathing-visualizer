/* eslint-disable no-unused-vars */
/* global p5 */

// SECURITY: Use Instance Mode to avoid global namespace pollution.
// This ensures p5 variables do not leak into the global scope.
const sketch = (p) => {

    // SECURITY: Tamper-Proof Configuration
    const TECHNIQUES = Object.freeze({
        box: Object.freeze([
            Object.freeze({ name: 'Inhale', duration: 4000, color: [52, 211, 153], x: 0 }),
            Object.freeze({ name: 'Hold', duration: 4000, color: [96, 165, 250], x: 0 }),
            Object.freeze({ name: 'Exhale', duration: 4000, color: [251, 113, 133], x: 0 }),
            Object.freeze({ name: 'Hold', duration: 4000, color: [96, 165, 250], x: 0 })
        ]),
        diaphragmatic: Object.freeze([
            Object.freeze({ name: 'Inhale', duration: 5000, color: [52, 211, 153], x: 0 }),
            Object.freeze({ name: 'Exhale', duration: 5000, color: [251, 113, 133], x: 0 })
        ]),
        alternate: Object.freeze([
            Object.freeze({ name: 'Inhale Left', duration: 4000, color: [52, 211, 153], x: -50 }),
            Object.freeze({ name: 'Hold', duration: 4000, color: [96, 165, 250], x: 0 }),
            Object.freeze({ name: 'Exhale Right', duration: 4000, color: [251, 113, 133], x: 50 }),
            Object.freeze({ name: 'Hold', duration: 4000, color: [96, 165, 250], x: 0 }),
            Object.freeze({ name: 'Inhale Right', duration: 4000, color: [52, 211, 153], x: 50 }),
            Object.freeze({ name: 'Hold', duration: 4000, color: [96, 165, 250], x: 0 }),
            Object.freeze({ name: 'Exhale Left', duration: 4000, color: [251, 113, 133], x: -50 }),
            Object.freeze({ name: 'Hold', duration: 4000, color: [96, 165, 250], x: 0 })
        ])
    });

    let currentTechnique = 'box';
    let phases = TECHNIQUES['box'];
    let phaseIndex = 0;
    let lastPhaseChange = 0;
    let xOffset = 0;
    let particles = [];

    class Particle {
        constructor() {
            this.angle = p.random(p.TWO_PI);
            this.initialRadius = p.random(50, 150);
            this.radius = this.initialRadius;
            this.size = p.random(2, 6);
            this.noiseOffset = p.random(1000);
            this.color = [0, 0, 0];
        }

        update(scale, targetColor) {
            // Organic movement
            this.noiseOffset += 0.01;
            let noiseVal = p.noise(this.noiseOffset);

            // Orbit
            this.angle += 0.005;

            // Breathe
            let targetRadius = this.initialRadius * scale;
            // Add some noise to the breathing for organic feel
            this.radius = p.lerp(this.radius, targetRadius + (noiseVal * 20), 0.1);

            this.color = targetColor;
        }

        show() {
            let x = p.cos(this.angle) * this.radius;
            let y = p.sin(this.angle) * this.radius;

            p.noStroke();
            p.fill(this.color[0], this.color[1], this.color[2]);
            p.ellipse(x, y, this.size);
        }
    }

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        lastPhaseChange = p.millis();

        // Initialize particles
        for (let i = 0; i < 300; i++) {
            particles.push(new Particle());
        }
    };

    p.keyPressed = () => {
        // SECURITY: Whitelist input keys to prevent unexpected behavior
        if (p.key === '1') setTechnique('box');
        else if (p.key === '2') setTechnique('diaphragmatic');
        else if (p.key === '3') setTechnique('alternate');
    };

    function setTechnique(key) {
        // SECURITY: Check existence
        if (TECHNIQUES[key]) {
            currentTechnique = key;
            phases = TECHNIQUES[key];
            phaseIndex = 0;
            lastPhaseChange = p.millis();
        }
    }

    p.draw = () => {
        // Semi-transparent background for trails
        p.background(240, 244, 248, 50);

        let currentTick = p.millis();
        let elapsed = currentTick - lastPhaseChange;
        let currentPhase = phases[phaseIndex];

        // Update Phase
        if (elapsed > currentPhase.duration) {
            phaseIndex = (phaseIndex + 1) % phases.length;
            lastPhaseChange = currentTick;
            elapsed = 0;
        }

        // Calculate Progress (0 to 1)
        let progress = elapsed / currentPhase.duration;
        let currentScale = 1;

        // Handle Translation
        let targetX = currentPhase.x || 0;
        xOffset = p.lerp(xOffset, targetX, 0.1);

        if (currentPhase.name.startsWith('Inhale')) {
            let t = progress;
            let smoothProgress = t * t * (3 - 2 * t);
            currentScale = 1 + (smoothProgress * 0.5);
        } else if (currentPhase.name.startsWith('Exhale')) {
            let t = progress;
            let smoothProgress = t * t * (3 - 2 * t);
            currentScale = 1.5 - (smoothProgress * 0.5);
        } else {
            // Hold phases
            let prevIndex = (phaseIndex - 1 + phases.length) % phases.length;
            if (phases[prevIndex].name.startsWith('Inhale')) {
                currentScale = 1.5;
            } else {
                currentScale = 1.0;
            }
        }

        // Draw Center Text
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        p.fill(100);
        p.noStroke();
        p.text("Press 1, 2, or 3 to change technique", p.width / 2, 30);

        p.textSize(32);
        p.fill(50);
        p.text(currentPhase.name, p.width / 2, p.height / 2);

        // Update and Draw Particles
        p.push();
        p.translate(p.width / 2 + xOffset, p.height / 2);
        for (let pt of particles) {
            pt.update(currentScale, currentPhase.color);
            pt.show();
        }
        p.pop();
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
};

// Start the sketch in instance mode
new p5(sketch);
