/**
 * Graph validator - checks graph correctness
 */

import { Graph, Node, Edge } from './graphTypes';
import { PinType } from './pinTypes';
import { NodeRegistry, NodeDefinition } from './nodeRegistry';

export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  message: string;
  severity: 'error' | 'warning';
}

export class GraphValidator {
  private registry: NodeRegistry;

  constructor(registry: NodeRegistry) {
    this.registry = registry;
  }

  /**
   * Validate entire graph
   */
  validate(graph: Graph): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate nodes
    for (const node of graph.nodes.values()) {
      errors.push(...this.validateNode(graph, node));
    }

    // Validate edges
    for (const edge of graph.edges.values()) {
      errors.push(...this.validateEdge(graph, edge));
    }

    // Check for cycles in exec flow
    errors.push(...this.checkCycles(graph));

    return errors;
  }

  /**
   * Validate a single node
   */
  private validateNode(graph: Graph, node: Node): ValidationError[] {
    const errors: ValidationError[] = [];
    const definition = this.registry.get(node.type);

    if (!definition) {
      errors.push({
        nodeId: node.id,
        message: `Unknown node type: ${node.type}`,
        severity: 'error',
      });
      return errors;
    }

    // Check required inputs
    for (const inputDef of definition.inputs) {
      if (inputDef.required) {
        const pin = node.inputs.find(p => p.id === inputDef.id);
        if (!pin) {
          errors.push({
            nodeId: node.id,
            message: `Missing required input pin: ${inputDef.name}`,
            severity: 'error',
          });
        } else {
          // Check if pin is connected or has default value
          const edges = this.getPinEdges(graph, node.id, inputDef.id);
          if (edges.length === 0 && pin.defaultValue === undefined) {
            errors.push({
              nodeId: node.id,
              message: `Required input pin '${inputDef.name}' is not connected and has no default value`,
              severity: 'error',
            });
          }
        }
      }
    }

    // Check for latent nodes in pure functions
    if (definition.pure && definition.latent) {
      errors.push({
        nodeId: node.id,
        message: `Latent nodes cannot be used in pure functions`,
        severity: 'error',
      });
    }

    return errors;
  }

  /**
   * Validate a single edge
   */
  private validateEdge(graph: Graph, edge: Edge): ValidationError[] {
    const errors: ValidationError[] = [];

    const fromNode = graph.nodes.get(edge.fromNode);
    const toNode = graph.nodes.get(edge.toNode);

    if (!fromNode) {
      errors.push({
        edgeId: edge.id,
        message: `Source node not found: ${edge.fromNode}`,
        severity: 'error',
      });
      return errors;
    }

    if (!toNode) {
      errors.push({
        edgeId: edge.id,
        message: `Target node not found: ${edge.toNode}`,
        severity: 'error',
      });
      return errors;
    }

    const fromPin = fromNode.outputs.find(p => p.id === edge.fromPin);
    const toPin = toNode.inputs.find(p => p.id === edge.toPin);

    if (!fromPin) {
      errors.push({
        edgeId: edge.id,
        message: `Source pin not found: ${edge.fromPin}`,
        severity: 'error',
      });
    }

    if (!toPin) {
      errors.push({
        edgeId: edge.id,
        message: `Target pin not found: ${edge.toPin}`,
        severity: 'error',
      });
    }

    if (fromPin && toPin) {
      // Check exec pin rules first
      if (fromPin.type === PinType.Exec && toPin.type !== PinType.Exec) {
        errors.push({
          edgeId: edge.id,
          message: `Exec pins can only connect to exec pins`,
          severity: 'error',
        });
      } else if (fromPin.type !== PinType.Exec && toPin.type === PinType.Exec) {
        errors.push({
          edgeId: edge.id,
          message: `Data pins cannot connect to exec pins`,
          severity: 'error',
        });
      } else if (fromPin.type !== PinType.Exec && toPin.type !== PinType.Exec) {
        // Check type compatibility for data pins
        if (!this.isCompatible(fromPin.type, toPin.type)) {
          errors.push({
            edgeId: edge.id,
            message: `Type mismatch: ${fromPin.type} cannot connect to ${toPin.type}`,
            severity: 'error',
          });
        }
      }
    }

    return errors;
  }

  /**
   * Check for cycles in exec flow
   */
  private checkCycles(graph: Graph): ValidationError[] {
    const errors: ValidationError[] = [];
    const visited = new Set<Node>();
    const recursionStack = new Set<Node>();

    const visit = (node: Node): void => {
      if (recursionStack.has(node)) {
        errors.push({
          nodeId: node.id,
          message: `Cycle detected in exec flow`,
          severity: 'error',
        });
        return;
      }

      if (visited.has(node)) {
        return;
      }

      visited.add(node);
      recursionStack.add(node);

      // Follow exec edges
      const execOutputs = node.outputs.filter(p => p.type === PinType.Exec);
      for (const output of execOutputs) {
        const edges = this.getPinEdges(graph, node.id, output.id);
        for (const edge of edges) {
          const targetNode = graph.nodes.get(edge.toNode);
          if (targetNode) {
            visit(targetNode);
          }
        }
      }

      recursionStack.delete(node);
    };

    // Check all nodes
    for (const node of graph.nodes.values()) {
      if (!visited.has(node)) {
        visit(node);
      }
    }

    return errors;
  }

  /**
   * Check type compatibility
   */
  private isCompatible(typeA: PinType, typeB: PinType): boolean {
    if (typeA === typeB) return true;
    if (typeA === PinType.Any || typeB === PinType.Any) return true;
    return false;
  }

  /**
   * Get edges connected to a pin
   */
  private getPinEdges(graph: Graph, nodeId: string, pinId: string): Edge[] {
    return Array.from(graph.edges.values()).filter(
      edge =>
        (edge.fromNode === nodeId && edge.fromPin === pinId) ||
        (edge.toNode === nodeId && edge.toPin === pinId)
    );
  }
}
