/**
 * Simple event emitter for game events
 */

export type EventCallback<T = unknown> = (data: T) => void;

export class EventEmitter {
  private listeners: Map<string, EventCallback[]> = new Map();

  /**
   * Subscribe to an event
   */
  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)!.push(callback as EventCallback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event once
   */
  once<T = unknown>(event: string, callback: EventCallback<T>): void {
    const wrappedCallback = (data: T) => {
      callback(data);
      this.off(event, wrappedCallback as EventCallback);
    };

    this.on(event, wrappedCallback as EventCallback<T>);
  }

  /**
   * Unsubscribe from an event
   */
  off<T = unknown>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback as EventCallback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }

    if (callbacks.length === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Emit an event
   */
  emit<T = unknown>(event: string, data?: T): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;

    // Clone array to avoid issues if listeners are removed during emit
    [...callbacks].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event, or all events if no event specified
   */
  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.length ?? 0;
  }

  /**
   * Check if there are any listeners for an event
   */
  hasListeners(event: string): boolean {
    return this.listenerCount(event) > 0;
  }
}

// Global event bus
export const gameEvents = new EventEmitter();
