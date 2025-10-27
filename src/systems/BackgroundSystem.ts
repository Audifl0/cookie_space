/**
 * Background system with parallax and procedural effects
 */

import { Container, Graphics } from 'pixi.js';
import { PerlinNoise } from '../utils/perlin';
import type { BackgroundTheme } from '../types';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  layer: number;
}

export class BackgroundSystem {
  private container: Container;
  private width: number;
  private height: number;

  private stars: Star[] = [];
  private nebula: Graphics;
  private perlin: PerlinNoise;

  private currentTheme: BackgroundTheme;
  private themes: Map<string, BackgroundTheme> = new Map();

  private time: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.container = new Container();

    this.perlin = new PerlinNoise(Date.now());
    this.nebula = new Graphics();

    this.initThemes();
    this.currentTheme = this.themes.get('default')!;

    this.createStars();
    this.container.addChild(this.nebula);
  }

  private initThemes(): void {
    this.themes.set('default', {
      id: 'default',
      name: 'Deep Space',
      colors: {
        star1: 0xffffff,
        star2: 0xaaaaff,
        star3: 0xffffaa,
        nebula1: 0x1a0033,
        nebula2: 0x330066,
      },
      parallaxSpeed: 1,
      particleDensity: 1,
    });

    this.themes.set('nebula_vanilla', {
      id: 'nebula_vanilla',
      name: 'Vanilla Nebula',
      colors: {
        star1: 0xfff8dc,
        star2: 0xffebcd,
        star3: 0xffd700,
        nebula1: 0x332200,
        nebula2: 0x664411,
      },
      parallaxSpeed: 1.2,
      particleDensity: 1.2,
    });

    this.themes.set('nebula_caramel', {
      id: 'nebula_caramel',
      name: 'Caramel Cloud',
      colors: {
        star1: 0xdaa520,
        star2: 0xffd700,
        star3: 0xffebcd,
        nebula1: 0x3d2817,
        nebula2: 0x6b4423,
      },
      parallaxSpeed: 1.1,
      particleDensity: 1.3,
    });

    this.themes.set('meteor_almond', {
      id: 'meteor_almond',
      name: 'Almond Storm',
      colors: {
        star1: 0xd2b48c,
        star2: 0xf5deb3,
        star3: 0xfff8dc,
        nebula1: 0x1a1410,
        nebula2: 0x3d2817,
      },
      parallaxSpeed: 1.5,
      particleDensity: 0.8,
    });

    this.themes.set('nebula_strawberry', {
      id: 'nebula_strawberry',
      name: 'Strawberry Field',
      colors: {
        star1: 0xff69b4,
        star2: 0xffb6c1,
        star3: 0xffc0cb,
        nebula1: 0x330011,
        nebula2: 0x660022,
      },
      parallaxSpeed: 1.0,
      particleDensity: 1.5,
    });

    this.themes.set('nebula_mint', {
      id: 'nebula_mint',
      name: 'Mint Galaxy',
      colors: {
        star1: 0x98ff98,
        star2: 0xd0f0c0,
        star3: 0xf0fff0,
        nebula1: 0x001a0a,
        nebula2: 0x003314,
      },
      parallaxSpeed: 0.9,
      particleDensity: 1.1,
    });

    this.themes.set('nebula_chocolate', {
      id: 'nebula_chocolate',
      name: 'Chocolate Abyss',
      colors: {
        star1: 0x7b3f00,
        star2: 0xd2691e,
        star3: 0xdaa520,
        nebula1: 0x0d0704,
        nebula2: 0x1a0e08,
      },
      parallaxSpeed: 0.8,
      particleDensity: 0.9,
    });
  }

  private createStars(): void {
    const density = 100 * this.currentTheme.particleDensity;

    for (let i = 0; i < density; i++) {
      const layer = Math.floor(Math.random() * 3);

      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 1 + Math.random() * 2,
        speed: (layer + 1) * 20 * this.currentTheme.parallaxSpeed,
        layer,
      });
    }
  }

  setTheme(themeId: string): void {
    const theme = this.themes.get(themeId);
    if (theme) {
      this.currentTheme = theme;
      // Optionally regenerate stars
    }
  }

  update(dt: number): void {
    this.time += dt;

    // Update stars (parallax)
    for (const star of this.stars) {
      star.y += star.speed * dt;

      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    }

    // Redraw
    this.render();
  }

  private render(): void {
    this.nebula.clear();

    // Draw nebula using Perlin noise
    const gridSize = 40;
    const cols = Math.ceil(this.width / gridSize);
    const rows = Math.ceil(this.height / gridSize);

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const noise = this.perlin.octaveNoise(
          (x + this.time * 0.1) * 0.05,
          (y + this.time * 0.1) * 0.05,
          3,
          0.5
        );

        const alpha = (noise + 1) * 0.15;
        const color = noise > 0 ? this.currentTheme.colors.nebula2 : this.currentTheme.colors.nebula1;

        this.nebula.beginFill(color, alpha);
        this.nebula.drawRect(x * gridSize, y * gridSize, gridSize, gridSize);
        this.nebula.endFill();
      }
    }

    // Draw stars
    const starColors = [
      this.currentTheme.colors.star1,
      this.currentTheme.colors.star2,
      this.currentTheme.colors.star3,
    ];

    for (const star of this.stars) {
      const color = starColors[star.layer];
      const twinkle = 0.5 + Math.sin(this.time * 2 + star.x) * 0.5;

      this.nebula.beginFill(color, twinkle);
      this.nebula.drawCircle(star.x, star.y, star.size);
      this.nebula.endFill();
    }
  }

  getContainer(): Container {
    return this.container;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.stars = [];
    this.createStars();
  }
}
