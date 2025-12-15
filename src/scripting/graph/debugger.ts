/**
 * Graph debugger - breakpoints, step, watch values
 */

import { NodeId } from './compiler';
import { GraphRuntime } from './runtime';

export interface WatchExpression {
  id: string;
  expression: string; // e.g., "NodeA.OutputValue"
  value?: unknown;
}

export interface Breakpoint {
  nodeId: NodeId;
  condition?: string; // Optional condition expression
  hitCount: number;
}

export class GraphDebugger {
  private runtime: GraphRuntime;
  private breakpoints = new Map<NodeId, Breakpoint>();
  private watches = new Map<string, WatchExpression>();
  private callStack: NodeId[] = [];

  constructor(runtime: GraphRuntime) {
    this.runtime = runtime;
  }

  /**
   * Set breakpoint on node
   */
  setBreakpoint(nodeId: NodeId, condition?: string): void {
    this.breakpoints.set(nodeId, {
      nodeId,
      condition,
      hitCount: 0,
    });
    this.runtime.setBreakpoint(nodeId);
  }

  /**
   * Remove breakpoint
   */
  removeBreakpoint(nodeId: NodeId): void {
    this.breakpoints.delete(nodeId);
    this.runtime.removeBreakpoint(nodeId);
  }

  /**
   * Get all breakpoints
   */
  getBreakpoints(): Breakpoint[] {
    return Array.from(this.breakpoints.values());
  }

  /**
   * Check if node has breakpoint
   */
  hasBreakpoint(nodeId: NodeId): boolean {
    return this.breakpoints.has(nodeId);
  }

  /**
   * Add watch expression
   */
  addWatch(id: string, expression: string): void {
    this.watches.set(id, {
      id,
      expression,
    });
  }

  /**
   * Remove watch
   */
  removeWatch(id: string): void {
    this.watches.delete(id);
  }

  /**
   * Evaluate watch expressions
   */
  evaluateWatches(): Map<string, unknown> {
    const results = new Map<string, unknown>();

    for (const watch of this.watches.values()) {
      try {
        const value = this.evaluateExpression(watch.expression);
        watch.value = value;
        results.set(watch.id, value);
      } catch (error) {
        watch.value = `Error: ${error}`;
        results.set(watch.id, watch.value);
      }
    }

    return results;
  }

  /**
   * Evaluate expression (simplified - would need proper parser in real implementation)
   */
  private evaluateExpression(expression: string): unknown {
    // Simplified expression evaluation
    // Real implementation would parse and evaluate expressions
    const parts = expression.split('.');
    if (parts.length === 2) {
      const [nodeId, pinName] = parts;
      const nodeState = this.runtime.getNodeState(nodeId);
      if (nodeState) {
        // Try to find pin value
        for (const [pinId, value] of nodeState.outputValues.entries()) {
          if (pinId === pinName) {
            return value;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Step execution
   */
  step(): void {
    this.runtime.step();
  }

  /**
   * Resume execution
   */
  resume(): void {
    this.runtime.resume();
  }

  /**
   * Get call stack
   */
  getCallStack(): NodeId[] {
    return [...this.callStack];
  }

  /**
   * Update call stack (called by runtime)
   */
  updateCallStack(stack: NodeId[]): void {
    this.callStack = [...stack];
  }
}
