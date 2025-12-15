/**
 * ECS System management and execution
 */

import { World } from './world';

export type SystemUpdateFn = (world: World, deltaTime: number) => void;

export interface System {
  name: string;
  update: SystemUpdateFn;
  priority?: number; // Lower numbers run first
}

/**
 * System manager for ordered execution
 */
export class SystemManager {
  private systems: System[] = [];
  private sorted = false;

  /**
   * Register a system
   */
  register(system: System): void {
    this.systems.push(system);
    this.sorted = false;
  }

  /**
   * Unregister a system
   */
  unregister(name: string): void {
    this.systems = this.systems.filter(s => s.name !== name);
  }

  /**
   * Update all systems in priority order
   */
  update(world: World, deltaTime: number): void {
    if (!this.sorted) {
      this.systems.sort((a, b) => (a.priority ?? 1000) - (b.priority ?? 1000));
      this.sorted = true;
    }

    for (const system of this.systems) {
      try {
        system.update(world, deltaTime);
      } catch (error) {
        console.error(`Error in system ${system.name}:`, error);
      }
    }
  }

  /**
   * Clear all systems
   */
  clear(): void {
    this.systems = [];
    this.sorted = false;
  }

  /**
   * Get system count
   */
  count(): number {
    return this.systems.length;
  }
}
