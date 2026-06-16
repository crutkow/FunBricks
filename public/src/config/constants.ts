export const GAME_CONFIG = {
  background: '#061221',
  paddle: {
    width: 140,
    height: 24,
    speed: 560,
    offsetFromBottom: 44,
  },
  ball: {
    radius: 11,
    speed: 420,
  },
  level: {
    rows: 5,
    cols: 6,
    brickWidth: 118,
    brickHeight: 59,
    gapX: 14,
    gapY: 10,
    topOffset: 56,
  },
  gameplay: {
    startingLives: 3,
  },
};

export const BRICK_SPRITES = [
  'brick-red',
  'brick-orange',
  'brick-yellow',
  'brick-green',
  'brick-cyan',
  'brick-blue',
  'brick-purple',
  'brick-magenta',
] as const;
