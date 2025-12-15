/**
 * Animation timeline for keyframe-based animations
 */

export interface Keyframe<T> {
  time: number;
  value: T;
  easing?: (t: number) => number;
}

export class Timeline<T> {
  private keyframes: Keyframe<T>[] = [];
  private currentTime = 0;
  private duration = 0;
  private isPlaying = false;
  private loop = false;

  /**
   * Add keyframe
   */
  addKeyframe(time: number, value: T, easing?: (t: number) => number): void {
    const keyframe: Keyframe<T> = { time, value, easing };
    this.keyframes.push(keyframe);
    this.keyframes.sort((a, b) => a.time - b.time);
    this.duration = Math.max(this.duration, time);
  }

  /**
   * Get value at current time
   */
  getValue(): T | null {
    if (this.keyframes.length === 0) {
      return null;
    }

    if (this.keyframes.length === 1) {
      return this.keyframes[0].value;
    }

    // Find surrounding keyframes
    let before: Keyframe<T> | null = null;
    let after: Keyframe<T> | null = null;

    for (const kf of this.keyframes) {
      if (kf.time <= this.currentTime) {
        before = kf;
      }
      if (kf.time >= this.currentTime && !after) {
        after = kf;
      }
    }

    if (!before) {
      return this.keyframes[0].value;
    }

    if (!after || before === after) {
      return before.value;
    }

    // Interpolate between keyframes
    const t = (this.currentTime - before.time) / (after.time - before.time);
    const easedT = before.easing ? before.easing(t) : t;

    return this.interpolate(before.value, after.value, easedT);
  }

  /**
   * Interpolate between two values (simplified - would need type-specific interpolation)
   */
  private interpolate(a: T, b: T, t: number): T {
    if (typeof a === 'number' && typeof b === 'number') {
      return (a + (b - a) * t) as T;
    }
    // For other types, return the later value
    return b;
  }

  /**
   * Update timeline
   */
  update(deltaTime: number): void {
    if (!this.isPlaying) {
      return;
    }

    this.currentTime += deltaTime;

    if (this.currentTime >= this.duration) {
      if (this.loop) {
        this.currentTime = this.currentTime % this.duration;
      } else {
        this.currentTime = this.duration;
        this.isPlaying = false;
      }
    }
  }

  /**
   * Play timeline
   */
  play(): void {
    this.isPlaying = true;
  }

  /**
   * Stop timeline
   */
  stop(): void {
    this.isPlaying = false;
    this.currentTime = 0;
  }

  /**
   * Pause timeline
   */
  pause(): void {
    this.isPlaying = false;
  }

  /**
   * Set current time
   */
  setTime(time: number): void {
    this.currentTime = Math.max(0, Math.min(time, this.duration));
  }

  /**
   * Get current time
   */
  getTime(): number {
    return this.currentTime;
  }

  /**
   * Get duration
   */
  getDuration(): number {
    return this.duration;
  }

  /**
   * Set loop
   */
  setLoop(loop: boolean): void {
    this.loop = loop;
  }

  /**
   * Check if playing
   */
  isTimelinePlaying(): boolean {
    return this.isPlaying;
  }
}
