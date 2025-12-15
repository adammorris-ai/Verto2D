/**
 * Pin type system for node graphs
 */

export enum PinType {
  Exec = 'exec',
  Bool = 'bool',
  Int = 'int',
  Float = 'float',
  String = 'string',
  Vec2 = 'vec2',
  Vec3 = 'vec3',
  Color = 'color',
  EntityRef = 'entity',
  AssetRef = 'asset',
  Array = 'array',
  Any = 'any',
}

export interface PinDefinition {
  id: string;
  name: string;
  type: PinType;
  direction: 'input' | 'output';
  defaultValue?: unknown;
  required?: boolean;
}

export class Pin {
  constructor(
    public id: string,
    public name: string,
    public type: PinType,
    public direction: 'input' | 'output',
    public defaultValue?: unknown,
    public required: boolean = false
  ) {}

  /**
   * Check if pin types are compatible
   */
  static isCompatible(typeA: PinType, typeB: PinType): boolean {
    if (typeA === typeB) return true;
    if (typeA === PinType.Any || typeB === PinType.Any) return true;
    return false;
  }

  /**
   * Clone pin
   */
  clone(): Pin {
    return new Pin(
      this.id,
      this.name,
      this.type,
      this.direction,
      this.defaultValue,
      this.required
    );
  }
}
