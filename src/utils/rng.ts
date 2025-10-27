/**
 * Seedable Random Number Generator
 * Uses Mulberry32 algorithm for deterministic randomness
 */

export class RNG {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed >>> 0;
  }

  /**
   * Returns a random number between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a random float between min (inclusive) and max (exclusive)
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Returns true with the given probability (0-1)
   */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Returns a random element from an array
   */
  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Shuffles an array in place
   */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Reset seed for reproducibility
   */
  setSeed(seed: number): void {
    this.seed = seed >>> 0;
  }
}

// Global RNG instance
export const globalRNG = new RNG();
