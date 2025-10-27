import { describe, it, expect } from 'vitest';
import { Pool } from '../src/utils/pool';

interface TestObject {
  id: number;
  active: boolean;
}

describe('Pool', () => {
  it('should create objects on demand', () => {
    let idCounter = 0;
    const pool = new Pool<TestObject>(
      () => ({ id: idCounter++, active: true }),
      (obj) => { obj.active = false; }
    );

    const obj1 = pool.acquire();
    const obj2 = pool.acquire();

    expect(obj1.id).toBe(0);
    expect(obj2.id).toBe(1);
    expect(pool.activeCount).toBe(2);
  });

  it('should reuse released objects', () => {
    const pool = new Pool<TestObject>(
      () => ({ id: 0, active: true }),
      (obj) => { obj.active = false; }
    );

    const obj1 = pool.acquire();
    pool.release(obj1);

    const obj2 = pool.acquire();

    expect(obj2).toBe(obj1);
    expect(pool.activeCount).toBe(1);
    expect(pool.availableCount).toBe(0);
  });

  it('should call reset function on release', () => {
    const pool = new Pool<TestObject>(
      () => ({ id: 0, active: true }),
      (obj) => { obj.active = false; }
    );

    const obj = pool.acquire();
    obj.active = true;

    pool.release(obj);

    expect(obj.active).toBe(false);
  });

  it('should warmup pool', () => {
    const pool = new Pool<TestObject>(
      () => ({ id: 0, active: true }),
      undefined,
      10
    );

    expect(pool.availableCount).toBe(10);
    expect(pool.activeCount).toBe(0);
  });
});
