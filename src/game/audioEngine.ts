import { CharacterId, UniverseMode } from './types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private sfxVolume = 0.65;
  private ambienceVolume = 0.25;
  private ambienceTimer = 0;
  private universe: UniverseMode = 'animal';

  private ensureContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setUniverse(universe: UniverseMode): void {
    this.universe = universe;
  }

  public setSettings(enabled: boolean, sfxVol: number, ambienceVol: number): void {
    this.enabled = enabled;
    this.sfxVolume = sfxVol;
    this.ambienceVolume = ambienceVol;
  }

  public playFootstep(sprint = false): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const jitter = 0.92 + Math.random() * 0.16;

    if (this.universe === 'human') {
      // Sneaker tap + subtle cloth/sole thud
      osc.type = 'sine';
      osc.frequency.setValueAtTime((sprint ? 120 : 95) * jitter, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.06);
      gain.gain.setValueAtTime(0.09 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    } else {
      // Crisp animal paw/claw patter
      osc.type = 'triangle';
      osc.frequency.setValueAtTime((sprint ? 180 : 140) * jitter, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);
      gain.gain.setValueAtTime(0.08 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    }

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playJump(charId: CharacterId): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const base =
      this.universe === 'human'
        ? charId === 'rat'
          ? 240
          : charId === 'duck'
            ? 200
            : 185
        : charId === 'rat'
          ? 360
          : charId === 'duck'
            ? 260
            : 210;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 2.0, now + 0.14);
    gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playCharacterAbility(charId: CharacterId): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (this.universe === 'human') {
      // Human voices / energetic shouts / whistles!
      if (charId === 'duck') {
        // Pedro Henrique Humano: playful megaphone yell + laugh cadence
        for (let i = 0; i < 2; i++) {
          const t = now + i * 0.13;
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220 + i * 35, t);
          osc.frequency.exponentialRampToValueAtTime(340, t + 0.08);
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(800, t);
          filter.Q.setValueAtTime(2.4, t);
          gain.gain.setValueAtTime(0.24 * this.sfxVolume, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          osc.connect(filter).connect(gain).connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.13);
        }
      } else if (charId === 'rat') {
        // Emanuel Humano: fast parkour dash whoosh + eager "bora!"
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(760, now + 0.15);
        gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
      } else {
        // Pedro Antônio Humano: athletic whistle + acrobatic wind leap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.14);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.3);
        gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.33);
      }
      return;
    }

    // ANIMAL WORLD
    if (charId === 'duck') {
      for (let q = 0; q < 2; q++) {
        const t = now + q * 0.14;
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc2.type = 'square';
        osc.frequency.setValueAtTime(340, t);
        osc.frequency.exponentialRampToValueAtTime(215, t + 0.11);
        osc2.frequency.setValueAtTime(690, t);
        osc2.frequency.exponentialRampToValueAtTime(420, t + 0.11);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(950, t);
        filter.Q.setValueAtTime(3.2, t);
        gain.gain.setValueAtTime(0.28 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc2.start(t);
        osc.stop(t + 0.14);
        osc2.stop(t + 0.14);
      }
    } else if (charId === 'rat') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.exponentialRampToValueAtTime(1680, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.18);
      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.21);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1180, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.34);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);
      gain.gain.setValueAtTime(0.22 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.connect(filter).connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.37);
    }
  }

  public playSlapstickBonk(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(290, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.2);
    gain.gain.setValueAtTime(0.26 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playPickup(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.setValueAtTime(640, now + 0.05);
    gain.gain.setValueAtTime(0.16 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playSchoolBell(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1240 + (i % 2) * 180, t);
      gain.gain.setValueAtTime(0.16 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.085);
    }
  }

  public playAlarm(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.24;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(780, t);
      osc.frequency.linearRampToValueAtTime(520, t + 0.2);
      gain.gain.setValueAtTime(0.15 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.23);
    }
  }

  public playGoalCheer(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const t = now + i * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  public tickAmbience(dt: number, isOutdoor: boolean): void {
    if (!this.enabled || this.ambienceVolume <= 0.01) return;
    this.ambienceTimer -= dt;
    if (this.ambienceTimer > 0) return;
    this.ambienceTimer = 2.6 + Math.random() * 2.8;
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    if (isOutdoor) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const f = 1750 + Math.random() * 750;
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.28, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(f * 0.9, now + 0.12);
      gain.gain.setValueAtTime(0.035 * this.ambienceVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  public dispose(): void {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
