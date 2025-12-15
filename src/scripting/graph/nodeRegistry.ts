/**
 * Node registry - manages available node types
 */

import { PinDefinition } from './pinTypes';
import { Node } from './graphTypes';

export enum NodeCategory {
  Flow = 'flow',
  Math = 'math',
  Logic = 'logic',
  Variables = 'variables',
  Arrays = 'arrays',
  Strings = 'strings',
  Time = 'time',
  Debug = 'debug',
  Engine = 'engine',
  Custom = 'custom',
}

export interface NodeDefinition {
  type: string;
  name: string;
  category: NodeCategory;
  description?: string;
  inputs: PinDefinition[];
  outputs: PinDefinition[];
  pure?: boolean; // Pure nodes have no side effects
  latent?: boolean; // Latent nodes can yield/resume
  execute?: (node: Node, context: ExecutionContext) => ExecutionResult;
}

export interface ExecutionContext {
  getInputValue(nodeId: string, pinId: string): unknown;
  setOutputValue(nodeId: string, pinId: string, value: unknown): void;
  executeNode(nodeId: string): ExecutionResult;
  [key: string]: unknown;
}

export enum ExecutionResult {
  Continue = 'continue',
  Yield = 'yield', // Latent action - pause execution
  Break = 'break',
  Return = 'return',
}

export class NodeRegistry {
  private nodes = new Map<string, NodeDefinition>();
  private categories = new Map<NodeCategory, Set<string>>();

  /**
   * Register a node type
   */
  register(definition: NodeDefinition): void {
    this.nodes.set(definition.type, definition);

    if (!this.categories.has(definition.category)) {
      this.categories.set(definition.category, new Set());
    }
    this.categories.get(definition.category)!.add(definition.type);
  }

  /**
   * Get node definition
   */
  get(type: string): NodeDefinition | undefined {
    return this.nodes.get(type);
  }

  /**
   * Check if node type exists
   */
  has(type: string): boolean {
    return this.nodes.has(type);
  }

  /**
   * Get all node types in a category
   */
  getByCategory(category: NodeCategory): NodeDefinition[] {
    const types = this.categories.get(category) || new Set();
    return Array.from(types)
      .map(type => this.nodes.get(type))
      .filter((def): def is NodeDefinition => def !== undefined);
  }

  /**
   * Search nodes by name/description
   */
  search(query: string): NodeDefinition[] {
    const lowerQuery = query.toLowerCase();
    const results: NodeDefinition[] = [];

    for (const definition of this.nodes.values()) {
      if (
        definition.name.toLowerCase().includes(lowerQuery) ||
        definition.type.toLowerCase().includes(lowerQuery) ||
        definition.description?.toLowerCase().includes(lowerQuery)
      ) {
        results.push(definition);
      }
    }

    return results;
  }

  /**
   * Get all registered node types
   */
  getAll(): NodeDefinition[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all categories
   */
  getCategories(): NodeCategory[] {
    return Array.from(this.categories.keys());
  }

  /**
   * Clear registry
   */
  clear(): void {
    this.nodes.clear();
    this.categories.clear();
  }
}
