/**
 * Entry point for Cookie Space Shooter
 */

import { Application } from 'pixi.js';
import { Game } from './app/Game';

async function init() {
  try {
    // Create Pixi Application with PixiJS v7 API
    const app = new Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    });

    // Wait for app to be ready (PixiJS v7)
    await app.renderer;

    // Add canvas to DOM
    const appDiv = document.getElementById('app');
    if (appDiv) {
      // Remove loading screen
      const loading = document.getElementById('loading');
      if (loading) {
        loading.remove();
      }

      // Add canvas (PixiJS v7 uses 'view' property)
      appDiv.appendChild(app.view as HTMLCanvasElement);
    }

    // Handle resize
    window.addEventListener('resize', () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    // Create game
    new Game(app);

    console.log('Cookie Space Shooter initialized!');
  } catch (error) {
    console.error('Failed to initialize game:', error);

    // Show error to user
    const appDiv = document.getElementById('app');
    if (appDiv) {
      appDiv.innerHTML = `
        <div style="color: white; padding: 20px; text-align: center; font-family: sans-serif;">
          <h1>❌ Error Loading Game</h1>
          <p>Failed to initialize PixiJS. Please check the browser console for details.</p>
          <p style="color: #ff6b6b; font-family: monospace; margin: 20px; padding: 10px; background: #2a2a2a; border-radius: 8px;">
            ${error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button
            onclick="location.reload()"
            style="padding: 12px 24px; margin-top: 20px; cursor: pointer; background: #4a9eff; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
            🔄 Retry
          </button>
          <p style="margin-top: 20px; font-size: 14px; color: #888;">
            Make sure your browser supports WebGL and hardware acceleration is enabled.
          </p>
        </div>
      `;
    }
  }
}

// Start game
init().catch(console.error);
