/**
 * Upgrade manager - handles upgrades, shop, and stat application
 */

import type { Upgrade, PlayerStats, WeaponStats, EconomyStats } from '../types';
import upgradesData from '../data/upgrades.json';
import { globalRNG } from '../utils/rng';

export class UpgradeManager {
  private upgrades: Map<string, Upgrade>;
  private ownedUpgrades: Set<string> = new Set();

  constructor() {
    this.upgrades = new Map();
    upgradesData.upgrades.forEach(u => this.upgrades.set(u.id, u as Upgrade));
  }

  /**
   * Get available upgrades for purchase
   */
  getAvailableUpgrades(): Upgrade[] {
    return Array.from(this.upgrades.values()).filter(u => {
      // Check if already owned
      if (this.ownedUpgrades.has(u.id)) {
        if (u.maxRank) {
          // Count ranks
          const ranks = Array.from(this.ownedUpgrades).filter(id => id.startsWith(u.id)).length;
          if (ranks >= u.maxRank) return false;
        } else {
          return false;
        }
      }

      // Check requirements
      if (u.requires) {
        return u.requires.every(req => this.ownedUpgrades.has(req));
      }

      return true;
    });
  }

  /**
   * Generate shop offerings (random selection)
   */
  generateShopOffers(count: number = 4): Upgrade[] {
    const available = this.getAvailableUpgrades();
    const offers: Upgrade[] = [];

    const shuffled = globalRNG.shuffle([...available]);

    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      offers.push(shuffled[i]);
    }

    return offers;
  }

  /**
   * Purchase an upgrade
   */
  purchaseUpgrade(upgradeId: string, currentGold: number): { success: boolean; newGold: number } {
    const upgrade = this.upgrades.get(upgradeId);
    if (!upgrade) {
      return { success: false, newGold: currentGold };
    }

    if (currentGold < upgrade.cost) {
      return { success: false, newGold: currentGold };
    }

    this.ownedUpgrades.add(upgradeId);
    return { success: true, newGold: currentGold - upgrade.cost };
  }

  /**
   * Apply owned upgrades to player stats
   */
  applyUpgrades(
    playerStats: PlayerStats,
    weaponStats: WeaponStats,
    economyStats: EconomyStats
  ): void {
    for (const upgradeId of this.ownedUpgrades) {
      const upgrade = this.upgrades.get(upgradeId);
      if (!upgrade) continue;

      const { target, key, delta, mode } = upgrade.apply;

      let stats: Record<string, number>;
      if (target === 'player') stats = playerStats as unknown as Record<string, number>;
      else if (target === 'weapon') stats = weaponStats as unknown as Record<string, number>;
      else if (target === 'economy') stats = economyStats as unknown as Record<string, number>;
      else continue;

      if (key in stats) {
        if (mode === 'add') {
          stats[key] += delta;
        } else if (mode === 'mul') {
          stats[key] *= delta;
        }
      }
    }
  }

  /**
   * Set owned upgrades (for loading saves)
   */
  setOwnedUpgrades(upgradeIds: string[]): void {
    this.ownedUpgrades = new Set(upgradeIds);
  }

  /**
   * Get owned upgrade IDs
   */
  getOwnedUpgrades(): string[] {
    return Array.from(this.ownedUpgrades);
  }

  /**
   * Check if upgrade is owned
   */
  hasUpgrade(upgradeId: string): boolean {
    return this.ownedUpgrades.has(upgradeId);
  }

  /**
   * Get upgrade by ID
   */
  getUpgrade(upgradeId: string): Upgrade | undefined {
    return this.upgrades.get(upgradeId);
  }
}
