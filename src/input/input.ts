/**
 * Input state tracking for keyboard, mouse, and touch
 */

export enum KeyCode {
  // Letters
  KeyA = 'KeyA',
  KeyB = 'KeyB',
  KeyC = 'KeyC',
  KeyD = 'KeyD',
  KeyE = 'KeyE',
  KeyF = 'KeyF',
  KeyG = 'KeyG',
  KeyH = 'KeyH',
  KeyI = 'KeyI',
  KeyJ = 'KeyJ',
  KeyK = 'KeyK',
  KeyL = 'KeyL',
  KeyM = 'KeyM',
  KeyN = 'KeyN',
  KeyO = 'KeyO',
  KeyP = 'KeyP',
  KeyQ = 'KeyQ',
  KeyR = 'KeyR',
  KeyS = 'KeyS',
  KeyT = 'KeyT',
  KeyU = 'KeyU',
  KeyV = 'KeyV',
  KeyW = 'KeyW',
  KeyX = 'KeyX',
  KeyY = 'KeyY',
  KeyZ = 'KeyZ',

  // Numbers
  Digit0 = 'Digit0',
  Digit1 = 'Digit1',
  Digit2 = 'Digit2',
  Digit3 = 'Digit3',
  Digit4 = 'Digit4',
  Digit5 = 'Digit5',
  Digit6 = 'Digit6',
  Digit7 = 'Digit7',
  Digit8 = 'Digit8',
  Digit9 = 'Digit9',

  // Special keys
  Space = 'Space',
  Enter = 'Enter',
  Escape = 'Escape',
  Tab = 'Tab',
  Backspace = 'Backspace',
  Delete = 'Delete',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  ShiftLeft = 'ShiftLeft',
  ShiftRight = 'ShiftRight',
  ControlLeft = 'ControlLeft',
  ControlRight = 'ControlRight',
  AltLeft = 'AltLeft',
  AltRight = 'AltRight',
  MetaLeft = 'MetaLeft',
  MetaRight = 'MetaRight',
}

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2,
}

export interface MouseState {
  x: number;
  y: number;
  buttons: Set<MouseButton>;
  deltaX: number;
  deltaY: number;
  wheelDelta: number;
}

export interface TouchState {
  identifier: number;
  x: number;
  y: number;
  force?: number;
}

export interface InputSnapshot {
  keys: Map<KeyCode, boolean>;
  keysPressed: Set<KeyCode>;
  keysReleased: Set<KeyCode>;
  mouse: MouseState;
  touches: Map<number, TouchState>;
  touchesStarted: Set<number>;
  touchesEnded: Set<number>; // Identifiers only
}

/**
 * Input state manager
 */
export class InputState {
  private keys = new Map<KeyCode, boolean>();
  private keysPressed = new Set<KeyCode>();
  private keysReleased = new Set<KeyCode>();
  private mouse: MouseState = {
    x: 0,
    y: 0,
    buttons: new Set(),
    deltaX: 0,
    deltaY: 0,
    wheelDelta: 0,
  };
  private touches = new Map<number, TouchState>();
  private touchesStarted = new Set<number>();
  private touchesEnded = new Set<number>();

  /**
   * Check if key is currently held
   */
  isKeyDown(key: KeyCode): boolean {
    return this.keys.get(key) === true;
  }

  /**
   * Check if key was just pressed this frame
   */
  isKeyPressed(key: KeyCode): boolean {
    return this.keysPressed.has(key);
  }

  /**
   * Check if key was just released this frame
   */
  isKeyReleased(key: KeyCode): boolean {
    return this.keysReleased.has(key);
  }

  /**
   * Get mouse state
   */
  getMouse(): MouseState {
    return { ...this.mouse };
  }

  /**
   * Check if mouse button is down
   */
  isMouseButtonDown(button: MouseButton): boolean {
    return this.mouse.buttons.has(button);
  }

