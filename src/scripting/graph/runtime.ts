/**
 * Graph runtime - executes compiled graphs
 */

import { Graph } from './graphTypes';
import { PinType } from './pinTypes';
import { NodeRegistry, ExecutionContext, ExecutionResult } from './nodeRegistry';
import { ExecutionPlan, ExecutionNode } from './compiler';

export interface RuntimeState {
  plan: ExecutionPlan;
  nodeStates: Map<string, ExecutionNode>;
  execStack: NodeId[]; // Current execution path
  paused: boolean;
  breakpoints: Set<NodeId>;
}

export type NodeId = string;

export class GraphRuntime {
  private registry: NodeRegistry;
  private state: RuntimeState | null = null;
  private eventHandlers = new Map<string, Set<NodeId>>(); // Event name -> node IDs

  constructor(registry: NodeRegistry) {
    this.registry = registry;
  }

  /**
   * Initialize runtime with execution plan
   */
  initialize(plan: ExecutionPlan): void {
    this.state = {
      plan,
      nodeStates: new Map(plan.nodes.map(n => [n.nodeId, { ...n }])),
      execStack: [],
      paused: false,
      breakpoints: new Set(),
    };

    // Build event handler map
    this.buildEventHandlers();
  }

  /**
   * Register event handler nodes
   */
  private buildEventHandlers(): void {
    if (!this.state) return;

    this.eventHandlers.clear();

    for (const node of this.state.plan.nodes) {
      const definition = this.registry.get(node.nodeType);
      if (definition && definition.name.startsWith('Event ')) {
        const eventName = definition.name.substring(6); // Remove "Event " prefix
        if (!this.eventHandlers.has(eventName)) {
          this.eventHandlers.set(eventName, new Set());
        }
        this.eventHandlers.get(eventName)!.add(node.nodeId);
      }
    }
  }

  /**
   * Dispatch event to graph
   */
  dispatchEvent(eventName: string, data?: unknown): void {
    if (!this.state) return;

    const handlers = this.eventHandlers.get(eventName);
    if (!handlers) return;

    for (const nodeId of handlers) {
      this.executeFromNode(nodeId, data);
    }
  }

  /**
   * Execute graph from a specific node
   */
  executeFromNode(startNodeId: NodeId, eventData?: unknown): void {
    if (!this.state) return;

    if (this.state.paused) return;

    // Check breakpoint
    if (this.state.breakpoints.has(startNodeId)) {
      this.state.paused = true;
      return;
    }

    // Set event data if provided
    if (eventData !== undefined) {
      const nodeState = this.state.nodeStates.get(startNodeId);
      if (nodeState) {
        // Find event data input pin
        const definition = this.registry.get(nodeState.nodeType);
        if (definition) {
          const eventDataInput = definition.inputs.find(
            input => input.name === 'EventData' || input.name === 'Data'
          );
          if (eventDataInput) {
            nodeState.inputValues.set(eventDataInput.id, eventData);
          }
        }
      }
    }

    // Execute node and follow exec flow
    this.executeNode(startNodeId);
  }

  /**
   * Execute a single node
   */
  private executeNode(nodeId: NodeId): ExecutionResult {
    if (!this.state) return ExecutionResult.Continue;

    const nodeState = this.state.nodeStates.get(nodeId);
    if (!nodeState) return ExecutionResult.Continue;

    const definition = this.registry.get(nodeState.nodeType);
    if (!definition || !definition.execute) {
      return ExecutionResult.Continue;
    }

    // Create execution context
    const context: ExecutionContext = {
      getInputValue: (nId: string, pinId: string) => {
        return this.getInputValue(nId, pinId);
      },
      setOutputValue: (nId: string, pinId: string, value: unknown) => {
        this.setOutputValue(nId, pinId, value);
      },
      executeNode: (nId: string) => {
        return this.executeNode(nId);
      },
    };

    // Execute node
    const result = definition.execute(
      {
        id: nodeId,
        type: nodeState.nodeType,
        position: { x: 0, y: 0 },
        inputs: [],
        outputs: [],
        data: {},
        enabled: true,
      },
      context
    );

    // Follow exec outputs
    if (result === ExecutionResult.Continue) {
      this.followExecOutputs(nodeId);
    }

    return result;
  }

  /**
   * Get input value for a node pin
   */
  private getInputValue(nodeId: NodeId, pinId: string): unknown {
    if (!this.state) return undefined;

    const nodeState = this.state.nodeStates.get(nodeId);
    if (!nodeState) return undefined;

    // Check if value is already computed
    if (nodeState.inputValues.has(pinId)) {
      return nodeState.inputValues.get(pinId);
    }

    // Try to get from connected output
    // This would require graph reference - simplified for now
    return undefined;
  }

  /**
   * Set output value for a node pin
   */
  private setOutputValue(nodeId: NodeId, pinId: string, value: unknown): void {
    if (!this.state) return;

    const nodeState = this.state.nodeStates.get(nodeId);
    if (!nodeState) return;

    nodeState.outputValues.set(pinId, value);

    // Propagate to connected inputs
    this.propagateValue(nodeId, pinId, value);
  }

  /**
   * Propagate value to connected nodes
   */
  private propagateValue(fromNodeId: NodeId, fromPinId: string, value: unknown): void {
    if (!this.state) return;

    // Find nodes connected to this output
    const consumers = this.state.plan.dataFlow.get(fromNodeId);
    if (!consumers) return;

    for (const consumerId of consumers) {
      const consumerState = this.state.nodeStates.get(consumerId);
      if (!consumerState) continue;

      // Find input pin connected to this output
      // Simplified - would need graph reference for exact pin mapping
      // For now, just mark that this node needs re-evaluation
    }
  }

  /**
   * Follow exec output pins
   */
  private followExecOutputs(nodeId: NodeId): void {
    if (!this.state) return;

    // Find exec output pins and execute connected nodes
    // Simplified - would need graph reference
    // For now, execute nodes in execution order that depend on this node
    const consumers = this.state.plan.dataFlow.get(nodeId);
    if (consumers) {
      for (const consumerId of consumers) {
        const consumerState = this.state.nodeStates.get(consumerId);
        if (!consumerState) continue;

        const definition = this.registry.get(consumerState.nodeType);
        if (definition && definition.inputs.some(p => p.type === PinType.Exec)) {
          // This node has exec input - execute it
          this.executeNode(consumerId);
        }
      }
    }
  }

  /**
   * Set breakpoint
   */
  setBreakpoint(nodeId: NodeId): void {
    if (this.state) {
      this.state.breakpoints.add(nodeId);
    }
  }

  /**
   * Remove breakpoint
   */
  removeBreakpoint(nodeId: NodeId): void {
    if (this.state) {
      this.state.breakpoints.delete(nodeId);
    }
  }

  /**
   * Resume execution
   */
  resume(): void {
    if (this.state) {
      this.state.paused = false;
    }
  }

  /**
   * Step execution (execute one node)
   */
  step(): void {
    if (!this.state || !this.state.paused) return;

    // Execute next node in exec stack or plan
    if (this.state.execStack.length > 0) {
      const nextNode = this.state.execStack.pop()!;
      this.executeNode(nextNode);
    }
  }

  /**
   * Get node state
   */
  getNodeState(nodeId: NodeId): ExecutionNode | undefined {
    return this.state?.nodeStates.get(nodeId);
  }

  /**
   * Get all node states
   */
  getAllNodeStates(): Map<NodeId, ExecutionNode> {
    return this.state?.nodeStates || new Map();
  }
}
