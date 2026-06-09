export class Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  alive = true;
  score: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    score = 10
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.score = score;
  }

  get left(): number {
    return this.x;
  }
  get right(): number {
    return this.x + this.width;
  }
  get top(): number {
    return this.y;
  }
  get bottom(): number {
    return this.y + this.height;
  }
  get centerX(): number {
    return this.x + this.width / 2;
  }
  get centerY(): number {
    return this.y + this.height / 2;
  }
}
