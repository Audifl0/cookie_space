/**
 * Main Game class - orchestrates all systems
 */

import { Application, Container } from 'pixi.js';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { Projectile } from '../entities/Projectile';
import { Loot } from '../entities/Loot';

import { InputSystem } from '../systems/InputSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { BackgroundSystem } from '../systems/BackgroundSystem';
import { WaveManager } from '../systems/WaveManager';
import { UpgradeManager } from '../systems/UpgradeManager';
import { MissionManager } from '../systems/MissionManager';

import { HUD } from '../ui/HUD';
import { Menu } from '../ui/Menu';
import { Shop } from '../ui/Shop';

import { Pool } from '../utils/pool';
import { SpatialHash } from '../utils/spatial';
import { gameEvents } from '../utils/events';
import { circleCollision, angleTo, distance } from '../utils/math';

import type { GameState, EconomyStats } from '../types';

type GamePhase = 'title' | 'playing' | 'shop' | 'paused' | 'gameover';

export class Game {
  private app: Application;
  private gameContainer: Container;
  private uiContainer: Container;

  // Systems
  private input: InputSystem;
  private audio: AudioSystem;
  private save: SaveSystem;
  private background: BackgroundSystem;
  private waveManager: WaveManager;
  private upgradeManager: UpgradeManager;
  private missionManager: MissionManager;

  // UI
  private hud: HUD;
  private currentMenu: Menu | null = null;
  private shop: Shop | null = null;

  // Entities
  private player: Player;
  private enemies: Enemy[] = [];
  private bosses: Boss[] = [];
  private projectiles: Projectile[] = [];
  private loots: Loot[] = [];

  // Pools
  private projectilePool: Pool<Projectile>;
  private lootPool: Pool<Loot>;

  // Spatial
  private spatial: SpatialHash;

  // Game state
  private phase: GamePhase = 'title';
  private state: GameState;
  private economyStats: EconomyStats;

  private kills: number = 0;

  private lastTime: number = 0;
  private fps: number = 60;
  private fpsFrames: number = 0;
  private fpsTime: number = 0;

  private entityIdCounter: number = 0;

  constructor(app: Application) {
    this.app = app;

    // Containers
    this.gameContainer = new Container();
    this.uiContainer = new Container();

    this.app.stage.addChild(this.gameContainer);
    this.app.stage.addChild(this.uiContainer);

    // Initialize systems
    this.input = new InputSystem(this.app.view as HTMLCanvasElement);
    this.audio = new AudioSystem();
    this.save = new SaveSystem();
    this.background = new BackgroundSystem(this.app.screen.width, this.app.screen.height);
    this.waveManager = new WaveManager();
    this.upgradeManager = new UpgradeManager();
    this.missionManager = new MissionManager();

    this.gameContainer.addChild(this.background.getContainer());

    // Initialize player
    this.player = new Player(this.app.screen.width / 2, this.app.screen.height / 2);
    this.gameContainer.addChild(this.player.sprite);

    // Pools
    this.projectilePool = new Pool(
      () => new Projectile(this.genId(), 0, 0, 0, 0, 0, true),
      (p) => p.reset(),
      50
    );

    this.lootPool = new Pool(
      () => new Loot(this.genId(), 0, 0, 0),
      (l) => l.reset(),
      30
    );

    // Spatial hash
    this.spatial = new SpatialHash(50);

    // State
    this.state = {
      currentWave: 1,
      gold: this.save.getGold(),
      kills: 0,
      waveStartTime: 0,
      noHitCurrentWave: true,
      difficulty: 'normal',
    };

    this.economyStats = {
      goldMultiplier: 1,
      dropRateBonus: 0,
      rerollCost: 10,
    };

    // UI
    this.hud = new HUD(this.app.screen.width, this.app.screen.height);
    this.hud.setShowFPS(this.save.getOptions().showFPS);
    this.uiContainer.addChild(this.hud.getContainer());

    // Apply saved upgrades
    this.upgradeManager.setOwnedUpgrades(this.save.getOwnedUpgrades());
    this.upgradeManager.applyUpgrades(this.player.stats, this.player.weaponStats, this.economyStats);

    // Load saved missions
    this.missionManager.loadProgress(this.save.getMissions());

    // Setup events
    this.setupEvents();

    // Show title menu
    this.showMenu('title');

    // Start game loop
    this.app.ticker.add(this.gameLoop.bind(this));

    // Audio context resume (browser requirement)
    window.addEventListener('click', () => this.audio.resume(), { once: true });
  }

