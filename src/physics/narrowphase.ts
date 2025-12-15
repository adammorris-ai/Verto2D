/**
 * Narrowphase collision detection - detailed collision info
 */

import { Vec2 } from '../core/math/vec2';
import { ColliderType, checkOverlap } from './collider';
import { CollisionPair } from './broadphase';

export interface Contact {
  point: Vec2;
  normal: Vec2;
  penetration: number;
}

export interface CollisionManifold {
  entityA: number;
  entityB: number;
  contacts: Contact[];
  normal: Vec2;
  penetration: number;
}

/**
 * Generate collision manifold from collision pair
 */
export function generateManifold(pair: CollisionPair): CollisionManifold | null {
  if (!checkOverlap(pair.colliderA, pair.positionA, pair.colliderB, pair.positionB)) {
    return null;
  }

  // Simple manifold generation
  // For AABB-AABB, calculate overlap and normal
  if (pair.colliderA.type === ColliderType.AABB && pair.colliderB.type === ColliderType.AABB) {
    return generateAABBManifold(pair);
  }

  // For Circle-Circle
  if (pair.colliderA.type === ColliderType.Circle && pair.colliderB.type === ColliderType.Circle) {
    return generateCircleManifold(pair);
  }

  // Mixed types
  if (pair.colliderA.type === ColliderType.AABB) {
    return generateAABBCircleManifold(pair);
  } else {
    return generateCircleAABBManifold(pair);
  }
}

function generateAABBManifold(pair: CollisionPair): CollisionManifold {
  const a = pair.colliderA as import('./collider').AABBCollider;
  const b = pair.colliderB as import('./collider').AABBCollider;

  const aMin = pair.positionA.clone().add(a.min);
  const aMax = pair.positionA.clone().add(a.max);
  const bMin = pair.positionB.clone().add(b.min);
  const bMax = pair.positionB.clone().add(b.max);

  // Calculate overlap
  const overlapX = Math.min(aMax.x - bMin.x, bMax.x - aMin.x);
  const overlapY = Math.min(aMax.y - bMin.y, bMax.y - aMin.y);

  // Choose smallest overlap axis
  let normal: Vec2;
  let penetration: number;

  if (overlapX < overlapY) {
    penetration = overlapX;
    normal = new Vec2(
      pair.positionA.x < pair.positionB.x ? -1 : 1,
      0
    );
  } else {
    penetration = overlapY;
    normal = new Vec2(
      0,
      pair.positionA.y < pair.positionB.y ? -1 : 1
    );
  }

  // Contact point (center of overlap)
  const contactX = (Math.max(aMin.x, bMin.x) + Math.min(aMax.x, bMax.x)) * 0.5;
  const contactY = (Math.max(aMin.y, bMin.y) + Math.min(aMax.y, bMax.y)) * 0.5;

  return {
    entityA: pair.entityA,
    entityB: pair.entityB,
    contacts: [{
      point: new Vec2(contactX, contactY),
      normal: normal.clone(),
      penetration,
    }],
    normal,
    penetration,
  };
}

function generateCircleManifold(pair: CollisionPair): CollisionManifold {
  const a = pair.colliderA as import('./collider').CircleCollider;
  const b = pair.colliderB as import('./collider').CircleCollider;

  const dx = pair.positionB.x - pair.positionA.x;
  const dy = pair.positionB.y - pair.positionA.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    // Circles are exactly overlapping
    return {
      entityA: pair.entityA,
      entityB: pair.entityB,
      contacts: [{
        point: pair.positionA.clone(),
        normal: new Vec2(1, 0),
        penetration: a.radius + b.radius,
      }],
      normal: new Vec2(1, 0),
      penetration: a.radius + b.radius,
    };
  }

  const normal = new Vec2(dx / distance, dy / distance);
  const penetration = a.radius + b.radius - distance;

  // Contact point on surface of circle A
  const contactPoint = pair.positionA.clone();
  contactPoint.add(normal.clone().mulScalar(a.radius));

  return {
    entityA: pair.entityA,
    entityB: pair.entityB,
    contacts: [{
      point: contactPoint,
      normal: normal.clone(),
      penetration,
    }],
    normal,
    penetration,
  };
}

function generateAABBCircleManifold(pair: CollisionPair): CollisionManifold {
  const aabb = pair.colliderA as import('./collider').AABBCollider;
  const circle = pair.colliderB as import('./collider').CircleCollider;

  const aabbMin = pair.positionA.clone().add(aabb.min);
  const aabbMax = pair.positionA.clone().add(aabb.max);

  // Find closest point on AABB to circle center
  const closestX = Math.max(aabbMin.x, Math.min(pair.positionB.x, aabbMax.x));
  const closestY = Math.max(aabbMin.y, Math.min(pair.positionB.y, aabbMax.y));

  const dx = pair.positionB.x - closestX;
  const dy = pair.positionB.y - closestY;
  const distanceSq = dx * dx + dy * dy;

  if (distanceSq >= circle.radius * circle.radius) {
    // Not overlapping (shouldn't happen, but safety check)
    return {
      entityA: pair.entityA,
      entityB: pair.entityB,
      contacts: [],
      normal: Vec2.zero(),
      penetration: 0,
    };
  }

  const distance = Math.sqrt(distanceSq);
  const penetration = circle.radius - distance;

  let normal: Vec2;
  if (distance === 0) {
    // Circle center is inside AABB - push out along shortest axis
    const distToMinX = pair.positionB.x - aabbMin.x;
    const distToMaxX = aabbMax.x - pair.positionB.x;
    const distToMinY = pair.positionB.y - aabbMin.y;
    const distToMaxY = aabbMax.y - pair.positionB.y;

    const minDist = Math.min(distToMinX, distToMaxX, distToMinY, distToMaxY);
    if (minDist === distToMinX) {
      normal = new Vec2(-1, 0);
    } else if (minDist === distToMaxX) {
      normal = new Vec2(1, 0);
    } else if (minDist === distToMinY) {
      normal = new Vec2(0, -1);
    } else {
      normal = new Vec2(0, 1);
    }
  } else {
    normal = new Vec2(-dx / distance, -dy / distance);
  }

  return {
    entityA: pair.entityA,
    entityB: pair.entityB,
    contacts: [{
      point: new Vec2(closestX, closestY),
      normal: normal.clone(),
      penetration,
    }],
    normal,
    penetration,
  };
}

function generateCircleAABBManifold(pair: CollisionPair): CollisionManifold {
  // Swap entities and generate, then swap back
  const swappedPair: CollisionPair = {
    entityA: pair.entityB,
    entityB: pair.entityA,
    colliderA: pair.colliderB,
    colliderB: pair.colliderA,
    positionA: pair.positionB,
    positionB: pair.positionA,
  };

  const manifold = generateAABBCircleManifold(swappedPair);
  if (!manifold) return null!;

  // Swap back and negate normal
  return {
    entityA: pair.entityA,
    entityB: pair.entityB,
    contacts: manifold.contacts.map(c => ({
      ...c,
      normal: c.normal.mulScalar(-1),
    })),
    normal: manifold.normal.mulScalar(-1),
    penetration: manifold.penetration,
  };
}
