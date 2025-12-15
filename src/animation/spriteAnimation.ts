/**
 * Sprite animation system
 */

import { AssetGUID } from '../assets/types';

export interface AnimationFrame {
  spriteIndex: number;
  duration: number; // Duration in seconds
  x?: number; // Sprite sheet position
  y?: number;
}

export interface SpriteAnimation {
  name: string;
  frames: AnimationFrame[];
  loop: boolean;
  speed: number; // Playback speed multiplier
}

export class AnimationClip {
  private name: string;
  private frames: AnimationFrame[];
  private loop: boolean;
  private speed: number;
  private currentFrameIndex = 0;
  private frameTimer = 0;
  private isPlaying = false;

  constructor(animation: SpriteAnimation) {
    this.name = animation.name;
    this.frames = [...animation.frames];
    this.loop = animation.loop;
    this.speed = animation.speed || 1.0;
  }

  /**
   * Play the animation
   */
  play(): void {
    this.isPlaying = true;
    this.currentFrameIndex = 0;
    this.frameTimer = 0;
  }

  /**
   * Stop the animation
   */
  stop(): void {
    this.isPlaying = false;
    this.currentFrameIndex = 0;
    this.frameTimer = 0;
  }

  /**
   * Pause the animation
   */
  pause(): void {
    this.isPlaying = false;
  }

  /**
   * Resume the animation
   */
  resume(): void {
    this.isPlaying = true;
  }

  /**
   * Update animation
   */
  update(deltaTime: number): void {
    if (!this.isPlaying || this.frames.length === 0) {
      return;
    }

    this.frameTimer += deltaTime * this.speed;
    const currentFrame = this.frames[this.currentFrameIndex];

    if (this.frameTimer >= currentFrame.duration) {
      this.frameTimer = 0;
      this.currentFrameIndex++;

      if (this.currentFrameIndex >= this.frames.length) {
        if (this.loop) {
          this.currentFrameIndex = 0;
        } else {
          this.currentFrameIndex = this.frames.length - 1;
          this.isPlaying = false;
        }
      }
    }
  }

  /**
   * Get current frame
   */
  getCurrentFrame(): AnimationFrame | null {
    if (this.frames.length === 0) {
      return null;
    }
    return this.frames[this.currentFrameIndex];
  }

  /**
   * Get animation name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Check if animation is playing
   */
  isAnimationPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Set playback speed
   */
  setSpeed(speed: number): void {
    this.speed = Math.max(0, speed);
  }

  /**
   * Get playback speed
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Reset animation to start
   */
  reset(): void {
    this.currentFrameIndex = 0;
    this.frameTimer = 0;
  }
}
