/**
 * Broadphase collision detection using spatial grid
 */

import { Vec2 } from '../core/math/vec2';
import { Collider, getColliderBounds } from './collider';

export interface CollisionPair {
  entityA: number;
  entityB: number;
  colliderA: Collider;
  colliderB: Collider;
  positionA: Vec2;
  positionB: Vec2;
}

export class SpatialGrid {
  private cellSize: number;
  private grid = new Map<string, Set<number>>(); // cell key -> set of entity IDs

  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
  }


  /**
   * Get cells that a collider overlaps
   */
  private getCellsForCollider(
    collider: Collider,
    position: Vec2
  ): Set<string> {
    const bounds = getColliderBounds(collider, position);
    const cells = new Set<string>();

    const minCellX = Math.floor(bounds.min.x / this.cellSize);
    const maxCellX = Math.floor(bounds.max.x / this.cellSize);
    const minCellY = Math.floor(bounds.min.y / this.cellSize);
    const maxCellY = Math.floor(bounds.max.y / this.cellSize);

    for (let x = minCellX; x <= maxCellX; x++) {
      for (let y = minCellY; y <= maxCellY; y++) {
        cells.add(`${x},${y}`);
      }
    }

    return cells;
  }

  /**
   * Insert entity into grid
   */
  insert(entity: number, collider: Collider, position: Vec2): void {
    const cells = this.getCellsForCollider(collider, position);
    for (const cellKey of cells) {
      if (!this.grid.has(cellKey)) {
        this.grid.set(cellKey, new Set());
      }
      this.grid.get(cellKey)!.add(entity);
    }
  }

  /**
   * Clear grid
   */
  clear(): void {
    this.grid.clear();
  }

  /**
   * Get potential collision pairs
   */
  getPotentialPairs(): Map<number, Set<number>> {
    const pairs = new Map<number, Set<number>>();

    for (const entities of this.grid.values()) {
      const entityArray = Array.from(entities);
      for (let i = 0; i < entityArray.length; i++) {
        for (let j = i + 1; j < entityArray.length; j++) {
          const a = entityArray[i];
          const b = entityArray[j];

          // Ensure consistent ordering (smaller ID first)
          const min = Math.min(a, b);
          const max = Math.max(a, b);

          if (!pairs.has(min)) {
            pairs.set(min, new Set());
          }
          pairs.get(min)!.add(max);
        }
      }
    }

    return pairs;
  }
}

export class Broadphase {
  private grid: SpatialGrid;

  constructor(cellSize: number = 100) {
    this.grid = new SpatialGrid(cellSize);
  }

  /**
   * Find potential collision pairs using spatial grid
   */
  findPairs(
    entities: Array<{
      entity: number;
      collider: Collider;
      position: Vec2;
    }>
  ): CollisionPair[] {
    this.grid.clear();

    // Insert all entities into grid
    for (const { entity, collider, position } of entities) {
      this.grid.insert(entity, collider, position);
    }

    // Get potential pairs
    const potentialPairs = this.grid.getPotentialPairs();
    const pairs: CollisionPair[] = [];

    // Create collision pair objects
    const entityMap = new Map(
      entities.map(e => [e.entity, e])
    );

    for (const [entityA, entityBSet] of potentialPairs.entries()) {
      const entityAData = entityMap.get(entityA);
      if (!entityAData) continue;

      for (const entityB of entityBSet) {
        const entityBData = entityMap.get(entityB);
        if (!entityBData) continue;

        pairs.push({
          entityA,
          entityB,
          colliderA: entityAData.collider,
          colliderB: entityBData.collider,
          positionA: entityAData.position,
          positionB: entityBData.position,
        });
      }
    }

    return pairs;
  }

  /**
   * Set grid cell size
   */
  setCellSize(cellSize: number): void {
    this.grid = new SpatialGrid(cellSize);
  }
}
