/**
 * Mission manager - handles mission tracking and rewards
 */

import type { MissionSpec, MissionProgress, MissionKind } from '../types';
import missionsData from '../data/missions.json';
import { gameEvents } from '../utils/events';

export class MissionManager {
  private missions: Map<string, MissionSpec>;
  private progress: Map<string, MissionProgress>;

  constructor() {
    this.missions = new Map();
    missionsData.missions.forEach(m => this.missions.set(m.id, m as MissionSpec));

    this.progress = new Map();
    this.initializeMissions();

    this.setupListeners();
  }

  private initializeMissions(): void {
    for (const [id] of this.missions) {
      this.progress.set(id, {
        id,
        progress: 0,
        completed: false,
        claimed: false,
      });
    }
  }

  private setupListeners(): void {
    gameEvents.on('enemy_killed', (data: { specId: string }) => {
      this.updateProgress('kill', data.specId, 1);
    });

    gameEvents.on('boss_killed', () => {
      this.updateProgress('kill', 'boss', 1);
    });

    gameEvents.on('wave_cleared', (data: { wave: number; noHit: boolean }) => {
      this.updateProgress('reach_wave', undefined, data.wave);
      if (data.noHit) {
        this.updateProgress('no_hit', undefined, 1);
      }
    });

    gameEvents.on('gold_collected', (data: { amount: number }) => {
      this.updateProgress('earn_gold', undefined, data.amount);
    });
  }

  private updateProgress(event: string, where: string | undefined, amount: number): void {
    for (const [id, spec] of this.missions) {
      const prog = this.progress.get(id);
      if (!prog || prog.completed) continue;

      if (spec.goal.event !== event) continue;
      if (spec.goal.where && spec.goal.where !== where) continue;

      if (spec.goal.event === 'reach_wave') {
        prog.progress = Math.max(prog.progress, amount);
      } else {
        prog.progress += amount;
      }

      if (prog.progress >= spec.goal.count) {
        prog.completed = true;
        gameEvents.emit('mission_completed', { id, spec });
      }
    }
  }

  getMissionsByKind(kind: MissionKind): Array<{ spec: MissionSpec; progress: MissionProgress }> {
    const result: Array<{ spec: MissionSpec; progress: MissionProgress }> = [];

    for (const [id, spec] of this.missions) {
      if (spec.kind === kind) {
        const prog = this.progress.get(id);
        if (prog) {
          result.push({ spec, progress: prog });
        }
      }
    }

    return result;
  }

  claimReward(missionId: string): { gold: number; skinId?: string; title?: string } | null {
    const spec = this.missions.get(missionId);
    const prog = this.progress.get(missionId);

    if (!spec || !prog || !prog.completed || prog.claimed) {
      return null;
    }

    prog.claimed = true;

    return {
      gold: spec.reward.gold ?? 0,
      skinId: spec.reward.skinId,
      title: spec.reward.title,
    };
  }

  resetMissions(kind: MissionKind): void {
    for (const [id, spec] of this.missions) {
      if (spec.kind === kind) {
        this.progress.set(id, {
          id,
          progress: 0,
          completed: false,
          claimed: false,
        });
      }
    }
  }

  getProgress(): MissionProgress[] {
    return Array.from(this.progress.values());
  }

  loadProgress(saved: MissionProgress[]): void {
    for (const p of saved) {
      this.progress.set(p.id, p);
    }
  }

  getAllMissions(): MissionSpec[] {
    return Array.from(this.missions.values());
  }
}
