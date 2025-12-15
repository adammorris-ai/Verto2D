import { describe, it, expect, beforeEach } from 'vitest';
import { World } from '../ecs/world';
import { Entity, NULL_ENTITY } from '../ecs/entity';
import { getComponentType, resetComponentTypes, ComponentStore } from '../ecs/components';
import { Query } from '../ecs/queries';
import { SystemManager } from '../ecs/systems';
import { EntityError } from '../core/errors';

// Test components
interface Position {
  x: number;
  y: number;
}

interface Velocity {
  vx: number;
  vy: number;
}

interface Health {
  hp: number;
  maxHp: number;
}

describe('ECS World', () => {
  let world: World;
  let PositionType: number;
  let VelocityType: number;
  let HealthType: number;

  beforeEach(() => {
    world = new World();
    resetComponentTypes();
    PositionType = getComponentType<Position>();
    VelocityType = getComponentType<Velocity>();
    HealthType = getComponentType<Health>();
  });

  describe('Entity Lifecycle', () => {
    it('should create entities', () => {
      const e1 = world.createEntity();
      const e2 = world.createEntity();
      expect(e1).toBeGreaterThan(0);
      expect(e2).toBeGreaterThan(e1);
      expect(world.getEntityCount()).toBe(2);
    });

    it('should destroy entities', () => {
      const e1 = world.createEntity();
      const e2 = world.createEntity();
      world.destroyEntity(e1);
      expect(world.hasEntity(e1)).toBe(false);
      expect(world.hasEntity(e2)).toBe(true);
      expect(world.getEntityCount()).toBe(1);
    });

    it('should not destroy NULL_ENTITY', () => {
      expect(() => world.destroyEntity(NULL_ENTITY)).toThrow(EntityError);
    });

    it('should clear all entities', () => {
      world.createEntity();
      world.createEntity();
      world.clear();
      expect(world.getEntityCount()).toBe(0);
    });
  });

  describe('Components', () => {
    it('should add components', () => {
      const entity = world.createEntity();
      const pos: Position = { x: 10, y: 20 };
      world.addComponent(entity, PositionType, pos);
      
      const retrieved = world.getComponent<Position>(entity, PositionType);
      expect(retrieved).toEqual(pos);
    });

    it('should check if entity has component', () => {
      const entity = world.createEntity();
      expect(world.hasComponent(entity, PositionType)).toBe(false);
      
      world.addComponent(entity, PositionType, { x: 0, y: 0 });
      expect(world.hasComponent(entity, PositionType)).toBe(true);
    });

    it('should remove components', () => {
      const entity = world.createEntity();
      world.addComponent(entity, PositionType, { x: 0, y: 0 });
      expect(world.hasComponent(entity, PositionType)).toBe(true);
      
      world.removeComponent(entity, PositionType);
      expect(world.hasComponent(entity, PositionType)).toBe(false);
    });

    it('should not add component to non-existent entity', () => {
      const fakeEntity = 999 as Entity;
      expect(() => {
        world.addComponent(fakeEntity, PositionType, { x: 0, y: 0 });
      }).toThrow(EntityError);
    });

    it('should destroy components when entity is destroyed', () => {
      const entity = world.createEntity();
      world.addComponent(entity, PositionType, { x: 0, y: 0 });
      world.addComponent(entity, VelocityType, { vx: 1, vy: 1 });
      
      world.destroyEntity(entity);
      
      expect(world.hasComponent(entity, PositionType)).toBe(false);
      expect(world.hasComponent(entity, VelocityType)).toBe(false);
    });

    it('should handle multiple components per entity', () => {
      const entity = world.createEntity();
      world.addComponent(entity, PositionType, { x: 10, y: 20 });
      world.addComponent(entity, VelocityType, { vx: 1, vy: 2 });
      world.addComponent(entity, HealthType, { hp: 100, maxHp: 100 });
      
      expect(world.getComponent<Position>(entity, PositionType)?.x).toBe(10);
      expect(world.getComponent<Velocity>(entity, VelocityType)?.vx).toBe(1);
      expect(world.getComponent<Health>(entity, HealthType)?.hp).toBe(100);
    });
  });

  describe('Queries', () => {
    it('should query entities with single component', () => {
      const e1 = world.createEntity();
      const e2 = world.createEntity();
      const e3 = world.createEntity();
      
      world.addComponent(e1, PositionType, { x: 0, y: 0 });
      world.addComponent(e2, PositionType, { x: 1, y: 1 });
      
      const query = new Query(world);
      const result = query.with(PositionType);
      
      expect(result.count()).toBe(2);
      expect(result.toArray()).toContain(e1);
      expect(result.toArray()).toContain(e2);
      expect(result.toArray()).not.toContain(e3);
    });

    it('should query entities with multiple components', () => {
      const e1 = world.createEntity();
      const e2 = world.createEntity();
      const e3 = world.createEntity();
      
      world.addComponent(e1, PositionType, { x: 0, y: 0 });
      world.addComponent(e1, VelocityType, { vx: 1, vy: 1 });
      
      world.addComponent(e2, PositionType, { x: 1, y: 1 });
      // e2 missing Velocity
      
      world.addComponent(e3, PositionType, { x: 2, y: 2 });
      world.addComponent(e3, VelocityType, { vx: 2, vy: 2 });
      
      const query = new Query(world);
      const result = query.with(PositionType, VelocityType);
      
      expect(result.count()).toBe(2);
      expect(result.toArray()).toContain(e1);
      expect(result.toArray()).toContain(e3);
      expect(result.toArray()).not.toContain(e2);
    });

    it('should query entities with any component', () => {
      const e1 = world.createEntity();
      const e2 = world.createEntity();
      const e3 = world.createEntity();
      
      world.addComponent(e1, PositionType, { x: 0, y: 0 });
      world.addComponent(e2, VelocityType, { vx: 1, vy: 1 });
      
      const query = new Query(world);
      const result = query.withAny(PositionType, VelocityType);
      
      expect(result.count()).toBe(2);
      expect(result.toArray()).toContain(e1);
      expect(result.toArray()).toContain(e2);
      expect(result.toArray()).not.toContain(e3);
    });

    it('should query entities without components', () => {
      const e1 = world.createEntity();
      const e2 = world.createEntity();
      const e3 = world.createEntity();
      
      world.addComponent(e1, PositionType, { x: 0, y: 0 });
      world.addComponent(e2, VelocityType, { vx: 1, vy: 1 });
      
      const query = new Query(world);
      const result = query.without(PositionType, VelocityType);
      
      expect(result.toArray()).toContain(e3);
      expect(result.toArray()).not.toContain(e1);
      expect(result.toArray()).not.toContain(e2);
    });
  });

  describe('Systems', () => {
    it('should register and update systems', () => {
      const manager = new SystemManager();
      let updateCount = 0;
      
      manager.register({
        name: 'test',
        update: () => { updateCount++; },
      });
      
      manager.update(world, 0.016);
      expect(updateCount).toBe(1);
    });

    it('should update systems in priority order', () => {
      const manager = new SystemManager();
      const order: string[] = [];
      
      manager.register({
        name: 'third',
        priority: 300,
        update: () => { order.push('third'); },
      });
      
      manager.register({
        name: 'first',
        priority: 100,
        update: () => { order.push('first'); },
      });
      
      manager.register({
        name: 'second',
        priority: 200,
        update: () => { order.push('second'); },
      });
      
      manager.update(world, 0.016);
      expect(order).toEqual(['first', 'second', 'third']);
    });

    it('should handle system errors gracefully', () => {
      const manager = new SystemManager();
      let otherRan = false;
      
      manager.register({
        name: 'error',
        update: () => { throw new Error('test error'); },
      });
      
      manager.register({
        name: 'other',
        update: () => { otherRan = true; },
      });
      
      // Should not throw, other system should still run
      expect(() => manager.update(world, 0.016)).not.toThrow();
      expect(otherRan).toBe(true);
    });

    it('should unregister systems', () => {
      const manager = new SystemManager();
      let count = 0;
      
      manager.register({
        name: 'test',
        update: () => { count++; },
      });
      
      manager.update(world, 0.016);
      expect(count).toBe(1);
      
      manager.unregister('test');
      manager.update(world, 0.016);
      expect(count).toBe(1); // Should not increment
    });
  });

  describe('Deterministic Behavior', () => {
    it('should produce same entity IDs in same order', () => {
      const world1 = new World();
      const world2 = new World();
      
      const e1a = world1.createEntity();
      const e1b = world1.createEntity();
      const e2a = world2.createEntity();
      const e2b = world2.createEntity();
      
      expect(e1a).toBe(e2a);
      expect(e1b).toBe(e2b);
    });

    it('should handle fixed timestep updates deterministically', () => {
      const world1 = new World();
      const world2 = new World();
      
      const e1 = world1.createEntity();
      const e2 = world2.createEntity();
      
      world1.addComponent(e1, PositionType, { x: 0, y: 0 });
      world2.addComponent(e2, PositionType, { x: 0, y: 0 });
      
      const manager1 = new SystemManager();
      const manager2 = new SystemManager();
      
      manager1.register({
        name: 'move',
        update: (w, dt) => {
          const query = new Query(w);
          for (const entity of query.with(PositionType)) {
            const pos = w.getComponent<Position>(entity, PositionType)!;
            pos.x += dt * 10; // Move at 10 units per second
          }
        },
      });
      
      manager2.register({
        name: 'move',
        update: (w, dt) => {
          const query = new Query(w);
          for (const entity of query.with(PositionType)) {
            const pos = w.getComponent<Position>(entity, PositionType)!;
            pos.x += dt * 10;
          }
        },
      });
      
      // Update with same delta time
      manager1.update(world1, 0.016);
      manager2.update(world2, 0.016);
      
      const pos1 = world1.getComponent<Position>(e1, PositionType)!;
      const pos2 = world2.getComponent<Position>(e2, PositionType)!;
      
      expect(pos1.x).toBeCloseTo(pos2.x);
    });
  });
});
