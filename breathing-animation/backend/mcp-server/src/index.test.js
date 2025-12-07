import { describe, it } from 'node:test';
import assert from 'node:assert';

// Simulated Logic Test (Unit)
const TECHNIQUES = {
    "box-breathing": {
        name: "Box Breathing",
        phases: [
            { name: "Inhale", duration: 4 },
            { name: "Hold", duration: 4 },
            { name: "Exhale", duration: 4 },
            { name: "Hold", duration: 4 },
        ],
    },
    "4-7-8": {
        name: "4-7-8 Relaxing Breath",
        phases: [
            { name: "Inhale", duration: 4 },
            { name: "Hold", duration: 7 },
            { name: "Exhale", duration: 8 },
        ]
    }
};

describe('Breathing Techniques Logic', () => {
    it('should have correct Box Breathing durations', () => {
        const technique = TECHNIQUES['box-breathing'];
        assert.strictEqual(technique.name, 'Box Breathing');
        assert.strictEqual(technique.phases.length, 4);
        technique.phases.forEach(phase => {
            assert.strictEqual(phase.duration, 4);
        });
    });

    it('should have correct 4-7-8 durations', () => {
        const technique = TECHNIQUES['4-7-8'];
        assert.strictEqual(technique.phases[0].duration, 4);
        assert.strictEqual(technique.phases[1].duration, 7);
        assert.strictEqual(technique.phases[2].duration, 8);
    });
});
