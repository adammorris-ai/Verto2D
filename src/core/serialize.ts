/**
 * Serialization helpers for engine data
 */

export interface Serializable {
  serialize(): unknown;
  deserialize(data: unknown): void;
}

export function serializeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Array) {
    return value.map(serializeValue);
  }

  if (typeof value === 'object') {
    if ('serialize' in value && typeof value.serialize === 'function') {
      return (value as Serializable).serialize();
    }

    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = serializeValue(val);
    }
    return result;
  }

  throw new Error(`Cannot serialize value: ${typeof value}`);
}

export function deserializeValue<T>(data: unknown, type?: new () => T & { deserialize?: (data: unknown) => void }): T {
  if (data === null || data === undefined) {
    return data as T;
  }

  if (type) {
    const instance = new type();
    if (instance.deserialize && typeof instance.deserialize === 'function') {
      instance.deserialize(data);
      return instance as T;
    }
  }

  return data as T;
}

/**
 * Create a deep clone via serialization
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}
