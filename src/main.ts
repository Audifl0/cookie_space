/**
 * Entry point for Cookie Space Shooter
 */

import { Application } from 'pixi.js';
import { Game } from './app/Game';

async function init() {
  try {
    // Create Pixi Application
    const app = new Application();

    // Initialize with options
    await app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      antialias: true,
    });

    // Add canvas to DOM
    const appDiv = document.getElementById('app');
    if (appDiv) {
      // Remove loading screen
      const loading = document.getElementById('loading');
      if (loading) {
        loading.remove();
      }

      // @ts-ignore - PixiJS v7 API
      appDiv.appendChild(app.canvas || app.view);
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
        <div style="color: white; padding: 20px; text-align: center;">
          <h1>Error Loading Game</h1>
          <p>Please check the browser console for details.</p>
          <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
            Retry
          </button>
        </div>
      `;
    }
  }
}

// Start game
init().catch(console.error);
