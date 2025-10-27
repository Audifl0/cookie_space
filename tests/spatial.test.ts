import { describe, it, expect } from 'vitest';
import { SpatialHash } from '../src/utils/spatial';
import type { EntityBase } from '../src/types';

function createTestEntity(x: number, y: number, radius: number = 10): EntityBase {
  return {
    id: `entity_${Math.random()}`,
    type: 'enemy',
    position: { x, y },
    velocity: { vx: 0, vy: 0 },
    radius,
    active: true,
  };
}

describe('SpatialHash', () => {
  it('should insert and retrieve entities', () => {
    const spatial = new SpatialHash(50);

    const entity = createTestEntity(100, 100);
    spatial.insert(entity);

    const nearby = spatial.getNearby(entity);

    // Should not include itself
    expect(nearby).not.toContain(entity);
  });

  it('should find nearby entities', () => {
    const spatial = new SpatialHash(50);

    const entity1 = createTestEntity(100, 100);
    const entity2 = createTestEntity(110, 110); // Close to entity1

    spatial.insert(entity1);
    spatial.insert(entity2);

    const nearby = spatial.getNearby(entity1);

    expect(nearby).toContain(entity2);
  });

  it('should not find far entities', () => {
    const spatial = new SpatialHash(50);

    const entity1 = createTestEntity(100, 100);
    const entity2 = createTestEntity(500, 500); // Far from entity1

    spatial.insert(entity1);
    spatial.insert(entity2);

    const nearby = spatial.getNearby(entity1);

    expect(nearby).not.toContain(entity2);
  });

  it('should query radius', () => {
    const spatial = new SpatialHash(50);

    const center = createTestEntity(200, 200);
    const near = createTestEntity(210, 210);
    const far = createTestEntity(500, 500);

    spatial.insert(center);
    spatial.insert(near);
    spatial.insert(far);

    const inRadius = spatial.queryRadius({ x: 200, y: 200 }, 50);

    expect(inRadius).toContain(center);
    expect(inRadius).toContain(near);
    expect(inRadius).not.toContain(far);
  });

  it('should clear grid', () => {
    const spatial = new SpatialHash(50);

    spatial.insert(createTestEntity(100, 100));
    spatial.insert(createTestEntity(200, 200));

    spatial.clear();

    const debug = spatial.getDebugInfo();
    expect(debug.cellCount).toBe(0);
  });
});
