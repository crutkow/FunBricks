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

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private proton: Proton;
  private emitter: Emitter;
  private renderer: CanvasRenderer;
  private spriteManager: SpriteManager;
  private audioManager: AudioManager;

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

    this.emitter = this.createEmitter();
    this.proton.addEmitter(this.emitter);
  }

  async init(): Promise<void> {
    await this.spriteManager.load();
    await this.audioManager.load();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    // Start emitting particles
    this.emitter.emit(10);

    // Play a click sound on user interaction (unlocks audio on many browsers)
    this.container.addEventListener(
      'click',
      () => {
        this.audioManager.play('click');
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

  private update(): void {
    // Update and render particles first
    this.proton.update();

    // Then draw sprites on top
    this.drawGameSprites();

    requestAnimationFrame(() => this.update());
  }

  private drawGameSprites(): void {
    const { clientWidth, clientHeight } = this.container;

    // Draw a few sample bricks in a grid
    const brickColors = [
      'brick-red',
      'brick-orange',
      'brick-yellow',
      'brick-green',
      'brick-cyan',
      'brick-blue',
    ];
    const startY = 40;
    const startX = 40;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const colorIndex = (row * 3 + col) % brickColors.length;
        const color = brickColors[colorIndex];
        const x = startX + col * 80;
        const y = startY + row * 50;
        this.spriteManager.draw(this.ctx, color, x, y, 0.8);
      }
    }

    // Draw the paddle at the bottom
    const paddleX = clientWidth / 2 - 32;
    const paddleY = clientHeight - 40;
    this.spriteManager.draw(this.ctx, 'paddle-normal', paddleX, paddleY, 1);

    // Draw a ball
    const ballX = clientWidth / 2 - 8;
    const ballY = clientHeight / 2;
    this.spriteManager.draw(this.ctx, 'ball', ballX, ballY, 1.5);

    // Draw a heart
    this.spriteManager.draw(this.ctx, 'heart', 20, 20, 1.5);
  }

  private resize(): void {
    const { clientWidth, clientHeight } = this.container;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = clientWidth;
    this.canvas.height = clientHeight;

    if (this.emitter) {
      this.emitter.p.x = clientWidth / 2;
      this.emitter.p.y = clientHeight / 2;
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
