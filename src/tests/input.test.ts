import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputState, KeyCode, MouseButton } from '../input/input';
import { ActionBindings } from '../input/bindings';
import { InputManager } from '../input/inputManager';

describe('InputState', () => {
  let inputState: InputState;

  beforeEach(() => {
    inputState = new InputState();
  });

  describe('Keyboard Input', () => {
    it('should track key down state', () => {
      inputState.setKey(KeyCode.KeyW, true);
      expect(inputState.isKeyDown(KeyCode.KeyW)).toBe(true);
      expect(inputState.isKeyDown(KeyCode.KeyA)).toBe(false);
    });

    it('should detect key pressed (just pressed this frame)', () => {
      inputState.setKey(KeyCode.KeyW, true);
      expect(inputState.isKeyPressed(KeyCode.KeyW)).toBe(true);
      
      // Clear frame state
      inputState.clearFrameState();
      expect(inputState.isKeyPressed(KeyCode.KeyW)).toBe(false);
      expect(inputState.isKeyDown(KeyCode.KeyW)).toBe(true); // Still held
    });

    it('should detect key released (just released this frame)', () => {
      inputState.setKey(KeyCode.KeyW, true);
      inputState.clearFrameState();
      
      inputState.setKey(KeyCode.KeyW, false);
      expect(inputState.isKeyReleased(KeyCode.KeyW)).toBe(true);
      expect(inputState.isKeyDown(KeyCode.KeyW)).toBe(false);
      
      inputState.clearFrameState();
      expect(inputState.isKeyReleased(KeyCode.KeyW)).toBe(false);
    });

    it('should handle multiple keys', () => {
      inputState.setKey(KeyCode.KeyW, true);
      inputState.setKey(KeyCode.KeyA, true);
      inputState.setKey(KeyCode.KeyS, true);
      
      expect(inputState.isKeyDown(KeyCode.KeyW)).toBe(true);
      expect(inputState.isKeyDown(KeyCode.KeyA)).toBe(true);
      expect(inputState.isKeyDown(KeyCode.KeyS)).toBe(true);
    });
  });

  describe('Mouse Input', () => {
    it('should track mouse position', () => {
      inputState.setMousePosition(100, 200);
      const pos = inputState.getMousePosition();
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(200);
    });

    it('should calculate mouse delta', () => {
      inputState.setMousePosition(100, 200);
      inputState.setMousePosition(150, 250);
      
      const delta = inputState.getMouseDelta();
      expect(delta.x).toBe(50);
      expect(delta.y).toBe(50);
    });

    it('should track mouse buttons', () => {
      inputState.setMouseButton(MouseButton.Left, true);
      expect(inputState.isMouseButtonDown(MouseButton.Left)).toBe(true);
      expect(inputState.isMouseButtonDown(MouseButton.Right)).toBe(false);
      
      inputState.setMouseButton(MouseButton.Left, false);
      expect(inputState.isMouseButtonDown(MouseButton.Left)).toBe(false);
    });

    it('should track mouse wheel', () => {
      inputState.setMouseWheel(10);
      const mouse = inputState.getMouse();
      expect(mouse.wheelDelta).toBe(10);
    });
  });

  describe('Touch Input', () => {
    it('should track touches', () => {
      inputState.setTouch(0, 100, 200);
      const touch = inputState.getTouch(0);
      
      expect(touch).toBeDefined();
      expect(touch?.x).toBe(100);
      expect(touch?.y).toBe(200);
      expect(touch?.identifier).toBe(0);
    });

    it('should detect touches started', () => {
      inputState.setTouch(0, 100, 200);
      const started = inputState.getTouchesStarted();
      
      expect(started.length).toBe(1);
      expect(started[0].identifier).toBe(0);
      
      inputState.clearFrameState();
      const startedAfter = inputState.getTouchesStarted();
      expect(startedAfter.length).toBe(0);
    });

    it('should detect touches ended', () => {
      inputState.setTouch(0, 100, 200);
      inputState.clearFrameState();
      
      // Touch should exist
      expect(inputState.getTouch(0)).toBeDefined();
      
      inputState.removeTouch(0);
      const ended = inputState.getTouchesEnded();
      
      expect(ended.length).toBe(1);
      expect(ended[0]).toBe(0); // Returns identifiers
      expect(inputState.getTouch(0)).toBeUndefined();
    });

    it('should handle multiple touches', () => {
      inputState.setTouch(0, 100, 200);
      inputState.setTouch(1, 300, 400);
      
      const touches = inputState.getTouches();
      expect(touches.length).toBe(2);
    });
  });

  describe('Frame State', () => {
    it('should clear frame-specific state', () => {
      inputState.setKey(KeyCode.KeyW, true);
      inputState.setMousePosition(100, 200);
      inputState.setMousePosition(150, 250);
      
      expect(inputState.isKeyPressed(KeyCode.KeyW)).toBe(true);
      expect(inputState.getMouseDelta().x).toBe(50);
      
      inputState.clearFrameState();
      
      expect(inputState.isKeyPressed(KeyCode.KeyW)).toBe(false);
      expect(inputState.getMouseDelta().x).toBe(0);
      expect(inputState.isKeyDown(KeyCode.KeyW)).toBe(true); // Still held
    });
  });
});

