export interface Phase {
    name: string;
    duration: number;
    scale: number;
    color: string;
    x?: number;
}

export interface Technique {
    name: string;
    phases: readonly Phase[];
}

export const TECHNIQUES: Record<string, Technique> = Object.freeze({
    box: Object.freeze({
        name: 'Box Breathing',
        phases: Object.freeze([
            { name: 'Inhale', duration: 4000, scale: 1.5, color: '#34d399', x: 0 },
            { name: 'Hold', duration: 4000, scale: 1.5, color: '#60a5fa', x: 0 },
            { name: 'Exhale', duration: 4000, scale: 1.0, color: '#fb7185', x: 0 },
            { name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 }
        ])
    }),
    diaphragmatic: Object.freeze({
        name: 'Diaphragmatic',
        phases: Object.freeze([
            { name: 'Inhale', duration: 5000, scale: 1.5, color: '#34d399', x: 0 },
            { name: 'Exhale', duration: 5000, scale: 1.0, color: '#fb7185', x: 0 }
        ])
    }),
    alternate: Object.freeze({
        name: 'Alternate Nostril',
        phases: Object.freeze([
            { name: 'Inhale Left', duration: 4000, scale: 1.0, color: '#34d399', x: -50 },
            { name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 },
            { name: 'Exhale Right', duration: 4000, scale: 1.0, color: '#fb7185', x: 50 },
            { name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 },
            { name: 'Inhale Right', duration: 4000, scale: 1.0, color: '#34d399', x: 50 },
            { name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 },
            { name: 'Exhale Left', duration: 4000, scale: 1.0, color: '#fb7185', x: -50 },
            { name: 'Hold', duration: 4000, scale: 1.0, color: '#60a5fa', x: 0 }
        ])
    })
});
