import { describe, it, expect, beforeEach } from 'vitest';
import { Scene } from '../engine/scene';
import { PrefabRegistry, PrefabDefinition } from '../engine/prefab';
import { Project } from '../engine/project';
import { World } from '../ecs/world';
import { getComponentType, resetComponentTypes } from '../ecs/components';
import { Entity } from '../ecs/entity';

interface Position {
  x: number;
  y: number;
}

interface Health {
  hp: number;
  maxHp: number;
}

describe('Prefab System', () => {
  let registry: PrefabRegistry;
  let world: World;
  let PositionType: number;
  let HealthType: number;

  beforeEach(() => {
    resetComponentTypes();
    PositionType = getComponentType<Position>();
    HealthType = getComponentType<Health>();
    
    registry = new PrefabRegistry();
    world = new World();
  });

  it('should register and retrieve prefabs', () => {
    const prefab: PrefabDefinition = {
      name: 'Player',
      components: [
        { type: PositionType, data: { x: 0, y: 0 } },
        { type: HealthType, data: { hp: 100, maxHp: 100 } },
      ],
    };

    registry.register(prefab);
    expect(registry.has('Player')).toBe(true);
    expect(registry.get('Player')).toEqual(prefab);
  });

  it('should instantiate prefab into world', () => {
    const prefab: PrefabDefinition = {
      name: 'Player',
      components: [
        { type: PositionType, data: { x: 10, y: 20 } },
        { type: HealthType, data: { hp: 100, maxHp: 100 } },
      ],
    };

    registry.register(prefab);
    const entity = registry.instantiate(world, 'Player');

    expect(entity).not.toBeNull();
    expect(world.hasEntity(entity!)).toBe(true);
    expect(world.hasComponent(entity!, PositionType)).toBe(true);
    expect(world.hasComponent(entity!, HealthType)).toBe(true);

    const pos = world.getComponent<Position>(entity!, PositionType);
    expect(pos?.x).toBe(10);
    expect(pos?.y).toBe(20);

    const health = world.getComponent<Health>(entity!, HealthType);
    expect(health?.hp).toBe(100);
    expect(health?.maxHp).toBe(100);
  });

  it('should return null for non-existent prefab', () => {
    const entity = registry.instantiate(world, 'NonExistent');
    expect(entity).toBeNull();
  });

  it('should serialize and deserialize prefabs', () => {
    const prefab: PrefabDefinition = {
      name: 'Player',
      components: [
        { type: PositionType, data: { x: 10, y: 20 } },
        { type: HealthType, data: { hp: 100, maxHp: 100 } },
      ],
    };

    registry.register(prefab);
    const serialized = registry.serialize();

    const newRegistry = new PrefabRegistry();
    newRegistry.deserialize(serialized);

    expect(newRegistry.has('Player')).toBe(true);
    const deserializedPrefab = newRegistry.get('Player');
    expect(deserializedPrefab?.name).toBe('Player');
    expect(deserializedPrefab?.components.length).toBe(2);
  });

  it('should instantiate multiple entities from same prefab', () => {
    const prefab: PrefabDefinition = {
      name: 'Enemy',
      components: [
        { type: PositionType, data: { x: 0, y: 0 } },
      ],
    };

    registry.register(prefab);
    const e1 = registry.instantiate(world, 'Enemy');
    const e2 = registry.instantiate(world, 'Enemy');
    const e3 = registry.instantiate(world, 'Enemy');

    expect(e1).not.toBe(e2);
    expect(e2).not.toBe(e3);
    expect(world.getEntityCount()).toBe(3);
  });
});

describe('Scene Serialization', () => {
  let scene: Scene;
  let PositionType: number;

  beforeEach(() => {
    resetComponentTypes();
    PositionType = getComponentType<Position>();
    scene = new Scene('TestScene');
  });

  it('should serialize scene metadata', () => {
    scene.setMetadata('author', 'Test Author');
    const serialized = scene.serialize() as { metadata?: unknown };
    
    expect(serialized.metadata).toBeDefined();
    const metadata = serialized.metadata as { name?: string; author?: string };
    expect(metadata.name).toBe('TestScene');
    expect(metadata.author).toBe('Test Author');
  });

  it('should deserialize scene metadata', () => {
    const data = {
      metadata: {
        name: 'DeserializedScene',
        author: 'Test Author',
      },
      entities: [],
    };

    scene.deserialize(data);
    const metadata = scene.getMetadata();
    expect(metadata.name).toBe('DeserializedScene');
    expect(metadata.author).toBe('Test Author');
  });

  it('should clear scene', () => {
    const entity = scene.getWorld().createEntity();
    scene.getWorld().addComponent(entity, PositionType, { x: 0, y: 0 });
    
    expect(scene.getWorld().getEntityCount()).toBe(1);
    scene.clear();
    expect(scene.getWorld().getEntityCount()).toBe(0);
  });
});

describe('Project Serialization', () => {
  let project: Project;
  let PositionType: number;

  beforeEach(() => {
    resetComponentTypes();
    PositionType = getComponentType<Position>();
    project = new Project('TestProject');
  });

  it('should serialize project with scenes and prefabs', () => {
    const scene = new Scene('Scene1');
    project.addScene(scene);

    const prefab: PrefabDefinition = {
      name: 'Player',
      components: [
        { type: PositionType, data: { x: 0, y: 0 } },
      ],
    };
    project.getPrefabs().register(prefab);

    const serialized = project.serialize() as {
      metadata?: unknown;
      scenes?: unknown[];
      prefabs?: unknown;
    };

    expect(serialized.metadata).toBeDefined();
    expect(serialized.scenes).toBeDefined();
    expect(Array.isArray(serialized.scenes)).toBe(true);
    expect(serialized.prefabs).toBeDefined();
  });

  it('should deserialize project', () => {
    const data = {
      metadata: {
        name: 'DeserializedProject',
        version: '2.0.0',
      },
      scenes: [
        {
          metadata: { name: 'Scene1' },
          entities: [],
        },
      ],
      prefabs: {},
    };

    project.deserialize(data);
    const metadata = project.getMetadata();
    expect(metadata.name).toBe('DeserializedProject');
    expect(metadata.version).toBe('2.0.0');
    expect(project.getScenes().length).toBe(1);
  });

  it('should clear project', () => {
    const scene = new Scene('Scene1');
    project.addScene(scene);
    
    const prefab: PrefabDefinition = {
      name: 'Player',
      components: [{ type: PositionType, data: { x: 0, y: 0 } }],
    };
    project.getPrefabs().register(prefab);

    project.clear();
    expect(project.getScenes().length).toBe(0);
    expect(project.getPrefabs().has('Player')).toBe(false);
  });
});
