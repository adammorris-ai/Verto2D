import { describe, it, expect, beforeEach } from 'vitest';
import { World } from '../ecs/world';
import { Entity } from '../ecs/entity';
import { getComponentType, resetComponentTypes } from '../ecs/components';
import { Vec2 } from '../core/math/vec2';
import {
  RigidBody,
  BodyType,
  createRigidBody,
  setMass,
} from '../physics/rigidBody';
import {
  Collider,
  ColliderType,
  ColliderComponent,
  createAABB,
  createCircle,
  checkOverlap,
  getColliderBounds,
} from '../physics/collider';
import { Broadphase } from '../physics/broadphase';
import { generateManifold } from '../physics/narrowphase';
import { resolveCollision, applyDamping, integrate } from '../physics/solver';
import { PhysicsWorld } from '../physics/physicsWorld';

describe('RigidBody', () => {
  it('should create rigid body', () => {
    const body = createRigidBody(BodyType.Dynamic);
    expect(body.type).toBe(BodyType.Dynamic);
    expect(body.mass).toBe(1);
    expect(body.invMass).toBe(1);
    expect(body.velocity.x).toBe(0);
    expect(body.velocity.y).toBe(0);
  });

  it('should create static body with zero mass', () => {
    const body = createRigidBody(BodyType.Static);
    expect(body.type).toBe(BodyType.Static);
    expect(body.mass).toBe(0);
    expect(body.invMass).toBe(0);
  });

  it('should set mass correctly', () => {
    const body = createRigidBody();
    setMass(body, 2);
    expect(body.mass).toBe(2);
    expect(body.invMass).toBe(0.5);
  });
});

describe('Colliders', () => {
  describe('AABB', () => {
    it('should create AABB collider', () => {
      const aabb = createAABB(32, 64);
      expect(aabb.type).toBe(ColliderType.AABB);
      expect(aabb.width).toBe(32);
      expect(aabb.height).toBe(64);
      expect(aabb.min.x).toBe(-16);
      expect(aabb.max.x).toBe(16);
    });

    it('should get AABB bounds', () => {
      const aabb = createAABB(32, 64);
      const position = new Vec2(10, 20);
      const bounds = getColliderBounds(aabb, position);

      expect(bounds.min.x).toBe(-6); // 10 - 16
      expect(bounds.max.x).toBe(26); // 10 + 16
      expect(bounds.min.y).toBe(-12); // 20 - 32
      expect(bounds.max.y).toBe(52); // 20 + 32
    });

    it('should detect AABB overlap', () => {
      const aabb1 = createAABB(32, 32);
      const aabb2 = createAABB(32, 32);
      const pos1 = new Vec2(0, 0);
      const pos2 = new Vec2(10, 10);

      expect(checkOverlap(aabb1, pos1, aabb2, pos2)).toBe(true);
    });

    it('should detect AABB non-overlap', () => {
      const aabb1 = createAABB(32, 32);
      const aabb2 = createAABB(32, 32);
      const pos1 = new Vec2(0, 0);
      const pos2 = new Vec2(50, 50);

      expect(checkOverlap(aabb1, pos1, aabb2, pos2)).toBe(false);
    });
  });

  describe('Circle', () => {
    it('should create circle collider', () => {
      const circle = createCircle(16);
      expect(circle.type).toBe(ColliderType.Circle);
      expect(circle.radius).toBe(16);
    });

    it('should get circle bounds', () => {
      const circle = createCircle(16);
      const position = new Vec2(10, 20);
      const bounds = getColliderBounds(circle, position);

      expect(bounds.min.x).toBe(-6); // 10 - 16
      expect(bounds.max.x).toBe(26); // 10 + 16
    });

    it('should detect circle overlap', () => {
      const circle1 = createCircle(16);
      const circle2 = createCircle(16);
      const pos1 = new Vec2(0, 0);
      const pos2 = new Vec2(20, 0);

      expect(checkOverlap(circle1, pos1, circle2, pos2)).toBe(true);
    });

    it('should detect circle non-overlap', () => {
      const circle1 = createCircle(16);
      const circle2 = createCircle(16);
      const pos1 = new Vec2(0, 0);
      const pos2 = new Vec2(50, 0);

      expect(checkOverlap(circle1, pos1, circle2, pos2)).toBe(false);
    });
  });

  describe('Mixed Types', () => {
    it('should detect AABB-Circle overlap', () => {
      const aabb = createAABB(32, 32);
      const circle = createCircle(16);
      const posAabb = new Vec2(0, 0);
      const posCircle = new Vec2(10, 10);

      expect(checkOverlap(aabb, posAabb, circle, posCircle)).toBe(true);
    });

    it('should detect AABB-Circle non-overlap', () => {
      const aabb = createAABB(32, 32);
      const circle = createCircle(16);
      const posAabb = new Vec2(0, 0);
      const posCircle = new Vec2(50, 50);

      expect(checkOverlap(aabb, posAabb, circle, posCircle)).toBe(false);
    });
  });
});

