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
import { Paddle } from './entities/Paddle';
import { Ball } from './entities/Ball';
import { Brick } from './entities/Brick';
import { Level } from './Level';
import { Input } from './Input';

type GameState = 'ready' | 'playing' | 'won' | 'gameover';

const TOTAL_ROWS = 6;
const TOTAL_COLS = 9;
const START_LIVES = 3;

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private proton: Proton;
  private burstEmitter: Emitter;
  private renderer: CanvasRenderer;
  private spriteManager: SpriteManager;
  private audioManager: AudioManager;
  private input: Input;

  private paddle!: Paddle;
  private ball!: Ball;
  private level!: Level;

  private state: GameState = 'ready';
  private score = 0;
  private lives = START_LIVES;

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
    this.input = new Input(this.container);

    this.burstEmitter = this.createBurstEmitter();
    this.proton.addEmitter(this.burstEmitter);
  }

  async init(): Promise<void> {
    await this.spriteManager.load();
    await this.audioManager.load();

    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;

    this.setupNewGame();

    window.addEventListener('resize', () => this.resize());

    // Unlock audio on first interaction.
    this.container.addEventListener('pointerdown', () => {
      this.audioManager.play('click');
    });

    requestAnimationFrame(() => this.update());
  }

  /** (Re)initialise paddle, ball, level and reset score/lives. */
  private setupNewGame(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.paddle = new Paddle(w, h);
    this.ball = new Ball(this.paddle);
    this.level = new Level();
    this.level.build(TOTAL_ROWS, TOTAL_COLS, w);

    this.score = 0;
    this.lives = START_LIVES;
    this.state = 'ready';
  }

  /** Particle burst emitter, reused for every brick break. */
  private createBurstEmitter(): Emitter {
    const emitter = new Emitter();
    emitter.rate = new Rate(new Span(8, 14), new Span(0.01));
    emitter.addInitialize(new Radius(2, 6));
    emitter.addInitialize(new Life(0.4, 0.8));
    emitter.addInitialize(new Velocity(6, new Span(0, 360), 'polar'));
    emitter.addBehaviour(new Color('#ffd166', '#ef476f'));
    emitter.addBehaviour(new Alpha(1, 0));
    return emitter;
  }

  private spawnBurst(x: number, y: number): void {
    this.burstEmitter.p.x = x;
    this.burstEmitter.p.y = y;
    this.burstEmitter.emit(1);
  }

  // ---- main loop -----------------------------------------------------------

  private update(): void {
    this.handleInput();

    if (this.state === 'playing') {
      this.updatePhysics();
    } else if (this.state === 'ready') {
      this.ball.followPaddle(this.paddle);
    }

    this.proton.update();
    this.draw();

    requestAnimationFrame(() => this.update());
  }

  private handleInput(): void {
    // Keyboard movement.
    if (this.input.left) this.paddle.moveLeft();
    if (this.input.right) this.paddle.moveRight();

    // Pointer movement (overrides if pointer has been used).
    if (this.input.pointerX !== null) {
      this.paddle.setCenterX(this.input.pointerX, this.canvas.width);
    }
    this.paddle.clamp(this.canvas.width);

    if (this.input.consumeLaunch()) {
      this.onLaunchRequested();
    }
  }

  private onLaunchRequested(): void {
    switch (this.state) {
      case 'ready':
        this.state = 'playing';
        this.ball.launch();
        break;
      case 'won':
      case 'gameover':
        this.setupNewGame();
        break;
    }
  }

  private updatePhysics(): void {
    this.ball.update();
    this.handleWallCollisions();
    this.handlePaddleCollision();
    this.handleBrickCollisions();
    this.checkBallLost();
    this.checkWin();
  }

  private handleWallCollisions(): void {
    const w = this.canvas.width;

    if (this.ball.left <= 0) {
      this.ball.x = this.ball.radius;
      this.ball.vx = Math.abs(this.ball.vx);
      this.audioManager.play('hit1');
    } else if (this.ball.right >= w) {
      this.ball.x = w - this.ball.radius;
      this.ball.vx = -Math.abs(this.ball.vx);
      this.audioManager.play('hit1');
    }

    if (this.ball.top <= 0) {
      this.ball.y = this.ball.radius;
      this.ball.vy = Math.abs(this.ball.vy);
      this.audioManager.play('hit1');
    }
  }

  private handlePaddleCollision(): void {
    const p = this.paddle;
    const ballMovingDown = this.ball.vy > 0;

    const overlapsX = this.ball.right >= p.x && this.ball.left <= p.x + p.width;
    const overlapsY =
      this.ball.bottom >= p.y && this.ball.top <= p.y + p.height;

    if (ballMovingDown && overlapsX && overlapsY) {
      // Reflect with angle depending on where it hit the paddle.
      const hitPos = (this.ball.x - p.centerX) / (p.width / 2); // -1 .. 1
      const maxAngle = (Math.PI / 3) * 1; // 60 deg max deflection
      const angle = hitPos * maxAngle;

      this.ball.vx = Math.sin(angle) * this.ball.speed;
      this.ball.vy = -Math.abs(Math.cos(angle) * this.ball.speed);
      this.ball.y = p.y - this.ball.radius;

      this.audioManager.play('hit2');
    }
  }

  private handleBrickCollisions(): void {
    for (const brick of this.level.bricks) {
      if (!brick.alive) continue;
      if (!this.intersectsBrick(brick)) continue;

      // Determine reflection axis by comparing penetration depths.
      const overlapLeft = this.ball.right - brick.left;
      const overlapRight = brick.right - this.ball.left;
      const overlapTop = this.ball.bottom - brick.top;
      const overlapBottom = brick.bottom - this.ball.top;
      const minOverlap = Math.min(
        overlapLeft,
        overlapRight,
        overlapTop,
        overlapBottom
      );

      if (minOverlap === overlapLeft || minOverlap === overlapRight) {
        this.ball.vx = -this.ball.vx;
      } else {
        this.ball.vy = -this.ball.vy;
      }

      brick.alive = false;
      this.score += brick.score;
      this.spawnBurst(brick.centerX, brick.centerY);
      this.audioManager.play('point');

      // Only handle one brick per frame to keep reflections sane.
      break;
    }
  }

  private intersectsBrick(brick: Brick): boolean {
    return (
      this.ball.right >= brick.left &&
      this.ball.left <= brick.right &&
      this.ball.bottom >= brick.top &&
      this.ball.top <= brick.bottom
    );
  }

  private checkBallLost(): void {
    if (this.ball.top > this.canvas.height) {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.state = 'gameover';
      } else {
        this.state = 'ready';
        this.ball.resetOnPaddle(this.paddle);
      }
    }
  }

  private checkWin(): void {
    if (this.level.remaining() === 0) {
      this.state = 'won';
      this.audioManager.play('win');
    }
  }

  // ---- rendering -----------------------------------------------------------

  private draw(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBricks();
    this.drawPaddle();
    this.drawBall();
    this.drawHud();
    this.drawOverlay();
  }

  private drawBricks(): void {
    for (const brick of this.level.bricks) {
      if (!brick.alive) continue;
      this.spriteManager.draw(
        this.ctx,
        brick.color,
        brick.x,
        brick.y,
        this.level.scale
      );
    }
  }

  private drawPaddle(): void {
    this.spriteManager.draw(
      this.ctx,
      'paddle-normal',
      this.paddle.x,
      this.paddle.y,
      1
    );
  }

  private drawBall(): void {
    this.spriteManager.draw(
      this.ctx,
      'ball',
      this.ball.x - this.ball.radius,
      this.ball.y - this.ball.radius,
      1
    );
  }

  private drawHud(): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#f5f7fb';
    ctx.font = '20px Segoe UI, system-ui, sans-serif';
    ctx.textBaseline = 'top';

    // Score (top-left).
    ctx.fillText(`Score: ${this.score}`, 16, 16);

    // Lives as hearts (top-right).
    const heartScale = 0.8;
    const heartW = 35 * heartScale;
    for (let i = 0; i < this.lives; i++) {
      const x = this.canvas.width - 16 - (i + 1) * (heartW + 6);
      this.spriteManager.draw(this.ctx, 'heart', x, 16, heartScale);
    }
    ctx.restore();
  }

  private drawOverlay(): void {
    if (this.state === 'playing') return;

    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(6, 18, 33, 0.55)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#f5f7fb';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    let title = '';
    let subtitle = '';
    switch (this.state) {
      case 'ready':
        title = 'FunBricks';
        subtitle = 'Press Space or Click to launch';
        break;
      case 'won':
        title = 'You Win!';
        subtitle = `Score: ${this.score} — Space / Click to play again`;
        break;
      case 'gameover':
        title = 'Game Over';
        subtitle = `Score: ${this.score} — Space / Click to retry`;
        break;
    }

    ctx.font = 'bold 48px Segoe UI, system-ui, sans-serif';
    ctx.fillText(title, cx, cy - 24);
    ctx.font = '20px Segoe UI, system-ui, sans-serif';
    ctx.fillStyle = '#9bb4d7';
    ctx.fillText(subtitle, cx, cy + 24);
    ctx.restore();
  }

  // ---- resize --------------------------------------------------------------

  private resize(): void {
    const { clientWidth, clientHeight } = this.container;
    this.canvas.width = clientWidth;
    this.canvas.height = clientHeight;

    // Rebuild the level to fit the new width and reposition entities.
    this.level.build(TOTAL_ROWS, TOTAL_COLS, clientWidth);
    this.paddle.reposition(clientWidth, clientHeight);
    if (!this.ball.launched) {
      this.ball.resetOnPaddle(this.paddle);
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  // Exposed for tests / debugging.
  getState(): GameState {
    return this.state;
  }
  getScore(): number {
    return this.score;
  }
}
