/**
 * Audio system using WebAudio API for procedural sounds
 */

export class AudioSystem {
  private context: AudioContext;
  private masterGain: GainNode;
  private sfxGain: GainNode;

  private volume: number = 0.5;
  private sfxVolume: number = 0.7;
  private muted: boolean = false;

  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.sfxGain = this.context.createGain();

    this.masterGain.connect(this.context.destination);
    this.sfxGain.connect(this.masterGain);

    this.updateVolume();
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateVolume();
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateVolume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.updateVolume();
  }

  private updateVolume(): void {
    this.masterGain.gain.value = this.muted ? 0 : this.volume;
    this.sfxGain.gain.value = this.sfxVolume;
  }

  /**
   * Play shoot sound
   */
  playShoot(): void {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'square';
    osc.frequency.value = 220;
    osc.frequency.exponentialRampToValueAtTime(110, this.context.currentTime + 0.1);

    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(this.context.currentTime);
    osc.stop(this.context.currentTime + 0.1);
  }

  /**
   * Play explosion sound
   */
  playExplosion(): void {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = 100;
    osc.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.3);

    gain.gain.value = 0.2;
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(this.context.currentTime);
    osc.stop(this.context.currentTime + 0.3);
  }

  /**
   * Play hit sound
   */
  playHit(): void {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'triangle';
    osc.frequency.value = 150;

    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(this.context.currentTime);
    osc.stop(this.context.currentTime + 0.05);
  }

  /**
   * Play pickup sound
   */
  playPickup(): void {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sine';
    osc.frequency.value = 440;
    osc.frequency.exponentialRampToValueAtTime(880, this.context.currentTime + 0.1);

    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(this.context.currentTime);
    osc.stop(this.context.currentTime + 0.1);
  }

  /**
   * Play dash sound
   */
  playDash(): void {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = 200;
    osc.frequency.exponentialRampToValueAtTime(400, this.context.currentTime + 0.15);

    gain.gain.value = 0.12;
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(this.context.currentTime);
    osc.stop(this.context.currentTime + 0.15);
  }

  /**
   * Play boss warning sound
   */
  playBossWarning(): void {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'square';
    osc.frequency.value = 100;

    gain.gain.value = 0.2;
    gain.gain.setValueAtTime(0.2, this.context.currentTime);
    gain.gain.setValueAtTime(0, this.context.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, this.context.currentTime + 0.2);
    gain.gain.setValueAtTime(0, this.context.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(this.context.currentTime);
    osc.stop(this.context.currentTime + 0.5);
  }

  /**
   * Play UI click sound
   */
  playClick(): void {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sine';
    osc.frequency.value = 600;

    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(this.context.currentTime);
    osc.stop(this.context.currentTime + 0.05);
  }

  /**
   * Resume audio context (required for some browsers)
   */
  async resume(): Promise<void> {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }
}
