import { SpriteManager } from './SpriteManager';
import { GameState } from './GameTypes';

export class Renderer {
  private lastScore: number = 0;
  private scoreScaleTime: number = 0;
  private scoreScaleDuration: number = 0.2;
  private lastPaddleSpeed: number = 0;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private spriteManager: SpriteManager,
    private canvasWidth: number,
    private canvasHeight: number
  ) {}

  /**
   * Renders the game scene including bricks, paddle, and ball
   */
  renderGame(gameState: GameState): void {
    // Clear canvas with dark background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw bricks
    for (const brick of gameState.bricks) {
      if (!brick.destroyed) {
        this.spriteManager.draw(this.ctx, brick.sprite, brick.x, brick.y, 0.8);
      }
    }

    // Draw paddle with brightness effect when moving
    const paddleScale = gameState.paddle.speed > 0 ? 1.1 : 1;
    this.spriteManager.draw(
      this.ctx,
      gameState.paddle.sprite,
      gameState.paddle.x,
      gameState.paddle.y,
      paddleScale
    );

    // Draw ball with glow effect during playing state
    if (gameState.gameState === 'playing') {
      const ballRadius = gameState.ball.radius;
      const glowRadius = ballRadius + 4;

      // Create glow effect
      const gradient = this.ctx.createRadialGradient(
        gameState.ball.x,
        gameState.ball.y,
        ballRadius,
        gameState.ball.x,
        gameState.ball.y,
        glowRadius
      );
      gradient.addColorStop(0, 'rgba(0, 181, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 181, 255, 0)');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        gameState.ball.x - glowRadius,
        gameState.ball.y - glowRadius,
        glowRadius * 2,
        glowRadius * 2
      );
    }

    // Draw ball
    this.spriteManager.draw(
      this.ctx,
      gameState.ball.sprite,
      gameState.ball.x - gameState.ball.radius,
      gameState.ball.y - gameState.ball.radius,
      1.5
    );
  }

  /**
   * Renders the HUD including score, lives, and game state message
   */
  renderHUD(gameState: GameState): void {
    // Draw lives (hearts) with color effect
    for (let i = 0; i < gameState.lives; i++) {
      const heartScale = gameState.lives <= 1 ? 1.3 : 1.5; // Enlarge heart when only 1 life left
      const heartColor = gameState.lives <= 1 ? 'rgba(255, 100, 100, 0.5)' : '';

      if (gameState.lives <= 1 && i === 0) {
        // Draw red glow around last heart
        this.ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(30 + i * 20, 30, 12, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.spriteManager.draw(this.ctx, 'heart', 20 + i * 20, 20, heartScale);
    }

    // Draw score with animation on change
    const scoreChanged = this.lastScore !== gameState.score;
    if (scoreChanged) {
      this.lastScore = gameState.score;
      this.scoreScaleTime = 0;
    }

    // Calculate score scale animation
    const scoreProgress = this.scoreScaleTime / this.scoreScaleDuration;
    const scoreScale = scoreProgress < 1 ? 1 + (0.1 * Math.sin(scoreProgress * Math.PI)) : 1;
    this.scoreScaleTime += 0.016; // Add delta time approximation

    this.ctx.save();
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px Arial';
    const scoreText = `Score: ${gameState.score}`;
    const textWidth = this.ctx.measureText(scoreText).width;
    const scoreX = this.canvasWidth - 150;
    const scoreY = 30;

    // Apply scale animation
    this.ctx.translate(scoreX + textWidth / 2, scoreY);
    this.ctx.scale(scoreScale, scoreScale);
    this.ctx.translate(-(scoreX + textWidth / 2), -scoreY);
    this.ctx.fillText(scoreText, scoreX, scoreY);
    this.ctx.restore();

    // Draw game state message
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';

    if (gameState.gameState === 'menu') {
      this.ctx.fillText('MENU - Click to Start', this.canvasWidth / 2, this.canvasHeight / 2);
    } else if (gameState.gameState === 'gameover') {
      // Game over text with pulse effect
      const pulseScale = 1 + 0.1 * Math.sin(Date.now() / 200);
      this.ctx.save();
      this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2 - 20);
      this.ctx.scale(pulseScale, pulseScale);
      this.ctx.fillText('GAME OVER', 0, 0);
      this.ctx.restore();

      this.ctx.font = 'bold 18px Arial';
      this.ctx.fillText('Press R to Restart', this.canvasWidth / 2, this.canvasHeight / 2 + 20);
    } else if (gameState.gameState === 'win') {
      // Win text with pulse effect
      const pulseScale = 1 + 0.1 * Math.sin(Date.now() / 200);
      this.ctx.save();
      this.ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2 - 20);
      this.ctx.scale(pulseScale, pulseScale);
      this.ctx.fillStyle = '#00ff00';
      this.ctx.fillText('YOU WIN!', 0, 0);
      this.ctx.restore();

      this.ctx.font = 'bold 18px Arial';
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText('Press R to Restart', this.canvasWidth / 2, this.canvasHeight / 2 + 20);
    }

    // Reset text alignment
    this.ctx.textAlign = 'left';
  }

  /**
   * Update canvas dimensions (called on resize)
   */
  updateCanvasDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
}