  /**
   * Get mouse position
   */
  getMousePosition(): { x: number; y: number } {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  /**
   * Get mouse delta (movement since last frame)
   */
  getMouseDelta(): { x: number; y: number } {
    return { x: this.mouse.deltaX, y: this.mouse.deltaY };
  }

  /**
   * Get all touches
   */
  getTouches(): TouchState[] {
    return Array.from(this.touches.values());
  }

  /**
   * Get touch by identifier
   */
  getTouch(identifier: number): TouchState | undefined {
    return this.touches.get(identifier);
  }

  /**
   * Get touches that started this frame
   */
  getTouchesStarted(): TouchState[] {
    return Array.from(this.touchesStarted)
      .map(id => this.touches.get(id))
      .filter((t): t is TouchState => t !== undefined);
  }

  /**
   * Get touches that ended this frame
   * Note: Returns identifiers only, as touches are removed from the map
   */
  getTouchesEnded(): number[] {
    return Array.from(this.touchesEnded);
  }

  /**
   * Get touch state for ended touches (if still available)
   */
  getTouchEndedState(identifier: number): TouchState | undefined {
    if (this.touchesEnded.has(identifier)) {
      // Try to get from touches map (might still be there if not cleared)
      return this.touches.get(identifier);
    }
    return undefined;
  }

  /**
   * Create snapshot of current input state
   */
  snapshot(): InputSnapshot {
    return {
      keys: new Map(this.keys),
      keysPressed: new Set(this.keysPressed),
      keysReleased: new Set(this.keysReleased),
      mouse: { ...this.mouse },
      touches: new Map(this.touches),
      touchesStarted: new Set(this.touchesStarted),
      touchesEnded: new Set(this.touchesEnded),
    };
  }

  /**
   * Update key state (internal)
   */
  setKey(key: KeyCode, down: boolean): void {
    const wasDown = this.keys.get(key) === true;
    this.keys.set(key, down);

    if (down && !wasDown) {
      this.keysPressed.add(key);
      this.keysReleased.delete(key);
    } else if (!down && wasDown) {
      this.keysReleased.add(key);
      this.keysPressed.delete(key);
    }
  }

  /**
   * Update mouse position (internal)
   */
  setMousePosition(x: number, y: number): void {
    this.mouse.deltaX = x - this.mouse.x;
    this.mouse.deltaY = y - this.mouse.y;
    this.mouse.x = x;
    this.mouse.y = y;
  }

  /**
   * Update mouse button (internal)
   */
  setMouseButton(button: MouseButton, down: boolean): void {
    if (down) {
      this.mouse.buttons.add(button);
    } else {
      this.mouse.buttons.delete(button);
    }
  }

  /**
   * Update mouse wheel (internal)
   */
  setMouseWheel(delta: number): void {
    this.mouse.wheelDelta = delta;
  }

  /**
   * Update touch (internal)
   */
  setTouch(identifier: number, x: number, y: number, force?: number): void {
    const wasPresent = this.touches.has(identifier);
    this.touches.set(identifier, { identifier, x, y, force });

    if (!wasPresent) {
      this.touchesStarted.add(identifier);
      this.touchesEnded.delete(identifier);
    }
  }

  /**
   * Remove touch (internal)
   */
  removeTouch(identifier: number): void {
    const wasPresent = this.touches.has(identifier);
    if (wasPresent) {
      this.touches.delete(identifier);
      this.touchesEnded.add(identifier);
      this.touchesStarted.delete(identifier);
    }
  }

  /**
   * Clear frame-specific state (call at end of frame)
   */
  clearFrameState(): void {
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    this.mouse.wheelDelta = 0;
    this.touchesStarted.clear();
    this.touchesEnded.clear();
  }

  /**
   * Reset all input state
   */
  reset(): void {
    this.keys.clear();
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mouse = {
      x: 0,
      y: 0,
      buttons: new Set(),
      deltaX: 0,
      deltaY: 0,
      wheelDelta: 0,
    };
    this.touches.clear();
    this.touchesStarted.clear();
    this.touchesEnded.clear();
  }
}
