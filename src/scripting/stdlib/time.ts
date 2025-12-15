/**
 * Time nodes (latent actions)
 */

import { NodeDefinition, ExecutionResult, NodeCategory } from '../graph/nodeRegistry';
import { PinType } from '../graph/pinTypes';

export function createTimeNodes(): NodeDefinition[] {
  return [
    {
      type: 'time.delay',
      name: 'Delay',
      category: NodeCategory.Time,
      description: 'Wait for specified duration',
      inputs: [
        { id: 'exec', name: 'Exec', type: PinType.Exec, direction: 'input' },
        { id: 'duration', name: 'Duration', type: PinType.Float, direction: 'input', defaultValue: 1.0 },
      ],
      outputs: [
        { id: 'completed', name: 'Completed', type: PinType.Exec, direction: 'output' },
      ],
      pure: false,
      latent: true,
      execute: (_node, _context) => {
        // Latent action - yield and schedule resume
        // In real implementation, would use scheduler
        return ExecutionResult.Yield;
      },
    },
  ];
}
