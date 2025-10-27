/**
 * Enemy entity class
 */

import { Graphics, Container } from 'pixi.js';
import type { Enemy as EnemyType, EnemySpec, Position, Velocity, BehaviorType } from '../types';

export class Enemy implements EnemyType {
  id: string;
  type: 'enemy' = 'enemy';
  specId: string;
  position: Position;
  velocity: Velocity;
  radius: number = 12;
  active: boolean = true;

  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  behaviors: BehaviorType[];

  // Behavior state
  orbitAngle?: number;
  orbitRadius?: number;
  targetPosition?: Position;

  sprite: Container;
  spec: EnemySpec;

  constructor(id: string, spec: EnemySpec, x: number, y: number, waveIndex: number) {
    this.id = id;
    this.specId = spec.id;
    this.spec = spec;
    this.position = { x, y };
    this.velocity = { vx: 0, vy: 0 };

    // Scale with wave
    this.maxHp = spec.hp * (1 + 0.12 * waveIndex);
    this.hp = this.maxHp;
    this.damage = spec.damage * (1 + 0.08 * waveIndex);
    this.speed = spec.speed * (1 + 0.02 * waveIndex);
    this.behaviors = spec.behaviors;

    // Initialize behavior state
    if (this.behaviors.includes('orbit')) {
      this.orbitAngle = Math.random() * Math.PI * 2;
      this.orbitRadius = 100 + Math.random() * 100;
    }

    this.sprite = this.createSprite(spec);
  }

  private createSprite(spec: EnemySpec): Container {
    const container = new Container();

    // Simple colored circle based on enemy type
    const body = new Graphics();
    const color = this.getColorForEnemy(spec.id);

    body.beginFill(color);
    body.drawCircle(0, 0, this.radius);
    body.endFill();

    // Add border
    body.lineStyle(2, 0xffffff, 0.3);
    body.drawCircle(0, 0, this.radius);

    // Add chip pattern for chip_drone
    if (spec.id.includes('chip')) {
      const chip = new Graphics();
      chip.beginFill(0x8b4513);
      chip.drawCircle(3, -3, 3);
      chip.drawCircle(-4, 2, 2);
      chip.drawCircle(2, 5, 2);
      chip.endFill();
      container.addChild(chip);
    }

    container.addChild(body);

    return container;
  }

  private getColorForEnemy(id: string): number {
    const colors: Record<string, number> = {
      chip_drone: 0xd4a574,
      oreo_orbiter: 0x3d2817,
      macaron_mine: 0xff69b4,
      biscotti_bomber: 0xdaa520,
      ginger_snapper: 0xcd7f32,
      fortune_flyer: 0xffd700,
      wafer_weaver: 0xf5deb3,
      sugar_sprite: 0xffffff,
      caramel_crusher: 0xc68e17,
      choco_chunk: 0x7b3f00,
      mint_menace: 0x98ff98,
      almond_asteroid: 0xd2b48c,
    };

    return colors[id] ?? 0xcccccc;
  }

  update(dt: number): void {
    if (!this.active) return;

    this.position.x += this.velocity.vx * dt;
    this.position.y += this.velocity.vy * dt;

    // Update orbit angle
    if (this.orbitAngle !== undefined) {
      this.orbitAngle += dt * 0.5;
    }

    this.sprite.position.set(this.position.x, this.position.y);
  }

  takeDamage(damage: number): boolean {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.active = false;
      return true; // Killed
    }
    return false;
  }

  get healthPercent(): number {
    return this.hp / this.maxHp;
  }

  reset(): void {
    this.active = false;
    this.hp = 0;
  }
}
