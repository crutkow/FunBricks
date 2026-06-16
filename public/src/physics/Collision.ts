export interface CollisionResult {
  hit: boolean;
  normalX: number;
  normalY: number;
}

export function circleRectCollision(
  cx: number,
  cy: number,
  radius: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): CollisionResult {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  const distanceSq = dx * dx + dy * dy;

  if (distanceSq > radius * radius) {
    return { hit: false, normalX: 0, normalY: 0 };
  }

  if (distanceSq > 0.0001) {
    const dist = Math.sqrt(distanceSq);
    return {
      hit: true,
      normalX: dx / dist,
      normalY: dy / dist,
    };
  }

  const leftPen = Math.abs(cx - rx);
  const rightPen = Math.abs(rx + rw - cx);
  const topPen = Math.abs(cy - ry);
  const bottomPen = Math.abs(ry + rh - cy);
  const minPen = Math.min(leftPen, rightPen, topPen, bottomPen);

  if (minPen === leftPen) return { hit: true, normalX: -1, normalY: 0 };
  if (minPen === rightPen) return { hit: true, normalX: 1, normalY: 0 };
  if (minPen === topPen) return { hit: true, normalX: 0, normalY: -1 };
  return { hit: true, normalX: 0, normalY: 1 };
}

export function reflectVector(
  vx: number,
  vy: number,
  nx: number,
  ny: number
): { vx: number; vy: number } {
  const dot = vx * nx + vy * ny;
  return {
    vx: vx - 2 * dot * nx,
    vy: vy - 2 * dot * ny,
  };
}
