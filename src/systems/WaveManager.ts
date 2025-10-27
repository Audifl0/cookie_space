/**
 * Wave manager - handles wave progression and enemy spawning
 */

import type { WaveSpec, EnemySpec, BossSpec } from '../types';
import { gameEvents } from '../utils/events';
import enemiesData from '../data/enemies.json';
import bossesData from '../data/bosses.json';
import wavesData from '../data/waves.json';

interface SpawnSchedule {
  enemyId: string;
  count: number;
  spawnRate: number;
  spawned: number;
  timer: number;
}

export class WaveManager {
  private waves: WaveSpec[];
  private enemies: Map<string, EnemySpec>;
  private bosses: Map<string, BossSpec>;

  private currentWave: number = 0;
  private waveActive: boolean = false;
  private waveCompleted: boolean = false;

  private schedules: SpawnSchedule[] = [];
  private enemiesAlive: number = 0;
  private bossSpawned: boolean = false;
  private bossDelay: number = 0;

  constructor() {
    this.waves = wavesData.waves;

    this.enemies = new Map();
    enemiesData.enemies.forEach(e => this.enemies.set(e.id, e));

    this.bosses = new Map();
    bossesData.bosses.forEach(b => this.bosses.set(b.id, b as BossSpec));
  }

  startWave(waveIndex: number): void {
    this.currentWave = waveIndex;
    this.waveActive = true;
    this.waveCompleted = false;
    this.bossSpawned = false;

    const waveSpec = this.getWave(waveIndex);
    if (!waveSpec) {
      console.warn(`Wave ${waveIndex} not found`);
      return;
    }

    // Setup spawn schedules
    this.schedules = waveSpec.enemies.map(e => ({
      enemyId: e.id,
      count: e.count,
      spawnRate: e.spawnRatePerSec,
      spawned: 0,
      timer: 0,
    }));

    if (waveSpec.boss) {
      this.bossDelay = waveSpec.boss.delaySec;
    } else {
      this.bossDelay = -1;
    }

    gameEvents.emit('wave_started', { wave: waveIndex, spec: waveSpec });
  }

  update(dt: number): void {
    if (!this.waveActive) return;

    // Update spawn schedules
    for (const schedule of this.schedules) {
      if (schedule.spawned >= schedule.count) continue;

      schedule.timer += dt;
      const interval = 1 / schedule.spawnRate;

      while (schedule.timer >= interval && schedule.spawned < schedule.count) {
        schedule.timer -= interval;
        schedule.spawned++;
        this.spawnEnemy(schedule.enemyId);
      }
    }

    // Boss spawn
    if (this.bossDelay >= 0 && !this.bossSpawned) {
      this.bossDelay -= dt;
      if (this.bossDelay <= 0) {
        this.spawnBoss();
        this.bossSpawned = true;
      }
    }

    // Check wave completion
    const allSpawned = this.schedules.every(s => s.spawned >= s.count);
    const bossHandled = this.bossDelay < 0 || this.bossSpawned;

    if (allSpawned && bossHandled && this.enemiesAlive === 0 && !this.waveCompleted) {
      this.completeWave();
    }
  }

  private spawnEnemy(enemyId: string): void {
    const spec = this.enemies.get(enemyId);
    if (!spec) return;

    gameEvents.emit('spawn_enemy', { spec, wave: this.currentWave });
    this.enemiesAlive++;
  }

  private spawnBoss(): void {
    const waveSpec = this.getWave(this.currentWave);
    if (!waveSpec?.boss) return;

    const spec = this.bosses.get(waveSpec.boss.id);
    if (!spec) return;

    gameEvents.emit('spawn_boss', { spec, wave: this.currentWave });
    gameEvents.emit('boss_warning');
    this.enemiesAlive++;
  }

  private completeWave(): void {
    this.waveActive = false;
    this.waveCompleted = true;
    gameEvents.emit('wave_cleared', { wave: this.currentWave });
  }

  onEnemyKilled(): void {
    this.enemiesAlive = Math.max(0, this.enemiesAlive - 1);
  }

  getWave(index: number): WaveSpec | null {
    return this.waves.find(w => w.index === index) ?? null;
  }

  getCurrentWave(): number {
    return this.currentWave;
  }

  isWaveActive(): boolean {
    return this.waveActive;
  }

  isWaveCompleted(): boolean {
    return this.waveCompleted;
  }

  getEnemySpec(id: string): EnemySpec | undefined {
    return this.enemies.get(id);
  }

  getBossSpec(id: string): BossSpec | undefined {
    return this.bosses.get(id);
  }

  getTotalWaves(): number {
    return this.waves.length;
  }
}