describe('ActionBindings', () => {
  let bindings: ActionBindings;

  beforeEach(() => {
    bindings = new ActionBindings();
  });

  it('should bind actions to inputs', () => {
    bindings.bind('MoveUp', KeyCode.KeyW);
    bindings.bind('MoveUp', KeyCode.ArrowUp);
    
    const moveUpBindings = bindings.getBindings('MoveUp');
    expect(moveUpBindings.length).toBe(2);
    expect(moveUpBindings).toContain(KeyCode.KeyW);
    expect(moveUpBindings).toContain(KeyCode.ArrowUp);
  });

  it('should unbind actions', () => {
    bindings.bind('MoveUp', KeyCode.KeyW);
    bindings.bind('MoveUp', KeyCode.ArrowUp);
    
    bindings.unbind('MoveUp', KeyCode.KeyW);
    const moveUpBindings = bindings.getBindings('MoveUp');
    expect(moveUpBindings.length).toBe(1);
    expect(moveUpBindings).toContain(KeyCode.ArrowUp);
  });

  it('should unbind all bindings for an action', () => {
    bindings.bind('MoveUp', KeyCode.KeyW);
    bindings.bind('MoveUp', KeyCode.ArrowUp);
    
    bindings.unbind('MoveUp');
    expect(bindings.hasAction('MoveUp')).toBe(false);
  });

  it('should set and get action values', () => {
    bindings.setActionValue('MoveHorizontal', 0.5);
    expect(bindings.getActionValue('MoveHorizontal')).toBe(0.5);
    
    bindings.setActionValue('MoveHorizontal', -0.3);
    expect(bindings.getActionValue('MoveHorizontal')).toBe(-0.3);
  });

  it('should serialize and deserialize bindings', () => {
    bindings.bind('MoveUp', KeyCode.KeyW);
    bindings.bind('MoveDown', KeyCode.KeyS);
    bindings.bind('Fire', MouseButton.Left);
    
    const serialized = bindings.serialize();
    
    const newBindings = new ActionBindings();
    newBindings.deserialize(serialized);
    
    expect(newBindings.getBindings('MoveUp')).toEqual([KeyCode.KeyW]);
    expect(newBindings.getBindings('MoveDown')).toEqual([KeyCode.KeyS]);
    expect(newBindings.getBindings('Fire')).toEqual([MouseButton.Left]);
  });
});

