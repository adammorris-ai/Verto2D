/**
 * Input integration nodes
 */

import { NodeCategory } from '../graph/nodeRegistry';
import { PinType } from '../graph/pinTypes';
import { APICatalog } from '../autogen/apiCatalog';

export function registerInputNodes(catalog: APICatalog): void {
  // Get Input Action Value
  catalog.register({
    name: 'getInputActionValue',
    displayName: 'Get Input Action Value',
    category: NodeCategory.Engine,
    description: 'Get the value of an input action (for axis inputs)',
    parameters: [
      { name: 'action', type: PinType.String, required: true },
    ],
    returnType: PinType.Float,
    pure: true,
  });

  // Is Input Action Pressed
  catalog.register({
    name: 'isInputActionPressed',
    displayName: 'Is Input Action Pressed',
    category: NodeCategory.Engine,
    description: 'Check if an input action was just pressed',
    parameters: [
      { name: 'action', type: PinType.String, required: true },
    ],
    returnType: PinType.Bool,
    pure: true,
  });

  // Is Input Action Held
  catalog.register({
    name: 'isInputActionHeld',
    displayName: 'Is Input Action Held',
    category: NodeCategory.Engine,
    description: 'Check if an input action is currently held',
    parameters: [
      { name: 'action', type: PinType.String, required: true },
    ],
    returnType: PinType.Bool,
    pure: true,
  });
}
