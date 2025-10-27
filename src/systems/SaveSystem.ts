/**
 * Save system using localStorage
 */

import type { SaveData, GameOptions, MissionProgress } from '../types';

const SAVE_KEY = 'cookie_space_save';
const SAVE_VERSION = 1;

export class SaveSystem {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private getDefaultSave(): SaveData {
    return {
      version: SAVE_VERSION,
      gold: 0,
      highestWave: 0,
      totalKills: 0,
      ownedUpgrades: [],
      unlockedSkins: ['default'],
      currentSkin: 'default',
      missions: [],
      options: {
        volume: 0.5,
        sfxVolume: 0.7,
        colorblindMode: false,
        reducedEffects: false,
        language: 'en',
        showFPS: false,
      },
      lastDaily: '',
      lastWeekly: '',
    };
  }

  private load(): SaveData {
    try {
      const stored = localStorage.getItem(SAVE_KEY);
      if (!stored) {
        return this.getDefaultSave();
      }

      const parsed = JSON.parse(stored) as SaveData;

      // Version migration
      if (parsed.version !== SAVE_VERSION) {
        console.log('Save version mismatch, migrating...');
        return this.migrate(parsed);
      }

      return parsed;
    } catch (error) {
      console.error('Failed to load save:', error);
      return this.getDefaultSave();
    }
  }

  private migrate(oldSave: SaveData): SaveData {
    // Add migration logic here if save format changes
    return { ...this.getDefaultSave(), ...oldSave, version: SAVE_VERSION };
  }

  save(): void {
    try {
      const json = JSON.stringify(this.data);
      localStorage.setItem(SAVE_KEY, json);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  }

  // Getters
  getSaveData(): SaveData {
    return this.data;
  }

  getGold(): number {
    return this.data.gold;
  }

  getOptions(): GameOptions {
    return this.data.options;
  }

  getMissions(): MissionProgress[] {
    return this.data.missions;
  }

  getOwnedUpgrades(): string[] {
    return this.data.ownedUpgrades;
  }

  // Setters
  setGold(gold: number): void {
    this.data.gold = gold;
    this.save();
  }

  addGold(amount: number): void {
    this.data.gold += amount;
    this.save();
  }

  setHighestWave(wave: number): void {
    if (wave > this.data.highestWave) {
      this.data.highestWave = wave;
      this.save();
    }
  }

  addKills(count: number): void {
    this.data.totalKills += count;
    this.save();
  }

  addUpgrade(upgradeId: string): void {
    if (!this.data.ownedUpgrades.includes(upgradeId)) {
      this.data.ownedUpgrades.push(upgradeId);
      this.save();
    }
  }

  unlockSkin(skinId: string): void {
    if (!this.data.unlockedSkins.includes(skinId)) {
      this.data.unlockedSkins.push(skinId);
      this.save();
    }
  }

  setCurrentSkin(skinId: string): void {
    if (this.data.unlockedSkins.includes(skinId)) {
      this.data.currentSkin = skinId;
      this.save();
    }
  }

  updateMissions(missions: MissionProgress[]): void {
    this.data.missions = missions;
    this.save();
  }

  updateOptions(options: Partial<GameOptions>): void {
    this.data.options = { ...this.data.options, ...options };
    this.save();
  }

  resetDaily(): void {
    const today = new Date().toDateString();
    if (this.data.lastDaily !== today) {
      this.data.lastDaily = today;
      // Reset daily missions
      this.data.missions = this.data.missions.filter(m => {
        const spec = m.id.startsWith('daily_');
        return !spec;
      });
      this.save();
    }
  }

  resetWeekly(): void {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekKey = weekStart.toDateString();

    if (this.data.lastWeekly !== weekKey) {
      this.data.lastWeekly = weekKey;
      // Reset weekly missions
      this.data.missions = this.data.missions.filter(m => {
        const spec = m.id.startsWith('weekly_');
        return !spec;
      });
      this.save();
    }
  }

  clearSave(): void {
    this.data = this.getDefaultSave();
    this.save();
  }

  exportSave(): string {
    return JSON.stringify(this.data);
  }

  importSave(json: string): boolean {
    try {
      const imported = JSON.parse(json) as SaveData;
      this.data = imported;
      this.save();
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }
}
