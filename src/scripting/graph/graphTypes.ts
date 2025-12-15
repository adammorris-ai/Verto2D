/**
 * Graph data structures - nodes, edges, graphs
 */

import { Pin } from './pinTypes';

export type NodeId = string;
export type EdgeId = string;

export interface NodePosition {
  x: number;
  y: number;
}

export interface Node {
  id: NodeId;
  type: string; // Node type identifier
  title?: string;
  position: NodePosition;
  inputs: Pin[];
  outputs: Pin[];
  data: Record<string, unknown>; // Node-specific data
  enabled: boolean;
}

export interface Edge {
  id: EdgeId;
  fromNode: NodeId;
  fromPin: string; // Pin ID
  toNode: NodeId;
  toPin: string; // Pin ID
}

export interface Graph {
  id: string;
  name: string;
  nodes: Map<NodeId, Node>;
  edges: Map<EdgeId, Edge>;
  metadata: Record<string, unknown>;
}

/**
 * Create a new graph
 */
export function createGraph(id: string, name: string): Graph {
  return {
    id,
    name,
    nodes: new Map(),
    edges: new Map(),
    metadata: {},
  };
}

/**
 * Create a new node
 */
export function createNode(
  id: NodeId,
  type: string,
  position: NodePosition,
  inputs: Pin[] = [],
  outputs: Pin[] = []
): Node {
  return {
    id,
    type,
    position,
    inputs: inputs.map(p => p.clone()),
    outputs: outputs.map(p => p.clone()),
    data: {},
    enabled: true,
  };
}

/**
 * Create a new edge
 */
export function createEdge(
  id: EdgeId,
  fromNode: NodeId,
  fromPin: string,
  toNode: NodeId,
  toPin: string
): Edge {
  return {
    id,
    fromNode,
    fromPin,
    toNode,
    toPin,
  };
}

/**
 * Add node to graph
 */
export function addNode(graph: Graph, node: Node): void {
  graph.nodes.set(node.id, node);
}

/**
 * Remove node from graph
 */
export function removeNode(graph: Graph, nodeId: NodeId): void {
  graph.nodes.delete(nodeId);
  
  // Remove all edges connected to this node
  for (const [edgeId, edge] of graph.edges.entries()) {
    if (edge.fromNode === nodeId || edge.toNode === nodeId) {
      graph.edges.delete(edgeId);
    }
  }
}

  /**
   * Add edge to graph
   */
  export function addEdge(graph: Graph, edge: Edge): boolean {
    const fromNode = graph.nodes.get(edge.fromNode);
    const toNode = graph.nodes.get(edge.toNode);

    if (!fromNode || !toNode) {
      return false;
    }

    const fromPin = fromNode.outputs.find(p => p.id === edge.fromPin);
    const toPin = toNode.inputs.find(p => p.id === edge.toPin);

    if (!fromPin || !toPin) {
      return false;
    }

    // Check type compatibility
    if (!Pin.isCompatible(fromPin.type, toPin.type)) {
      return false;
    }

    graph.edges.set(edge.id, edge);
    return true;
  }

/**
 * Remove edge from graph
 */
export function removeEdge(graph: Graph, edgeId: EdgeId): void {
  graph.edges.delete(edgeId);
}

/**
 * Get edges connected to a node
 */
export function getNodeEdges(graph: Graph, nodeId: NodeId): Edge[] {
  return Array.from(graph.edges.values()).filter(
    edge => edge.fromNode === nodeId || edge.toNode === nodeId
  );
}

/**
 * Get edges connected to a pin
 */
export function getPinEdges(graph: Graph, nodeId: NodeId, pinId: string): Edge[] {
  return Array.from(graph.edges.values()).filter(
    edge =>
      (edge.fromNode === nodeId && edge.fromPin === pinId) ||
      (edge.toNode === nodeId && edge.toPin === pinId)
  );
}
