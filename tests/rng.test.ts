import { describe, it, expect } from 'vitest';
import { RNG } from '../src/utils/rng';

describe('RNG', () => {
  it('should generate deterministic sequence with same seed', () => {
    const rng1 = new RNG(12345);
    const rng2 = new RNG(12345);

    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());

    expect(seq1).toEqual(seq2);
  });

  it('should generate values between 0 and 1', () => {
    const rng = new RNG(42);

    for (let i = 0; i < 100; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('should generate integers in range', () => {
    const rng = new RNG(99);

    for (let i = 0; i < 100; i++) {
      const value = rng.nextInt(1, 10);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('should shuffle array', () => {
    const rng = new RNG(777);
    const original = [1, 2, 3, 4, 5];
    const shuffled = rng.shuffle([...original]);

    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original);
  });
});
