import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Breathing Techniques', () => {
  test.beforeEach(async ({ page }) => {
    const filePath = path.join(__dirname, '../frontend/vanilla-js/public/index.html');
    await page.goto(`file://${filePath}`);
  });

  test('can select Box Breathing', async ({ page }) => {
    const select = page.locator('#exerciseSelect');
    await select.selectOption('boxBreathing');
    // Verify value
    await expect(select).toHaveValue('boxBreathing');
  });

  test('can select Diaphragmatic Breathing with Hold = 0s', async ({ page }) => {
    const select = page.locator('#exerciseSelect');
    await select.selectOption('diaphragmaticBreathing');
    await expect(select).toHaveValue('diaphragmaticBreathing');
    await expect(page.locator('#holdTime')).toHaveValue('0');
  });

  test('instructions toggle synchronizes visibility and aria-expanded', async ({ page }) => {
    const toggle = page.locator('#instructionsToggle');
    const container = page.locator('#instructions-container');

    await expect(container).toHaveClass(/hidden/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(container).not.toHaveClass(/hidden/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(container).toHaveClass(/hidden/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('turtle visualizer renders visible pseudo-element glyph', async ({ page }) => {
    await page.locator('#animationStyle').selectOption('turtle');
    const turtleEl = page.locator('.turtle-animation');
    await expect(turtleEl).toBeAttached();
    const afterContent = await turtleEl.evaluate((el) =>
      window.getComputedStyle(el, '::after').getPropertyValue('content')
    );
    expect(afterContent).toContain('🐢');
  });

  test('can select Alternate Nostril Breathing', async ({ page }) => {
    const select = page.locator('#exerciseSelect');
    await select.selectOption('alternateNostrilBreathing');
    await expect(select).toHaveValue('alternateNostrilBreathing');
  });

  test('UI updates when starting alternate nostril', async ({ page }) => {
    // Select Alternate
    await page.locator('#exerciseSelect').selectOption('alternateNostrilBreathing');

    // Start
    await page.locator('#startButton').click();

    // Check for specific instruction text or phase name if available
    // Note: The vanilla JS implementation updates text inside #animation-container or #animation-wrapper
    // For now, we just ensure no JS errors occurred and button is hidden
    await expect(page.locator('#startButton')).toBeHidden();
    await expect(page.locator('#stopButton')).toBeVisible();
  });
});
