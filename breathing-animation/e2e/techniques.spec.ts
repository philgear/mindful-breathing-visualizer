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

    await expect(page.locator('#startButton')).toBeHidden();
    await expect(page.locator('#stopButton')).toBeVisible();
    await expect(page.locator('body')).toHaveClass(/focus-mode/);
    await expect(page.locator('.settings-group').first()).toHaveClass(/fade-out/);

    // Focus mode dims settings group (wait past 300ms CSS transition)
    await expect
      .poll(async () => {
        const val = await page
          .locator('.settings-group')
          .first()
          .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
        return val;
      })
      .toBeLessThan(0.5);
  });

  test('dark and light mode toggle updates computed background styles and uses PocketGull font', async ({ page }) => {
    const bodyFont = await page.locator('body').evaluate((el) => window.getComputedStyle(el).fontFamily);
    expect(bodyFont).toContain('PocketGull');

    const timerFont = await page.locator('#timerDisplay').evaluate((el) => window.getComputedStyle(el).fontFamily);
    expect(timerFont).toContain('PocketGull Mono');

    const darkBtn = page.locator('#darkModeButton');
    const initialBg = await page.locator('body').evaluate((el) => window.getComputedStyle(el).backgroundColor);

    await darkBtn.click();
    const toggledBg = await page.locator('body').evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(toggledBg).not.toBe(initialBg);

    await darkBtn.click();
    const restoredBg = await page.locator('body').evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(restoredBg).toBe(initialBg);
  });
});
