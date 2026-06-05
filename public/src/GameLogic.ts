import { Ball, Paddle, Brick } from './GameTypes';

export interface CollisionEvent {
  particlesRequested: boolean;
  x: number;
  y: number;
}

export class BallPhysics {
  private lastPaddleCollisionTime: number = 0;
  private lastBrickCollisionTime: number = 0;

  updateBallPosition(ball: Ball, deltaTime: number): void {
    ball.x += ball.vx * deltaTime;
    ball.y += ball.vy * deltaTime;
  }

  checkWallCollisions(ball: Ball, canvasWidth: number, canvasHeight: number): boolean {
    let ballFellOff = false;

    // Left wall collision
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx = Math.abs(ball.vx);
    }

    // Right wall collision
    if (ball.x + ball.radius > canvasWidth) {
      ball.x = canvasWidth - ball.radius;
      ball.vx = -Math.abs(ball.vx);
    }

    // Top wall collision
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy = Math.abs(ball.vy);
    }

    // Bottom - ball fell off (but don't bounce)
    if (ball.y - ball.radius > canvasHeight) {
      ballFellOff = true;
    }

    return ballFellOff;
  }

  checkPaddleCollision(ball: Ball, paddle: Paddle): CollisionEvent | null {
    // Ball bounding box
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;
    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;

    // Paddle bounding box
    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;

    // Check if ball overlaps paddle
    if (
      ballRight > paddleLeft &&
      ballLeft < paddleRight &&
      ballBottom > paddleTop &&
      ballTop < paddleBottom
    ) {
      // Ball hit paddle from above - reflect upward
      if (ball.vy > 0) {
        const now = Date.now();
        ball.y = paddleTop - ball.radius;
        ball.vy = -Math.abs(ball.vy);

        // Calculate new horizontal velocity based on where ball hit the paddle
        // Left side of paddle: ball goes left, right side: goes right
        const paddleCenter = paddle.x + paddle.width / 2;
        const hitOffset = ball.x - paddleCenter; // -32 to +32
        const maxVx = 3;
        ball.vx = (hitOffset / (paddle.width / 2)) * maxVx;

        // Prevent rapid-fire collision events
        if (now - this.lastPaddleCollisionTime > 100) {
          this.lastPaddleCollisionTime = now;
          return {
            particlesRequested: true,
            x: ball.x,
            y: paddleTop,
          };
        }
      }
    }
    return null;
  }

  checkBrickCollisions(ball: Ball, bricks: Brick[]): { score: number; collisions: CollisionEvent[] } {
    let scoreGained = 0;
    const collisions: CollisionEvent[] = [];

    for (const brick of bricks) {
      if (brick.destroyed) continue;

      // Ball bounding box
      const ballLeft = ball.x - ball.radius;
      const ballRight = ball.x + ball.radius;
      const ballTop = ball.y - ball.radius;
      const ballBottom = ball.y + ball.radius;

      // Brick bounding box
      const brickLeft = brick.x;
      const brickRight = brick.x + brick.width;
      const brickTop = brick.y;
      const brickBottom = brick.y + brick.height;

      // Check if ball overlaps brick
      if (
        ballRight > brickLeft &&
        ballLeft < brickRight &&
        ballBottom > brickTop &&
        ballTop < brickBottom
      ) {
        // Mark brick as destroyed
        brick.destroyed = true;
        scoreGained += 10;

        // Determine which side was hit and bounce accordingly
        // Calculate overlap on each side
        const overlapLeft = ballRight - brickLeft;
        const overlapRight = brickRight - ballLeft;
        const overlapTop = ballBottom - brickTop;
        const overlapBottom = brickBottom - ballTop;

        // Find the smallest overlap to determine the collision side
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapTop) {
          // Hit from top
          ball.y = brickTop - ball.radius;
          ball.vy = -Math.abs(ball.vy);
        } else if (minOverlap === overlapBottom) {
          // Hit from bottom
          ball.y = brickBottom + ball.radius;
          ball.vy = Math.abs(ball.vy);
        } else if (minOverlap === overlapLeft) {
          // Hit from left
          ball.x = brickLeft - ball.radius;
          ball.vx = -Math.abs(ball.vx);
        } else {
          // Hit from right
          ball.x = brickRight + ball.radius;
          ball.vx = Math.abs(ball.vx);
        }

        // Record collision event for particle emission
        const now = Date.now();
        if (now - this.lastBrickCollisionTime > 50) {
          this.lastBrickCollisionTime = now;
          collisions.push({
            particlesRequested: true,
            x: ball.x,
            y: ball.y,
          });
        }

        // Only handle one brick collision per frame
        break;
      }
    }

    return { score: scoreGained, collisions };
  }

  resetBall(paddle: Paddle): Ball {
    const ball: Ball = {
      x: paddle.x + paddle.width / 2,
      y: paddle.y - 20,
      vx: 2,
      vy: -3,
      radius: 8,
      sprite: 'ball',
    };
    return ball;
  }
}