  private genId(): string {
    return `entity_${this.entityIdCounter++}`;
  }

  private setupEvents(): void {
    gameEvents.on('spawn_enemy', (data: { spec: unknown; wave: number }) => {
      this.spawnEnemy(data.spec, data.wave);
    });

    gameEvents.on('spawn_boss', (data: { spec: unknown; wave: number }) => {
      this.spawnBoss(data.spec, data.wave);
    });

    gameEvents.on('boss_warning', () => {
      this.audio.playBossWarning();
    });

    gameEvents.on('wave_cleared', () => {
      this.onWaveCleared();
    });

    gameEvents.on('menu_action', (data: { action: string }) => {
      this.handleMenuAction(data.action);
    });

    gameEvents.on('shop_purchase', (data: { upgradeId: string }) => {
      this.purchaseUpgrade(data.upgradeId);
    });
  }

  private gameLoop(delta: number): void {
    const now = performance.now();
    const dt = delta / 60; // Normalize to 60fps

    // FPS calculation
    this.fpsFrames++;
    this.fpsTime += now - this.lastTime;
    if (this.fpsTime >= 1000) {
      this.fps = (this.fpsFrames / this.fpsTime) * 1000;
      this.fpsFrames = 0;
      this.fpsTime = 0;
    }
    this.lastTime = now;

    if (this.phase === 'playing') {
      this.updateGame(dt, now);
    }

    // Always update background
    this.background.update(dt);

    // Update HUD
    this.hud.update(this.player, this.state.gold, this.state.currentWave, this.kills, this.fps);
  }

  private updateGame(dt: number, time: number): void {
    // Input
    const inputState = this.input.getState();

    // Pause
    if (inputState.pause) {
      this.pause();
      return;
    }

    // Player movement
    const moveSpeed = this.player.stats.speed * dt;
    this.player.velocity.vx = inputState.moveX * moveSpeed;
    this.player.velocity.vy = inputState.moveY * moveSpeed;

    // Player rotation (aim at mouse/touch)
    if (!inputState.touchActive) {
      this.player.rotation = angleTo(
        this.player.position.x,
        this.player.position.y,
        inputState.mouseX,
        inputState.mouseY
      );
    } else {
      // Touch: aim in movement direction
      if (inputState.moveX !== 0 || inputState.moveY !== 0) {
        this.player.rotation = Math.atan2(inputState.moveY, inputState.moveX);
      }
    }

    // Player shooting
    if (inputState.fire && this.player.canFire(time)) {
      this.playerShoot(time);
    }

    // Player dash
    if (inputState.dash && this.player.canDash(time)) {
      this.player.dash(time);
      this.audio.playDash();
      // Apply dash velocity
      const dashSpeed = 500;
      this.player.velocity.vx = Math.cos(this.player.rotation) * dashSpeed * dt;
      this.player.velocity.vy = Math.sin(this.player.rotation) * dashSpeed * dt;
    }

    // Update player
    this.player.update(dt);

    // Constrain player to bounds
    this.constrainPlayer();

    // Update wave manager
    this.waveManager.update(dt);

    // Update enemies
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      this.updateEnemyAI(enemy, dt);
      enemy.update(dt);
    }

    // Update bosses
    for (const boss of this.bosses) {
      if (!boss.active) continue;
      this.updateEnemyAI(boss, dt);
      boss.update(dt);
    }

    // Update projectiles
    for (const projectile of this.projectiles) {
      if (!projectile.active) continue;
      projectile.update(dt);

      // Remove off-screen projectiles
      if (this.isOffScreen(projectile.position.x, projectile.position.y)) {
        this.removeProjectile(projectile);
      }
    }

    // Update loot
    for (const loot of this.loots) {
      if (!loot.active) continue;

      const dist = distance(loot.position.x, loot.position.y, this.player.position.x, this.player.position.y);
      if (dist < this.player.stats.lootMagnetRadius) {
        loot.attractTo(this.player.position.x, this.player.position.y, 300);
      }

      loot.update(dt);

      // Check collection
      if (dist < this.player.radius + loot.radius) {
        this.collectLoot(loot);
      }
    }

    // Collision detection
    this.handleCollisions();

