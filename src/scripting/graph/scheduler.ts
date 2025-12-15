/**
 * Latent action scheduler - manages yielding/resuming nodes
 */

import { NodeId } from './graphTypes';

export interface LatentAction {
  nodeId: NodeId;
  resumeTime: number; // Timestamp when action should resume
  data?: unknown; // Action-specific data
}

export class LatentScheduler {
  private actions = new Map<NodeId, LatentAction>();
  private currentTime = 0;

  /**
   * Update scheduler with current time
   */
  update(currentTime: number): NodeId[] {
    this.currentTime = currentTime;
    const ready: NodeId[] = [];

    for (const [nodeId, action] of this.actions.entries()) {
      if (this.currentTime >= action.resumeTime) {
        ready.push(nodeId);
        this.actions.delete(nodeId);
      }
    }

    return ready;
  }

  /**
   * Schedule a latent action
   */
  schedule(nodeId: NodeId, delay: number, data?: unknown): void {
    this.actions.set(nodeId, {
      nodeId,
      resumeTime: this.currentTime + delay,
      data,
    });
  }

  /**
   * Cancel a latent action
   */
  cancel(nodeId: NodeId): void {
    this.actions.delete(nodeId);
  }

  /**
   * Check if action is scheduled
   */
  isScheduled(nodeId: NodeId): boolean {
    return this.actions.has(nodeId);
  }

  /**
   * Clear all scheduled actions
   */
  clear(): void {
    this.actions.clear();
  }

  /**
   * Get remaining time for an action
   */
  getRemainingTime(nodeId: NodeId): number {
    const action = this.actions.get(nodeId);
    if (!action) return 0;
    return Math.max(0, action.resumeTime - this.currentTime);
  }
}
