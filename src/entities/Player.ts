/**
 * Player entity class
 */

import { Graphics, Container } from 'pixi.js';
import type { Position, Velocity, PlayerStats, WeaponStats } from '../types';

export class Player {
  position: Position;
  velocity: Velocity;
  radius: number = 15;
  rotation: number = 0;

  stats: PlayerStats;
  weaponStats: WeaponStats;

  sprite: Container;
  lastFireTime: number = 0;
  lastDashTime: number = 0;
  invulnerableUntil: number = 0;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.velocity = { vx: 0, vy: 0 };

    // Default stats
    this.stats = {
      maxHp: 100,
      currentHp: 100,
      shield: 0,
      maxShield: 0,
      shieldRegenRate: 2, // per second
      speed: 200,
      dashCooldown: 2000, // ms
      lootMagnetRadius: 50,
    };

    this.weaponStats = {
      damage: 10,
      fireRate: 3, // shots per second
      spread: 0,
      pierce: 0,
      splash: 0,
      critChance: 0,
      critMultiplier: 2,
    };

    this.sprite = this.createSprite();
  }

  private createSprite(): Container {
    const container = new Container();

    // Ship body (triangle)
    const ship = new Graphics();
    ship.beginFill(0x4a9eff);
    ship.moveTo(15, 0);
    ship.lineTo(-10, -8);
    ship.lineTo(-10, 8);
    ship.closePath();
    ship.endFill();

    // Engine glow
    const engine = new Graphics();
    engine.beginFill(0xffaa00, 0.7);
    engine.drawCircle(-12, 0, 4);
    engine.endFill();

    container.addChild(engine);
    container.addChild(ship);

    return container;
  }

  update(dt: number): void {
    // Apply velocity
    this.position.x += this.velocity.vx * dt;
    this.position.y += this.velocity.vy * dt;

    // Shield regeneration
    if (this.stats.shield < this.stats.maxShield) {
      this.stats.shield = Math.min(
        this.stats.maxShield,
        this.stats.shield + this.stats.shieldRegenRate * dt
      );
    }

    // Update sprite position
    this.sprite.position.set(this.position.x, this.position.y);
    this.sprite.rotation = this.rotation;
  }

  takeDamage(damage: number, time: number): boolean {
    if (time < this.invulnerableUntil) {
      return false;
    }

    if (this.stats.shield > 0) {
      this.stats.shield = Math.max(0, this.stats.shield - damage);
      if (this.stats.shield === 0) {
        // Shield broken, apply remaining damage
        const remaining = damage - this.stats.shield;
        this.stats.currentHp = Math.max(0, this.stats.currentHp - remaining);
      }
    } else {
      this.stats.currentHp = Math.max(0, this.stats.currentHp - damage);
    }

    // Brief invulnerability
    this.invulnerableUntil = time + 200; // 200ms

    return this.stats.currentHp <= 0;
  }

  heal(amount: number): void {
    this.stats.currentHp = Math.min(this.stats.maxHp, this.stats.currentHp + amount);
  }

  canFire(time: number): boolean {
    const fireInterval = 1000 / this.weaponStats.fireRate; // ms
    return time - this.lastFireTime >= fireInterval;
  }

  fire(time: number): void {
    this.lastFireTime = time;
  }

  canDash(time: number): boolean {
    return time - this.lastDashTime >= this.stats.dashCooldown;
  }

  dash(time: number): void {
    this.lastDashTime = time;
    this.invulnerableUntil = time + 200; // Brief invulnerability during dash
  }

  get isAlive(): boolean {
    return this.stats.currentHp > 0;
  }

  get healthPercent(): number {
    return this.stats.currentHp / this.stats.maxHp;
  }

  get shieldPercent(): number {
    return this.stats.maxShield > 0 ? this.stats.shield / this.stats.maxShield : 0;
  }
}
