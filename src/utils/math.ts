/**
 * Math utilities for game calculations
 */

import type { Position, Velocity } from '../types';

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate distance squared (faster, no sqrt)
 */
export function distanceSquared(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

/**
 * Calculate angle from point1 to point2 (in radians)
 */
export function angleTo(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Normalize a vector
 */
export function normalize(vx: number, vy: number): Velocity {
  const len = Math.sqrt(vx * vx + vy * vy);
  if (len === 0) return { vx: 0, vy: 0 };
  return { vx: vx / len, vy: vy / len };
}

/**
 * Vector length
 */
export function vectorLength(vx: number, vy: number): number {
  return Math.sqrt(vx * vx + vy * vy);
}

/**
 * Check if two circles collide
 */
export function circleCollision(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean {
  const distSq = distanceSquared(x1, y1, x2, y2);
  const radiusSum = r1 + r2;
  return distSq < radiusSum * radiusSum;
}

/**
 * Check if point is in circle
 */
export function pointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean {
  return distanceSquared(px, py, cx, cy) < radius * radius;
}

/**
 * Wrap value between 0 and max
 */
export function wrap(value: number, max: number): number {
  return ((value % max) + max) % max;
}

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Random float between min and max
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Smooth step interpolation
 */
export function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Ease in out
 */
export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Move towards target with max distance
 */
export function moveTowards(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) {
    return target;
  }
  return current + Math.sign(target - current) * maxDelta;
}

/**
 * Get direction vector from angle
 */
export function angleToVector(angle: number): Velocity {
  return {
    vx: Math.cos(angle),
    vy: Math.sin(angle),
  };
}

/**
 * Rotate point around origin
 */
export function rotatePoint(x: number, y: number, angle: number): Position {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}
