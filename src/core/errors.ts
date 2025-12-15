/**
 * Engine error types
 */

export class EngineError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'EngineError';
  }
}

export class ComponentError extends EngineError {
  constructor(message: string) {
    super(message, 'COMPONENT_ERROR');
    this.name = 'ComponentError';
  }
}

export class EntityError extends EngineError {
  constructor(message: string) {
    super(message, 'ENTITY_ERROR');
    this.name = 'EntityError';
  }
}

export class ScriptingError extends EngineError {
  constructor(message: string) {
    super(message, 'SCRIPTING_ERROR');
    this.name = 'ScriptingError';
  }
}
