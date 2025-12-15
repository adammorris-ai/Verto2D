/**
 * Physics World - manages physics simulation
 */

import { World } from '../ecs/world';
import { Entity } from '../ecs/entity';
import { ComponentType } from '../ecs/components';
import { Vec2 } from '../core/math/vec2';
import { RigidBody, BodyType } from './rigidBody';
import { ColliderComponent, Collider } from './collider';
import { Broadphase, CollisionPair } from './broadphase';
import { generateManifold, CollisionManifold } from './narrowphase';
import { resolveCollision, applyDamping, integrate } from './solver';
import { EventEmitter } from '../core/events';

export interface CollisionEvent {
  entityA: Entity;
  entityB: Entity;
  manifold: CollisionManifold;
}

export class PhysicsWorld {
  private world: World;
  private rigidBodyType: ComponentType;
  private colliderType: ComponentType;
  private positionType: ComponentType;
  private broadphase: Broadphase;
  private currentCollisions = new Map<string, CollisionManifold>(); // "entityA,entityB" -> manifold
  private events: EventEmitter<CollisionEvent>;

  constructor(
    world: World,
    rigidBodyType: ComponentType,
    colliderType: ComponentType,
    positionType: ComponentType
  ) {
    this.world = world;
    this.rigidBodyType = rigidBodyType;
    this.colliderType = colliderType;
    this.positionType = positionType;
    this.broadphase = new Broadphase(100);
    this.events = new EventEmitter();
  }

  /**
   * Step physics simulation
   */
  step(deltaTime: number): void {
    // Collect all physics entities
    const physicsEntities = this.collectPhysicsEntities();

    // Apply damping
    for (const entity of physicsEntities) {
      const body = this.world.getComponent<RigidBody>(entity.entity, this.rigidBodyType);
      if (body && body.enabled) {
        applyDamping(body, deltaTime);
      }
    }

    // Integrate velocities
    for (const entity of physicsEntities) {
      const body = this.world.getComponent<RigidBody>(entity.entity, this.rigidBodyType);
      const position = this.world.getComponent<Vec2>(entity.entity, this.positionType);
      if (body && position && body.enabled) {
        integrate(body, position, deltaTime);
      }
    }

    // Detect collisions
    const pairs = this.broadphase.findPairs(physicsEntities);
    const newCollisions = new Map<string, CollisionManifold>();

    for (const pair of pairs) {
      const manifold = generateManifold(pair);
      if (!manifold) continue;

      const key = this.getCollisionKey(pair.entityA, pair.entityB);
      newCollisions.set(key, manifold);

      // Check if this is a new collision
      const wasColliding = this.currentCollisions.has(key);
      if (!wasColliding) {
        // Collision enter event
        this.events.emit('collisionEnter', {
          entityA: pair.entityA,
          entityB: pair.entityB,
          manifold,
        });
      }

      // Resolve collision
      const bodyA = this.world.getComponent<RigidBody>(pair.entityA, this.rigidBodyType);
      const bodyB = this.world.getComponent<RigidBody>(pair.entityB, this.rigidBodyType);
      const posA = this.world.getComponent<Vec2>(pair.entityA, this.positionType);
      const posB = this.world.getComponent<Vec2>(pair.entityB, this.positionType);

      if (bodyA && bodyB && posA && posB) {
        const colliderA = this.world.getComponent<ColliderComponent>(pair.entityA, this.colliderType);
        const colliderB = this.world.getComponent<ColliderComponent>(pair.entityB, this.colliderType);

        // Skip resolution for triggers
        if (!colliderA?.isTrigger && !colliderB?.isTrigger) {
          resolveCollision(manifold, bodyA, bodyB, posA, posB);
        }
      }
    }

    // Check for collision exit
    for (const [key, manifold] of this.currentCollisions.entries()) {
      if (!newCollisions.has(key)) {
        // Collision exit event
        this.events.emit('collisionExit', {
          entityA: manifold.entityA,
          entityB: manifold.entityB,
          manifold,
        });
      }
    }

    this.currentCollisions = newCollisions;
  }

  /**
   * Collect all entities with physics components
   */
  private collectPhysicsEntities(): Array<{
    entity: Entity;
    collider: Collider;
    position: Vec2;
  }> {
    const entities: Array<{
      entity: Entity;
      collider: Collider;
      position: Vec2;
    }> = [];

    // Query entities with collider and position
    const query = this.world['getComponentStore'](this.colliderType);
    if (!query) return entities;

    for (const entity of query.getAllEntities()) {
      const colliderComp = this.world.getComponent<ColliderComponent>(entity, this.colliderType);
      const position = this.world.getComponent<Vec2>(entity, this.positionType);

      if (colliderComp && colliderComp.enabled && position) {
        entities.push({
          entity,
          collider: colliderComp.collider,
          position,
        });
      }
    }

    return entities;
  }

