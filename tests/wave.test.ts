import { describe, it, expect } from 'vitest';
import { WaveManager } from '../src/systems/WaveManager';

describe('WaveManager', () => {
  it('should load wave data', () => {
    const manager = new WaveManager();
    const wave1 = manager.getWave(1);

    expect(wave1).toBeDefined();
    expect(wave1?.index).toBe(1);
    expect(wave1?.enemies.length).toBeGreaterThan(0);
  });

  it('should track wave progression', () => {
    const manager = new WaveManager();

    expect(manager.getCurrentWave()).toBe(0);

    manager.startWave(1);

    expect(manager.getCurrentWave()).toBe(1);
    expect(manager.isWaveActive()).toBe(true);
  });

  it('should have 30+ waves', () => {
    const manager = new WaveManager();
    const totalWaves = manager.getTotalWaves();

    expect(totalWaves).toBeGreaterThanOrEqual(30);
  });

  it('should load enemy specs', () => {
    const manager = new WaveManager();
    const chipDrone = manager.getEnemySpec('chip_drone');

    expect(chipDrone).toBeDefined();
    expect(chipDrone?.name).toBe('Chip Drone');
    expect(chipDrone?.hp).toBeGreaterThan(0);
  });

  it('should load boss specs', () => {
    const manager = new WaveManager();
    const boss = manager.getBossSpec('grand_four_sombre');

    expect(boss).toBeDefined();
    expect(boss?.name).toBe('Grand Four Sombre');
    expect(boss?.phases).toBeDefined();
    expect(boss!.phases.length).toBeGreaterThan(0);
  });
});
