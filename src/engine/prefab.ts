/**
 * Prefab system - component templates for entity instantiation
 */

import { Entity } from '../ecs/entity';
import { World } from '../ecs/world';
import { ComponentType } from '../ecs/components';
import { serializeValue } from '../core/serialize';

export interface ComponentTemplate {
  type: ComponentType;
  data: unknown;
}

export interface PrefabDefinition {
  name: string;
  components: ComponentTemplate[];
}

/**
 * Prefab registry
 */
export class PrefabRegistry {
  private prefabs = new Map<string, PrefabDefinition>();

  /**
   * Register a prefab
   */
  register(prefab: PrefabDefinition): void {
    this.prefabs.set(prefab.name, prefab);
  }

  /**
   * Get a prefab by name
   */
  get(name: string): PrefabDefinition | undefined {
    return this.prefabs.get(name);
  }

  /**
   * Check if prefab exists
   */
  has(name: string): boolean {
    return this.prefabs.has(name);
  }

  /**
   * Instantiate a prefab into the world
   */
  instantiate(world: World, name: string): Entity | null {
    const prefab = this.get(name);
    if (!prefab) {
      return null;
    }

    const entity = world.createEntity();

    // Add all components from prefab
    for (const template of prefab.components) {
      world.addComponent(entity, template.type, template.data);
    }

    return entity;
  }

  /**
   * Serialize prefab registry
   */
  serialize(): unknown {
    const prefabs: Record<string, unknown> = {};
    for (const [name, prefab] of this.prefabs.entries()) {
      prefabs[name] = {
        name: prefab.name,
        components: prefab.components.map(c => ({
          type: c.type,
          data: serializeValue(c.data),
        })),
      };
    }
    return prefabs;
  }

  /**
   * Deserialize prefab registry
   */
  deserialize(data: unknown): void {
    const prefabs = data as Record<string, PrefabDefinition>;
    this.prefabs.clear();
    for (const [name, prefab] of Object.entries(prefabs)) {
      this.prefabs.set(name, prefab);
    }
  }

  /**
   * Clear all prefabs
   */
  clear(): void {
    this.prefabs.clear();
  }
}
