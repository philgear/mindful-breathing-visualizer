import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Breathing Visualizer', () => {
    test('basic functionality', async ({ page }) => {
        // Open the local file
        const filePath = path.join(__dirname, '../vanilla-js/public/index.html');
        await page.goto(`file://${filePath}`);

        // Check title
        await expect(page).toHaveTitle('Mindful Breathing Visualizer');

        // Check initial state
        const startButton = page.locator('#startButton');
        await expect(startButton).toBeVisible();

        // Start exercises
        await startButton.click();

        // Check animation element gets 'inhale' class
        const animationCircle = page.locator('.circle-animation');
        await expect(animationCircle).toHaveClass(/inhale/, { timeout: 10000 });
    });

    test('audio toggle', async ({ page }) => {
        const filePath = path.join(__dirname, '../vanilla-js/public/index.html');
        await page.goto(`file://${filePath}`);

        const muteButton = page.locator('#muteButton');
        await expect(muteButton).toHaveText('🔊 Sound On');

        await muteButton.click();
        await expect(muteButton).toHaveText('🔇 Muted');
    });
});
