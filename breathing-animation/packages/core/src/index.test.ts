import { describe, it, expect } from 'vitest';
import { TECHNIQUES } from './index';

describe('Breathing Techniques Core', () => {
  it('should have correct Box Breathing setup', () => {
    const box = TECHNIQUES.box;
    expect(box).toBeDefined();
    expect(box.name).toBe('Box Breathing');
    expect(box.phases).toHaveLength(4);
    
    // Inhale
    expect(box.phases[0].name).toBe('Inhale');
    expect(box.phases[0].duration).toBe(4000);
    expect(box.phases[0].scale).toBe(1.5);
    
    // Hold
    expect(box.phases[1].name).toBe('Hold');
    expect(box.phases[1].duration).toBe(4000);
    expect(box.phases[1].scale).toBe(1.5);
  });

  it('should have correct Diaphragmatic setup', () => {
    const diaphragmatic = TECHNIQUES.diaphragmatic;
    expect(diaphragmatic).toBeDefined();
    expect(diaphragmatic.name).toBe('Diaphragmatic');
    expect(diaphragmatic.phases).toHaveLength(2);
  });
});
