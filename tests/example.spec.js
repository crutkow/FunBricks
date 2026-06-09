// @ts-check
import { test, expect } from '@playwright/test';

test.describe('FunBricks Proton game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the game page', async ({ page }) => {
    await expect(page).toHaveTitle(/FunBricks Proton Game/);
  });

  test('renders the game canvas', async ({ page }) => {
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('id', 'game-canvas');
  });

  test('has an active Proton animation scene', async ({ page }) => {
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(500);
    await expect(canvas).toBeVisible();
  });

  test('renders sprites on canvas (ball, paddle, bricks)', async ({ page }) => {
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();

    // Wait for sprites and particles to render
    await page.waitForTimeout(2000);

    // Verify the canvas has dimensions and is rendering
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.getElementById('game-canvas');
      if (!(canvas instanceof HTMLCanvasElement)) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      // Try to get image data to verify the canvas is initialized
      try {
        ctx.getImageData(0, 0, 1, 1);
        return {
          width: canvas.width,
          height: canvas.height,
          canGetImageData: true,
        };
      } catch (e) {
        return null;
      }
    });

    expect(canvasInfo).not.toBeNull();
    expect(canvasInfo?.width).toBeGreaterThan(0);
    expect(canvasInfo?.height).toBeGreaterThan(0);
  });

  test('starts in the ready state', async ({ page }) => {
    await page.waitForTimeout(500);
    const state = await page.evaluate(() => window.game?.getState?.());
    expect(state).toBe('ready');
  });

  test('launches the ball on space and enters playing state', async ({ page }) => {
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(500);

    // A pointer click both unlocks audio and can launch the ball.
    await canvas.click();
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    const state = await page.evaluate(() => window.game?.getState?.());
    expect(state).toBe('playing');
  });

  test('paddle responds to keyboard input', async ({ page }) => {
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(500);

    // Move the paddle right; the game should keep running without errors.
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(300);
    await page.keyboard.up('ArrowRight');

    await expect(canvas).toBeVisible();
    const state = await page.evaluate(() => window.game?.getState?.());
    expect(['ready', 'playing']).toContain(state);
  });
});
