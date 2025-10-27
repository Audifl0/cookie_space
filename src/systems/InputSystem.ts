/**
 * Input system handling keyboard, mouse, gamepad, and touch
 */

export interface InputState {
  // Movement
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1

  // Actions
  fire: boolean;
  dash: boolean;
  pause: boolean;

  // Mouse
  mouseX: number;
  mouseY: number;
  mouseDown: boolean;

  // Touch
  touchActive: boolean;
}

export class InputSystem {
  private keys: Set<string> = new Set();
  private mousePos: { x: number; y: number } = { x: 0, y: 0 };
  private mousePressed: boolean = false;

  private gamepad: Gamepad | null = null;
  private touchStick: { x: number; y: number } = { x: 0, y: 0 };
  private touchActive: boolean = false;

  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupListeners();
  }

  private setupListeners(): void {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);

      // Prevent default for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    // Mouse
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos.x = e.clientX - rect.left;
      this.mousePos.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', () => {
      this.mousePressed = true;
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mousePressed = false;
    });

    // Touch (simplified virtual joystick)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touchActive = true;
      this.updateTouch(e.touches[0]);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.touchActive) {
        this.updateTouch(e.touches[0]);
      }
    });

    this.canvas.addEventListener('touchend', () => {
      this.touchActive = false;
      this.touchStick = { x: 0, y: 0 };
    });

    // Gamepad
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
    });
  }

  private updateTouch(touch: Touch): void {
    const rect = this.canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    // Simple stick calculation (left side of screen)
    const centerX = rect.width * 0.25;
    const centerY = rect.height * 0.75;

    const dx = touchX - centerX;
    const dy = touchY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 50;

    if (distance > 0) {
      this.touchStick.x = Math.max(-1, Math.min(1, dx / maxDistance));
      this.touchStick.y = Math.max(-1, Math.min(1, dy / maxDistance));
    }
  }

  private updateGamepad(): void {
    const gamepads = navigator.getGamepads();
    this.gamepad = null;

    for (const gp of gamepads) {
      if (gp && gp.connected) {
        this.gamepad = gp;
        break;
      }
    }
  }

  getState(): InputState {
    this.updateGamepad();

    let moveX = 0;
    let moveY = 0;

    // Keyboard
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft') || this.keys.has('KeyQ')) {
      moveX -= 1;
    }
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) {
      moveX += 1;
    }
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp') || this.keys.has('KeyZ')) {
      moveY -= 1;
    }
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) {
      moveY += 1;
    }

    // Gamepad
    if (this.gamepad) {
      const gx = this.gamepad.axes[0];
      const gy = this.gamepad.axes[1];

      if (Math.abs(gx) > 0.15) moveX += gx;
      if (Math.abs(gy) > 0.15) moveY += gy;
    }

    // Touch
    if (this.touchActive) {
      moveX += this.touchStick.x;
      moveY += this.touchStick.y;
    }

    // Normalize
    moveX = Math.max(-1, Math.min(1, moveX));
    moveY = Math.max(-1, Math.min(1, moveY));

    // Actions
    const fire = this.mousePressed ||
                 (this.gamepad?.buttons[0]?.pressed ?? false) ||
                 this.touchActive;

    const dash = this.keys.has('Space') ||
                 (this.gamepad?.buttons[5]?.pressed ?? false);

    const pause = this.keys.has('Escape');

    return {
      moveX,
      moveY,
      fire,
      dash,
      pause,
      mouseX: this.mousePos.x,
      mouseY: this.mousePos.y,
      mouseDown: this.mousePressed,
      touchActive: this.touchActive,
    };
  }

  update(dt: number): void {
    // Update is called each frame
  }

  destroy(): void {
    // Remove listeners if needed
  }
}