    // Clean up inactive entities
    this.cleanupEntities();
  }

  private playerShoot(time: number): void {
    const projectile = this.projectilePool.acquire();

    const offset = 20;
    const startX = this.player.position.x + Math.cos(this.player.rotation) * offset;
    const startY = this.player.position.y + Math.sin(this.player.rotation) * offset;

    projectile.id = this.genId();
    projectile.position.x = startX;
    projectile.position.y = startY;
    projectile.velocity.vx = Math.cos(this.player.rotation) * 400;
    projectile.velocity.vy = Math.sin(this.player.rotation) * 400;
    projectile.damage = this.player.weaponStats.damage;
    projectile.pierce = this.player.weaponStats.pierce;
    projectile.splash = this.player.weaponStats.splash;
    projectile.active = true;
    projectile.fromPlayer = true;
    projectile.sprite.visible = true;

    this.projectiles.push(projectile);
    this.gameContainer.addChild(projectile.sprite);

    this.player.fire(time);
    this.audio.playShoot();
  }

  private updateEnemyAI(enemy: Enemy, _dt: number): void {
    const dx = this.player.position.x - enemy.position.x;
    const dy = this.player.position.y - enemy.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (enemy.behaviors.includes('seek')) {
      if (dist > 0) {
        enemy.velocity.vx = (dx / dist) * enemy.speed;
        enemy.velocity.vy = (dy / dist) * enemy.speed;
      }
    }

    if (enemy.behaviors.includes('orbit')) {
      if (enemy.orbitAngle !== undefined) {
        const targetDist = enemy.orbitRadius ?? 100;
        const targetX = this.player.position.x + Math.cos(enemy.orbitAngle) * targetDist;
        const targetY = this.player.position.y + Math.sin(enemy.orbitAngle) * targetDist;

        const odx = targetX - enemy.position.x;
        const ody = targetY - enemy.position.y;
        const odist = Math.sqrt(odx * odx + ody * ody);

        if (odist > 0) {
          enemy.velocity.vx = (odx / odist) * enemy.speed;
          enemy.velocity.vy = (ody / odist) * enemy.speed;
        }
      }
    }

    if (enemy.behaviors.includes('kamikaze')) {
      if (dist > 0) {
        enemy.velocity.vx = (dx / dist) * enemy.speed * 1.5;
        enemy.velocity.vy = (dy / dist) * enemy.speed * 1.5;
      }
    }

    if (enemy.behaviors.includes('mine')) {
      // Mines just float
      enemy.velocity.vx *= 0.95;
      enemy.velocity.vy *= 0.95;
    }
  }

  private handleCollisions(): void {
    this.spatial.clear();

    // Insert all entities
    for (const enemy of this.enemies) {
      if (enemy.active) this.spatial.insert(enemy);
    }
    for (const boss of this.bosses) {
      if (boss.active) this.spatial.insert(boss);
    }

    // Check projectile collisions
    for (const projectile of this.projectiles) {
      if (!projectile.active || !projectile.fromPlayer) continue;

      const nearby = this.spatial.getNearby(projectile);

      for (const entity of nearby) {
        if (entity.type === 'enemy' || entity.type === 'boss') {
          const enemy = entity as Enemy;

          if (circleCollision(
            projectile.position.x,
            projectile.position.y,
            projectile.radius,
            enemy.position.x,
            enemy.position.y,
            enemy.radius
          )) {
            this.damageEnemy(enemy, projectile.damage);
            projectile.hit();
            this.audio.playHit();

            if (!projectile.active) break;
          }
        }
      }
    }

    // Check player-enemy collisions
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      if (circleCollision(
        this.player.position.x,
        this.player.position.y,
        this.player.radius,
        enemy.position.x,
        enemy.position.y,
        enemy.radius
      )) {
        this.damagePlayer(enemy.damage, performance.now());
      }
    }

    for (const boss of this.bosses) {
      if (!boss.active) continue;

      if (circleCollision(
        this.player.position.x,
        this.player.position.y,
        this.player.radius,
        boss.position.x,
        boss.position.y,
        boss.radius
      )) {
        this.damagePlayer(boss.damage, performance.now());
      }
    }
  }

  private damageEnemy(enemy: Enemy, damage: number): void {
    const killed = enemy.takeDamage(damage);

    if (killed) {
      this.killEnemy(enemy);
    }
  }

  private killEnemy(enemy: Enemy): void {
    this.audio.playExplosion();
    this.kills++;
    this.waveManager.onEnemyKilled();

    // Drop loot
    if (Math.random() < enemy.spec.loot.dropRate + this.economyStats.dropRateBonus) {
      const goldAmount = Math.floor(
        Math.random() * (enemy.spec.loot.goldMax - enemy.spec.loot.goldMin + 1) +
        enemy.spec.loot.goldMin
      );
      this.spawnLoot(enemy.position.x, enemy.position.y, goldAmount);
    }

    // Emit event for missions
    gameEvents.emit('enemy_killed', { specId: enemy.specId });

    if (enemy.type === 'boss') {
      gameEvents.emit('boss_killed', { specId: enemy.specId });
    }

    // Remove sprite
    enemy.sprite.destroy();
    const index = enemy.type === 'boss' ? this.bosses.indexOf(enemy as Boss) : this.enemies.indexOf(enemy);
    if (index !== -1) {
      if (enemy.type === 'boss') {
        this.bosses.splice(index, 1);
      } else {
        this.enemies.splice(index, 1);
      }
    }
  }

  private damagePlayer(damage: number, time: number): void {
    const killed = this.player.takeDamage(damage, time);
    this.state.noHitCurrentWave = false;

    if (killed) {
      this.gameOver();
    }
  }

  private spawnEnemy(spec: unknown, wave: number): void {
    const enemySpec = spec as import('../types').EnemySpec;

    // Spawn at random edge
    const edge = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    switch (edge) {
      case 0: // Top
        x = Math.random() * this.app.screen.width;
        y = -20;
        break;
      case 1: // Right
        x = this.app.screen.width + 20;
        y = Math.random() * this.app.screen.height;
        break;
      case 2: // Bottom
        x = Math.random() * this.app.screen.width;
        y = this.app.screen.height + 20;
        break;
      case 3: // Left
        x = -20;
        y = Math.random() * this.app.screen.height;
        break;
    }

    const enemy = new Enemy(this.genId(), enemySpec, x, y, wave);
    this.enemies.push(enemy);
    this.gameContainer.addChild(enemy.sprite);
  }

  private spawnBoss(spec: unknown, wave: number): void {
    const bossSpec = spec as import('../types').BossSpec;

    const x = this.app.screen.width / 2;
    const y = 100;

    const boss = new Boss(this.genId(), bossSpec, x, y, wave);
    boss.startPhase(performance.now());
    this.bosses.push(boss);
    this.gameContainer.addChild(boss.sprite);
    this.gameContainer.addChild(boss.healthBar);
    this.uiContainer.addChild(boss.nameText);
  }

  private spawnLoot(x: number, y: number, goldValue: number): void {
    const loot = this.lootPool.acquire();
    loot.id = this.genId();
    loot.position.x = x;
    loot.position.y = y;
    loot.goldValue = goldValue;
    loot.active = true;
    loot.sprite.visible = true;

    this.loots.push(loot);
    this.gameContainer.addChild(loot.sprite);
  }

  private collectLoot(loot: Loot): void {
    const goldGained = Math.floor(loot.goldValue * this.economyStats.goldMultiplier);
    this.state.gold += goldGained;

    gameEvents.emit('gold_collected', { amount: goldGained });

    this.audio.playPickup();
    this.removeLoot(loot);
  }

  private removeProjectile(projectile: Projectile): void {
    projectile.sprite.visible = false;
    this.projectilePool.release(projectile);
  }

  private removeLoot(loot: Loot): void {
    loot.sprite.visible = false;
    this.lootPool.release(loot);
  }

  private cleanupEntities(): void {
    this.projectiles = this.projectiles.filter(p => p.active);
    this.loots = this.loots.filter(l => l.active);
  }

  private constrainPlayer(): void {
    const margin = this.player.radius;
    this.player.position.x = Math.max(margin, Math.min(this.app.screen.width - margin, this.player.position.x));
    this.player.position.y = Math.max(margin, Math.min(this.app.screen.height - margin, this.player.position.y));
  }

  private isOffScreen(x: number, y: number, margin: number = 50): boolean {
    return x < -margin || x > this.app.screen.width + margin || y < -margin || y > this.app.screen.height + margin;
  }

  private onWaveCleared(): void {
    this.save.setHighestWave(this.state.currentWave);
    this.save.setGold(this.state.gold);

    gameEvents.emit('wave_cleared', { wave: this.state.currentWave, noHit: this.state.noHitCurrentWave });

    // Show shop
    this.showShop();
  }

  private showShop(): void {
    this.phase = 'shop';

    const offers = this.upgradeManager.generateShopOffers(4);
    this.shop = new Shop(this.app.screen.width, this.app.screen.height);
    this.shop.displayOffers(offers, this.state.gold);

    const menu = new Menu(this.app.screen.width, this.app.screen.height, 'shop');
    this.currentMenu = menu;

    this.uiContainer.addChild(this.shop.getContainer());
    this.uiContainer.addChild(menu.getContainer());
  }

  private purchaseUpgrade(upgradeId: string): void {
    const result = this.upgradeManager.purchaseUpgrade(upgradeId, this.state.gold);

    if (result.success) {
      this.state.gold = result.newGold;

      // Reapply all upgrades
      this.upgradeManager.applyUpgrades(this.player.stats, this.player.weaponStats, this.economyStats);

      // Save
      this.save.addUpgrade(upgradeId);
      this.save.setGold(this.state.gold);

      // Update shop display
      if (this.shop) {
        this.shop.updateGold(this.state.gold);
      }

      this.audio.playClick();
      gameEvents.emit('upgrade_purchased', { upgradeId });
    }
  }

  private handleMenuAction(action: string): void {
    this.audio.playClick();

    switch (action) {
      case 'play':
        this.startGame();
        break;
      case 'continue':
        if (this.phase === 'shop') {
          this.nextWave();
        } else {
          this.resume();
        }
        break;
      case 'resume':
        this.resume();
        break;
      case 'restart':
        this.restart();
        break;
      case 'mainmenu':
        this.showMenu('title');
        break;
    }
  }

  private startGame(): void {
    this.phase = 'playing';
    this.state.currentWave = 1;
    this.kills = 0;

    if (this.currentMenu) {
      this.currentMenu.destroy();
      this.currentMenu = null;
    }

    this.waveManager.startWave(1);
  }

  private nextWave(): void {
    this.phase = 'playing';
    this.state.currentWave++;
    this.state.noHitCurrentWave = true;

    if (this.currentMenu) {
      this.currentMenu.destroy();
      this.currentMenu = null;
    }

    if (this.shop) {
      this.shop.destroy();
      this.shop = null;
    }

    const waveSpec = this.waveManager.getWave(this.state.currentWave);
    if (waveSpec?.bgTheme) {
      this.background.setTheme(waveSpec.bgTheme);
    }

    this.waveManager.startWave(this.state.currentWave);
  }

  private pause(): void {
    this.phase = 'paused';
    this.currentMenu = new Menu(this.app.screen.width, this.app.screen.height, 'pause');
    this.uiContainer.addChild(this.currentMenu.getContainer());
  }

  private resume(): void {
    this.phase = 'playing';
    if (this.currentMenu) {
      this.currentMenu.destroy();
      this.currentMenu = null;
    }
  }

  private gameOver(): void {
    this.phase = 'gameover';

    this.save.addKills(this.kills);
    this.save.setGold(this.state.gold);

    this.currentMenu = new Menu(this.app.screen.width, this.app.screen.height, 'gameover');
    this.uiContainer.addChild(this.currentMenu.getContainer());
  }

  private restart(): void {
    // Clear all entities
    for (const enemy of this.enemies) {
      enemy.sprite.destroy();
    }
    this.enemies = [];

    for (const boss of this.bosses) {
      boss.sprite.destroy();
      boss.healthBar.destroy();
      boss.nameText.destroy();
    }
    this.bosses = [];

    for (const projectile of this.projectiles) {
      this.removeProjectile(projectile);
    }
    this.projectiles = [];

    for (const loot of this.loots) {
      this.removeLoot(loot);
    }
    this.loots = [];

    // Reset player
    this.player.stats.currentHp = this.player.stats.maxHp;
    this.player.stats.shield = this.player.stats.maxShield;
    this.player.position.x = this.app.screen.width / 2;
    this.player.position.y = this.app.screen.height / 2;

    // Start fresh
    this.startGame();
  }

  private showMenu(type: 'title' | 'pause' | 'gameover'): void {
    if (type === 'pause') {
      this.phase = 'paused';
    } else {
      this.phase = type;
    }

    if (this.currentMenu) {
      this.currentMenu.destroy();
    }

    this.currentMenu = new Menu(this.app.screen.width, this.app.screen.height, type);
    this.uiContainer.addChild(this.currentMenu.getContainer());
  }
}
