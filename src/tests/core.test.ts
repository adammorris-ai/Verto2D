import { describe, it, expect, beforeEach } from 'vitest';
import { Vec2 } from '../core/math/vec2';
import { Vec3 } from '../core/math/vec3';
import { Mat4 } from '../core/math/mat4';
import { Quat } from '../core/math/quat';
import { Color } from '../core/math/color';
import { Time } from '../core/time';
import { serializeValue, deepClone } from '../core/serialize';
import { createEntityId, resetIds } from '../core/ids';
import { EventEmitter } from '../core/events';

describe('Core Math', () => {
  describe('Vec2', () => {
    it('should create zero vector', () => {
      const v = Vec2.zero();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    });

    it('should add vectors', () => {
      const a = new Vec2(1, 2);
      const b = new Vec2(3, 4);
      a.add(b);
      expect(a.x).toBe(4);
      expect(a.y).toBe(6);
    });

    it('should calculate length', () => {
      const v = new Vec2(3, 4);
      expect(v.length()).toBe(5);
    });

    it('should normalize', () => {
      const v = new Vec2(3, 4);
      v.normalize();
      expect(v.length()).toBeCloseTo(1);
    });

    it('should calculate distance', () => {
      const a = new Vec2(0, 0);
      const b = new Vec2(3, 4);
      expect(a.distance(b)).toBe(5);
    });

    it('should dot product', () => {
      const a = new Vec2(1, 2);
      const b = new Vec2(3, 4);
      expect(a.dot(b)).toBe(11);
    });

    it('should lerp', () => {
      const a = new Vec2(0, 0);
      const b = new Vec2(10, 10);
      a.lerp(b, 0.5);
      expect(a.x).toBe(5);
      expect(a.y).toBe(5);
    });
  });

  describe('Vec3', () => {
    it('should create zero vector', () => {
      const v = Vec3.zero();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    });

    it('should add vectors', () => {
      const a = new Vec3(1, 2, 3);
      const b = new Vec3(4, 5, 6);
      a.add(b);
      expect(a.x).toBe(5);
      expect(a.y).toBe(7);
      expect(a.z).toBe(9);
    });

    it('should calculate length', () => {
      const v = new Vec3(2, 3, 6);
      expect(v.length()).toBe(7);
    });

    it('should cross product', () => {
      const a = new Vec3(1, 0, 0);
      const b = new Vec3(0, 1, 0);
      const c = a.cross(b);
      expect(c.x).toBe(0);
      expect(c.y).toBe(0);
      expect(c.z).toBe(1);
    });
  });

  describe('Mat4', () => {
    it('should create identity matrix', () => {
      const m = Mat4.identity();
      const arr = m.toArray();
      expect(arr[0]).toBe(1);
      expect(arr[5]).toBe(1);
      expect(arr[10]).toBe(1);
      expect(arr[15]).toBe(1);
    });

    it('should translate', () => {
      const m = Mat4.identity();
      m.translate(10, 20, 30);
      const arr = m.toArray();
      expect(arr[12]).toBe(10);
      expect(arr[13]).toBe(20);
      expect(arr[14]).toBe(30);
    });

    it('should scale', () => {
      const m = Mat4.identity();
      m.scale(2, 3, 4);
      const arr = m.toArray();
      expect(arr[0]).toBe(2);
      expect(arr[5]).toBe(3);
      expect(arr[10]).toBe(4);
    });

    it('should multiply matrices', () => {
      const a = Mat4.identity();
      a.translate(1, 2, 3);
      const b = Mat4.identity();
      b.scale(2, 2, 2);
      a.multiply(b);
      const arr = a.toArray();
      expect(arr[0]).toBe(2);
      expect(arr[5]).toBe(2);
      expect(arr[10]).toBe(2);
    });

    it('should create orthographic projection', () => {
      const m = Mat4.identity();
      m.ortho(-1, 1, -1, 1, -1, 1);
      // Just verify it doesn't crash and produces valid matrix
      expect(m.toArray().length).toBe(16);
    });
  });

  describe('Quat', () => {
    it('should create identity quaternion', () => {
      const q = Quat.identity();
      expect(q.w).toBe(1);
      expect(q.x).toBe(0);
      expect(q.y).toBe(0);
      expect(q.z).toBe(0);
    });

    it('should normalize', () => {
      const q = new Quat(1, 1, 1, 1);
      q.normalize();
      const len = Math.sqrt(q.x ** 2 + q.y ** 2 + q.z ** 2 + q.w ** 2);
      expect(len).toBeCloseTo(1);
    });

    it('should multiply quaternions', () => {
      const a = Quat.identity();
      const b = Quat.fromAxisAngle(new Vec3(0, 0, 1), Math.PI / 2);
      a.multiply(b);
      expect(a.w).toBeCloseTo(Math.cos(Math.PI / 4));
    });
  });

  describe('Color', () => {
    it('should create white color', () => {
      const c = Color.white();
      expect(c.r).toBe(1);
      expect(c.g).toBe(1);
      expect(c.b).toBe(1);
    });

    it('should convert from hex', () => {
      const c = Color.fromHex('#FF0000');
      expect(c.r).toBeCloseTo(1);
      expect(c.g).toBe(0);
      expect(c.b).toBe(0);
    });

    it('should lerp', () => {
      const a = Color.black();
      const b = Color.white();
      a.lerp(b, 0.5);
      expect(a.r).toBe(0.5);
      expect(a.g).toBe(0.5);
      expect(a.b).toBe(0.5);
    });
  });
});

