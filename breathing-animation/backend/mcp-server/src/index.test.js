import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverSource = fs.readFileSync(path.join(__dirname, 'index.ts'), 'utf8');

describe('MCP Server Breathing Techniques Parity', () => {
  it('registers all four core breathing techniques including 4-7-8', () => {
    expect(serverSource).toContain("'box-breathing':");
    expect(serverSource).toContain("'4-7-8':");
    expect(serverSource).toContain('diaphragmatic:');
    expect(serverSource).toContain("'alternate-nostril':");
  });

  it('defines accurate 4s / 7s / 8s phase durations for 4-7-8 Relaxing Breath', () => {
    expect(serverSource).toContain("name: '4-7-8 Relaxing Breath'");
    expect(serverSource).toContain("{ name: 'Inhale', duration: 4, color: DO_NOT_MODIFY_COLORS.EMERALD }");
    expect(serverSource).toContain("{ name: 'Hold', duration: 7, color: DO_NOT_MODIFY_COLORS.BLUE }");
    expect(serverSource).toContain("{ name: 'Exhale', duration: 8, color: DO_NOT_MODIFY_COLORS.ROSE }");
  });
});
