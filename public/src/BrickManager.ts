import { Brick } from './GameTypes';

export class BrickManager {
  constructor(private canvasWidth: number, private canvasHeight: number) {}

  createBrickGrid(): Brick[] {
    const bricks: Brick[] = [];

    const brickWidth = 64;
    const brickHeight = 32;
    const rows = 4;
    const cols = 8;
    const marginSides = 10;
    const marginTop = 60;
    const spaceBetweenBricks = 10;
    const verticalSpacing = 40;

    // Color cycle (8 colors as specified)
    const colors = [
      'brick-red',
      'brick-orange',
      'brick-yellow',
      'brick-green',
      'brick-cyan',
      'brick-blue',
      'brick-purple',
      'brick-magenta',
    ];

    // Calculate grid width and spacing between bricks
    const gridWidth = this.canvasWidth - marginSides * 2;
    const spaceBetweenBricksCalculated =
      (gridWidth - cols * brickWidth) / (cols - 1);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = marginSides + col * (brickWidth + spaceBetweenBricksCalculated);
        const y = marginTop + row * verticalSpacing;
        const colorIndex = (row * cols + col) % colors.length;

        bricks.push({
          x,
          y,
          width: brickWidth,
          height: brickHeight,
          color: colors[colorIndex],
          destroyed: false,
          sprite: colors[colorIndex],
        });
      }
    }

    return bricks;
  }

  getActiveBrickCount(bricks: Brick[]): number {
    return bricks.filter(brick => !brick.destroyed).length;
  }
}
