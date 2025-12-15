/**
 * Input Manager - coordinates input state and action bindings
 */

import { InputState, KeyCode, MouseButton } from './input';
import { ActionBindings, InputBinding } from './bindings';

export interface ActionState {
  pressed: boolean;
  held: boolean;
  released: boolean;
  value: number;
}

/**
 * Input Manager - main interface for input handling
 */
export class InputManager {
  private inputState: InputState;
  private bindings: ActionBindings;
  private element: HTMLElement | null = null;
  private isEnabled = false;

  constructor() {
    this.inputState = new InputState();
    this.bindings = new ActionBindings();
  }

  /**
   * Enable input capture for an element
   */
  enable(element: HTMLElement): void {
    if (this.isEnabled) {
      this.disable();
    }

    this.element = element;
    this.setupEventListeners();
    this.isEnabled = true;
  }

  /**
   * Disable input capture
   */
  disable(): void {
    if (this.element) {
      this.removeEventListeners();
      this.element = null;
    }
    this.isEnabled = false;
    this.inputState.reset();
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.element) return;

    this.element.addEventListener('keydown', this.handleKeyDown);
    this.element.addEventListener('keyup', this.handleKeyUp);
    this.element.addEventListener('mousemove', this.handleMouseMove);
    this.element.addEventListener('mousedown', this.handleMouseDown);
    this.element.addEventListener('mouseup', this.handleMouseUp);
    this.element.addEventListener('wheel', this.handleWheel);
    this.element.addEventListener('touchstart', this.handleTouchStart);
    this.element.addEventListener('touchmove', this.handleTouchMove);
    this.element.addEventListener('touchend', this.handleTouchEnd);
    this.element.addEventListener('touchcancel', this.handleTouchCancel);

    // Prevent context menu on right click
    this.element.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * Remove event listeners
   */
  private removeEventListeners(): void {
    if (!this.element) return;

    this.element.removeEventListener('keydown', this.handleKeyDown);
    this.element.removeEventListener('keyup', this.handleKeyUp);
    this.element.removeEventListener('mousemove', this.handleMouseMove);
    this.element.removeEventListener('mousedown', this.handleMouseDown);
    this.element.removeEventListener('mouseup', this.handleMouseUp);
    this.element.removeEventListener('wheel', this.handleWheel);
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);
  }

  /**
   * Event handlers
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    const keyCode = e.code as KeyCode;
    this.inputState.setKey(keyCode, true);
    e.preventDefault();
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    const keyCode = e.code as KeyCode;
    this.inputState.setKey(keyCode, false);
    e.preventDefault();
  };

  private handleMouseMove = (e: MouseEvent): void => {
    const rect = this.element!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.inputState.setMousePosition(x, y);
  };

  private handleMouseDown = (e: MouseEvent): void => {
    this.inputState.setMouseButton(e.button as MouseButton, true);
  };

  private handleMouseUp = (e: MouseEvent): void => {
    this.inputState.setMouseButton(e.button as MouseButton, false);
  };

  private handleWheel = (e: WheelEvent): void => {
    this.inputState.setMouseWheel(e.deltaY);
    e.preventDefault();
  };

  private handleTouchStart = (e: TouchEvent): void => {
    const rect = this.element!.getBoundingClientRect();
    for (const touch of Array.from(e.changedTouches)) {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      this.inputState.setTouch(touch.identifier, x, y, touch.force || undefined);
    }
    e.preventDefault();
  };

  private handleTouchMove = (e: TouchEvent): void => {
    const rect = this.element!.getBoundingClientRect();
    for (const touch of Array.from(e.changedTouches)) {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      this.inputState.setTouch(touch.identifier, x, y, touch.force || undefined);
    }
    e.preventDefault();
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    for (const touch of Array.from(e.changedTouches)) {
      this.inputState.removeTouch(touch.identifier);
    }
    e.preventDefault();
  };

  private handleTouchCancel = (e: TouchEvent): void => {
    for (const touch of Array.from(e.changedTouches)) {
      this.inputState.removeTouch(touch.identifier);
    }
    e.preventDefault();
  };

  /**
   * Get action state
   */
  getAction(action: string): ActionState {
    const bindings = this.bindings.getBindings(action);
    let pressed = false;
    let held = false;
    let released = false;

    for (const binding of bindings) {
      if (typeof binding === 'string') {
        // Custom binding - check if it's a key code
        const keyCode = binding as KeyCode;
        if (this.inputState.isKeyPressed(keyCode)) {
          pressed = true;
        }
        if (this.inputState.isKeyDown(keyCode)) {
          held = true;
        }
        if (this.inputState.isKeyReleased(keyCode)) {
          released = true;
        }
      } else if (typeof binding === 'number') {
        // Mouse button
        if (this.inputState.isMouseButtonDown(binding as MouseButton)) {
          held = true;
        }
      } else {
        // KeyCode enum
        if (this.inputState.isKeyPressed(binding as KeyCode)) {
          pressed = true;
        }
        if (this.inputState.isKeyDown(binding as KeyCode)) {
          held = true;
        }
        if (this.inputState.isKeyReleased(binding as KeyCode)) {
          released = true;
        }
      }
    }

    return {
      pressed,
      held,
      released,
      value: this.bindings.getActionValue(action),
    };
  }

  /**
   * Check if action is pressed
   */
  isActionPressed(action: string): boolean {
    return this.getAction(action).pressed;
  }

  /**
   * Check if action is held
   */
  isActionHeld(action: string): boolean {
    return this.getAction(action).held;
  }

  /**
   * Check if action is released
   */
  isActionReleased(action: string): boolean {
    return this.getAction(action).released;
  }

  /**
   * Get action value (for axis inputs)
   */
  getActionValue(action: string): number {
    return this.getAction(action).value;
  }

  /**
   * Bind an action
   */
  bindAction(action: string, input: InputBinding): void {
    this.bindings.bind(action, input);
  }

  /**
   * Unbind an action
   */
  unbindAction(action: string, input?: InputBinding): void {
    this.bindings.unbind(action, input);
  }

  /**
   * Get input state (for direct access)
   */
  getInputState(): InputState {
    return this.inputState;
  }

  /**
   * Get bindings (for direct access)
   */
  getBindings(): ActionBindings {
    return this.bindings;
  }

  /**
   * Update (call at end of frame to clear frame-specific state)
   */
  update(): void {
    this.inputState.clearFrameState();
  }

  /**
   * Reset all input state
   */
  reset(): void {
    this.inputState.reset();
    this.bindings.clear();
  }
}
