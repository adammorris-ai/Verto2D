/**
 * Audio integration nodes
 */

import { NodeCategory } from '../graph/nodeRegistry';
import { PinType } from '../graph/pinTypes';
import { APICatalog } from '../autogen/apiCatalog';

export function registerAudioNodes(catalog: APICatalog): void {
  // Play Sound
  catalog.register({
    name: 'playSound',
    displayName: 'Play Sound',
    category: NodeCategory.Engine,
    description: 'Play an audio clip',
    parameters: [
      { name: 'audioClip', type: PinType.AssetRef, required: true },
      { name: 'volume', type: PinType.Float, defaultValue: 1.0 },
      { name: 'pitch', type: PinType.Float, defaultValue: 1.0 },
    ],
    execInput: true,
    execOutput: true,
    pure: false,
  });

  // Stop Sound
  catalog.register({
    name: 'stopSound',
    displayName: 'Stop Sound',
    category: NodeCategory.Engine,
    description: 'Stop a playing audio clip',
    parameters: [
      { name: 'audioClip', type: PinType.AssetRef, required: true },
    ],
    execInput: true,
    execOutput: true,
    pure: false,
  });
}
