/**
 * Action bindings - map keys/buttons to game actions
 */

import { KeyCode } from './input';
import { MouseButton } from './input';

export type InputBinding = KeyCode | MouseButton | string; // string for custom bindings

export interface ActionBinding {
  action: string;
  bindings: InputBinding[];
  value?: number; // For axis/analog inputs
}

/**
 * Action binding manager
 */
export class ActionBindings {
  private bindings = new Map<string, Set<InputBinding>>();
  private actionValues = new Map<string, number>();

  /**
   * Register an action binding
   */
  bind(action: string, input: InputBinding): void {
    if (!this.bindings.has(action)) {
      this.bindings.set(action, new Set());
    }
    this.bindings.get(action)!.add(input);
  }

  /**
   * Unbind an action
   */
  unbind(action: string, input?: InputBinding): void {
    if (!input) {
      // Remove all bindings for this action
      this.bindings.delete(action);
      this.actionValues.delete(action);
      return;
    }

    const actionBindings = this.bindings.get(action);
    if (actionBindings) {
      actionBindings.delete(input);
      if (actionBindings.size === 0) {
        this.bindings.delete(action);
        this.actionValues.delete(action);
      }
    }
  }

  /**
   * Get all bindings for an action
   */
  getBindings(action: string): InputBinding[] {
    return Array.from(this.bindings.get(action) || []);
  }

  /**
   * Check if an action has any bindings
   */
  hasAction(action: string): boolean {
    return this.bindings.has(action);
  }

  /**
   * Get all registered actions
   */
  getActions(): string[] {
    return Array.from(this.bindings.keys());
  }

  /**
   * Set action value (for analog/axis inputs)
   */
  setActionValue(action: string, value: number): void {
    this.actionValues.set(action, value);
  }

  /**
   * Get action value
   */
  getActionValue(action: string): number {
    return this.actionValues.get(action) || 0;
  }

  /**
   * Clear all bindings
   */
  clear(): void {
    this.bindings.clear();
    this.actionValues.clear();
  }

  /**
   * Serialize bindings
   */
  serialize(): Record<string, InputBinding[]> {
    const result: Record<string, InputBinding[]> = {};
    for (const [action, bindings] of this.bindings.entries()) {
      result[action] = Array.from(bindings);
    }
    return result;
  }

  /**
   * Deserialize bindings
   */
  deserialize(data: Record<string, InputBinding[]>): void {
    this.clear();
    for (const [action, bindings] of Object.entries(data)) {
      for (const binding of bindings) {
        this.bind(action, binding);
      }
    }
  }
}
