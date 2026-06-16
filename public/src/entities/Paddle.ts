export class Paddle {
  x = 0;
  y = 0;

  constructor(
    public width: number,
    public height: number,
    public speed: number
  ) {}

  moveByAxis(axis: number, dt: number): void {
    this.x += axis * this.speed * dt;
  }

  moveToCenterX(centerX: number): void {
    this.x = centerX - this.width / 2;
  }

  clamp(maxWidth: number): void {
    this.x = Math.max(0, Math.min(maxWidth - this.width, this.x));
  }

  get centerX(): number {
    return this.x + this.width / 2;
  }
}
