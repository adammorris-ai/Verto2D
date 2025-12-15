/**
 * Graph compiler - converts graph into execution plan
 */

import { Graph, NodeId } from './graphTypes';
import { PinType } from './pinTypes';
import { NodeRegistry } from './nodeRegistry';
import { GraphValidator, ValidationError } from './validator';

export interface ExecutionPlan {
  nodes: ExecutionNode[];
  execOrder: NodeId[];
  dataFlow: Map<NodeId, Set<NodeId>>; // Node -> nodes that depend on its outputs
}

export interface ExecutionNode {
  nodeId: NodeId;
  nodeType: string;
  inputValues: Map<string, unknown>; // Pin ID -> value
  outputValues: Map<string, unknown>; // Pin ID -> value
  dependencies: Set<NodeId>; // Nodes that must execute before this
}

// NodeId is exported from graphTypes

export class GraphCompiler {
  private validator: GraphValidator;

  constructor(registry: NodeRegistry) {
    this.validator = new GraphValidator(registry);
  }

  /**
   * Compile graph into execution plan
   */
  compile(graph: Graph): { plan: ExecutionPlan; errors: ValidationError[] } {
    const errors = this.validator.validate(graph);
    if (errors.some(e => e.severity === 'error')) {
      return {
        plan: {
          nodes: [],
          execOrder: [],
          dataFlow: new Map(),
        },
        errors,
      };
    }

    // Build execution nodes
    const executionNodes = this.buildExecutionNodes(graph);
    
    // Calculate dependencies
    const dependencies = this.calculateDependencies(graph, executionNodes);
    
    // Topological sort for execution order
    const execOrder = this.topologicalSort(executionNodes, dependencies);
    
    // Build data flow graph
    const dataFlow = this.buildDataFlow(graph, executionNodes);

    return {
      plan: {
        nodes: executionNodes,
        execOrder,
        dataFlow,
      },
      errors: [],
    };
  }

  /**
   * Build execution nodes from graph
   */
  private buildExecutionNodes(graph: Graph): ExecutionNode[] {
    const nodes: ExecutionNode[] = [];

    for (const node of graph.nodes.values()) {
      const inputValues = new Map<string, unknown>();
      const outputValues = new Map<string, unknown>();

      // Initialize input values with defaults
      for (const input of node.inputs) {
        if (input.defaultValue !== undefined) {
          inputValues.set(input.id, input.defaultValue);
        }
      }

      nodes.push({
        nodeId: node.id,
        nodeType: node.type,
        inputValues,
        outputValues,
        dependencies: new Set(),
      });
    }

    return nodes;
  }

  /**
   * Calculate node dependencies
   */
  private calculateDependencies(
    graph: Graph,
    executionNodes: ExecutionNode[]
  ): Map<NodeId, Set<NodeId>> {
    const dependencies = new Map<NodeId, Set<NodeId>>();

    for (const execNode of executionNodes) {
      dependencies.set(execNode.nodeId, new Set());
    }

    // For data pins, add dependencies
    for (const edge of graph.edges.values()) {
      const fromNode = graph.nodes.get(edge.fromNode);
      const toNode = graph.nodes.get(edge.toNode);
      
      if (!fromNode || !toNode) continue;

      const fromPin = fromNode.outputs.find(p => p.id === edge.fromPin);
      const toPin = toNode.inputs.find(p => p.id === edge.toPin);

      if (!fromPin || !toPin) continue;

      // Data dependencies (non-exec pins)
      if (fromPin.type !== PinType.Exec && toPin.type !== PinType.Exec) {
        const toDeps = dependencies.get(edge.toNode);
        if (toDeps) {
          toDeps.add(edge.fromNode);
        }
      }
    }

    return dependencies;
  }

  /**
   * Topological sort for execution order
   */
  private topologicalSort(
    nodes: ExecutionNode[],
    dependencies: Map<NodeId, Set<NodeId>>
  ): NodeId[] {
    const sorted: NodeId[] = [];
    const visited = new Set<NodeId>();
    const visiting = new Set<NodeId>();

    const visit = (nodeId: NodeId): void => {
      if (visiting.has(nodeId)) {
        // Cycle detected (should have been caught by validator)
        return;
      }

      if (visited.has(nodeId)) {
        return;
      }

      visiting.add(nodeId);

      const deps = dependencies.get(nodeId) || new Set();
      for (const dep of deps) {
        visit(dep);
      }

      visiting.delete(nodeId);
      visited.add(nodeId);
      sorted.push(nodeId);
    };

    for (const node of nodes) {
      if (!visited.has(node.nodeId)) {
        visit(node.nodeId);
      }
    }

    return sorted;
  }

  /**
   * Build data flow graph
   */
  private buildDataFlow(
    graph: Graph,
    executionNodes: ExecutionNode[]
  ): Map<NodeId, Set<NodeId>> {
    const dataFlow = new Map<NodeId, Set<NodeId>>();

    for (const execNode of executionNodes) {
      dataFlow.set(execNode.nodeId, new Set());
    }

    for (const edge of graph.edges.values()) {
      const fromNode = graph.nodes.get(edge.fromNode);
      if (!fromNode) continue;

      const fromPin = fromNode.outputs.find(p => p.id === edge.fromPin);
      if (!fromPin || fromPin.type === PinType.Exec) continue;

      const consumers = dataFlow.get(edge.fromNode);
      if (consumers) {
        consumers.add(edge.toNode);
      }
    }

    return dataFlow;
  }
}
