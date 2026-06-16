import { Paddle } from './Paddle';

export class Ball {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  attached = true;

  constructor(public radius: number, public speed: number) {}

  attachToPaddle(paddle: Paddle): void {
    this.attached = true;
    this.x = paddle.centerX;
    this.y = paddle.y - this.radius - 2;
    this.vx = 0;
    this.vy = 0;
  }

  launch(): void {
    if (!this.attached) return;
    this.attached = false;
    this.vx = this.speed * 0.45;
    this.vy = -this.speed;
  }

  update(dt: number): void {
    if (this.attached) return;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
}
