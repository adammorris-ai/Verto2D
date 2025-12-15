/**
 * Math nodes
 */

import { NodeDefinition, ExecutionResult, NodeCategory } from '../graph/nodeRegistry';
import { PinType } from '../graph/pinTypes';

export function createMathNodes(): NodeDefinition[] {
  return [
    {
      type: 'math.add',
      name: 'Add',
      category: NodeCategory.Math,
      description: 'Add two numbers',
      inputs: [
        { id: 'a', name: 'A', type: PinType.Float, direction: 'input', defaultValue: 0 },
        { id: 'b', name: 'B', type: PinType.Float, direction: 'input', defaultValue: 0 },
      ],
      outputs: [
        { id: 'result', name: 'Result', type: PinType.Float, direction: 'output' },
      ],
      pure: true,
      execute: (_node, context) => {
        const a = (context.getInputValue('node', 'a') as number) || 0;
        const b = (context.getInputValue('node', 'b') as number) || 0;
        context.setOutputValue('node', 'result', a + b);
        return ExecutionResult.Continue;
      },
    },
    {
      type: 'math.multiply',
      name: 'Multiply',
      category: NodeCategory.Math,
      description: 'Multiply two numbers',
      inputs: [
        { id: 'a', name: 'A', type: PinType.Float, direction: 'input', defaultValue: 1 },
        { id: 'b', name: 'B', type: PinType.Float, direction: 'input', defaultValue: 1 },
      ],
      outputs: [
        { id: 'result', name: 'Result', type: PinType.Float, direction: 'output' },
      ],
      pure: true,
      execute: (_node, context) => {
        const a = (context.getInputValue('node', 'a') as number) || 1;
        const b = (context.getInputValue('node', 'b') as number) || 1;
        context.setOutputValue('node', 'result', a * b);
        return ExecutionResult.Continue;
      },
    },
    {
      type: 'math.clamp',
      name: 'Clamp',
      category: NodeCategory.Math,
      description: 'Clamp value between min and max',
      inputs: [
        { id: 'value', name: 'Value', type: PinType.Float, direction: 'input', defaultValue: 0 },
        { id: 'min', name: 'Min', type: PinType.Float, direction: 'input', defaultValue: 0 },
        { id: 'max', name: 'Max', type: PinType.Float, direction: 'input', defaultValue: 1 },
      ],
      outputs: [
        { id: 'result', name: 'Result', type: PinType.Float, direction: 'output' },
      ],
      pure: true,
      execute: (_node, context) => {
        const value = (context.getInputValue('node', 'value') as number) || 0;
        const min = (context.getInputValue('node', 'min') as number) || 0;
        const max = (context.getInputValue('node', 'max') as number) || 1;
        context.setOutputValue('node', 'result', Math.max(min, Math.min(max, value)));
        return ExecutionResult.Continue;
      },
    },
  ];
}
