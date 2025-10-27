/**
 * Shop UI for upgrades
 */

import { Container, Graphics, Text } from 'pixi.js';
import type { Upgrade } from '../types';
import { gameEvents } from '../utils/events';

interface ShopCard {
  upgrade: Upgrade;
  x: number;
  y: number;
  width: number;
  height: number;
  graphics: Graphics;
  nameText: Text;
  descText: Text;
  costText: Text;
}

export class Shop {
  private container: Container;
  private width: number;

  private cards: ShopCard[] = [];
  private gold: number = 0;

  constructor(width: number, _height: number) {
    this.width = width;
    this.container = new Container();

    this.setupInteraction();
  }

  displayOffers(upgrades: Upgrade[], currentGold: number): void {
    this.gold = currentGold;
    this.cards = [];
    this.container.removeChildren();

    const cardWidth = 220;
    const cardHeight = 200;
    const spacing = 20;
    const startX = (this.width - (cardWidth * upgrades.length + spacing * (upgrades.length - 1))) / 2;
    const startY = 150;

    for (let i = 0; i < upgrades.length; i++) {
      const upgrade = upgrades[i];
      const x = startX + i * (cardWidth + spacing);
      const y = startY;

      const card = this.createCard(upgrade, x, y, cardWidth, cardHeight);
      this.cards.push(card);

      this.container.addChild(card.graphics);
      this.container.addChild(card.nameText);
      this.container.addChild(card.descText);
      this.container.addChild(card.costText);
    }
  }

  private createCard(upgrade: Upgrade, x: number, y: number, width: number, height: number): ShopCard {
    const graphics = new Graphics();

    const nameText = new Text(upgrade.name, {
      fontSize: 16,
      fill: 0xffd700,
      fontWeight: 'bold',
      wordWrap: true,
      wordWrapWidth: width - 20,
      align: 'center',
    });
    nameText.anchor.set(0.5, 0);
    nameText.position.set(x + width / 2, y + 10);

    const descText = new Text(upgrade.description, {
      fontSize: 13,
      fill: 0xffffff,
      wordWrap: true,
      wordWrapWidth: width - 20,
      align: 'center',
    });
    descText.anchor.set(0.5, 0);
    descText.position.set(x + width / 2, y + 50);

    const canAfford = this.gold >= upgrade.cost;
    const costColor = canAfford ? 0x00ff00 : 0xff0000;

    const costText = new Text(`${upgrade.cost} Gold`, {
      fontSize: 18,
      fill: costColor,
      fontWeight: 'bold',
    });
    costText.anchor.set(0.5);
    costText.position.set(x + width / 2, y + height - 30);

    const card: ShopCard = {
      upgrade,
      x,
      y,
      width,
      height,
      graphics,
      nameText,
      descText,
      costText,
    };

    this.drawCard(card, false);

    return card;
  }

  private drawCard(card: ShopCard, hover: boolean): void {
    card.graphics.clear();

    const canAfford = this.gold >= card.upgrade.cost;
    let color = 0x2a2a4a;

    if (hover && canAfford) {
      color = 0x4a4a8a;
    } else if (!canAfford) {
      color = 0x4a2a2a;
    }

    card.graphics.beginFill(color, 0.9);
    card.graphics.drawRoundedRect(card.x, card.y, card.width, card.height, 10);
    card.graphics.endFill();

    card.graphics.lineStyle(3, hover ? 0xffd700 : 0xffffff, 0.6);
    card.graphics.drawRoundedRect(card.x, card.y, card.width, card.height, 10);
  }

  private setupInteraction(): void {
    this.container.interactive = true;

    this.container.on('pointermove', (event) => {
      const pos = event.data.global;

      for (const card of this.cards) {
        const hover =
          pos.x >= card.x &&
          pos.x <= card.x + card.width &&
          pos.y >= card.y &&
          pos.y <= card.y + card.height;

        this.drawCard(card, hover);
      }
    });

    this.container.on('pointerdown', (event) => {
      const pos = event.data.global;

      for (const card of this.cards) {
        const clicked =
          pos.x >= card.x &&
          pos.x <= card.x + card.width &&
          pos.y >= card.y &&
          pos.y <= card.y + card.height;

        if (clicked && this.gold >= card.upgrade.cost) {
          gameEvents.emit('shop_purchase', { upgradeId: card.upgrade.id });
        }
      }
    });
  }

  getContainer(): Container {
    return this.container;
  }

  updateGold(gold: number): void {
    this.gold = gold;
    // Redraw cards with updated affordability
    for (const card of this.cards) {
      this.drawCard(card, false);
      const canAfford = this.gold >= card.upgrade.cost;
      card.costText.style.fill = canAfford ? 0x00ff00 : 0xff0000;
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
