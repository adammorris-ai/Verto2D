/**
 * ECS integration nodes
 */

import { NodeDefinition, ExecutionContext, ExecutionResult, NodeCategory } from '../graph/nodeRegistry';
import { PinType } from '../graph/pinTypes';
import { APICatalog } from '../autogen/apiCatalog';

export function registerECSNodes(catalog: APICatalog): void {
  // Spawn Entity
  catalog.register({
    name: 'spawnEntity',
    displayName: 'Spawn Entity',
    category: NodeCategory.Engine,
    description: 'Create a new entity in the world',
    parameters: [
      { name: 'prefabName', type: PinType.String, required: true },
    ],
    returnType: PinType.EntityRef,
    execInput: true,
    execOutput: true,
    pure: false,
  });

  // Destroy Entity
  catalog.register({
    name: 'destroyEntity',
    displayName: 'Destroy Entity',
    category: NodeCategory.Engine,
    description: 'Remove an entity from the world',
    parameters: [
      { name: 'entity', type: PinType.EntityRef, required: true },
    ],
    execInput: true,
    execOutput: true,
    pure: false,
  });

  // Get Component
  catalog.register({
    name: 'getComponent',
    displayName: 'Get Component',
    category: NodeCategory.Engine,
    description: 'Get a component from an entity',
    parameters: [
      { name: 'entity', type: PinType.EntityRef, required: true },
      { name: 'componentType', type: PinType.Int, required: true },
    ],
    returnType: PinType.Any,
    pure: true,
  });

  // Set Component
  catalog.register({
    name: 'setComponent',
    displayName: 'Set Component',
    category: NodeCategory.Engine,
    description: 'Set a component on an entity',
    parameters: [
      { name: 'entity', type: PinType.EntityRef, required: true },
      { name: 'componentType', type: PinType.Int, required: true },
      { name: 'data', type: PinType.Any, required: true },
    ],
    execInput: true,
    execOutput: true,
    pure: false,
  });
}
