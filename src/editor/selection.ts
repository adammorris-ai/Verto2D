/**
 * Selection management
 */

import { Entity } from '../ecs/entity';

export class SelectionManager {
  private selectedNodes = new Set<string>();
  private selectedEntities = new Set<Entity>();
  private primarySelection: string | Entity | null = null;

  /**
   * Select node
   */
  selectNode(nodeId: string, add: boolean = false): void {
    if (!add) {
      this.clear();
    }
    this.selectedNodes.add(nodeId);
    this.primarySelection = nodeId;
  }

  /**
   * Select entity
   */
  selectEntity(entity: Entity, add: boolean = false): void {
    if (!add) {
      this.clear();
    }
    this.selectedEntities.add(entity);
    this.primarySelection = entity;
  }

  /**
   * Deselect node
   */
  deselectNode(nodeId: string): void {
    this.selectedNodes.delete(nodeId);
    if (this.primarySelection === nodeId) {
      this.primarySelection = null;
    }
  }

  /**
   * Deselect entity
   */
  deselectEntity(entity: Entity): void {
    this.selectedEntities.delete(entity);
    if (this.primarySelection === entity) {
      this.primarySelection = null;
    }
  }

  /**
   * Clear all selections
   */
  clear(): void {
    this.selectedNodes.clear();
    this.selectedEntities.clear();
    this.primarySelection = null;
  }

  /**
   * Get selected nodes
   */
  getSelectedNodes(): string[] {
    return Array.from(this.selectedNodes);
  }

  /**
   * Get selected entities
   */
  getSelectedEntities(): Entity[] {
    return Array.from(this.selectedEntities);
  }

  /**
   * Get primary selection
   */
  getPrimarySelection(): string | Entity | null {
    return this.primarySelection;
  }

  /**
   * Check if node is selected
   */
  isNodeSelected(nodeId: string): boolean {
    return this.selectedNodes.has(nodeId);
  }

  /**
   * Check if entity is selected
   */
  isEntitySelected(entity: Entity): boolean {
    return this.selectedEntities.has(entity);
  }

  /**
   * Check if anything is selected
   */
  hasSelection(): boolean {
    return this.selectedNodes.size > 0 || this.selectedEntities.size > 0;
  }
}
