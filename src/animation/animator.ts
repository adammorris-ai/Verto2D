/**
 * Animator component with state machine
 */

import { AnimationClip } from './spriteAnimation';

export interface AnimationState {
  name: string;
  clip: AnimationClip;
  transitions: AnimationTransition[];
}

export interface AnimationTransition {
  toState: string;
  condition?: () => boolean; // Condition function
  trigger?: string; // Trigger name
}

export class Animator {
  private states = new Map<string, AnimationState>();
  private currentState: string | null = null;
  private defaultState: string | null = null;

  /**
   * Add animation state
   */
  addState(name: string, clip: AnimationClip, transitions: AnimationTransition[] = []): void {
    this.states.set(name, {
      name,
      clip,
      transitions: [...transitions],
    });

    if (!this.defaultState) {
      this.defaultState = name;
    }
  }

  /**
   * Set default state
   */
  setDefaultState(name: string): void {
    if (this.states.has(name)) {
      this.defaultState = name;
      if (!this.currentState) {
        this.setState(name);
      }
    }
  }

  /**
   * Set current state
   */
  setState(name: string): boolean {
    const state = this.states.get(name);
    if (!state) {
      return false;
    }

    // Stop current state
    if (this.currentState) {
      const currentStateObj = this.states.get(this.currentState);
      currentStateObj?.clip.stop();
    }

    this.currentState = name;
    state.clip.play();
    return true;
  }

  /**
   * Get current state
   */
  getCurrentState(): string | null {
    return this.currentState;
  }

  /**
   * Update animator
   */
  update(deltaTime: number): void {
    if (!this.currentState) {
      if (this.defaultState) {
        this.setState(this.defaultState);
      }
      return;
    }

    const state = this.states.get(this.currentState);
    if (!state) {
      return;
    }

    // Update current clip
    state.clip.update(deltaTime);

    // Check transitions
    for (const transition of state.transitions) {
      if (transition.condition && transition.condition()) {
        this.setState(transition.toState);
        return;
      }
    }
  }

  /**
   * Trigger transition
   */
  trigger(triggerName: string): boolean {
    if (!this.currentState) {
      return false;
    }

    const state = this.states.get(this.currentState);
    if (!state) {
      return false;
    }

    for (const transition of state.transitions) {
      if (transition.trigger === triggerName) {
        return this.setState(transition.toState);
      }
    }

    return false;
  }

  /**
   * Get current animation clip
   */
  getCurrentClip(): AnimationClip | null {
    if (!this.currentState) {
      return null;
    }
    return this.states.get(this.currentState)?.clip || null;
  }

  /**
   * Play animation
   */
  play(): void {
    if (this.currentState) {
      this.states.get(this.currentState)?.clip.play();
    } else if (this.defaultState) {
      this.setState(this.defaultState);
    }
  }

  /**
   * Stop animation
   */
  stop(): void {
    if (this.currentState) {
      this.states.get(this.currentState)?.clip.stop();
    }
  }

  /**
   * Pause animation
   */
  pause(): void {
    if (this.currentState) {
      this.states.get(this.currentState)?.clip.pause();
    }
  }
}
