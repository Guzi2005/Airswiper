/**
 * Web Audio API procedural sound synthesizer for Airswiper (闪光怪盗).
 * Crisp, retro-storybook audio without external sound assets.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Coin or Gem pickup chime
  public playLootPickup(isGem: boolean = false, combo: number = 1) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = isGem ? 880 : 587.33;
      const pitchMultiplier = 1 + Math.min((combo - 1) * 0.08, 0.8);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isGem ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq * pitchMultiplier, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5 * pitchMultiplier, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);

      const sparkleOsc = this.ctx.createOscillator();
      const sparkleGain = this.ctx.createGain();
      sparkleOsc.type = 'sine';
      sparkleOsc.frequency.setValueAtTime(baseFreq * 2.2 * pitchMultiplier, now);
      sparkleOsc.frequency.exponentialRampToValueAtTime(baseFreq * 3.0 * pitchMultiplier, now + 0.18);
      sparkleGain.gain.setValueAtTime(0.08, now);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      sparkleOsc.connect(sparkleGain);
      sparkleGain.connect(this.ctx.destination);
      sparkleOsc.start(now + 0.04);
      sparkleOsc.stop(now + 0.22);
    } catch {
      // Ignored
    }
  }

  // Parabolic dive whoosh
  public playDiveWhoosh(powerRatio: number = 0.5) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const startFreq = 260 + powerRatio * 180;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.38);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.38);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch {
      // Ignored
    }
  }

  // Rebound snap upward
  public playReboundSwoosh() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.22);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Ignored
    }
  }

  // Croissant crunch
  public playCroissantCrunch() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(220, now + 0.05);
      osc.frequency.setValueAtTime(150, now + 0.1);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignored
    }
  }

  // Balloon pack released (soaring away celebratory chime)
  public playBalloonBank() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    } catch {
      // Ignored
    }
  }

  // Poop drop sound (cute bird whistle)
  public playPoopDrop() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.12);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignored
    }
  }

  // Poop splat sound ("SPLAT!")
  public playPoopSplat(isBonus: boolean = false) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);

      if (isBonus) {
        // High bonus chime
        const chime = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        chime.type = 'triangle';
        chime.frequency.setValueAtTime(1046.5, now + 0.05); // C6
        cGain.gain.setValueAtTime(0.15, now + 0.05);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        chime.connect(cGain);
        cGain.connect(this.ctx.destination);
        chime.start(now + 0.05);
        chime.stop(now + 0.32);
      }
    } catch {
      // Ignored
    }
  }

  // Perch landing tap
  public playPerchLand() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // Ignored
    }
  }

  // Mail Delivery Post Horn Fanfare
  public playMailDelivery() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [392.0, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.32);
      });
    } catch {
      // Ignored
    }
  }

  // Glass obstacle bonk
  public playBonk() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Ignored
    }
  }

  // Water splash
  public playWaterSplash() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Ignored
    }
  }

  // Car Horn (Vintage "Beep-Beep!")
  public playCarHorn() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.12].forEach((offset) => {
        const osc1 = this.ctx!.createOscillator();
        const osc2 = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(370, now + offset);
        osc2.frequency.setValueAtTime(440, now + offset);

        gain.gain.setValueAtTime(0.08, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx!.destination);

        osc1.start(now + offset);
        osc2.start(now + offset);
        osc1.stop(now + offset + 0.1);
        osc2.stop(now + offset + 0.1);
      });
    } catch {
      // Ignored
    }
  }

  // Umbrella Open Snap ("Shhk-Pop!")
  public playUmbrellaOpen() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Friction rustle
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.12);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);

      // Spring latch pop
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      popOsc.type = 'sine';
      popOsc.frequency.setValueAtTime(620, now + 0.1);
      popOsc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
      popGain.gain.setValueAtTime(0.18, now + 0.1);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      popOsc.connect(popGain);
      popGain.connect(this.ctx.destination);
      popOsc.start(now + 0.1);
      popOsc.stop(now + 0.24);
    } catch {
      // Ignored
    }
  }

  // Vehicle Collision Knockout ("BAM - Honk - Twirl!")
  public playVehicleCrash() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Heavy metallic thump
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.28);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);

      // Comic slide whistle twirl
      const slide = this.ctx.createOscillator();
      const slideGain = this.ctx.createGain();
      slide.type = 'sine';
      slide.frequency.setValueAtTime(800, now + 0.08);
      slide.frequency.exponentialRampToValueAtTime(220, now + 0.45);
      slideGain.gain.setValueAtTime(0.14, now + 0.08);
      slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      slide.connect(slideGain);
      slideGain.connect(this.ctx.destination);
      slide.start(now + 0.08);
      slide.stop(now + 0.5);
    } catch {
      // Ignored
    }
  }

  // Stamina Exhausted ("Puff... pant...")
  public playExhaustedPuff() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.24);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Ignored
    }
  }

  // Digestion Complete Gurgle ("Bloop-pop!")
  public playDigestionGurgle() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Ignored
    }
  }

  // Smug Crow Caw / Taunt in Nest ("Caw-caw-caw! 洋洋得意")
  public playCrowTaunt() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.18, 0.36].forEach((delay, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(380 + idx * 30, now + delay);
        osc.frequency.exponentialRampToValueAtTime(290, now + delay + 0.12);
        gain.gain.setValueAtTime(0.12, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.15);
      });
    } catch {
      // Ignored
    }
  }

  // Treasure auto-released fluttering away
  public playTreasureRelease() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Ignored
    }
  }

  // -------------------------------------------------------------
  // PROCEDURAL CAFE MUSETTE BACKGROUND MUSIC (BGM)
  // Charming storybook French accordion & acoustic guitar waltz
  // -------------------------------------------------------------
  private bgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;

  // Major scale frequencies (C4, D4, E4, F4, G4, A4, B4, C5, etc.)
  private notes = {
    C3: 130.81, E3: 164.81, G3: 196.0, A3: 220.0,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  };

  // Vintage Car / Bus / Police Honk Horn
  public playHonkHorn() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [349.23, 440.0].forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 0.24);
      });
    } catch {
      // Ignored
    }
  }

  public isBgmPlaying(): boolean {
    return this.bgmPlaying;
  }

  public toggleBGM(): boolean {
    if (this.bgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  public startBGM() {
    if (this.bgmPlaying) return;
    this.initContext();
    if (!this.ctx) return;
    this.bgmPlaying = true;
    this.bgmStep = 0;
    this.scheduleNextBgmBeat();
  }

  public stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private scheduleNextBgmBeat = () => {
    if (!this.bgmPlaying || !this.ctx) return;

    try {
      const now = this.ctx.currentTime + 0.05;
      const bpm = 128;
      const beatDur = 60 / bpm; // ~0.468s per beat (3/4 waltz measure = 3 beats)

      const measure = Math.floor(this.bgmStep / 3) % 8;
      const beatInMeasure = this.bgmStep % 3; // 0, 1, or 2

      // Harmony chord progression (C - Am - F - G7 - C - Em - F - G)
      const chordRoots = [
        this.notes.C3, this.notes.A3, this.notes.F4 / 2, this.notes.G3,
        this.notes.C3, this.notes.E3, this.notes.F4 / 2, this.notes.G3
      ];
      const chordTriads = [
        [this.notes.C4, this.notes.E4, this.notes.G4],
        [this.notes.A3, this.notes.C4, this.notes.E4],
        [this.notes.F4, this.notes.A4, this.notes.C5],
        [this.notes.G4, this.notes.B4, this.notes.D5],
        [this.notes.C4, this.notes.E4, this.notes.G4],
        [this.notes.E4, this.notes.G4, this.notes.B4],
        [this.notes.F4, this.notes.A4, this.notes.C5],
        [this.notes.G4, this.notes.B4, this.notes.D5],
      ];

      // Bass on beat 0: "Boom"
      if (beatInMeasure === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(chordRoots[measure], now);
        bassGain.gain.setValueAtTime(0.12, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + beatDur * 0.95);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + beatDur);
      } else {
        // Light chord strum on beats 1 & 2: "Chik-Chik"
        chordTriads[measure].forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.015);
          gain.gain.setValueAtTime(0.035, now + idx * 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, now + beatDur * 0.7);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + idx * 0.015);
          osc.stop(now + beatDur * 0.75);
        });
      }

      // Melodic whistle/accordion lead (airy and playful!)
      const melodyNotes = [
        this.notes.G4, this.notes.E5, this.notes.D5, this.notes.C5,
        this.notes.E4, this.notes.C5, this.notes.B4, this.notes.A4,
        this.notes.A4, this.notes.F5, this.notes.E5, this.notes.D5,
        this.notes.G4, this.notes.D5, this.notes.C5, this.notes.B4,
        this.notes.C5, this.notes.G5, this.notes.E5, this.notes.C5,
        this.notes.B4, this.notes.E5, this.notes.D5, this.notes.B4,
        this.notes.A4, this.notes.F5, this.notes.D5, this.notes.B4,
        this.notes.C5, 0, this.notes.G4, 0
      ];

      const noteIdx = this.bgmStep % melodyNotes.length;
      const mFreq = melodyNotes[noteIdx];
      if (mFreq && mFreq > 0) {
        const mOsc = this.ctx.createOscillator();
        const mGain = this.ctx.createGain();
        mOsc.type = 'triangle';
        mOsc.frequency.setValueAtTime(mFreq, now);

        mGain.gain.setValueAtTime(0.065, now);
        mGain.gain.exponentialRampToValueAtTime(0.001, now + beatDur * 0.85);

        mOsc.connect(mGain);
        mGain.connect(this.ctx.destination);
        mOsc.start(now);
        mOsc.stop(now + beatDur);
      }

      this.bgmStep++;
      const nextDelayMs = Math.max(10, beatDur * 1000 - 10);
      this.bgmTimer = window.setTimeout(this.scheduleNextBgmBeat, nextDelayMs);
    } catch {
      // Ignored
    }
  };
}

export const soundManager = new SoundManager();
