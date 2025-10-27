/**
 * Core type definitions for Cookie Space Shooter
 */

import type { Container, Graphics } from 'pixi.js';

// ====================
// IDs & Basic Types
// ====================

export type EnemyId = string;
export type WeaponId = string;
export type MissionId = string;
export type UpgradeId = string;
export type SkinId = string;

export type BehaviorType = 'seek' | 'orbit' | 'kamikaze' | 'mine' | 'burst';
export type EffectType = 'burn' | 'slow' | 'chain' | 'crit';
export type ModifierType = 'fast' | 'tank' | 'tiny' | 'mirror' | 'double_loot';
export type BossPatternType = 'bullet_hell' | 'laser_sweep' | 'summon' | 'charge';
export type MissionKind = 'daily' | 'weekly' | 'longterm';
export type MissionEvent = 'kill' | 'no_hit' | 'reach_wave' | 'earn_gold';
export type UpgradeTarget = 'player' | 'weapon' | 'economy';
export type UpgradeMode = 'add' | 'mul';

// ====================
// Enemy Specifications
// ====================

export interface EnemySpec {
  id: EnemyId;
  name: string;
  hp: number;
  speed: number;
  damage: number;
  sprite: string;
  behaviors: BehaviorType[];
  onDeath?: {
    spawn?: EnemyId[];
    explode?: { radius: number; dmg: number };
  };
  loot: {
    goldMin: number;
    goldMax: number;
    dropRate: number;
  };
  tags: string[];
}

export interface BossPhase {
  durationSec: number;
  pattern: BossPatternType;
  params: Record<string, number>;
}

export interface BossSpec extends EnemySpec {
  phases: BossPhase[];
  musicCue?: string;
}

// ====================
// Wave Specifications
// ====================

export interface WaveEnemySpawn {
  id: EnemyId;
  count: number;
  spawnRatePerSec: number;
}

export interface WaveSpec {
  index: number;
  enemies: WaveEnemySpawn[];
  modifiers?: ModifierType[];
  bgTheme?: string;
  boss?: {
    id: EnemyId;
    delaySec: number;
  };
}

// ====================
// Weapon Specifications
// ====================

export interface ProjectileSpec {
  speed: number;
  size: number;
  pierce: number;
  splash?: number;
}

export interface WeaponSpec {
  id: WeaponId;
  name: string;
  dpsBase: number;
  fireRate: number;
  projectile: ProjectileSpec;
  spreadDeg?: number;
  effects?: EffectType[];
}

// ====================
// Upgrade System
// ====================

export interface UpgradeApply {
  target: UpgradeTarget;
  key: string;
  delta: number;
  mode: UpgradeMode;
}

export interface Upgrade {
  id: UpgradeId;
  name: string;
  description: string;
  cost: number;
  apply: UpgradeApply;
  requires?: UpgradeId[];
  maxRank?: number;
}

// ====================
// Mission System
// ====================

export interface MissionGoal {
  event: MissionEvent;
  where?: string;
  count: number;
}

export interface MissionReward {
  gold?: number;
  skinId?: SkinId;
  title?: string;
}

export interface MissionSpec {
  id: MissionId;
  name: string;
  kind: MissionKind;
  goal: MissionGoal;
  reward: MissionReward;
}

export interface MissionProgress {
  id: MissionId;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

// ====================
// Game State & Save
// ====================

export interface PlayerStats {
  maxHp: number;
  currentHp: number;
  shield: number;
  maxShield: number;
  shieldRegenRate: number;
  speed: number;
  dashCooldown: number;
  lootMagnetRadius: number;
}

export interface WeaponStats {
  damage: number;
  fireRate: number;
  spread: number;
  pierce: number;
  splash: number;
  critChance: number;
  critMultiplier: number;
}

export interface EconomyStats {
  goldMultiplier: number;
  dropRateBonus: number;
  rerollCost: number;
}

export interface GameState {
  currentWave: number;
  gold: number;
  kills: number;
  waveStartTime: number;
  noHitCurrentWave: boolean;
  difficulty: 'normal' | 'hard' | 'crazy';
}

export interface SaveData {
  version: number;
  gold: number;
  highestWave: number;
  totalKills: number;
  ownedUpgrades: UpgradeId[];
  unlockedSkins: SkinId[];
  currentSkin: SkinId;
  missions: MissionProgress[];
  options: GameOptions;
  lastDaily: string;
  lastWeekly: string;
}

export interface GameOptions {
  volume: number;
  sfxVolume: number;
  colorblindMode: boolean;
  reducedEffects: boolean;
  language: 'en' | 'fr';
  showFPS: boolean;
}

// ====================
// Entities & Components
// ====================

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EntityBase {
  id: string;
  type: 'player' | 'enemy' | 'boss' | 'projectile' | 'loot';
  position: Position;
  velocity: Velocity;
  radius: number;
  active: boolean;
  sprite?: Container | Graphics;
}

export interface EnemyEntity extends EntityBase {
  type: 'enemy' | 'boss';
  specId: EnemyId;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  behaviors: BehaviorType[];
  orbitAngle?: number;
  orbitRadius?: number;
  targetPosition?: Position;
  spec: EnemySpec;
}

export interface Projectile extends EntityBase {
  type: 'projectile';
  damage: number;
  pierce: number;
  piercedCount: number;
  fromPlayer: boolean;
  splash?: number;
  effects?: EffectType[];
}

export interface Loot extends EntityBase {
  type: 'loot';
  goldValue: number;
  attracted: boolean;
}

// ====================
// Events
// ====================

export type GameEventType =
  | 'enemy_killed'
  | 'boss_killed'
  | 'wave_cleared'
  | 'wave_started'
  | 'player_damaged'
  | 'gold_collected'
  | 'upgrade_purchased'
  | 'mission_completed';

export interface GameEvent {
  type: GameEventType;
  data?: unknown;
}

// ====================
// i18n
// ====================

export interface I18nStrings {
  [key: string]: string | I18nStrings;
}

export interface I18nData {
  en: I18nStrings;
  fr: I18nStrings;
}

// ====================
// Background Themes
// ====================

export interface BackgroundTheme {
  id: string;
  name: string;
  colors: {
    star1: number;
    star2: number;
    star3: number;
    nebula1: number;
    nebula2: number;
  };
  parallaxSpeed: number;
  particleDensity: number;
}

// ====================
// Spatial Hashing
// ====================

export interface SpatialCell {
  entities: EntityBase[];
}

export interface SpatialGrid {
  cellSize: number;
  cells: Map<string, SpatialCell>;
}
