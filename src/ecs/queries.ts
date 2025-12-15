/**
 * ECS Query system for finding entities by component combinations
 */

import { Entity } from './entity';
import { World } from './world';
import { ComponentType } from './components';

/**
 * Query result iterator
 */
export class QueryResult {
  constructor(private entities: Entity[]) {}

  *[Symbol.iterator](): Generator<Entity> {
    for (const entity of this.entities) {
      yield entity;
    }
  }

  toArray(): Entity[] {
    return [...this.entities];
  }

  count(): number {
    return this.entities.length;
  }

  first(): Entity | undefined {
    return this.entities[0];
  }
}

/**
 * Query builder for finding entities
 */
export class Query {
  constructor(private world: World) {}

  /**
   * Find entities with all specified components
   */
  with(...types: ComponentType[]): QueryResult {
    if (types.length === 0) {
      return new QueryResult(this.world.getAllEntities());
    }

    // Start with entities that have the first component type
    const firstStore = this.world.getComponentStore(types[0]);
    if (!firstStore) {
      return new QueryResult([]);
    }
    let candidates = firstStore.getAllEntities();

    // Filter by remaining component types
    for (let i = 1; i < types.length; i++) {
      const store = this.world.getComponentStore(types[i]);
      if (!store) {
        return new QueryResult([]);
      }
      const typeEntities = new Set(store.getAllEntities());
      candidates = candidates.filter(e => typeEntities.has(e));
    }

    return new QueryResult(candidates);
  }

  /**
   * Find entities with any of the specified components
   */
  withAny(...types: ComponentType[]): QueryResult {
    if (types.length === 0) {
      return new QueryResult([]);
    }

    const resultSet = new Set<Entity>();
    for (const type of types) {
      const store = this.world.getComponentStore(type);
      if (store) {
        for (const entity of store.getAllEntities()) {
          resultSet.add(entity);
        }
      }
    }

    return new QueryResult(Array.from(resultSet));
  }

  /**
   * Find entities without any of the specified components
   */
  without(...types: ComponentType[]): QueryResult {
    const allEntities = this.world.getAllEntities();
    const excluded = new Set<Entity>();

    for (const type of types) {
      const store = this.world.getComponentStore(type);
      if (store) {
        for (const entity of store.getAllEntities()) {
          excluded.add(entity);
        }
      }
    }

    return new QueryResult(allEntities.filter(e => !excluded.has(e)));
  }
}
