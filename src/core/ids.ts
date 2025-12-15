/**
 * Entity and component ID generation
 * Uses simple incrementing counters for deterministic IDs in tests
 */

let nextEntityId = 1;
let nextComponentId = 1;

export function createEntityId(): number {
  return nextEntityId++;
}

export function createComponentId(): number {
  return nextComponentId++;
}

export function resetIds(): void {
  nextEntityId = 1;
  nextComponentId = 1;
}
