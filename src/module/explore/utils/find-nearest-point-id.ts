import { type ScatterPoint } from '../types/scatter-point';

const HIT_RADIUS = 12;

interface HitTestInput {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

function findNearestPointId(
  points: readonly ScatterPoint[],
  { x, y, width, height }: HitTestInput,
  axisMax: number,
): string | null {
  let nearestId: string | null = null;
  let nearestDistanceSquared = HIT_RADIUS ** 2;

  for (const point of points) {
    const dx = x - (point.efficiency / axisMax) * width;
    const dy = y - (1 - point.quality / axisMax) * height;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared <= nearestDistanceSquared) {
      nearestId = point.id;
      nearestDistanceSquared = distanceSquared;
    }
  }

  return nearestId;
}

export { findNearestPointId };
