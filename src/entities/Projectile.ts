/**
 * Projectile entity class
 */

import { Graphics } from 'pixi.js';
import type { Position, Velocity, Projectile as ProjectileType, EffectType } from '../types';

export class Projectile implements ProjectileType {
  id: string;
  type: 'projectile' = 'projectile';
  position: Position;
  velocity: Velocity;
  radius: number;
  active: boolean = true;

  damage: number;
  pierce: number;
  piercedCount: number = 0;
  fromPlayer: boolean;
  splash?: number;
  effects?: EffectType[];

  sprite: Graphics;
  lifetime: number = 0;
  maxLifetime: number = 5000; // 5 seconds

  constructor(
    id: string,
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
    fromPlayer: boolean,
    options: {
      radius?: number;
      pierce?: number;
      splash?: number;
      effects?: EffectType[];
    } = {}
  ) {
    this.id = id;
    this.position = { x, y };
    this.velocity = {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    };
    this.radius = options.radius ?? 8;
    this.damage = damage;
    this.fromPlayer = fromPlayer;
    this.pierce = options.pierce ?? 0;
    this.splash = options.splash;
    this.effects = options.effects;

    this.sprite = this.createSprite();
  }

  private createSprite(): Graphics {
    const g = new Graphics();
    const color = this.fromPlayer ? 0xffd700 : 0xff4444;

    g.beginFill(color);
    g.drawCircle(0, 0, this.radius);
    g.endFill();

    // Add glow
    g.lineStyle(2, color, 0.5);
    g.drawCircle(0, 0, this.radius + 2);

    return g;
  }

  update(dt: number): void {
    if (!this.active) return;

    this.position.x += this.velocity.vx * dt;
    this.position.y += this.velocity.vy * dt;

    this.lifetime += dt * 1000;
    if (this.lifetime >= this.maxLifetime) {
      this.active = false;
    }

    this.sprite.position.set(this.position.x, this.position.y);
  }

  hit(): boolean {
    this.piercedCount++;

    if (this.piercedCount > this.pierce) {
      this.active = false;
      this.sprite.visible = false;
      return true; // Destroyed
    }

    return false; // Can still pierce
  }

  reset(): void {
    this.active = false;
    this.lifetime = 0;
    this.piercedCount = 0;
  }
}