describe('Broadphase', () => {
  let broadphase: Broadphase;

  beforeEach(() => {
    broadphase = new Broadphase(100);
  });

  it('should find collision pairs', () => {
    const entities = [
      {
        entity: 1 as Entity,
        collider: createAABB(32, 32),
        position: new Vec2(0, 0),
      },
      {
        entity: 2 as Entity,
        collider: createAABB(32, 32),
        position: new Vec2(10, 10),
      },
      {
        entity: 3 as Entity,
        collider: createAABB(32, 32),
        position: new Vec2(200, 200), // Far away
      },
    ];

    const pairs = broadphase.findPairs(entities);
    expect(pairs.length).toBeGreaterThan(0);
    
    // Should find pair between entity 1 and 2, but not 3
    const hasPair12 = pairs.some(
      p => (p.entityA === 1 && p.entityB === 2) || (p.entityA === 2 && p.entityB === 1)
    );
    expect(hasPair12).toBe(true);
  });

  it('should handle empty entity list', () => {
    const pairs = broadphase.findPairs([]);
    expect(pairs.length).toBe(0);
  });
});

describe('Narrowphase', () => {
  it('should generate manifold for overlapping AABBs', () => {
    const pair = {
      entityA: 1 as Entity,
      entityB: 2 as Entity,
      colliderA: createAABB(32, 32),
      colliderB: createAABB(32, 32),
      positionA: new Vec2(0, 0),
      positionB: new Vec2(10, 0),
    };

    const manifold = generateManifold(pair);
    expect(manifold).not.toBeNull();
    expect(manifold!.penetration).toBeGreaterThan(0);
    expect(manifold!.contacts.length).toBeGreaterThan(0);
  });

  it('should return null for non-overlapping colliders', () => {
    const pair = {
      entityA: 1 as Entity,
      entityB: 2 as Entity,
      colliderA: createAABB(32, 32),
      colliderB: createAABB(32, 32),
      positionA: new Vec2(0, 0),
      positionB: new Vec2(100, 100),
    };

    const manifold = generateManifold(pair);
    expect(manifold).toBeNull();
  });

  it('should generate manifold for overlapping circles', () => {
    const pair = {
      entityA: 1 as Entity,
      entityB: 2 as Entity,
      colliderA: createCircle(16),
      colliderB: createCircle(16),
      positionA: new Vec2(0, 0),
      positionB: new Vec2(20, 0),
    };

    const manifold = generateManifold(pair);
    expect(manifold).not.toBeNull();
    expect(manifold!.penetration).toBeGreaterThan(0);
  });
});

