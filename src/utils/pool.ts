/**
 * Generic object pool for performance optimization
 * Avoids garbage collection by reusing objects
 */

export class Pool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();
  private factory: () => T;
  private reset?: (obj: T) => void;

  constructor(factory: () => T, reset?: (obj: T) => void, warmupSize: number = 0) {
    this.factory = factory;
    this.reset = reset;

    // Warmup: pre-create objects
    for (let i = 0; i < warmupSize; i++) {
      this.available.push(factory());
    }
  }

  /**
   * Acquire an object from the pool
   */
  acquire(): T {
    let obj: T;

    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      obj = this.factory();
    }

    this.inUse.add(obj);
    return obj;
  }

  /**
   * Release an object back to the pool
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      console.warn('Attempting to release object not in use');
      return;
    }

    this.inUse.delete(obj);

    if (this.reset) {
      this.reset(obj);
    }

    this.available.push(obj);
  }

  /**
   * Release multiple objects
   */
  releaseAll(objects: T[]): void {
    objects.forEach(obj => this.release(obj));
  }

  /**
   * Get number of objects currently in use
   */
  get activeCount(): number {
    return this.inUse.size;
  }

  /**
   * Get number of available objects
   */
  get availableCount(): number {
    return this.available.length;
  }

  /**
   * Get total pool size
   */
  get totalSize(): number {
    return this.activeCount + this.availableCount;
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.available = [];
    this.inUse.clear();
  }
}
