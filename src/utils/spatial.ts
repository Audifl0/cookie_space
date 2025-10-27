/**
 * Spatial hashing grid for efficient collision detection
 * Optimized for many moving entities
 */

import type { EntityBase, Position } from '../types';

export class SpatialHash {
  private cellSize: number;
  private cells: Map<string, EntityBase[]>;

  constructor(cellSize: number = 50) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }


  /**
   * Get all cell keys an entity occupies (based on radius)
   */
  private getEntityCellKeys(entity: EntityBase): string[] {
    const { x, y } = entity.position;
    const r = entity.radius;

    const minX = Math.floor((x - r) / this.cellSize);
    const maxX = Math.floor((x + r) / this.cellSize);
    const minY = Math.floor((y - r) / this.cellSize);
    const maxY = Math.floor((y + r) / this.cellSize);

    const keys: string[] = [];
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        keys.push(`${cx},${cy}`);
      }
    }

    return keys;
  }

  /**
   * Clear all cells
   */
  clear(): void {
    this.cells.clear();
  }

  /**
   * Insert an entity into the grid
   */
  insert(entity: EntityBase): void {
    const keys = this.getEntityCellKeys(entity);

    for (const key of keys) {
      if (!this.cells.has(key)) {
        this.cells.set(key, []);
      }
      this.cells.get(key)!.push(entity);
    }
  }

  /**
   * Get nearby entities (potential collisions)
   */
  getNearby(entity: EntityBase): EntityBase[] {
    const keys = this.getEntityCellKeys(entity);
    const nearby = new Set<EntityBase>();

    for (const key of keys) {
      const cell = this.cells.get(key);
      if (cell) {
        cell.forEach(e => {
          if (e !== entity) {
            nearby.add(e);
          }
        });
      }
    }

    return Array.from(nearby);
  }

  /**
   * Get all entities in a radius around a position
   */
  queryRadius(pos: Position, radius: number): EntityBase[] {
    const minX = Math.floor((pos.x - radius) / this.cellSize);
    const maxX = Math.floor((pos.x + radius) / this.cellSize);
    const minY = Math.floor((pos.y - radius) / this.cellSize);
    const maxY = Math.floor((pos.y + radius) / this.cellSize);

    const entities = new Set<EntityBase>();

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const cell = this.cells.get(`${cx},${cy}`);
        if (cell) {
          cell.forEach(e => entities.add(e));
        }
      }
    }

    return Array.from(entities);
  }

  /**
   * Get debug info
   */
  getDebugInfo(): { cellCount: number; entityCount: number } {
    let entityCount = 0;
    this.cells.forEach(cell => {
      entityCount += cell.length;
    });

    return {
      cellCount: this.cells.size,
      entityCount,
    };
  }
}
