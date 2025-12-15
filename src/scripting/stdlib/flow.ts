/**
 * Flow control nodes
 */

import { NodeDefinition, ExecutionContext, ExecutionResult, NodeCategory } from '../graph/nodeRegistry';
import { PinType } from '../graph/pinTypes';

export function createFlowNodes(): NodeDefinition[] {
  return [
    {
      type: 'flow.sequence',
      name: 'Sequence',
      category: NodeCategory.Flow,
      description: 'Execute outputs in order',
      inputs: [
        { id: 'exec', name: 'Exec', type: PinType.Exec, direction: 'input' },
      ],
      outputs: [
        { id: 'then0', name: 'Then 0', type: PinType.Exec, direction: 'output' },
        { id: 'then1', name: 'Then 1', type: PinType.Exec, direction: 'output' },
        { id: 'then2', name: 'Then 2', type: PinType.Exec, direction: 'output' },
      ],
      pure: false,
      execute: (node, context) => {
        // Execute outputs in sequence
        context.executeNode(node.outputs[0]?.id || '');
        context.executeNode(node.outputs[1]?.id || '');
        context.executeNode(node.outputs[2]?.id || '');
        return ExecutionResult.Continue;
      },
    },
    {
      type: 'flow.branch',
      name: 'Branch',
      category: NodeCategory.Flow,
      description: 'Execute True or False based on condition',
      inputs: [
        { id: 'exec', name: 'Exec', type: PinType.Exec, direction: 'input' },
        { id: 'condition', name: 'Condition', type: PinType.Bool, direction: 'input', required: true },
      ],
      outputs: [
        { id: 'true', name: 'True', type: PinType.Exec, direction: 'output' },
        { id: 'false', name: 'False', type: PinType.Exec, direction: 'output' },
      ],
      pure: false,
      execute: (node, context) => {
        const condition = context.getInputValue(node.id, 'condition') as boolean;
        if (condition) {
          // Find True output pin and execute
          const truePin = node.outputs.find(p => p.name === 'True');
          if (truePin) {
            context.executeNode(truePin.id);
          }
        } else {
          const falsePin = node.outputs.find(p => p.name === 'False');
          if (falsePin) {
            context.executeNode(falsePin.id);
          }
        }
        return ExecutionResult.Continue;
      },
    },
  ];
}
