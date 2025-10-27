# Cookie Space Shooter 🍪🚀

A delicious wave-based space shoot'em up where you pilot a spaceship against hordes of cookie aliens! Earn gold, upgrade your ship, complete missions, and unlock skins as you fight through increasingly challenging waves.

![Cookie Space Shooter](public/favicon.svg)

## Features

### Core Gameplay
- **Wave-based survival**: Fight through 30+ progressively harder waves
- **5 unique bosses** with multiple attack phases
- **12+ enemy types** with varied behaviors (seek, orbit, kamikaze, mine, burst)
- **Dynamic backgrounds**: Parallax starfields with Perlin noise nebulas that change every few waves
- **Smooth 60 FPS gameplay** with object pooling and spatial hashing for optimal performance

### Progression Systems
- **Upgrade shop**: Choose from 22+ upgrades between waves
  - Ship upgrades: HP, shield, speed, dash cooldown, loot magnet
  - Weapon upgrades: Damage, fire rate, pierce, splash, critical hits
  - Economy upgrades: Gold multiplier, drop rate bonus
- **Mission system**: Complete daily, weekly, and long-term missions for rewards
- **Unlockable skins**: Earn cosmetic rewards through missions
- **Persistent saves**: Your progress, gold, upgrades, and options are saved locally

### Technical Highlights
- **TypeScript** with strict mode for type safety
- **PixiJS v7** for hardware-accelerated 2D rendering
- **Vite** for fast development and optimized builds
- **Modular architecture**: Clean separation between entities, systems, and UI
- **Performance optimized**:
  - Object pooling for projectiles and loot
  - Spatial hashing for collision detection
  - No allocations in game loop
  - Handles 200+ entities at 60 FPS

### Multi-Platform Support
- **Desktop**: Keyboard (WASD/ZQSD/Arrows) + Mouse
- **Gamepad**: Full controller support
- **Mobile**: Virtual joystick + touch controls
- **Accessibility**: Colorblind mode, reduced effects, adjustable volumes

