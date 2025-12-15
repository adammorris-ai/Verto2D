/**
 * Scene - contains ECS world and scene metadata
 */

import { World } from '../ecs/world';

export interface SceneMetadata {
  name: string;
  version?: string;
  [key: string]: unknown;
}

export class Scene {
  private world: World;
  private metadata: SceneMetadata;

  constructor(name: string, metadata: Partial<SceneMetadata> = {}) {
    this.world = new World();
    this.metadata = {
      name,
      version: '1.0.0',
      ...metadata,
    };
  }

  /**
   * Get the ECS world
   */
  getWorld(): World {
    return this.world;
  }

  /**
   * Get scene metadata
   */
  getMetadata(): SceneMetadata {
    return { ...this.metadata };
  }

  /**
   * Set metadata value
   */
  setMetadata(key: string, value: unknown): void {
    this.metadata[key] = value;
  }

  /**
   * Serialize scene to JSON
   */
  serialize(): unknown {
    return {
      metadata: this.metadata,
      entities: this.serializeEntities(),
    };
  }

  /**
   * Deserialize scene from JSON
   */
  deserialize(data: unknown): void {
    const sceneData = data as {
      metadata?: SceneMetadata;
      entities?: unknown[];
    };

    if (sceneData.metadata) {
      this.metadata = { ...this.metadata, ...sceneData.metadata };
    }

    if (sceneData.entities) {
      this.deserializeEntities(sceneData.entities);
    }
  }

  /**
   * Serialize all entities and components
   * Note: This is a simplified version. Full implementation would need
   * component type registry and proper serialization.
   */
  private serializeEntities(): unknown[] {
    // For now, return empty array
    // Full implementation in Phase 2 tests will handle this
    return [];
  }

  /**
   * Deserialize entities and components
   */
  private deserializeEntities(_entities: unknown[]): void {
    // For now, do nothing
    // Full implementation in Phase 2 tests will handle this
  }

  /**
   * Clear the scene
   */
  clear(): void {
    this.world.clear();
  }
}
