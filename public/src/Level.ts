import { Brick } from './entities/Brick';

const ROW_COLORS = [
  'brick-red',
  'brick-orange',
  'brick-yellow',
  'brick-green',
  'brick-cyan',
  'brick-blue',
  'brick-purple',
  'brick-magenta',
];

// Native brick sprite size in the sheet.
const BRICK_NATIVE_W = 118;
const BRICK_NATIVE_H = 59;

export class Level {
  bricks: Brick[] = [];

  /** Brick render scale, derived during build() so bricks fit the canvas. */
  scale = 0.7;

  /**
   * Build a grid of bricks that fits the canvas width.
   * Rows higher up are worth more points.
   */
  build(rows: number, cols: number, canvasWidth: number): void {
    this.bricks = [];

    const gap = 8;
    const sideMargin = 32;
    const topMargin = 60;

    const usableWidth = canvasWidth - sideMargin * 2 - gap * (cols - 1);
    const brickWidth = usableWidth / cols;
    this.scale = brickWidth / BRICK_NATIVE_W;
    const brickHeight = BRICK_NATIVE_H * this.scale;

    for (let row = 0; row < rows; row++) {
      const color = ROW_COLORS[row % ROW_COLORS.length];
      // Top rows are worth more.
      const score = (rows - row) * 10;
      for (let col = 0; col < cols; col++) {
        const x = sideMargin + col * (brickWidth + gap);
        const y = topMargin + row * (brickHeight + gap);
        this.bricks.push(
          new Brick(x, y, brickWidth, brickHeight, color, score)
        );
      }
    }
  }

  remaining(): number {
    let count = 0;
    for (const b of this.bricks) {
      if (b.alive) count++;
    }
    return count;
  }
}
