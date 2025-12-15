/**
 * Main Engine class - orchestrates all subsystems
 */

import { World } from '../ecs/world';
import { SystemManager } from '../ecs/systems';
import { Time } from '../core/time';
import { Scene } from './scene';

export interface EngineConfig {
  fixedDeltaTime?: number;
  maxStepsPerFrame?: number;
}

export class Engine {
  private world: World;
  private systems: SystemManager;
  private time: Time;
  private currentScene: Scene | null = null;
  private isRunning = false;
  private maxStepsPerFrame: number;

  constructor(config: EngineConfig = {}) {
    this.world = new World();
    this.systems = new SystemManager();
    this.time = new Time(config.fixedDeltaTime ?? 1 / 60);
    this.maxStepsPerFrame = config.maxStepsPerFrame ?? 10;
  }

  /**
   * Start the engine
   */
  start(): void {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.time.reset();
  }

  /**
   * Stop the engine
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * Step the engine forward by deltaTime
   * Returns number of fixed steps executed
   */
  step(deltaTime: number): number {
    if (!this.isRunning) {
      return 0;
    }

    const steps = this.time.update(deltaTime);
    const clampedSteps = Math.min(steps, this.maxStepsPerFrame);

    // Execute fixed timestep updates
    for (let i = 0; i < clampedSteps; i++) {
      this.fixedUpdate(this.time.getFixedDeltaTime());
    }

    return clampedSteps;
  }

  /**
   * Fixed timestep update (deterministic)
   */
  private fixedUpdate(deltaTime: number): void {
    if (!this.currentScene) {
      return;
    }

    const world = this.currentScene.getWorld();

    // Update all systems in order
    this.systems.update(world, deltaTime);
  }

  /**
   * Get the ECS world
   */
  getWorld(): World {
    return this.world;
  }

  /**
   * Get the system manager
   */
  getSystems(): SystemManager {
    return this.systems;
  }

  /**
   * Get the time system
   */
  getTime(): Time {
    return this.time;
  }

  /**
   * Set the current scene
   */
  setScene(scene: Scene): void {
    this.currentScene = scene;
  }

  /**
   * Get the current scene
   */
  getScene(): Scene | null {
    return this.currentScene;
  }

  /**
   * Check if engine is running
   */
  isEngineRunning(): boolean {
    return this.isRunning;
  }
}
