/**
 * Perlin noise generator for procedural backgrounds
 * Simplified 2D implementation
 */

export class PerlinNoise {
  private permutation: number[];
  private gradients: { x: number; y: number }[];

  constructor(seed: number = 0) {
    // Generate permutation table
    this.permutation = [];
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i;
    }

    // Shuffle with seed
    const rand = this.seededRandom(seed);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
    }

    // Duplicate for overflow
    this.permutation = [...this.permutation, ...this.permutation];

    // Generate gradients
    this.gradients = [];
    for (let i = 0; i < 256; i++) {
      const angle = (this.permutation[i] / 256) * Math.PI * 2;
      this.gradients.push({
        x: Math.cos(angle),
        y: Math.sin(angle),
      });
    }
  }

  private seededRandom(seed: number): () => number {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const g = this.gradients[hash & 255];
    return g.x * x + g.y * y;
  }

  /**
   * Get noise value at (x, y)
   * Returns value between -1 and 1
   */
  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const a = this.permutation[X] + Y;
    const aa = this.permutation[a];
    const ab = this.permutation[a + 1];
    const b = this.permutation[X + 1] + Y;
    const ba = this.permutation[b];
    const bb = this.permutation[b + 1];

    return this.lerp(
      this.lerp(this.grad(aa, x, y), this.grad(ba, x - 1, y), u),
      this.lerp(this.grad(ab, x, y - 1), this.grad(bb, x - 1, y - 1), u),
      v
    );
  }

  /**
   * Get octaved noise (fractal Brownian motion)
   */
  octaveNoise(x: number, y: number, octaves: number = 4, persistence: number = 0.5): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }

  /**
   * Get noise normalized to 0-1
   */
  normalizedNoise(x: number, y: number): number {
    return (this.noise(x, y) + 1) / 2;
  }
}
