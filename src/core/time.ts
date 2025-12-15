/**
 * Deterministic time system with fixed timestep accumulator
 * Critical for deterministic simulation and testing
 */

export class Time {
  private accumulator = 0;
  private fixedDeltaTime: number;
  private currentTime = 0;
  private frameCount = 0;

  constructor(fixedDeltaTime = 1 / 60) {
    this.fixedDeltaTime = fixedDeltaTime;
  }

  /**
   * Update time accumulator with delta time
   * Returns number of fixed steps to execute
   */
  update(deltaTime: number): number {
    this.currentTime += deltaTime;
    this.accumulator += deltaTime;
    this.frameCount++;

    const steps = Math.floor(this.accumulator / this.fixedDeltaTime);
    this.accumulator -= steps * this.fixedDeltaTime;

    return steps;
  }

  /**
   * Get fixed timestep duration
   */
  getFixedDeltaTime(): number {
    return this.fixedDeltaTime;
  }

  /**
   * Get current accumulated time
   */
  getTime(): number {
    return this.currentTime;
  }

  /**
   * Get frame count
   */
  getFrameCount(): number {
    return this.frameCount;
  }

  /**
   * Get remaining accumulator (for interpolation)
   */
  getAccumulator(): number {
    return this.accumulator;
  }

  /**
   * Reset time state (useful for tests)
   */
  reset(): void {
    this.accumulator = 0;
    this.currentTime = 0;
    this.frameCount = 0;
  }

  /**
   * Set fixed timestep
   */
  setFixedDeltaTime(dt: number): void {
    this.fixedDeltaTime = dt;
  }
}
