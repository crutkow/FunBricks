import { GameState } from './GameTypes';
import { BallPhysics } from './GameLogic';
import { BrickManager } from './BrickManager';

export class GameStateManager {
  handleStateTransition(
    gameState: GameState,
    ballPhysics: BallPhysics,
    brickManager: BrickManager,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    // Transition from menu to playing
    if (gameState.gameState === 'menu') {
      // Will be triggered by user input (click or key press)
      // No automatic transition needed here
    }

    // Transition from playing to gameover (lives <= 0)
    if (gameState.gameState === 'playing' && gameState.lives <= 0) {
      gameState.gameState = 'gameover';
    }

    // Transition from playing to win (all bricks destroyed)
    if (gameState.gameState === 'playing') {
      const activeBricks = gameState.bricks.filter(b => !b.destroyed);
      if (activeBricks.length === 0) {
        gameState.gameState = 'win';
      }
    }
  }

  resetGame(gameState: GameState, brickManager: BrickManager): GameState {
    // Reset lives to 3
    gameState.lives = 3;

    // Reset score to 0
    gameState.score = 0;

    // Reinitialize bricks (all destroyed = false)
    gameState.bricks = brickManager.createBrickGrid();

    // Reset ball position on paddle
    gameState.ball.x = gameState.paddle.x + gameState.paddle.width / 2;
    gameState.ball.y = gameState.paddle.y - 20;
    gameState.ball.vx = 20;
    gameState.ball.vy = -30;

    // Reset game state to menu
    gameState.gameState = 'menu';

    return gameState;
  }

  startGame(gameState: GameState): void {
    if (gameState.gameState === 'menu') {
      gameState.gameState = 'playing';
    }
  }
}
