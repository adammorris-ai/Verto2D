/**
 * Collider shapes and definitions
 */

import { Vec2 } from '../core/math/vec2';

export enum ColliderType {
  AABB = 'aabb',
  Circle = 'circle',
}

export interface AABBCollider {
  type: ColliderType.AABB;
  min: Vec2;
  max: Vec2;
  width: number;
  height: number;
}

export interface CircleCollider {
  type: ColliderType.Circle;
  center: Vec2;
  radius: number;
}

export type Collider = AABBCollider | CircleCollider;

export interface ColliderComponent {
  collider: Collider;
  isTrigger: boolean;
  enabled: boolean;
  layer: number; // Collision layer
  mask: number; // Collision mask (which layers this collider interacts with)
}

/**
 * Create AABB collider
 */
export function createAABB(width: number, height: number): AABBCollider {
  const halfWidth = width * 0.5;
  const halfHeight = height * 0.5;
  return {
    type: ColliderType.AABB,
    min: new Vec2(-halfWidth, -halfHeight),
    max: new Vec2(halfWidth, halfHeight),
    width,
    height,
  };
}

/**
 * Create circle collider
 */
export function createCircle(radius: number): CircleCollider {
  return {
    type: ColliderType.Circle,
    center: Vec2.zero(),
    radius,
  };
}

/**
 * Get AABB bounds for a collider at a position
 */
export function getColliderBounds(
  collider: Collider,
  position: Vec2,
  _rotation: number = 0
): { min: Vec2; max: Vec2 } {
  if (collider.type === ColliderType.AABB) {
    // For AABB, rotation is ignored for simplicity (axis-aligned)
    const aabb = collider as AABBCollider;
    const min = position.clone();
    min.add(aabb.min);
    const max = position.clone();
    max.add(aabb.max);
    return { min, max };
  } else {
    // Circle bounds
    const circle = collider as CircleCollider;
    const min = new Vec2(
      position.x - circle.radius,
      position.y - circle.radius
    );
    const max = new Vec2(
      position.x + circle.radius,
      position.y + circle.radius
    );
    return { min, max };
  }
}

/**
 * Check if two colliders overlap
 */
export function checkOverlap(
  colliderA: Collider,
  positionA: Vec2,
  colliderB: Collider,
  positionB: Vec2
): boolean {
  if (colliderA.type === ColliderType.AABB && colliderB.type === ColliderType.AABB) {
    return checkAABBOverlap(
      colliderA,
      positionA,
      colliderB,
      positionB
    );
  } else if (colliderA.type === ColliderType.Circle && colliderB.type === ColliderType.Circle) {
    return checkCircleOverlap(
      colliderA,
      positionA,
      colliderB,
      positionB
    );
  } else {
    // Mixed types - convert AABB to circle approximation or use more complex check
    if (colliderA.type === ColliderType.AABB) {
      return checkAABBCircleOverlap(
        colliderA as AABBCollider,
        positionA,
        colliderB as CircleCollider,
        positionB
      );
    } else {
      return checkAABBCircleOverlap(
        colliderB as AABBCollider,
        positionB,
        colliderA as CircleCollider,
        positionA
      );
    }
  }
}

function checkAABBOverlap(
  a: AABBCollider,
  posA: Vec2,
  b: AABBCollider,
  posB: Vec2
): boolean {
  const aMin = posA.clone().add(a.min);
  const aMax = posA.clone().add(a.max);
  const bMin = posB.clone().add(b.min);
  const bMax = posB.clone().add(b.max);

  return (
    aMin.x < bMax.x &&
    aMax.x > bMin.x &&
    aMin.y < bMax.y &&
    aMax.y > bMin.y
  );
}

function checkCircleOverlap(
  a: CircleCollider,
  posA: Vec2,
  b: CircleCollider,
  posB: Vec2
): boolean {
  const dx = posB.x - posA.x;
  const dy = posB.y - posA.y;
  const distanceSq = dx * dx + dy * dy;
  const radiusSum = a.radius + b.radius;
  return distanceSq < radiusSum * radiusSum;
}

function checkAABBCircleOverlap(
  aabb: AABBCollider,
  posA: Vec2,
  circle: CircleCollider,
  posB: Vec2
): boolean {
  const aabbMin = posA.clone().add(aabb.min);
  const aabbMax = posA.clone().add(aabb.max);
  
  // Find closest point on AABB to circle center
  const closestX = Math.max(aabbMin.x, Math.min(posB.x, aabbMax.x));
  const closestY = Math.max(aabbMin.y, Math.min(posB.y, aabbMax.y));
  
  const dx = posB.x - closestX;
  const dy = posB.y - closestY;
  const distanceSq = dx * dx + dy * dy;
  
  return distanceSq < circle.radius * circle.radius;
}
