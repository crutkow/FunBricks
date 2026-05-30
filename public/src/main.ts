import { Game } from './Game';

const root = document.getElementById('game-root');
if (!root) {
  throw new Error('Game root element not found');
}

const game = new Game(root);
game.init().catch((err) => {
  console.error('Failed to initialize game:', err);
});

(window as any).game = game;
