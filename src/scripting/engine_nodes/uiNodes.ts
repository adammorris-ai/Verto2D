/**
 * UI integration nodes
 */

import { NodeCategory } from '../graph/nodeRegistry';
import { PinType } from '../graph/pinTypes';
import { APICatalog } from '../autogen/apiCatalog';

export function registerUINodes(catalog: APICatalog): void {
  // Set UI Text
  catalog.register({
    name: 'setUIText',
    displayName: 'Set UI Text',
    category: NodeCategory.Engine,
    description: 'Set the text of a UI element',
    parameters: [
      { name: 'widgetId', type: PinType.String, required: true },
      { name: 'text', type: PinType.String, required: true },
    ],
    execInput: true,
    execOutput: true,
    pure: false,
  });

  // Show UI Widget
  catalog.register({
    name: 'showUIWidget',
    displayName: 'Show UI Widget',
    category: NodeCategory.Engine,
    description: 'Show a UI widget',
    parameters: [
      { name: 'widgetId', type: PinType.String, required: true },
    ],
    execInput: true,
    execOutput: true,
    pure: false,
  });

  // Hide UI Widget
  catalog.register({
    name: 'hideUIWidget',
    displayName: 'Hide UI Widget',
    category: NodeCategory.Engine,
    description: 'Hide a UI widget',
    parameters: [
      { name: 'widgetId', type: PinType.String, required: true },
    ],
    execInput: true,
    execOutput: true,
    pure: false,
  });
}
