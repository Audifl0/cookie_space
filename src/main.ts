/**
 * Entry point for Cookie Space Shooter
 */

import { Application } from 'pixi.js';
import { Game } from './app/Game';

async function init() {
  // Create Pixi Application
  const app = new Application();

  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x000000,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
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

    appDiv.appendChild(app.canvas);
  }

  // Handle resize
  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
  });

  // Create game
  new Game(app);

  console.log('Cookie Space Shooter initialized!');
}

// Start game
init().catch(console.error);