### Internationalization
- English and French localization
- Easy to add more languages via JSON files

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Type checking
npm run typecheck
```

## Project Structure

```
cookie_space/
├── public/              # Static assets
│   └── favicon.svg
├── src/
│   ├── app/
│   │   └── Game.ts      # Main game orchestrator
│   ├── data/            # JSON data files
│   │   ├── enemies.json
│   │   ├── bosses.json
│   │   ├── waves.json
│   │   ├── weapons.json
│   │   ├── upgrades.json
│   │   ├── missions.json
│   │   └── i18n/        # Translations
│   ├── entities/        # Game entities
│   │   ├── Player.ts
│   │   ├── Enemy.ts
│   │   ├── Boss.ts
│   │   ├── Projectile.ts
│   │   └── Loot.ts
│   ├── systems/         # Core systems
│   │   ├── InputSystem.ts
│   │   ├── AudioSystem.ts
│   │   ├── SaveSystem.ts
│   │   ├── BackgroundSystem.ts
│   │   ├── WaveManager.ts
│   │   ├── UpgradeManager.ts
│   │   └── MissionManager.ts
│   ├── ui/              # User interface
│   │   ├── HUD.ts
│   │   ├── Menu.ts
│   │   └── Shop.ts
│   ├── utils/           # Utility modules
│   │   ├── rng.ts       # Seedable RNG
│   │   ├── pool.ts      # Object pooling
│   │   ├── spatial.ts   # Spatial hashing
│   │   ├── perlin.ts    # Perlin noise
│   │   ├── math.ts      # Math helpers
│   │   └── events.ts    # Event system
│   ├── types.ts         # TypeScript types
│   └── main.ts          # Entry point
├── tests/               # Unit tests
└── package.json
```

## Controls

### Desktop
- **Move**: WASD or Arrow Keys (ZQSD for French keyboards)
- **Aim**: Mouse
- **Shoot**: Left Click (or auto-fire)
- **Dash**: Space
- **Pause**: ESC

### Gamepad
- **Move**: Left Stick
- **Aim**: Right Stick
- **Shoot**: A Button
- **Dash**: RB/R1

### Mobile
- **Move**: Virtual joystick (left side)
- **Aim/Shoot**: Touch right side

## Game Mechanics

### Enemy Behaviors
- **Seek**: Moves directly toward the player
- **Orbit**: Circles around the player
- **Kamikaze**: Rushes at high speed
- **Mine**: Floats slowly, explodes on contact
- **Burst**: Fires projectiles

### Wave Scaling
- Enemy HP increases by 12% per wave
- Enemy speed increases by 2% per wave
- Gold drops scale with wave progression
- Bosses appear every 5-10 waves

### Economy
- Enemies drop gold coins based on their difficulty
- Gold multiplier upgrades boost all earnings
- Drop rate upgrades increase loot frequency
- Shop offers 4 random upgrades between waves

### Missions
- **Daily**: Reset every 24 hours
- **Weekly**: Reset every week
- **Long-term**: Permanent goals for dedicated players
- Rewards include gold, skins, and titles

## Development

### Adding New Enemies

1. Add enemy spec to `src/data/enemies.json`:
```json
{
  "id": "new_enemy",
  "name": "New Enemy",
  "hp": 20,
  "speed": 80,
  "damage": 7,
  "sprite": "new_enemy",
  "behaviors": ["seek"],
  "loot": { "goldMin": 2, "goldMax": 5, "dropRate": 0.6 },
  "tags": ["cookie", "new"]
}
```

2. Add color mapping in `Enemy.ts`:
```typescript
const colors: Record<string, number> = {
  // ...
  new_enemy: 0xff00ff,
};
```

### Adding New Upgrades

Add to `src/data/upgrades.json`:
```json
{
  "id": "new_upgrade",
  "name": "Upgrade Name",
  "description": "What it does",
  "cost": 25,
  "apply": {
    "target": "player",
    "key": "maxHp",
    "delta": 30,
    "mode": "add"
  }
}
```

### Adding New Waves

Add to `src/data/waves.json`:
```json
{
  "index": 31,
  "enemies": [
    { "id": "enemy_id", "count": 20, "spawnRatePerSec": 2.5 }
  ],
  "modifiers": ["fast"],
  "bgTheme": "nebula_chocolate"
}
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui
```

## Performance Tips

### Optimization Techniques Used
1. **Object Pooling**: Reuses projectile and loot objects to avoid GC pauses
2. **Spatial Hashing**: O(n) collision detection instead of O(n²)
3. **Dirty Flag Pattern**: Only redraws UI when values change
4. **Texture Atlasing**: Groups sprites for batch rendering
5. **RAF Synchronization**: Matches game loop to display refresh rate

### Target Performance
- **Desktop**: 60 FPS with 200+ entities
- **Mobile**: 30-60 FPS depending on device
- **Memory**: < 200 MB typical usage

## Asset Credits

All assets are procedurally generated:
- **Sprites**: Simple geometric shapes (PixiJS Graphics)
- **Audio**: WebAudio oscillators with ADSR envelopes
- **Backgrounds**: Perlin noise with parallax layers

## License

MIT License - Feel free to use this project as a learning resource or template for your own games!

## Contributing

Contributions welcome! Areas for improvement:
- More enemy types and bosses
- Additional weapons and special abilities
- More visual effects and polish
- Sound effects and music tracks
- Additional language translations
- Mobile UI/UX improvements

## Roadmap

### Planned Features
- [ ] More weapons (laser, spread shot, homing missiles)
- [ ] Power-ups (temporary invincibility, slow-mo, screen clear)
- [ ] Achievement system
- [ ] Leaderboards (local/online)
- [ ] Endless mode
- [ ] Boss rush mode
- [ ] Co-op multiplayer
- [ ] More skins and customization

### Known Issues
- Touch controls need refinement on small screens
- Boss AI could be more varied
- Some translations may be incomplete

## Credits

Developed as a demonstration of:
- Modern game development with TypeScript
- PixiJS rendering techniques
- Modular game architecture
- Performance optimization strategies
- Responsive design patterns

Built with ❤️ and 🍪

---

**Enjoy destroying cookies in space!** 🚀✨
