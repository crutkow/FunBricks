import { Paddle } from './Paddle';

export class Ball {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  radius: number;
  speed = 6;
  launched = false;

  // The 'ball' sprite is 42x42 in the sheet; rendered at scale 1.
  constructor(paddle: Paddle) {
    this.radius = 21;
    this.x = paddle.centerX;
    this.y = paddle.y - this.radius;
  }

  /** Sit the ball on top of the paddle, ready to launch. */
  resetOnPaddle(paddle: Paddle): void {
    this.launched = false;
    this.vx = 0;
    this.vy = 0;
    this.x = paddle.centerX;
    this.y = paddle.y - this.radius;
  }

  /** Launch the ball upward at a slight angle. */
  launch(): void {
    if (this.launched) return;
    this.launched = true;
    // Launch up-right with full speed.
    const angle = -Math.PI / 3; // 60 degrees above horizontal
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  update(): void {
    if (!this.launched) return;
    this.x += this.vx;
    this.y += this.vy;
  }

  /** Follow the paddle while waiting to launch. */
  followPaddle(paddle: Paddle): void {
    if (this.launched) return;
    this.x = paddle.centerX;
    this.y = paddle.y - this.radius;
  }

  get left(): number {
    return this.x - this.radius;
  }
  get right(): number {
    return this.x + this.radius;
  }
  get top(): number {
    return this.y - this.radius;
  }
  get bottom(): number {
    return this.y + this.radius;
  }
}
