export class Brick {
  alive = true;

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public sprite: string,
    public points: number = 100
  ) {}
}
