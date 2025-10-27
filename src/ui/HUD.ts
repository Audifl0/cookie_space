/**
 * HUD - Heads-up display for game stats
 */

import { Container, Graphics, Text } from 'pixi.js';
import type { Player } from '../entities/Player';

export class HUD {
  private container: Container;
  private width: number;
  private height: number;

  private hpBar: Graphics;
  private shieldBar: Graphics;
  private goldText: Text;
  private waveText: Text;
  private killsText: Text;
  private fpsText: Text;

  private showFPS: boolean = false;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.container = new Container();

    this.hpBar = new Graphics();
    this.shieldBar = new Graphics();

    this.goldText = this.createText('Gold: 0', 20);
    this.waveText = this.createText('Wave: 1', 20);
    this.killsText = this.createText('Kills: 0', 20);
    this.fpsText = this.createText('FPS: 60', 16);

    this.layoutUI();

    this.container.addChild(this.hpBar);
    this.container.addChild(this.shieldBar);
    this.container.addChild(this.goldText);
    this.container.addChild(this.waveText);
    this.container.addChild(this.killsText);
    this.container.addChild(this.fpsText);
  }

  private createText(content: string, fontSize: number): Text {
    return new Text(content, {
      fontSize,
      fill: 0xffffff,
      fontWeight: 'bold',
      stroke: 0x000000,
      strokeThickness: 3,
    });
  }

  private layoutUI(): void {
    const padding = 20;

    this.goldText.position.set(padding, padding);
    this.waveText.position.set(padding, padding + 30);
    this.killsText.position.set(padding, padding + 60);

    this.fpsText.position.set(this.width - 100, padding);
  }

  update(player: Player, gold: number, wave: number, kills: number, fps: number): void {
    // Update HP bar
    this.hpBar.clear();

    const barWidth = 200;
    const barHeight = 20;
    const barX = this.width / 2 - barWidth / 2;
    const barY = this.height - 60;

    // Background
    this.hpBar.beginFill(0x000000, 0.5);
    this.hpBar.drawRect(barX, barY, barWidth, barHeight);
    this.hpBar.endFill();

    // HP
    const hpWidth = barWidth * player.healthPercent;
    const hpColor = player.healthPercent > 0.5 ? 0x00ff00 : player.healthPercent > 0.25 ? 0xffaa00 : 0xff0000;

    this.hpBar.beginFill(hpColor);
    this.hpBar.drawRect(barX, barY, hpWidth, barHeight);
    this.hpBar.endFill();

    // HP text
    const hpText = `${Math.ceil(player.stats.currentHp)} / ${player.stats.maxHp}`;
    const hpLabel = new Text(hpText, {
      fontSize: 14,
      fill: 0xffffff,
      fontWeight: 'bold',
      stroke: 0x000000,
      strokeThickness: 2,
    });
    hpLabel.anchor.set(0.5);
    hpLabel.position.set(barX + barWidth / 2, barY + barHeight / 2);
    this.hpBar.addChild(hpLabel);

    // Border
    this.hpBar.lineStyle(2, 0xffffff, 0.8);
    this.hpBar.drawRect(barX, barY, barWidth, barHeight);

    // Shield bar
    if (player.stats.maxShield > 0) {
      this.shieldBar.clear();

      const shieldY = barY - 30;
      const shieldWidth = barWidth * player.shieldPercent;

      this.shieldBar.beginFill(0x000000, 0.5);
      this.shieldBar.drawRect(barX, shieldY, barWidth, barHeight);
      this.shieldBar.endFill();

      this.shieldBar.beginFill(0x00aaff);
      this.shieldBar.drawRect(barX, shieldY, shieldWidth, barHeight);
      this.shieldBar.endFill();

      const shieldText = `Shield: ${Math.ceil(player.stats.shield)} / ${player.stats.maxShield}`;
      const shieldLabel = new Text(shieldText, {
        fontSize: 14,
        fill: 0xffffff,
        fontWeight: 'bold',
        stroke: 0x000000,
        strokeThickness: 2,
      });
      shieldLabel.anchor.set(0.5);
      shieldLabel.position.set(barX + barWidth / 2, shieldY + barHeight / 2);
      this.shieldBar.addChild(shieldLabel);

      this.shieldBar.lineStyle(2, 0xffffff, 0.8);
      this.shieldBar.drawRect(barX, shieldY, barWidth, barHeight);
    }

    // Update text
    this.goldText.text = `Gold: ${gold}`;
    this.waveText.text = `Wave: ${wave}`;
    this.killsText.text = `Kills: ${kills}`;

    if (this.showFPS) {
      this.fpsText.text = `FPS: ${Math.round(fps)}`;
      this.fpsText.visible = true;
    } else {
      this.fpsText.visible = false;
    }
  }

  setShowFPS(show: boolean): void {
    this.showFPS = show;
  }

  getContainer(): Container {
    return this.container;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.layoutUI();
  }
}
