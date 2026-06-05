export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  sprite: string;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  sprite: string;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  destroyed: boolean;
  sprite: string;
}

export type GameStateValue = 'menu' | 'playing' | 'gameover' | 'win';

export interface GameState {
  ball: Ball;
  paddle: Paddle;
  bricks: Brick[];
  score: number;
  lives: number;
  gameState: GameStateValue;
}