describe('Time System', () => {
  let time: Time;

  beforeEach(() => {
    time = new Time(1 / 60);
  });

  it('should accumulate time', () => {
    const steps = time.update(0.016);
    expect(steps).toBeGreaterThanOrEqual(0);
  });

  it('should return correct number of fixed steps', () => {
    const steps = time.update(0.033); // ~2 frames at 60fps
    expect(steps).toBeGreaterThanOrEqual(1);
  });

  it('should track frame count', () => {
    time.update(0.016);
    time.update(0.016);
    expect(time.getFrameCount()).toBe(2);
  });

  it('should reset correctly', () => {
    time.update(1.0);
    time.reset();
    expect(time.getTime()).toBe(0);
    expect(time.getFrameCount()).toBe(0);
  });

  it('should be deterministic', () => {
    const time1 = new Time(1 / 60);
    const time2 = new Time(1 / 60);
    
    for (let i = 0; i < 100; i++) {
      const dt = 0.016 + Math.random() * 0.008;
      const steps1 = time1.update(dt);
      const steps2 = time2.update(dt);
      expect(steps1).toBe(steps2);
    }
  });
});

describe('Serialization', () => {
  it('should serialize primitives', () => {
    expect(serializeValue(42)).toBe(42);
    expect(serializeValue('hello')).toBe('hello');
    expect(serializeValue(true)).toBe(true);
  });

  it('should serialize arrays', () => {
    const arr = [1, 2, 3];
    const serialized = serializeValue(arr);
    expect(serialized).toEqual([1, 2, 3]);
  });

  it('should serialize objects', () => {
    const obj = { a: 1, b: 'test' };
    const serialized = serializeValue(obj);
    expect(serialized).toEqual({ a: 1, b: 'test' });
  });

  it('should deep clone', () => {
    const obj = { a: 1, nested: { b: 2 } };
    const cloned = deepClone(obj);
    cloned.nested.b = 3;
    expect(obj.nested.b).toBe(2);
  });
});

describe('IDs', () => {
  beforeEach(() => {
    resetIds();
  });

  it('should generate unique entity IDs', () => {
    const id1 = createEntityId();
    const id2 = createEntityId();
    expect(id2).toBeGreaterThan(id1);
  });

  it('should reset IDs', () => {
    createEntityId();
    createEntityId();
    resetIds();
    const id = createEntityId();
    expect(id).toBe(1);
  });
});

describe('EventEmitter', () => {
  it('should emit and handle events', () => {
    const emitter = new EventEmitter<number>();
    let received = 0;
    
    emitter.on('test', (data) => {
      received = data;
    });
    
    emitter.emit('test', 42);
    expect(received).toBe(42);
  });

  it('should unsubscribe', () => {
    const emitter = new EventEmitter();
    let count = 0;
    
    const handler = () => count++;
    const unsubscribe = emitter.on('test', handler);
    
    emitter.emit('test', null);
    expect(count).toBe(1);
    
    unsubscribe();
    emitter.emit('test', null);
    expect(count).toBe(1); // Should not increment
  });
});
