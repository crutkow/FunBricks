export type GameStatus = 'ready' | 'playing' | 'paused' | 'won' | 'lost';

export interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  level: number;
}
