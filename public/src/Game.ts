import Proton, {
  Emitter,
  Rate,
  Span,
  Radius,
  Life,
  Velocity,
  Color,
  Alpha,
  CanvasRenderer,
} from 'proton-engine';
import { SpriteManager } from './SpriteManager';
import { AudioManager } from './AudioManager';
import { InputManager } from './InputManager';
import { BallPhysics, CollisionEvent } from './GameLogic';
import { Renderer } from './Renderer';
import { BrickManager } from './BrickManager';
import { GameStateManager } from './GameStateManager';
import { GameState, GameStateValue, Ball, Paddle, Brick } from './GameTypes';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private proton: Proton;
  private emitter: Emitter;
  private renderer: CanvasRenderer;
  private gameRenderer: Renderer;
  private spriteManager: SpriteManager;
  private audioManager: AudioManager;
  private inputManager!: InputManager;
  private brickManager!: BrickManager;
  private gameStateManager!: GameStateManager;
  private ballPhysics: BallPhysics;
  private gameState: GameState;
  private lastTime: number = 0;

  constructor(private container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'game-canvas';
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.container.appendChild(this.canvas);

    const ctxOrNull = this.canvas.getContext('2d');
    if (!ctxOrNull) {
      throw new Error('Failed to get canvas context');
    }
    this.ctx = ctxOrNull;

    this.proton = new Proton();
    this.renderer = new CanvasRenderer(this.canvas);
    this.proton.addRenderer(this.renderer);

    this.spriteManager = new SpriteManager();
    this.audioManager = new AudioManager();
    this.ballPhysics = new BallPhysics();

    // Initialize game state first so we can create renderer with proper dimensions
    this.gameState = this.initializeGameState();

    // Create game renderer
    this.gameRenderer = new Renderer(
      this.ctx,
      this.spriteManager,
      this.canvas.width,
      this.canvas.height
    );

    this.emitter = this.createEmitter();
    this.proton.addEmitter(this.emitter);
  }

  async init(): Promise<void> {
    await this.spriteManager.load();
    await this.audioManager.load();
    this.inputManager = new InputManager();
    
    // Initialize brick manager after sprite manager loads
    const { clientWidth, clientHeight } = this.container;
    this.brickManager = new BrickManager(clientWidth, clientHeight);
    this.gameState.bricks = this.brickManager.createBrickGrid();
    
    // Initialize game state manager
    this.gameStateManager = new GameStateManager();
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    // Start emitting particles
    this.emitter.emit(10);

    // Play a click sound on user interaction (unlocks audio on many browsers)
    this.container.addEventListener(
      'click',
      () => {
        this.audioManager.play('click');
        // Start game from menu on click
        if (this.gameState.gameState === 'menu') {
          this.gameStateManager.startGame(this.gameState);
        }
      },
      { once: false }
    );

    requestAnimationFrame(() => this.update());
  }

  private createEmitter(): Emitter {
    const emitter = new Emitter();
    emitter.rate = new Rate(new Span(15, 25), 0.1);
    emitter.addInitialize(new Radius(2, 10));
    emitter.addInitialize(new Life(2, 3));
    emitter.addInitialize(new Velocity(6, new Span(0, 360), 'polar'));
    emitter.addBehaviour(new Color('#00b5ff', '#f5f7fb'));
    emitter.addBehaviour(new Alpha(1, 0));
    // Don't call emit here; the emitter will emit continuously based on rate
    return emitter;
  }

  private emitParticles(x: number, y: number, count: number): void {
    if (this.emitter) {
      this.emitter.p.x = x;
      this.emitter.p.y = y;
      this.emitter.emit(count);
    }
  }

  private update(): void {
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.016); // Cap at ~60fps
    this.lastTime = currentTime;

    // Handle state transitions and user input
    this.gameStateManager.handleStateTransition(
      this.gameState,
      this.ballPhysics,
      this.brickManager,
      this.canvas.width,
      this.canvas.height
    );

    // Handle restart input (R key)
    if (this.inputManager.isKeyPressed('r')) {
      if (this.gameState.gameState === 'gameover' || this.gameState.gameState === 'win') {
        this.gameStateManager.resetGame(this.gameState, this.brickManager);
      }
    }

    // Handle start input (Space or Enter from menu)
    if (this.gameState.gameState === 'menu') {
      if (this.inputManager.isKeyPressed(' ') || this.inputManager.isKeyPressed('enter')) {
        this.gameStateManager.startGame(this.gameState);
      }
    }

    // Update game logic only when playing
    if (this.gameState.gameState === 'playing') {
      this.updateGameLogic(deltaTime);
    }

    // Update and render particles first
    this.proton.update();

    // Then render game objects and HUD
    this.gameRenderer.renderGame(this.gameState);
    this.gameRenderer.renderHUD(this.gameState);

    requestAnimationFrame(() => this.update());
  }

  private updateGameLogic(deltaTime: number): void {
    const { ball, paddle, bricks } = this.gameState;
    const { clientWidth, clientHeight } = this.container;

    // Handle paddle input
    const input = this.inputManager.getInputVector();
    if (input.left) {
      paddle.x = Math.max(0, paddle.x - paddle.speed);
    }
    if (input.right) {
      paddle.x = Math.min(clientWidth - paddle.width, paddle.x + paddle.speed);
    }

    // Update ball position
    this.ballPhysics.updateBallPosition(ball, deltaTime);

    // Check wall collisions (includes falling off bottom)
    const ballFellOff = this.ballPhysics.checkWallCollisions(ball, clientWidth, clientHeight);
    if (ballFellOff) {
      this.gameState.lives--;
      this.audioManager.play('click');
      if (this.gameState.lives <= 0) {
        this.gameState.gameState = 'gameover';
      } else {
        // Reset ball on paddle
        this.gameState.ball = this.ballPhysics.resetBall(paddle);
      }
      return;
    }

    // Check paddle collision
    const paddleCollision = this.ballPhysics.checkPaddleCollision(ball, paddle);
    if (paddleCollision) {
      this.audioManager.play('click');
      this.emitParticles(paddleCollision.x, paddleCollision.y, 8);
    }

    // Check brick collisions
    const brickResult = this.ballPhysics.checkBrickCollisions(ball, bricks);
    this.gameState.score += brickResult.score;
    for (const collision of brickResult.collisions) {
      this.audioManager.play('click');
      this.emitParticles(collision.x, collision.y, 6);
    }

    // Check win condition
    if (this.gameState.bricks.every(b => b.destroyed)) {
      this.gameState.gameState = 'win';
      this.audioManager.play('click');
      this.emitParticles(clientWidth / 2, clientHeight / 2, 20);
    }
  }

  private initializeGameState(): GameState {
    const { clientWidth, clientHeight } = this.container;

    // Create paddle
    const paddle: Paddle = {
      x: clientWidth / 2 - 32,
      y: clientHeight - 40,
      width: 64,
      height: 16,
      speed: 5,
      sprite: 'paddle-normal',
    };

    // Create ball
    const ball: Ball = {
      x: paddle.x + paddle.width / 2,
      y: paddle.y - 20,
      vx: 2,
      vy: -3,
      radius: 8,
      sprite: 'ball',
    };

    return {
      ball,
      paddle,
      bricks: [],
      score: 0,
      lives: 3,
      gameState: 'menu',
    };
  }

  private resize(): void {
    const { clientWidth, clientHeight } = this.container;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = clientWidth;
    this.canvas.height = clientHeight;

    // Update renderer dimensions
    this.gameRenderer.updateCanvasDimensions(clientWidth, clientHeight);

    if (this.emitter) {
      this.emitter.p.x = clientWidth / 2;
      this.emitter.p.y = clientHeight / 2;
    }

    // Re-center paddle and ball on resize
    this.gameState.paddle.x = clientWidth / 2 - 32;
    this.gameState.paddle.y = clientHeight - 40;
    this.gameState.ball.x = this.gameState.paddle.x + this.gameState.paddle.width / 2;
    this.gameState.ball.y = this.gameState.paddle.y - 20;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getGameState() {
    return {
      ball: this.gameState.ball,
      paddle: this.gameState.paddle,
      bricks: this.gameState.bricks,
      score: this.gameState.score,
      lives: this.gameState.lives,
      gameState: this.gameState.gameState,
    };
  }
}