describe('InputManager', () => {
  let manager: InputManager;
  let element: HTMLElement;

  beforeEach(() => {
    manager = new InputManager();
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    manager.disable();
    document.body.removeChild(element);
  });

  it('should enable and disable input capture', () => {
    expect(() => manager.enable(element)).not.toThrow();
    expect(() => manager.disable()).not.toThrow();
  });

  it('should bind actions', () => {
    manager.bindAction('MoveUp', KeyCode.KeyW);
    manager.bindAction('MoveDown', KeyCode.KeyS);
    manager.bindAction('Fire', MouseButton.Left);
    
    const bindings = manager.getBindings();
    expect(bindings.hasAction('MoveUp')).toBe(true);
    expect(bindings.hasAction('MoveDown')).toBe(true);
    expect(bindings.hasAction('Fire')).toBe(true);
  });

  it('should check action state', () => {
    manager.enable(element);
    manager.bindAction('MoveUp', KeyCode.KeyW);
    
    // Simulate key press
    const inputState = manager.getInputState();
    inputState.setKey(KeyCode.KeyW, true);
    
    expect(manager.isActionPressed('MoveUp')).toBe(true);
    expect(manager.isActionHeld('MoveUp')).toBe(true);
    
    manager.update();
    expect(manager.isActionPressed('MoveUp')).toBe(false);
    expect(manager.isActionHeld('MoveUp')).toBe(true);
    
    inputState.setKey(KeyCode.KeyW, false);
    expect(manager.isActionReleased('MoveUp')).toBe(true);
    expect(manager.isActionHeld('MoveUp')).toBe(false);
  });

  it('should handle multiple bindings for same action', () => {
    manager.enable(element);
    manager.bindAction('MoveUp', KeyCode.KeyW);
    manager.bindAction('MoveUp', KeyCode.ArrowUp);
    
    const inputState = manager.getInputState();
    
    // Press W
    inputState.setKey(KeyCode.KeyW, true);
    expect(manager.isActionHeld('MoveUp')).toBe(true);
    
    manager.update();
    inputState.setKey(KeyCode.KeyW, false);
    
    // Press ArrowUp
    inputState.setKey(KeyCode.ArrowUp, true);
    expect(manager.isActionHeld('MoveUp')).toBe(true);
  });

  it('should update frame state', () => {
    manager.enable(element);
    manager.bindAction('MoveUp', KeyCode.KeyW);
    
    const inputState = manager.getInputState();
    inputState.setKey(KeyCode.KeyW, true);
    
    expect(manager.isActionPressed('MoveUp')).toBe(true);
    
    manager.update();
    
    expect(manager.isActionPressed('MoveUp')).toBe(false);
    expect(manager.isActionHeld('MoveUp')).toBe(true);
  });

  it('should reset input state', () => {
    manager.enable(element);
    manager.bindAction('MoveUp', KeyCode.KeyW);
    
    const inputState = manager.getInputState();
    inputState.setKey(KeyCode.KeyW, true);
    
    manager.reset();
    
    expect(manager.isActionHeld('MoveUp')).toBe(false);
    expect(manager.getBindings().hasAction('MoveUp')).toBe(false);
  });
});

describe('Input Action Mapping Correctness', () => {
  let manager: InputManager;
  let element: HTMLElement;

  beforeEach(() => {
    manager = new InputManager();
    element = document.createElement('div');
    document.body.appendChild(element);
    manager.enable(element);
  });

  afterEach(() => {
    manager.disable();
    document.body.removeChild(element);
  });

  it('should correctly map MoveUp action', () => {
    manager.bindAction('MoveUp', KeyCode.KeyW);
    
    const inputState = manager.getInputState();
    inputState.setKey(KeyCode.KeyW, true);
    
    const action = manager.getAction('MoveUp');
    expect(action.pressed).toBe(true);
    expect(action.held).toBe(true);
    expect(action.released).toBe(false);
  });

  it('should correctly map MoveDown action', () => {
    manager.bindAction('MoveDown', KeyCode.KeyS);
    
    const inputState = manager.getInputState();
    inputState.setKey(KeyCode.KeyS, true);
    
    const action = manager.getAction('MoveDown');
    expect(action.held).toBe(true);
  });

  it('should correctly map Fire action with mouse', () => {
    manager.bindAction('Fire', MouseButton.Left);
    
    const inputState = manager.getInputState();
    inputState.setMouseButton(MouseButton.Left, true);
    
    const action = manager.getAction('Fire');
    expect(action.held).toBe(true);
  });

  it('should handle action with multiple bindings', () => {
    manager.bindAction('MoveUp', KeyCode.KeyW);
    manager.bindAction('MoveUp', KeyCode.ArrowUp);
    
    const inputState = manager.getInputState();
    
    // Press W
    inputState.setKey(KeyCode.KeyW, true);
    let action = manager.getAction('MoveUp');
    expect(action.held).toBe(true);
    
    manager.update();
    inputState.setKey(KeyCode.KeyW, false);
    
    // Press ArrowUp
    inputState.setKey(KeyCode.ArrowUp, true);
    action = manager.getAction('MoveUp');
    expect(action.held).toBe(true);
  });

  it('should return correct action values', () => {
    manager.bindAction('MoveHorizontal', KeyCode.ArrowLeft);
    manager.getBindings().setActionValue('MoveHorizontal', -1.0);
    
    expect(manager.getActionValue('MoveHorizontal')).toBe(-1.0);
    
    manager.getBindings().setActionValue('MoveHorizontal', 1.0);
    expect(manager.getActionValue('MoveHorizontal')).toBe(1.0);
  });
});