describe('Solver', () => {
  it('should resolve collision between two dynamic bodies', () => {
    const bodyA = createRigidBody(BodyType.Dynamic);
    const bodyB = createRigidBody(BodyType.Dynamic);
    bodyA.velocity = new Vec2(10, 0);
    bodyB.velocity = new Vec2(-10, 0);

    const positionA = new Vec2(0, 0);
    const positionB = new Vec2(10, 0);

    const manifold = {
      entityA: 1 as Entity,
      entityB: 2 as Entity,
      contacts: [{
        point: new Vec2(5, 0),
        normal: new Vec2(1, 0),
        penetration: 5,
      }],
      normal: new Vec2(1, 0),
      penetration: 5,
    };

    resolveCollision(manifold, bodyA, bodyB, positionA, positionB);

    // Velocities should be reversed (simplified check)
    expect(bodyA.velocity.x).toBeLessThan(10);
    expect(bodyB.velocity.x).toBeGreaterThan(-10);
  });

  it('should not resolve collision between static bodies', () => {
    const bodyA = createRigidBody(BodyType.Static);
    const bodyB = createRigidBody(BodyType.Static);
    const positionA = new Vec2(0, 0);
    const positionB = new Vec2(10, 0);

    const manifold = {
      entityA: 1 as Entity,
      entityB: 2 as Entity,
      contacts: [],
      normal: new Vec2(1, 0),
      penetration: 5,
    };

    const posABefore = positionA.clone();
    const posBBefore = positionB.clone();

    resolveCollision(manifold, bodyA, bodyB, positionA, positionB);

    expect(positionA.equals(posABefore)).toBe(true);
    expect(positionB.equals(posBBefore)).toBe(true);
  });

  it('should apply damping', () => {
    const body = createRigidBody();
    body.velocity = new Vec2(10, 10);
    body.linearDamping = 0.5;

    applyDamping(body, 0.016);
    
    expect(body.velocity.length()).toBeLessThan(10 * Math.sqrt(2));
  });

  it('should integrate velocity to position', () => {
    const body = createRigidBody();
    body.velocity = new Vec2(10, 20);
    const position = new Vec2(0, 0);

    integrate(body, position, 0.016);

    expect(position.x).toBeCloseTo(0.16, 2);
    expect(position.y).toBeCloseTo(0.32, 2);
  });
});

