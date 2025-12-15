/**
 * Auto Node Generation - creates nodes from API catalog
 */

import { NodeDefinition, ExecutionContext, ExecutionResult } from '../graph/nodeRegistry';
import { PinDefinition } from '../graph/pinTypes';
import { APICatalog, APIFunction } from './apiCatalog';

export class NodeAutoGenerator {
  private catalog: APICatalog;
  private nodeImplementations = new Map<string, (context: ExecutionContext) => ExecutionResult>();

  constructor(catalog: APICatalog) {
    this.catalog = catalog;
  }

  /**
   * Register implementation for an API function
   */
  registerImplementation(
    functionName: string,
    implementation: (context: ExecutionContext) => ExecutionResult
  ): void {
    this.nodeImplementations.set(functionName, implementation);
  }

  /**
   * Generate node definition from API function
   */
  generateNode(func: APIFunction): NodeDefinition {
    const inputs: PinDefinition[] = [];
    const outputs: PinDefinition[] = [];

    // Add exec input if needed
    if (func.execInput) {
      inputs.push({
        id: 'exec',
        name: 'Exec',
        type: 'exec' as any,
        direction: 'input',
      });
    }

    // Add function parameters as inputs
    for (const param of func.parameters) {
      inputs.push({
        id: param.name,
        name: param.name,
        type: param.type,
        direction: 'input',
        defaultValue: param.defaultValue,
        required: param.required !== false,
      });
    }

    // Add exec output if needed
    if (func.execOutput) {
      outputs.push({
        id: 'exec',
        name: 'Exec',
        type: 'exec' as any,
        direction: 'output',
      });
    }

    // Add return value as output
    if (func.returnType) {
      outputs.push({
        id: 'result',
        name: 'Result',
        type: func.returnType,
        direction: 'output',
      });
    }

    // Get implementation
    const implementation = this.nodeImplementations.get(func.name);

    return {
      type: `auto.${func.name}`,
      name: func.displayName,
      category: func.category,
      description: func.description,
      inputs,
      outputs,
      pure: func.pure,
      latent: func.latent,
      execute: implementation || this.createDefaultImplementation(func),
    };
  }

  /**
   * Generate all nodes from catalog
   */
  generateAllNodes(): NodeDefinition[] {
    return this.catalog.getAll().map(func => this.generateNode(func));
  }

  /**
   * Generate nodes by category
   */
  generateByCategory(category: any): NodeDefinition[] {
    return this.catalog.getByCategory(category).map(func => this.generateNode(func));
  }

  /**
   * Create default implementation (placeholder)
   */
  private createDefaultImplementation(func: APIFunction): (context: ExecutionContext) => ExecutionResult {
    return (context: ExecutionContext) => {
      // Default implementation - would call actual engine function
      // This is a placeholder that would be replaced with actual implementations
      console.warn(`No implementation registered for ${func.name}`);
      return ExecutionResult.Continue;
    };
  }
}
