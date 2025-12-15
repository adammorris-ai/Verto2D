import { describe, it, expect, beforeEach } from 'vitest';
import { Engine } from '../engine/engine';
import { Scene } from '../engine/scene';
import { World } from '../ecs/world';
import { getComponentType, resetComponentTypes } from '../ecs/components';
import { Entity } from '../ecs/entity';
import { Query } from '../ecs/queries';

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  vx: number;
  vy: number;
}

describe('Engine Step', () => {
  let engine: Engine;
  let scene: Scene;
  let PositionType: number;
  let VelocityType: number;

  beforeEach(() => {
    resetComponentTypes();
    PositionType = getComponentType<Position>();
    VelocityType = getComponentType<Velocity>();
    
    engine = new Engine({ fixedDeltaTime: 1 / 60 });
    scene = new Scene('TestScene');
    engine.setScene(scene);
  });

  it('should start and stop', () => {
    expect(engine.isEngineRunning()).toBe(false);
    engine.start();
    expect(engine.isEngineRunning()).toBe(true);
    engine.stop();
    expect(engine.isEngineRunning()).toBe(false);
  });

  it('should not step when stopped', () => {
    const steps = engine.step(0.016);
    expect(steps).toBe(0);
  });

  it('should execute fixed timestep updates', () => {
    engine.start();
    
    // Add a movement system
    let updateCount = 0;
    engine.getSystems().register({
      name: 'movement',
      update: (world, dt) => {
        updateCount++;
        const query = new Query(world);
        for (const entity of query.with(PositionType, VelocityType)) {
          const pos = world.getComponent<Position>(entity, PositionType)!;
          const vel = world.getComponent<Velocity>(entity, VelocityType)!;
          pos.x += vel.vx * dt;
          pos.y += vel.vy * dt;
        }
      },
    });

    // Create an entity with position and velocity
    const entity = scene.getWorld().createEntity();
    scene.getWorld().addComponent(entity, PositionType, { x: 0, y: 0 });
    scene.getWorld().addComponent(entity, VelocityType, { vx: 10, vy: 20 });

    // Step with ~2 frames worth of time
    const steps = engine.step(0.033);
    expect(steps).toBeGreaterThanOrEqual(1);
    expect(updateCount).toBeGreaterThanOrEqual(1);
  });

  it('should be deterministic', () => {
    engine.start();
    
    // Create movement system
    engine.getSystems().register({
      name: 'movement',
      update: (world, dt) => {
        const query = new Query(world);
        for (const entity of query.with(PositionType, VelocityType)) {
          const pos = world.getComponent<Position>(entity, PositionType)!;
          const vel = world.getComponent<Velocity>(entity, VelocityType)!;
          pos.x += vel.vx * dt;
          pos.y += vel.vy * dt;
        }
      },
    });

    // Create entity
    const entity = scene.getWorld().createEntity();
    scene.getWorld().addComponent(entity, PositionType, { x: 0, y: 0 });
    scene.getWorld().addComponent(entity, VelocityType, { vx: 10, vy: 20 });

    // Step multiple times
    for (let i = 0; i < 10; i++) {
      engine.step(0.016);
    }

    const pos = scene.getWorld().getComponent<Position>(entity, PositionType)!;
    expect(pos.x).toBeGreaterThan(0);
    expect(pos.y).toBeGreaterThan(0);
  });

  it('should clamp max steps per frame', () => {
    const limitedEngine = new Engine({ 
      fixedDeltaTime: 1 / 60,
      maxStepsPerFrame: 2,
    });
    limitedEngine.setScene(scene);
    limitedEngine.start();

    let updateCount = 0;
    limitedEngine.getSystems().register({
      name: 'counter',
      update: () => { updateCount++; },
    });

    // Step with huge delta time (would normally cause many steps)
    limitedEngine.step(1.0);
    
    // Should be clamped to maxStepsPerFrame
    expect(updateCount).toBeLessThanOrEqual(2);
  });

  it('should update systems in priority order', () => {
    engine.start();
    
    const order: string[] = [];
    
    engine.getSystems().register({
      name: 'third',
      priority: 300,
      update: () => { order.push('third'); },
    });
    
    engine.getSystems().register({
      name: 'first',
      priority: 100,
      update: () => { order.push('first'); },
    });
    
    engine.getSystems().register({
      name: 'second',
      priority: 200,
      update: () => { order.push('second'); },
    });

    // Use larger delta time to ensure at least one step
    engine.step(0.02);
    expect(order).toEqual(['first', 'second', 'third']);
  });
});
