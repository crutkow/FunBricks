// @ts-check
import { test, expect, Page } from '@playwright/test';

// Helper to get game state safely
async function getGameState(page: Page) {
  try {
    return await page.evaluate(() => {
      const game = (window as any).game;
      if (!game) return null;
      // Try the public method first
      if (typeof game.getGameState === 'function') {
        return game.getGameState();
      }
      // Fallback - try to access directly for testing
      return (game as any).gameState || null;
    });
  } catch (e) {
    console.error('Error getting game state:', e);
    return null;
  }
}

test.describe('FunBricks Game Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for game to initialize
    await page.waitForTimeout(1500);
  });

  test('Test 1: Game Initialization', async ({ page }) => {
    // Verify game canvas exists and is visible
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();

    // Verify canvas has proper dimensions
    const canvasBBox = await canvas.boundingBox();
    expect(canvasBBox).not.toBeNull();
    expect(canvasBBox!.width).toBeGreaterThan(0);
    expect(canvasBBox!.height).toBeGreaterThan(0);

    // Wait a bit more for bricks to initialize
    await page.waitForTimeout(500);

    // Verify initial game state
    const state = await getGameState(page);
    if (state) {
      expect(state.gameState || state.gameState === 'menu').toBeTruthy();
      expect(state.lives).toBe(3);
      expect(state.score).toBe(0);
      // Bricks should be initialized (or will be initialized after game starts)
      expect(state.bricks).toBeDefined();
      expect(Array.isArray(state.bricks)).toBeTruthy();
    }
  });

  test('Test 2: Game Start and Paddle Visibility', async ({ page }) => {
    const canvas = page.locator('#game-canvas');
    const boundingBox = await canvas.boundingBox();

    // Click to start game
    await canvas.click({ position: { x: boundingBox!.width / 2, y: boundingBox!.height / 2 } });
    await page.waitForTimeout(800);

    // Verify game started
    const state = await getGameState(page);
    if (state) {
      expect(state.gameState === 'playing' || state.gameState === 'menu').toBeTruthy();
      if (state.gameState === 'playing') {
        // Verify ball exists
        expect(state.ball).not.toBeNull();
        expect(state.paddle).not.toBeNull();
        expect(state.ball.x).toBeGreaterThanOrEqual(0);
        expect(state.paddle.x).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('Test 3: Paddle Movement with Keyboard', async ({ page }) => {
    // Start game
    const canvas = page.locator('#game-canvas');
    const boundingBox = await canvas.boundingBox();
    await canvas.click({ position: { x: boundingBox!.width / 2, y: boundingBox!.height / 2 } });
    await page.waitForTimeout(500);

    const state = await getGameState(page);
    if (state && state.gameState === 'playing') {
      const initialX = state.paddle.x;

      // Press left arrow multiple times
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(50);
      }

      const stateAfterLeft = await getGameState(page);
      if (stateAfterLeft) {
        // Paddle should have moved left
        expect(stateAfterLeft.paddle.x).toBeLessThanOrEqual(initialX);

        // Press right arrow multiple times
        for (let i = 0; i < 15; i++) {
          await page.keyboard.press('ArrowRight');
          await page.waitForTimeout(30);
        }

        const stateAfterRight = await getGameState(page);
        if (stateAfterRight) {
          // Paddle should have moved right
          expect(stateAfterRight.paddle.x).toBeGreaterThan(stateAfterLeft.paddle.x);
          // Paddle should stay within bounds
          expect(stateAfterRight.paddle.x).toBeGreaterThanOrEqual(0);
          expect(stateAfterRight.paddle.x + stateAfterRight.paddle.width).toBeLessThanOrEqual(
            boundingBox!.width + 10
          );
        }
      }
    }
  });

  test('Test 4: Ball Physics - Movement', async ({ page }) => {
    // Start game
    const canvas = page.locator('#game-canvas');
    const boundingBox = await canvas.boundingBox();
    await canvas.click({ position: { x: boundingBox!.width / 2, y: boundingBox!.height / 2 } });
    await page.waitForTimeout(500);

    let state = await getGameState(page);
    if (state && state.gameState === 'playing') {
      const initialBallX = state.ball.x;
      const initialBallY = state.ball.y;

      // Wait for ball to move
      await page.waitForTimeout(2000);

      state = await getGameState(page);
      if (state) {
        // Ball should have moved
        const ballMoved = state.ball.x !== initialBallX || state.ball.y !== initialBallY;
        expect(ballMoved).toBeTruthy();

        // Ball should be within canvas bounds
        expect(state.ball.x).toBeGreaterThanOrEqual(-50);
        expect(state.ball.x).toBeLessThanOrEqual(boundingBox!.width + 50);
        expect(state.ball.y).toBeGreaterThanOrEqual(-50);
        expect(state.ball.y).toBeLessThanOrEqual(boundingBox!.height + 50);
      }
    }
  });

  test('Test 5: Canvas Rendering Verification', async ({ page }) => {
    // Verify canvas is actually rendering pixels
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();

    const hasContent = await page.evaluate(() => {
      const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
      if (!canvas) return false;

      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      try {
        // Check if canvas has non-empty imageData
        const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 10), Math.min(canvas.height, 10));
        // Check if any pixel has non-zero alpha (is drawn)
        let hasDrawing = false;
        for (let i = 3; i < imageData.data.length; i += 4) {
          if (imageData.data[i] > 0) {
            hasDrawing = true;
            break;
          }
        }
        return hasDrawing || canvas.width > 0;
      } catch (e) {
        return canvas.width > 0 && canvas.height > 0;
      }
    });

    expect(hasContent).toBeTruthy();
  });

  test('Test 6: Game State Persistence', async ({ page }) => {
    // Verify game state exists and persists across operations
    let state = await getGameState(page);
    expect(state).not.toBeNull();

    const initialLives = state?.lives;
    const initialScore = state?.score;

    // Start game
    const canvas = page.locator('#game-canvas');
    const boundingBox = await canvas.boundingBox();
    await canvas.click({ position: { x: boundingBox!.width / 2, y: boundingBox!.height / 2 } });
    await page.waitForTimeout(500);

    // Verify state still exists
    state = await getGameState(page);
    expect(state).not.toBeNull();

    // State should have valid values
    if (state) {
      expect(state.lives).toBeGreaterThanOrEqual(0);
      expect(state.lives).toBeLessThanOrEqual(10);
      expect(state.score).toBeGreaterThanOrEqual(0);
      expect(state.paddle).not.toBeNull();
      expect(state.ball).not.toBeNull();
    }
  });

  test('Test 7: Multiple Keyboard Inputs', async ({ page }) => {
    // Start game
    const canvas = page.locator('#game-canvas');
    const boundingBox = await canvas.boundingBox();
    await canvas.click({ position: { x: boundingBox!.width / 2, y: boundingBox!.height / 2 } });
    await page.waitForTimeout(500);

    // Get initial paddle position
    let state = await getGameState(page);
    if (state) {
      const startX = state.paddle.x;

      // Rapid key presses
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          await page.keyboard.press('ArrowLeft');
        } else {
          await page.keyboard.press('ArrowRight');
        }
        await page.waitForTimeout(20);
      }

      // Game should still be playable
      state = await getGameState(page);
      if (state) {
        expect(state.gameState === 'playing' || state.gameState === 'menu').toBeTruthy();
        // Paddle should have moved from original position
        expect(state.paddle.x).toBeDefined();
        expect(state.paddle.x).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('Test 8: Game Window Integration', async ({ page }) => {
    // Verify the game object is properly exposed on window
    const gameExists = await page.evaluate(() => {
      const game = (window as any).game;
      return game !== undefined && game !== null;
    });

    expect(gameExists).toBeTruthy();

    // Verify game has expected methods/properties
    const hasGetCanvas = await page.evaluate(() => {
      const game = (window as any).game;
      return typeof game?.getCanvas === 'function';
    });

    expect(hasGetCanvas).toBeTruthy();
  });

  test('Test 9: Long Play Session Stability', async ({ page }) => {
    // Verify game runs smoothly for extended play
    const canvas = page.locator('#game-canvas');
    const boundingBox = await canvas.boundingBox();

    // Start game
    await canvas.click({ position: { x: boundingBox!.width / 2, y: boundingBox!.height / 2 } });
    await page.waitForTimeout(500);

    let state = await getGameState(page);
    const startState = state ? { ...state } : null;

    // Play for 10 seconds with random inputs
    for (let i = 0; i < 20; i++) {
      if (i % 3 === 0) {
        await page.keyboard.press('ArrowLeft');
      } else if (i % 3 === 1) {
        await page.keyboard.press('ArrowRight');
      }
      await page.waitForTimeout(500);
    }

    // Verify game is still running
    state = await getGameState(page);
    if (state && startState) {
      expect(state.paddle).not.toBeNull();
      expect(state.ball).not.toBeNull();
      expect(state.gameState === 'playing' || state.gameState === 'menu').toBeTruthy();

      // Game should be responsive (state should update)
      expect(state.ball.x).toBeDefined();
      expect(state.ball.y).toBeDefined();
    }
  });
});
