/**
 * Component storage and management
 */

import { Entity, NULL_ENTITY } from './entity';
import { ComponentError } from '../core/errors';

/**
 * Component type identifier
 */
export type ComponentType = number;

/**
 * Component data storage
 */
export class ComponentStore<T> {
  private components = new Map<Entity, T>();
  private nextTypeId = 0;

  /**
   * Get component for entity
   */
  get(entity: Entity): T | undefined {
    return this.components.get(entity);
  }

  /**
   * Set component for entity
   */
  set(entity: Entity, component: T): void {
    if (entity === NULL_ENTITY) {
      throw new ComponentError('Cannot set component on NULL_ENTITY');
    }
    this.components.set(entity, component);
  }

  /**
   * Remove component from entity
   */
  remove(entity: Entity): boolean {
    return this.components.delete(entity);
  }

  /**
   * Check if entity has component
   */
  has(entity: Entity): boolean {
    return this.components.has(entity);
  }

  /**
   * Get all entities with this component
   */
  getAllEntities(): Entity[] {
    return Array.from(this.components.keys());
  }

  /**
   * Clear all components
   */
  clear(): void {
    this.components.clear();
  }

  /**
   * Get component count
   */
  size(): number {
    return this.components.size;
  }
}

/**
 * Global component type registry
 */
let nextComponentType = 1;

export function getComponentType<T>(): ComponentType {
  // Use a simple incrementing counter for component types
  // In a real implementation, this might use a symbol or string-based system
  return nextComponentType++;
}

/**
 * Reset component type counter (for tests)
 */
export function resetComponentTypes(): void {
  nextComponentType = 1;
}
