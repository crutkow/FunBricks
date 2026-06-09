export class Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed = 9;

  // The sprite 'paddle-normal' is 170x48 in the sheet; we render at scale 1.
  constructor(canvasWidth: number, canvasHeight: number) {
    this.width = 170;
    this.height = 48;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight - this.height - 24;
  }

  /** Re-centre horizontally and pin to the bottom when the canvas resizes. */
  reposition(canvasWidth: number, canvasHeight: number): void {
    this.y = canvasHeight - this.height - 24;
    this.clamp(canvasWidth);
  }

  moveLeft(): void {
    this.x -= this.speed;
  }

  moveRight(): void {
    this.x += this.speed;
  }

  /** Centre the paddle on an absolute x (used for mouse/pointer control). */
  setCenterX(centerX: number, canvasWidth: number): void {
    this.x = centerX - this.width / 2;
    this.clamp(canvasWidth);
  }

  /** Keep the paddle within the play area. */
  clamp(canvasWidth: number): void {
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;
  }

  get centerX(): number {
    return this.x + this.width / 2;
  }
}
