/**
 * ECS World - main container for entities, components, and systems
 */

import { Entity, NULL_ENTITY } from './entity';
import { ComponentStore, ComponentType } from './components';
import { EntityError } from '../core/errors';

export class World {
  private entities = new Set<Entity>();
  private componentStores = new Map<ComponentType, ComponentStore<unknown>>();
  private nextEntityId = 1;

  /**
   * Create a new entity
   */
  createEntity(): Entity {
    const entity = this.nextEntityId++ as Entity;
    this.entities.add(entity);
    return entity;
  }

  /**
   * Destroy an entity and all its components
   */
  destroyEntity(entity: Entity): void {
    if (entity === NULL_ENTITY) {
      throw new EntityError('Cannot destroy NULL_ENTITY');
    }
    
    if (!this.entities.has(entity)) {
      return; // Already destroyed or never existed
    }

    // Remove all components
    for (const store of this.componentStores.values()) {
      store.remove(entity);
    }

    this.entities.delete(entity);
  }

  /**
   * Check if entity exists
   */
  hasEntity(entity: Entity): boolean {
    return this.entities.has(entity);
  }

  /**
   * Get component store for a type
   */
  private getOrCreateStore<T>(type: ComponentType): ComponentStore<T> {
    if (!this.componentStores.has(type)) {
      this.componentStores.set(type, new ComponentStore<T>());
    }
    return this.componentStores.get(type) as ComponentStore<T>;
  }

  /**
   * Get component store (for queries)
   */
  getComponentStore<T>(type: ComponentType): ComponentStore<T> | undefined {
    return this.componentStores.get(type) as ComponentStore<T> | undefined;
  }

  /**
   * Add component to entity
   */
  addComponent<T>(entity: Entity, type: ComponentType, component: T): void {
    if (!this.entities.has(entity)) {
      throw new EntityError(`Entity ${entity} does not exist`);
    }
    const store = this.getOrCreateStore<T>(type);
    store.set(entity, component);
  }

  /**
   * Remove component from entity
   */
  removeComponent(entity: Entity, type: ComponentType): boolean {
    const store = this.componentStores.get(type);
    if (!store) {
      return false;
    }
    return store.remove(entity);
  }

  /**
   * Get component from entity
   */
  getComponent<T>(entity: Entity, type: ComponentType): T | undefined {
    const store = this.componentStores.get(type);
    if (!store) {
      return undefined;
    }
    return store.get(entity) as T | undefined;
  }

  /**
   * Check if entity has component
   */
  hasComponent(entity: Entity, type: ComponentType): boolean {
    const store = this.componentStores.get(type);
    if (!store) {
      return false;
    }
    return store.has(entity);
  }

  /**
   * Get all entities
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities);
  }

  /**
   * Clear all entities and components
   */
  clear(): void {
    for (const entity of this.entities) {
      this.destroyEntity(entity);
    }
    this.entities.clear();
    this.componentStores.clear();
    this.nextEntityId = 1;
  }

  /**
   * Get entity count
   */
  getEntityCount(): number {
    return this.entities.size;
  }
}
