/**
 * Simple event emitter for engine systems
 */

export type EventHandler<T = unknown> = (data: T) => void;

export class EventEmitter<T = unknown> {
  private handlers = new Map<string, Set<EventHandler<T>>>();

  on(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  off(event: string, handler: EventHandler<T>): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit(event: string, data: T): void {
    this.handlers.get(event)?.forEach(handler => {
      try {
        handler(data);
      } catch (err) {
        console.error(`Error in event handler for ${event}:`, err);
      }
    });
  }

  clear(): void {
    this.handlers.clear();
  }
}
