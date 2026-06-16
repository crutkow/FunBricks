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
import { GAME_CONFIG } from './config/constants';
import { InputManager } from './input/InputManager';
import { Paddle } from './entities/Paddle';
import { Ball } from './entities/Ball';
import { Brick } from './entities/Brick';
import { circleRectCollision, reflectVector } from './physics/Collision';
import { buildLevel } from './levels/LevelLoader';
import { GameState } from './state/GameState';
import { HudRenderer } from './rendering/HudRenderer';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private proton: Proton;
  private emitter: Emitter;
  private renderer: CanvasRenderer;
  private spriteManager: SpriteManager;
  private audioManager: AudioManager;
  private inputManager: InputManager;
  private hudRenderer: HudRenderer;
  private paddle: Paddle;
  private ball: Ball;
  private bricks: Brick[] = [];
  private state: GameState = {
    status: 'ready',
    score: 0,
    lives: GAME_CONFIG.gameplay.startingLives,
    level: 1,
  };
  private lastTimestamp = 0;

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
    this.inputManager = new InputManager(this.container);
    this.hudRenderer = new HudRenderer();

    this.paddle = new Paddle(
      GAME_CONFIG.paddle.width,
      GAME_CONFIG.paddle.height,
      GAME_CONFIG.paddle.speed
    );
    this.ball = new Ball(GAME_CONFIG.ball.radius, GAME_CONFIG.ball.speed);

    this.emitter = this.createEmitter();
    this.proton.addEmitter(this.emitter);
  }

  async init(): Promise<void> {
    await this.spriteManager.load();
    await this.audioManager.load();

    this.resize();
    this.resetLevel();
    this.inputManager.bind();

    this.emitter.emit(10);
    window.addEventListener('resize', () => this.resize());

    this.container.addEventListener('click', () => {
      this.audioManager.play('click');
      if (this.state.status === 'won' || this.state.status === 'lost') {
        this.restart();
      }
    });

    (window as any).__funbricks = {
      getState: () => ({ ...this.state, bricksRemaining: this.bricks.filter((b) => b.alive).length }),
    };

    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  private createEmitter(): Emitter {
    const emitter = new Emitter();
    emitter.rate = new Rate(new Span(15, 25), 0.1);
    emitter.addInitialize(new Radius(2, 10));
    emitter.addInitialize(new Life(2, 3));
    emitter.addInitialize(new Velocity(6, new Span(0, 360), 'polar'));
    emitter.addBehaviour(new Color('#00b5ff', '#f5f7fb'));
    emitter.addBehaviour(new Alpha(1, 0));
    return emitter;
  }

  private gameLoop(timestamp: number): void {
    const dt = Math.min(0.033, (timestamp - this.lastTimestamp) / 1000 || 0.016);
    this.lastTimestamp = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((nextTimestamp) => this.gameLoop(nextTimestamp));
  }

  private update(dt: number): void {
    this.handleInput();

    if (this.state.status !== 'playing') {
      this.proton.update();
      return;
    }

    this.paddle.moveByAxis(this.inputManager.getHorizontalAxis(), dt);

    const pointerX = this.inputManager.getPointerX();
    if (pointerX > 0) {
      this.paddle.moveToCenterX(pointerX);
    }
    this.paddle.clamp(this.canvas.width);

    if (this.ball.attached) {
      this.ball.attachToPaddle(this.paddle);
    }

    this.ball.update(dt);
    this.handleWallCollisions();
    this.handlePaddleCollision();
    this.handleBrickCollisions();

    if (this.ball.y - this.ball.radius > this.canvas.height) {
      this.onBallMissed();
    }

    if (this.bricks.every((brick) => !brick.alive)) {
      this.state.status = 'won';
      this.audioManager.play('win');
    }

    this.proton.update();
  }

  private handleInput(): void {
    if (!this.inputManager.consumeLaunchAction()) {
      return;
    }

    if (this.state.status === 'ready') {
      this.state.status = 'playing';
      this.ball.launch();
      return;
    }

    if (this.state.status === 'playing' && this.ball.attached) {
      this.ball.launch();
      return;
    }

    if (this.state.status === 'won' || this.state.status === 'lost') {
      this.restart();
    }
  }

  private handleWallCollisions(): void {
    if (this.ball.x - this.ball.radius <= 0 && this.ball.vx < 0) {
      this.ball.x = this.ball.radius;
      this.ball.vx *= -1;
      this.audioManager.play('hit1');
    }

    if (this.ball.x + this.ball.radius >= this.canvas.width && this.ball.vx > 0) {
      this.ball.x = this.canvas.width - this.ball.radius;
      this.ball.vx *= -1;
      this.audioManager.play('hit1');
    }

    if (this.ball.y - this.ball.radius <= 0 && this.ball.vy < 0) {
      this.ball.y = this.ball.radius;
      this.ball.vy *= -1;
      this.audioManager.play('hit2');
    }
  }

  private handlePaddleCollision(): void {
    const result = circleRectCollision(
      this.ball.x,
      this.ball.y,
      this.ball.radius,
      this.paddle.x,
      this.paddle.y,
      this.paddle.width,
      this.paddle.height
    );

    if (!result.hit || this.ball.vy <= 0) {
      return;
    }

    this.ball.y = this.paddle.y - this.ball.radius - 0.5;

    const hitOffset = (this.ball.x - this.paddle.centerX) / (this.paddle.width / 2);
    const clampedOffset = Math.max(-1, Math.min(1, hitOffset));

    this.ball.vx = clampedOffset * this.ball.speed;
    this.ball.vy = -Math.sqrt(Math.max(50, this.ball.speed * this.ball.speed - this.ball.vx * this.ball.vx));

    this.audioManager.play('hit2');
  }

  private handleBrickCollisions(): void {
    for (const brick of this.bricks) {
      if (!brick.alive) continue;

      const result = circleRectCollision(
        this.ball.x,
        this.ball.y,
        this.ball.radius,
        brick.x,
        brick.y,
        brick.width,
        brick.height
      );

      if (!result.hit) continue;

      brick.alive = false;
      this.state.score += brick.points;

      const reflected = reflectVector(this.ball.vx, this.ball.vy, result.normalX, result.normalY);
      this.ball.vx = reflected.vx;
      this.ball.vy = reflected.vy;

      this.audioManager.play('point');
      break;
    }
  }

  private onBallMissed(): void {
    this.state.lives -= 1;

    if (this.state.lives <= 0) {
      this.state.status = 'lost';
      return;
    }

    this.state.status = 'ready';
    this.ball.attachToPaddle(this.paddle);
  }

  private render(): void {
    this.ctx.fillStyle = GAME_CONFIG.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const brick of this.bricks) {
      if (!brick.alive) continue;
      this.spriteManager.draw(this.ctx, brick.sprite, brick.x, brick.y, 1);
    }

    this.spriteManager.draw(this.ctx, 'paddle-normal', this.paddle.x, this.paddle.y, 1);
    this.spriteManager.draw(
      this.ctx,
      'ball',
      this.ball.x - this.ball.radius,
      this.ball.y - this.ball.radius,
      (this.ball.radius * 2) / 42
    );

    for (let i = 0; i < this.state.lives; i++) {
      this.spriteManager.draw(this.ctx, 'heart', 20 + i * 44, 44, 1.2);
    }

    this.hudRenderer.render(this.ctx, this.state, this.canvas.width, this.canvas.height);
  }

  private resetLevel(): void {
    this.bricks = buildLevel(this.canvas.width);

    this.paddle.y = this.canvas.height - GAME_CONFIG.paddle.offsetFromBottom;
    this.paddle.moveToCenterX(this.canvas.width / 2);
    this.paddle.clamp(this.canvas.width);

    this.ball.attachToPaddle(this.paddle);
    this.state.status = 'ready';
  }

  private restart(): void {
    this.state = {
      status: 'ready',
      score: 0,
      lives: GAME_CONFIG.gameplay.startingLives,
      level: 1,
    };
    this.resetLevel();
  }

  private resize(): void {
    const { clientWidth, clientHeight } = this.container;

    this.canvas.width = clientWidth;
    this.canvas.height = clientHeight;

    if (this.emitter) {
      this.emitter.p.x = clientWidth / 2;
      this.emitter.p.y = clientHeight / 2;
    }

    this.paddle.y = this.canvas.height - GAME_CONFIG.paddle.offsetFromBottom;
    this.paddle.clamp(this.canvas.width);

    if (this.ball.attached) {
      this.ball.attachToPaddle(this.paddle);
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}

