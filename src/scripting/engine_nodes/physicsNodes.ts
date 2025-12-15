/**
 * Physics integration nodes
 */

import { NodeCategory } from '../graph/nodeRegistry';
import { PinType } from '../graph/pinTypes';
import { APICatalog } from '../autogen/apiCatalog';

export function registerPhysicsNodes(catalog: APICatalog): void {
  // Set Velocity
  catalog.register({
    name: 'setVelocity',
    displayName: 'Set Velocity',
    category: NodeCategory.Engine,
    description: 'Set the velocity of a physics body',
    parameters: [
      { name: 'entity', type: PinType.EntityRef, required: true },
      { name: 'velocity', type: PinType.Vec2, required: true },
    ],
    execInput: true,
    execOutput: true,
    pure: false,
  });

  // Add Force
  catalog.register({
    name: 'addForce',
    displayName: 'Add Force',
    category: NodeCategory.Engine,
    description: 'Apply a force to a physics body',
    parameters: [
      { name: 'entity', type: PinType.EntityRef, required: true },
      { name: 'force', type: PinType.Vec2, required: true },
    ],
    execInput: true,
    execOutput: true,
    pure: false,
  });

  // On Collision Enter
  catalog.register({
    name: 'onCollisionEnter',
    displayName: 'On Collision Enter',
    category: NodeCategory.Engine,
    description: 'Event fired when collision begins',
    parameters: [
      { name: 'otherEntity', type: PinType.EntityRef },
    ],
    execOutput: true,
    pure: false,
  });

  // On Collision Exit
  catalog.register({
    name: 'onCollisionExit',
    displayName: 'On Collision Exit',
    category: NodeCategory.Engine,
    description: 'Event fired when collision ends',
    parameters: [
      { name: 'otherEntity', type: PinType.EntityRef },
    ],
    execOutput: true,
    pure: false,
  });
}