  /**
   * Get collision key for pair
   */
  private getCollisionKey(entityA: Entity, entityB: Entity): string {
    const min = Math.min(entityA, entityB);
    const max = Math.max(entityA, entityB);
    return `${min},${max}`;
  }

  /**
   * Subscribe to collision events
   */
  onCollisionEnter(handler: (event: CollisionEvent) => void): () => void {
    return this.events.on('collisionEnter', handler);
  }

  /**
   * Subscribe to collision exit events
   */
  onCollisionExit(handler: (event: CollisionEvent) => void): () => void {
    return this.events.on('collisionExit', handler);
  }

  /**
   * Raycast (simple implementation)
   */
  raycast(
    start: Vec2,
    end: Vec2,
    layer?: number
  ): Array<{ entity: Entity; point: Vec2; normal: Vec2 }> {
    const results: Array<{ entity: Entity; point: Vec2; normal: Vec2 }> = [];
    const physicsEntities = this.collectPhysicsEntities();

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const dir = new Vec2(dx / length, dy / length);

    for (const { entity, collider, position } of physicsEntities) {
      const colliderComp = this.world.getComponent<ColliderComponent>(entity, this.colliderType);
      if (layer !== undefined && colliderComp && colliderComp.layer !== layer) {
        continue;
      }

      const hit = this.raycastAgainstCollider(start, dir, length, collider, position);
      if (hit) {
        results.push({
          entity,
          point: hit.point,
          normal: hit.normal,
        });
      }
    }

    return results.sort((a, b) => {
      const distA = start.distanceSq(a.point);
      const distB = start.distanceSq(b.point);
      return distA - distB;
    });
  }

  /**
   * Raycast against a single collider
   */
  private raycastAgainstCollider(
    start: Vec2,
    dir: Vec2,
    maxDistance: number,
    collider: Collider,
    position: Vec2
  ): { point: Vec2; normal: Vec2 } | null {
    if (collider.type === 'circle') {
      // Circle raycast
      const toCircle = position.clone().sub(start);
      const projectionLength = toCircle.dot(dir);
      
      if (projectionLength < 0 || projectionLength > maxDistance) {
        return null;
      }

      const closestPoint = start.clone();
      closestPoint.add(dir.clone().mulScalar(projectionLength));
      const distanceToCenter = closestPoint.distance(position);

      if (distanceToCenter <= collider.radius) {
        const normal = closestPoint.clone().sub(position);
        normal.normalize();
        return { point: closestPoint, normal };
      }
    } else {
      // AABB raycast (simplified)
      const bounds = this.getColliderBounds(collider, position);
      const hit = this.raycastAABB(start, dir, maxDistance, bounds.min, bounds.max);
      if (hit) {
        return hit;
      }
    }

    return null;
  }

  /**
   * Get collider bounds
   */
  private getColliderBounds(collider: Collider, position: Vec2): { min: Vec2; max: Vec2 } {
    if (collider.type === 'aabb') {
      return {
        min: position.clone().add(collider.min),
        max: position.clone().add(collider.max),
      };
    } else {
      return {
        min: new Vec2(position.x - collider.radius, position.y - collider.radius),
        max: new Vec2(position.x + collider.radius, position.y + collider.radius),
      };
    }
  }

  /**
   * Raycast against AABB
   */
  private raycastAABB(
    start: Vec2,
    dir: Vec2,
    maxDistance: number,
    min: Vec2,
    max: Vec2
  ): { point: Vec2; normal: Vec2 } | null {
    // Simplified AABB raycast
    let tMin = 0;
    let tMax = maxDistance;
    let normal = new Vec2(0, 0);

    for (let i = 0; i < 2; i++) {
      const invD = 1 / (i === 0 ? dir.x : dir.y);
      let t0 = (i === 0 ? min.x : min.y - (i === 0 ? start.x : start.y)) * invD;
      let t1 = (i === 0 ? max.x : max.y - (i === 0 ? start.x : start.y)) * invD;

      if (invD < 0) {
        [t0, t1] = [t1, t0];
      }

      tMin = Math.max(tMin, t0);
      tMax = Math.min(tMax, t1);

      if (tMin <= tMax) {
        if (t0 > tMin) {
          normal = i === 0 ? new Vec2(-1, 0) : new Vec2(0, -1);
        }
      } else {
        return null;
      }
    }

    if (tMin > maxDistance) {
      return null;
    }

    const point = start.clone();
    point.add(dir.clone().mulScalar(tMin));
    return { point, normal };
  }
}
