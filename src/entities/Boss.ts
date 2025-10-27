/**
 * Boss entity class
 */

import { Graphics, Container, Text } from 'pixi.js';
import type { BossSpec, BossPhase } from '../types';
import { Enemy } from './Enemy';

export class Boss extends Enemy {
  override type: 'boss' = 'boss';
  phases: BossPhase[];
  currentPhaseIndex: number = 0;
  phaseStartTime: number = 0;
  phaseElapsed: number = 0;

  healthBar: Graphics;
  nameText: Text;

  constructor(id: string, spec: BossSpec, x: number, y: number, waveIndex: number) {
    super(id, spec, x, y, waveIndex);
    this.type = 'boss';
    this.phases = spec.phases;
    this.radius = 30; // Bosses are bigger

    // Recreate sprite for boss (bigger)
    this.sprite.destroy();
    this.sprite = this.createBossSprite(spec);

    this.healthBar = this.createHealthBar();
    this.nameText = this.createNameText(spec.name);
  }

  private getColorForBoss(id: string): number {
    const colors: Record<string, number> = {
      grand_four_sombre: 0xff4400,
      la_gaufrette_reine: 0xf5deb3,
      le_rouleau_compresseur: 0x888888,
      king_choco_chunk: 0x7b3f00,
      supreme_biscuit: 0xffd700,
    };
    return colors[id] ?? 0xff0000;
  }

  private createBossSprite(spec: BossSpec): Container {
    const container = new Container();

    // Boss body (larger, more detailed)
    const body = new Graphics();
    const color = this.getColorForBoss(spec.id);

    body.beginFill(color);
    body.drawCircle(0, 0, this.radius);
    body.endFill();

    // Crown/decoration
    body.beginFill(0xffd700);
    body.moveTo(-15, -this.radius);
    body.lineTo(-10, -this.radius - 8);
    body.lineTo(-5, -this.radius);
    body.lineTo(0, -this.radius - 10);
    body.lineTo(5, -this.radius);
    body.lineTo(10, -this.radius - 8);
    body.lineTo(15, -this.radius);
    body.endFill();

    // Glow effect
    body.lineStyle(4, color, 0.3);
    body.drawCircle(0, 0, this.radius + 5);

    container.addChild(body);

    return container;
  }

  private createHealthBar(): Graphics {
    const bar = new Graphics();
    return bar;
  }

  private createNameText(name: string): Text {
    const text = new Text(name, {
      fontSize: 18,
      fill: 0xffd700,
      fontWeight: 'bold',
      stroke: 0x000000,
      strokeThickness: 3,
    });
    text.anchor.set(0.5);
    return text;
  }

  override update(dt: number): void {
    super.update(dt);

    // Update phase timer
    this.phaseElapsed += dt;

    const currentPhase = this.phases[this.currentPhaseIndex];
    if (currentPhase && this.phaseElapsed >= currentPhase.durationSec) {
      this.nextPhase();
    }

    // Update health bar
    this.updateHealthBar();

    // Position name text above boss
    this.nameText.position.set(this.position.x, this.position.y - this.radius - 60);
  }

  private updateHealthBar(): void {
    this.healthBar.clear();

    const barWidth = 200;
    const barHeight = 12;
    const x = this.position.x - barWidth / 2;
    const y = this.position.y - this.radius - 45;

    // Background
    this.healthBar.beginFill(0x000000, 0.5);
    this.healthBar.drawRect(x, y, barWidth, barHeight);
    this.healthBar.endFill();

    // Health
    const healthWidth = barWidth * this.healthPercent;
    const healthColor = this.healthPercent > 0.5 ? 0x00ff00 : this.healthPercent > 0.25 ? 0xffaa00 : 0xff0000;

    this.healthBar.beginFill(healthColor);
    this.healthBar.drawRect(x, y, healthWidth, barHeight);
    this.healthBar.endFill();

    // Border
    this.healthBar.lineStyle(2, 0xffffff, 0.8);
    this.healthBar.drawRect(x, y, barWidth, barHeight);
  }

  private nextPhase(): void {
    this.currentPhaseIndex++;
    this.phaseElapsed = 0;

    if (this.currentPhaseIndex >= this.phases.length) {
      // Loop phases or stay on last
      this.currentPhaseIndex = 0;
    }
  }

  getCurrentPhase(): BossPhase | null {
    return this.phases[this.currentPhaseIndex] ?? null;
  }

  startPhase(time: number): void {
    this.phaseStartTime = time;
    this.phaseElapsed = 0;
  }
}
