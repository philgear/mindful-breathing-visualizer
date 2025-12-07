import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Breathing Techniques', () => {
    test.beforeEach(async ({ page }) => {
        const filePath = path.join(__dirname, '../vanilla-js/public/index.html');
        await page.goto(`file://${filePath}`);
    });

    test('can select Box Breathing', async ({ page }) => {
        const select = page.locator('#exerciseSelect');
        await select.selectOption('boxBreathing');
        // Verify value
        await expect(select).toHaveValue('boxBreathing');
    });

    test('can select Diaphragmatic Breathing', async ({ page }) => {
        const select = page.locator('#exerciseSelect');
        await select.selectOption('diaphragmaticBreathing');
        await expect(select).toHaveValue('diaphragmaticBreathing');
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
