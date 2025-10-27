/**
 * Menu system - title screen, pause menu, game over, etc.
 */

import { Container, Graphics, Text } from 'pixi.js';
import { gameEvents } from '../utils/events';

export type MenuType = 'title' | 'pause' | 'shop' | 'gameover' | 'victory' | 'wave_complete';

export interface MenuButton {
  text: string;
  action: string;
  x: number;
  y: number;
  width: number;
  height: number;
  graphics: Graphics;
  label: Text;
}

export class Menu {
  private container: Container;
  private width: number;
  private height: number;
  private type: MenuType;

  private buttons: MenuButton[] = [];
  private title: Text | null = null;
  private subtitle: Text | null = null;
  private background: Graphics;

  constructor(width: number, height: number, type: MenuType) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.container = new Container();

    this.background = new Graphics();
    this.background.beginFill(0x000000, 0.8);
    this.background.drawRect(0, 0, width, height);
    this.background.endFill();
    this.container.addChild(this.background);

    this.build();
    this.setupInteraction();
  }

  private build(): void {
    switch (this.type) {
      case 'title':
        this.buildTitleMenu();
        break;
      case 'pause':
        this.buildPauseMenu();
        break;
      case 'shop':
        this.buildShopMenu();
        break;
      case 'gameover':
        this.buildGameOverMenu();
        break;
      case 'victory':
        this.buildVictoryMenu();
        break;
      case 'wave_complete':
        this.buildWaveCompleteMenu();
        break;
    }
  }

  private buildTitleMenu(): void {
    this.title = this.createText('Cookie Space Shooter', 48, true);
    this.title.position.set(this.width / 2, this.height / 3);
    this.container.addChild(this.title);

    this.subtitle = this.createText('A delicious space adventure', 20, false);
    this.subtitle.position.set(this.width / 2, this.height / 3 + 60);
    this.container.addChild(this.subtitle);

    this.addButton('Play', 'play', this.width / 2, this.height / 2 + 50);
    this.addButton('Options', 'options', this.width / 2, this.height / 2 + 120);
  }

  private buildPauseMenu(): void {
    this.title = this.createText('Paused', 40, true);
    this.title.position.set(this.width / 2, this.height / 3);
    this.container.addChild(this.title);

    this.addButton('Resume', 'resume', this.width / 2, this.height / 2);
    this.addButton('Main Menu', 'mainmenu', this.width / 2, this.height / 2 + 70);
  }

  private buildShopMenu(): void {
    this.title = this.createText('Upgrade Shop', 36, true);
    this.title.position.set(this.width / 2, 50);
    this.container.addChild(this.title);

    this.addButton('Continue', 'continue', this.width / 2, this.height - 80);
  }

  private buildGameOverMenu(): void {
    this.title = this.createText('Game Over', 48, true);
    this.title.position.set(this.width / 2, this.height / 3);
    this.container.addChild(this.title);

    this.addButton('Restart', 'restart', this.width / 2, this.height / 2 + 50);
    this.addButton('Main Menu', 'mainmenu', this.width / 2, this.height / 2 + 120);
  }

  private buildVictoryMenu(): void {
    this.title = this.createText('Victory!', 48, true);
    this.title.position.set(this.width / 2, this.height / 3);
    this.container.addChild(this.title);

    this.subtitle = this.createText('You survived the cookie invasion!', 20, false);
    this.subtitle.position.set(this.width / 2, this.height / 3 + 60);
    this.container.addChild(this.subtitle);

    this.addButton('Continue', 'continue', this.width / 2, this.height / 2 + 50);
    this.addButton('Main Menu', 'mainmenu', this.width / 2, this.height / 2 + 120);
  }

  private buildWaveCompleteMenu(): void {
    this.title = this.createText('Wave Complete!', 40, true);
    this.title.position.set(this.width / 2, this.height / 3);
    this.container.addChild(this.title);

    this.addButton('Next Wave', 'continue', this.width / 2, this.height / 2 + 50);
  }

  private createText(content: string, fontSize: number, bold: boolean): Text {
    return new Text(content, {
      fontSize,
      fill: 0xffd700,
      fontWeight: bold ? 'bold' : 'normal',
      stroke: 0x000000,
      strokeThickness: 4,
      align: 'center',
    });
  }

  private addButton(text: string, action: string, x: number, y: number): void {
    const width = 200;
    const height = 50;

    const graphics = new Graphics();
    const label = new Text(text, {
      fontSize: 20,
      fill: 0xffffff,
      fontWeight: 'bold',
    });

    label.anchor.set(0.5);
    label.position.set(x, y);

    const button: MenuButton = {
      text,
      action,
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      graphics,
      label,
    };

    this.drawButton(button, false);

    this.container.addChild(graphics);
    this.container.addChild(label);

    this.buttons.push(button);
  }

  private drawButton(button: MenuButton, hover: boolean): void {
    button.graphics.clear();

    const color = hover ? 0xffa500 : 0x4a9eff;
    const alpha = hover ? 1 : 0.8;

    button.graphics.beginFill(color, alpha);
    button.graphics.drawRoundedRect(button.x, button.y, button.width, button.height, 8);
    button.graphics.endFill();

    button.graphics.lineStyle(3, 0xffffff, 0.8);
    button.graphics.drawRoundedRect(button.x, button.y, button.width, button.height, 8);
  }

  private setupInteraction(): void {
    this.container.interactive = true;

    this.container.on('pointermove', (event) => {
      const pos = event.data.global;

      for (const button of this.buttons) {
        const hover =
          pos.x >= button.x &&
          pos.x <= button.x + button.width &&
          pos.y >= button.y &&
          pos.y <= button.y + button.height;

        this.drawButton(button, hover);
      }
    });

    this.container.on('pointerdown', (event) => {
      const pos = event.data.global;

      for (const button of this.buttons) {
        const clicked =
          pos.x >= button.x &&
          pos.x <= button.x + button.width &&
          pos.y >= button.y &&
          pos.y <= button.y + button.height;

        if (clicked) {
          gameEvents.emit('menu_action', { action: button.action });
        }
      }
    });
  }

  getContainer(): Container {
    return this.container;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
