/**
 * Transform nodes for entity positioning
 */

import { NodeDefinition, ExecutionContext, ExecutionResult, NodeCategory } from '../graph/nodeRegistry';
import { PinType } from '../graph/pinTypes';
import { APICatalog } from '../autogen/apiCatalog';

export function registerTransformNodes(catalog: APICatalog): void {
  // Get Transform Position
  catalog.register({
    name: 'getTransformPosition',
    displayName: 'Get Transform Position',
    category: NodeCategory.Engine,
    description: 'Get the position of an entity',
    parameters: [
      { name: 'entity', type: PinType.EntityRef, required: true },
    ],
    returnType: PinType.Vec2,
    pure: true,
  });

  // Set Transform Position
  catalog.register({
    name: 'setTransformPosition',
    displayName: 'Set Transform Position',
    category: NodeCategory.Engine,
    description: 'Set the position of an entity',
    parameters: [
      { name: 'entity', type: PinType.EntityRef, required: true },
      { name: 'position', type: PinType.Vec2, required: true },
    ],
    execInput: true,
    execOutput: true,
    pure: false,
  });

  // Add Movement Input
  catalog.register({
    name: 'addMovementInput',
    displayName: 'Add Movement Input',
    category: NodeCategory.Engine,
    description: 'Add movement input to an entity (for character movement)',
    parameters: [
      { name: 'entity', type: PinType.EntityRef, required: true },
      { name: 'direction', type: PinType.Vec2, required: true },
      { name: 'scale', type: PinType.Float, defaultValue: 1.0 },
    ],
    execInput: true,
    execOutput: true,
    pure: false,
  });
}
