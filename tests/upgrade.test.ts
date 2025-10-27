import { describe, it, expect } from 'vitest';
import { UpgradeManager } from '../src/systems/UpgradeManager';
import type { PlayerStats, WeaponStats, EconomyStats } from '../src/types';

describe('UpgradeManager', () => {
  it('should apply additive upgrades', () => {
    const manager = new UpgradeManager();
    manager.purchaseUpgrade('hp_boost_1', 100);

    const playerStats: PlayerStats = {
      maxHp: 100,
      currentHp: 100,
      shield: 0,
      maxShield: 0,
      shieldRegenRate: 2,
      speed: 200,
      dashCooldown: 2000,
      lootMagnetRadius: 50,
    };

    const weaponStats: WeaponStats = {
      damage: 10,
      fireRate: 3,
      spread: 0,
      pierce: 0,
      splash: 0,
      critChance: 0,
      critMultiplier: 2,
    };

    const economyStats: EconomyStats = {
      goldMultiplier: 1,
      dropRateBonus: 0,
      rerollCost: 10,
    };

    manager.applyUpgrades(playerStats, weaponStats, economyStats);

    expect(playerStats.maxHp).toBe(120); // 100 + 20
  });

  it('should apply multiplicative upgrades', () => {
    const manager = new UpgradeManager();
    manager.purchaseUpgrade('speed_boost_1', 100);

    const playerStats: PlayerStats = {
      maxHp: 100,
      currentHp: 100,
      shield: 0,
      maxShield: 0,
      shieldRegenRate: 2,
      speed: 200,
      dashCooldown: 2000,
      lootMagnetRadius: 50,
    };

    const weaponStats: WeaponStats = {
      damage: 10,
      fireRate: 3,
      spread: 0,
      pierce: 0,
      splash: 0,
      critChance: 0,
      critMultiplier: 2,
    };

    const economyStats: EconomyStats = {
      goldMultiplier: 1,
      dropRateBonus: 0,
      rerollCost: 10,
    };

    manager.applyUpgrades(playerStats, weaponStats, economyStats);

    expect(playerStats.speed).toBe(220); // 200 * 1.1
  });

  it('should not allow purchase without enough gold', () => {
    const manager = new UpgradeManager();
    const result = manager.purchaseUpgrade('hp_boost_1', 5);

    expect(result.success).toBe(false);
    expect(result.newGold).toBe(5);
  });

  it('should deduct gold on successful purchase', () => {
    const manager = new UpgradeManager();
    const result = manager.purchaseUpgrade('hp_boost_1', 50);

    expect(result.success).toBe(true);
    expect(result.newGold).toBe(40); // 50 - 10
  });

  it('should generate shop offers', () => {
    const manager = new UpgradeManager();
    const offers = manager.generateShopOffers(4);

    expect(offers.length).toBeLessThanOrEqual(4);
    expect(offers.length).toBeGreaterThan(0);
  });
});
