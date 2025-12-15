/**
 * Animation integration nodes
 */

import { NodeDefinition, ExecutionContext, ExecutionResult, NodeCategory } from '../graph/nodeRegistry';
import { PinType } from '../graph/pinTypes';
import { APICatalog } from '../autogen/apiCatalog';

export function registerAnimationNodes(catalog: APICatalog): void {
  // Play Animation
  catalog.register({
    name: 'playAnimation',
    displayName: 'Play Animation',
    category: NodeCategory.Engine,
    description: 'Play an animation on an entity',
    parameters: [
      { name: 'entity', type: PinType.EntityRef, required: true },
      { name: 'animationName', type: PinType.String, required: true },
      { name: 'loop', type: PinType.Bool, defaultValue: false },
    ],
    execInput: true,
    execOutput: true,
    pure: false,
  });

  // Set Animation Speed
  catalog.register({
    name: 'setAnimationSpeed',
    displayName: 'Set Animation Speed',
    category: NodeCategory.Engine,
    description: 'Set the playback speed of an animation',
    parameters: [
      { name: 'entity', type: PinType.EntityRef, required: true },
      { name: 'speed', type: PinType.Float, defaultValue: 1.0 },
    ],
    execInput: true,
    execOutput: true,
    pure: false,
  });
}
