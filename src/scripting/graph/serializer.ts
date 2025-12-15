/**
 * Graph serialization
 */

import { Graph, Node, Edge } from './graphTypes';
import { Pin } from './pinTypes';

export interface SerializedGraph {
  id: string;
  name: string;
  nodes: SerializedNode[];
  edges: SerializedEdge[];
  metadata: Record<string, unknown>;
}

export interface SerializedNode {
  id: string;
  type: string;
  title?: string;
  position: { x: number; y: number };
  inputs: SerializedPin[];
  outputs: SerializedPin[];
  data: Record<string, unknown>;
  enabled: boolean;
}

export interface SerializedPin {
  id: string;
  name: string;
  type: string;
  direction: 'input' | 'output';
  defaultValue?: unknown;
  required: boolean;
}

export interface SerializedEdge {
  id: string;
  fromNode: string;
  fromPin: string;
  toNode: string;
  toPin: string;
}

/**
 * Serialize graph to JSON
 */
export function serializeGraph(graph: Graph): SerializedGraph {
  return {
    id: graph.id,
    name: graph.name,
    nodes: Array.from(graph.nodes.values()).map(serializeNode),
    edges: Array.from(graph.edges.values()).map(serializeEdge),
    metadata: graph.metadata,
  };
}

/**
 * Deserialize graph from JSON
 */
export function deserializeGraph(data: SerializedGraph): Graph {
  const graph: Graph = {
    id: data.id,
    name: data.name,
    nodes: new Map(),
    edges: new Map(),
    metadata: data.metadata || {},
  };

  // Deserialize nodes
  for (const nodeData of data.nodes) {
    const node = deserializeNode(nodeData);
    graph.nodes.set(node.id, node);
  }

  // Deserialize edges
  for (const edgeData of data.edges) {
    const edge = deserializeEdge(edgeData);
    graph.edges.set(edge.id, edge);
  }

  return graph;
}

function serializeNode(node: Node): SerializedNode {
  return {
    id: node.id,
    type: node.type,
    title: node.title,
    position: node.position,
    inputs: node.inputs.map(serializePin),
    outputs: node.outputs.map(serializePin),
    data: node.data,
    enabled: node.enabled,
  };
}

function deserializeNode(data: SerializedNode): Node {
  return {
    id: data.id,
    type: data.type,
    title: data.title,
    position: data.position,
    inputs: data.inputs.map(deserializePin),
    outputs: data.outputs.map(deserializePin),
    data: data.data || {},
    enabled: data.enabled !== undefined ? data.enabled : true,
  };
}

function serializePin(pin: Pin): SerializedPin {
  return {
    id: pin.id,
    name: pin.name,
    type: pin.type,
    direction: pin.direction,
    defaultValue: pin.defaultValue,
    required: pin.required,
  };
}

function deserializePin(data: SerializedPin): Pin {
  return new Pin(
    data.id,
    data.name,
    data.type as any,
    data.direction,
    data.defaultValue,
    data.required
  );
}

function serializeEdge(edge: Edge): SerializedEdge {
  return {
    id: edge.id,
    fromNode: edge.fromNode,
    fromPin: edge.fromPin,
    toNode: edge.toNode,
    toPin: edge.toPin,
  };
}

function deserializeEdge(data: SerializedEdge): Edge {
  return {
    id: data.id,
    fromNode: data.fromNode,
    fromPin: data.fromPin,
    toNode: data.toNode,
    toPin: data.toPin,
  };
}
