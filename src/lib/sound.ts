class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;

  setMuted(value: boolean) {
    this.muted = value;
    if (value && this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  private ensureCtx(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
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

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.08,
    delay = 0
  ) {
    if (this.muted) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  tap() {
    this.tone(540, 0.07, 'triangle', 0.06);
  }

  found() {
    this.tone(523.25, 0.09, 'triangle', 0.08, 0);
    this.tone(783.99, 0.14, 'triangle', 0.09, 0.06);
  }

  /** Triggered when locating the hidden tiny specimen in TinyHuntGame */
  specimenFound() {
    this.tone(659.25, 0.08, 'triangle', 0.08, 0);
    this.tone(987.77, 0.11, 'triangle', 0.085, 0.055);
    this.tone(1318.51, 0.18, 'sine', 0.065, 0.11);
  }

  /** Triggered on CopyCat prompt match evaluation in TinyHuntGame & CopyCatDuel */
  copyMatch(score: number) {
    if (score >= 75) {
      const notes = [523.25, 659.25, 783.99, 987.77, 1174.66];
      notes.forEach((n, i) => {
        this.tone(n, 0.16, 'triangle', 0.075, i * 0.06);
      });
    } else if (score >= 45) {
      this.tone(587.33, 0.09, 'triangle', 0.075, 0);
      this.tone(739.99, 0.11, 'triangle', 0.08, 0.065);
      this.tone(880.0, 0.16, 'sine', 0.065, 0.13);
    } else {
      this.tone(440, 0.09, 'sine', 0.06, 0);
      this.tone(493.88, 0.12, 'sine', 0.055, 0.07);
    }
  }

  /** Triggered upon completing a full multi-round TinyHunt run */
  dailyRunComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((n, i) => {
      this.tone(n, 0.2, 'triangle', 0.08, i * 0.075);
    });
  }

  wrong() {
    this.tone(190, 0.12, 'sawtooth', 0.05, 0);
    this.tone(145, 0.16, 'sawtooth', 0.05, 0.06);
  }

  zoom() {
    this.tone(380, 0.06, 'sine', 0.05, 0);
    this.tone(620, 0.08, 'sine', 0.06, 0.04);
  }

  sonar() {
    this.tone(880, 0.25, 'sine', 0.07, 0);
    this.tone(880, 0.3, 'sine', 0.035, 0.22);
  }

  splash() {
    this.tone(320, 0.14, 'sine', 0.07, 0);
    this.tone(240, 0.18, 'sine', 0.07, 0.08);
    this.tone(180, 0.22, 'triangle', 0.06, 0.16);
  }

  victory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.tone(n, 0.18, 'triangle', 0.08, i * 0.075);
    });
  }

  unlock() {
    this.tone(440, 0.09, 'square', 0.04, 0);
    this.tone(660, 0.1, 'square', 0.04, 0.07);
    this.tone(880, 0.18, 'triangle', 0.07, 0.14);
  }
}

export const sound = new SoundEngine();