describe('PhysicsWorld', () => {
  let world: World;
  let physicsWorld: PhysicsWorld;
  let RigidBodyType: ComponentType;
  let ColliderType: ComponentType;
  let PositionType: ComponentType;

  beforeEach(() => {
    resetComponentTypes();
    world = new World();
    RigidBodyType = getComponentType<RigidBody>();
    ColliderType = getComponentType<ColliderComponent>();
    PositionType = getComponentType<Vec2>();

    physicsWorld = new PhysicsWorld(world, RigidBodyType, ColliderType, PositionType);
  });

  it('should step physics simulation', () => {
    const entity = world.createEntity();
    const body = createRigidBody();
    const position = new Vec2(0, 0);
    const collider: ColliderComponent = {
      collider: createAABB(32, 32),
      isTrigger: false,
      enabled: true,
      layer: 0,
      mask: 0xFFFFFFFF,
    };

    body.velocity = new Vec2(10, 0);

    world.addComponent(entity, RigidBodyType, body);
    world.addComponent(entity, PositionType, position);
    world.addComponent(entity, ColliderType, collider);

    physicsWorld.step(0.016);

    expect(position.x).toBeGreaterThan(0);
  });

  it('should emit collision enter event', () => {
    const entity1 = world.createEntity();
    const entity2 = world.createEntity();

    const body1 = createRigidBody();
    const body2 = createRigidBody();
    const pos1 = new Vec2(0, 0);
    const pos2 = new Vec2(10, 0);
    const collider1: ColliderComponent = {
      collider: createAABB(32, 32),
      isTrigger: false,
      enabled: true,
      layer: 0,
      mask: 0xFFFFFFFF,
    };
    const collider2: ColliderComponent = {
      collider: createAABB(32, 32),
      isTrigger: false,
      enabled: true,
      layer: 0,
      mask: 0xFFFFFFFF,
    };

    world.addComponent(entity1, RigidBodyType, body1);
    world.addComponent(entity1, PositionType, pos1);
    world.addComponent(entity1, ColliderType, collider1);

    world.addComponent(entity2, RigidBodyType, body2);
    world.addComponent(entity2, PositionType, pos2);
    world.addComponent(entity2, ColliderType, collider2);

    let enterCount = 0;
    physicsWorld.onCollisionEnter(() => {
      enterCount++;
    });

    physicsWorld.step(0.016);

    expect(enterCount).toBe(1);
  });

  it('should emit collision exit event', () => {
    const entity1 = world.createEntity();
    const entity2 = world.createEntity();

    const body1 = createRigidBody();
    const body2 = createRigidBody();
    const pos1 = new Vec2(0, 0);
    const pos2 = new Vec2(10, 0); // Overlapping
    const collider1: ColliderComponent = {
      collider: createAABB(32, 32),
      isTrigger: false,
      enabled: true,
      layer: 0,
      mask: 0xFFFFFFFF,
    };
    const collider2: ColliderComponent = {
      collider: createAABB(32, 32),
      isTrigger: false,
      enabled: true,
      layer: 0,
      mask: 0xFFFFFFFF,
    };

    world.addComponent(entity1, RigidBodyType, body1);
    world.addComponent(entity1, PositionType, pos1);
    world.addComponent(entity1, ColliderType, collider1);

    world.addComponent(entity2, RigidBodyType, body2);
    world.addComponent(entity2, PositionType, pos2);
    world.addComponent(entity2, ColliderType, collider2);

    let exitCount = 0;
    physicsWorld.onCollisionExit(() => {
      exitCount++;
    });

    // First step - collision enter
    physicsWorld.step(0.016);

    // Move entities apart
    pos2.x = 100;
    pos2.y = 100;

    // Second step - collision exit
    physicsWorld.step(0.016);

    expect(exitCount).toBe(1);
  });

  it('should trigger collision enter exactly once', () => {
    const entity1 = world.createEntity();
    const entity2 = world.createEntity();

    const body1 = createRigidBody();
    const body2 = createRigidBody();
    const pos1 = new Vec2(0, 0);
    const pos2 = new Vec2(10, 0);
    const collider1: ColliderComponent = {
      collider: createAABB(32, 32),
      isTrigger: false,
      enabled: true,
      layer: 0,
      mask: 0xFFFFFFFF,
    };
    const collider2: ColliderComponent = {
      collider: createAABB(32, 32),
      isTrigger: false,
      enabled: true,
      layer: 0,
      mask: 0xFFFFFFFF,
    };

    world.addComponent(entity1, RigidBodyType, body1);
    world.addComponent(entity1, PositionType, pos1);
    world.addComponent(entity1, ColliderType, collider1);

    world.addComponent(entity2, RigidBodyType, body2);
    world.addComponent(entity2, PositionType, pos2);
    world.addComponent(entity2, ColliderType, collider2);

    let enterCount = 0;
    physicsWorld.onCollisionEnter(() => {
      enterCount++;
    });

    // Step multiple times while still colliding
    physicsWorld.step(0.016);
    physicsWorld.step(0.016);
    physicsWorld.step(0.016);

    expect(enterCount).toBe(1); // Should only trigger once
  });

  it('should resolve collisions deterministically', () => {
    const entity1 = world.createEntity();
    const entity2 = world.createEntity();

    const body1 = createRigidBody();
    const body2 = createRigidBody();
    body1.velocity = new Vec2(10, 0);
    body2.velocity = new Vec2(-10, 0);

    const pos1 = new Vec2(0, 0);
    const pos2 = new Vec2(10, 0);
    const collider1: ColliderComponent = {
      collider: createAABB(32, 32),
      isTrigger: false,
      enabled: true,
      layer: 0,
      mask: 0xFFFFFFFF,
    };
    const collider2: ColliderComponent = {
      collider: createAABB(32, 32),
      isTrigger: false,
      enabled: true,
      layer: 0,
      mask: 0xFFFFFFFF,
    };

    world.addComponent(entity1, RigidBodyType, body1);
    world.addComponent(entity1, PositionType, pos1);
    world.addComponent(entity1, ColliderType, collider1);

    world.addComponent(entity2, RigidBodyType, body2);
    world.addComponent(entity2, PositionType, pos2);
    world.addComponent(entity2, ColliderType, collider2);

    // Step multiple times
    for (let i = 0; i < 10; i++) {
      physicsWorld.step(0.016);
    }

    // Bodies should have separated
    expect(pos1.x).toBeLessThan(pos2.x);
  });

  it('should perform raycast', () => {
    const entity = world.createEntity();
    const body = createRigidBody(BodyType.Static);
    const position = new Vec2(50, 50);
    const collider: ColliderComponent = {
      collider: createCircle(16),
      isTrigger: false,
      enabled: true,
      layer: 0,
      mask: 0xFFFFFFFF,
    };

    world.addComponent(entity, RigidBodyType, body);
    world.addComponent(entity, PositionType, position);
    world.addComponent(entity, ColliderType, collider);

    const start = new Vec2(0, 50);
    const end = new Vec2(100, 50);

    const results = physicsWorld.raycast(start, end);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].entity).toBe(entity);
  });
});
