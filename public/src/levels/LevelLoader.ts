import { Brick } from '../entities/Brick';
import { BRICK_SPRITES, GAME_CONFIG } from '../config/constants';

export function buildLevel(containerWidth: number): Brick[] {
  const { rows, cols, brickWidth, brickHeight, gapX, gapY, topOffset } = GAME_CONFIG.level;
  const totalWidth = cols * brickWidth + (cols - 1) * gapX;
  const startX = Math.max(16, (containerWidth - totalWidth) / 2);
  const bricks: Brick[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * (brickWidth + gapX);
      const y = topOffset + row * (brickHeight + gapY);
      const sprite = BRICK_SPRITES[(row + col) % BRICK_SPRITES.length];
      const points = 50 + (rows - row) * 10;
      bricks.push(new Brick(x, y, brickWidth, brickHeight, sprite, points));
    }
  }

  return bricks;
}
