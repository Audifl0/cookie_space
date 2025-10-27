/**
 * Loot entity class (gold drops)
 */

import { Graphics } from 'pixi.js';
import type { Loot as LootType, Position, Velocity } from '../types';

export class Loot implements LootType {
  id: string;
  type: 'loot' = 'loot';
  position: Position;
  velocity: Velocity;
  radius: number = 8;
  active: boolean = true;
  attracted: boolean = false;

  goldValue: number;
  sprite: Graphics;
  lifetime: number = 0;
  bobPhase: number;

  constructor(id: string, x: number, y: number, goldValue: number) {
    this.id = id;
    this.position = { x, y };
    this.velocity = { vx: 0, vy: 0 };
    this.goldValue = goldValue;
    this.bobPhase = Math.random() * Math.PI * 2;

    this.sprite = this.createSprite();
  }

  private createSprite(): Graphics {
    const g = new Graphics();

    // Gold coin
    g.beginFill(0xffd700);
    g.drawCircle(0, 0, this.radius);
    g.endFill();

    // Highlight
    g.beginFill(0xffed4e, 0.6);
    g.drawCircle(-2, -2, this.radius * 0.4);
    g.endFill();

    // Border
    g.lineStyle(1, 0xdaa520);
    g.drawCircle(0, 0, this.radius);

    return g;
  }

  update(dt: number): void {
    if (!this.active) return;

    // Apply velocity
    this.position.x += this.velocity.vx * dt;
    this.position.y += this.velocity.vy * dt;

    // Floating bob animation
    if (!this.attracted) {
      this.lifetime += dt;
      this.bobPhase += dt * 2;
      const bobOffset = Math.sin(this.bobPhase) * 2;
      this.sprite.position.set(this.position.x, this.position.y + bobOffset);
    } else {
      this.sprite.position.set(this.position.x, this.position.y);
    }

    // Fade after 10 seconds
    if (this.lifetime > 10) {
      const alpha = Math.max(0, 1 - (this.lifetime - 10) / 5);
      this.sprite.alpha = alpha;

      if (alpha === 0) {
        this.active = false;
      }
    }
  }

  attractTo(targetX: number, targetY: number, attractionSpeed: number): void {
    this.attracted = true;

    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.velocity.vx = (dx / distance) * attractionSpeed;
      this.velocity.vy = (dy / distance) * attractionSpeed;
    }
  }

  reset(): void {
    this.active = false;
    this.attracted = false;
    this.lifetime = 0;
    this.sprite.alpha = 1;
  }
}
