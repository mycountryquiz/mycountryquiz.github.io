export type Cue = 'tap' | 'correct' | 'wrong';

interface Tone {
  readonly frequency: number;
  readonly start: number;
  readonly duration: number;
  readonly wave: OscillatorType;
}

const TONES: Record<Cue, readonly Tone[]> = {
  tap: [{ frequency: 660, start: 0, duration: 0.04, wave: 'triangle' }],
  correct: [
    { frequency: 660, start: 0, duration: 0.09, wave: 'sine' },
    { frequency: 990, start: 0.09, duration: 0.16, wave: 'sine' }
  ],
  wrong: [
    { frequency: 220, start: 0, duration: 0.12, wave: 'square' },
    { frequency: 165, start: 0.12, duration: 0.2, wave: 'square' }
  ]
};

const VIBRATIONS: Record<Cue, VibratePattern> = {
  tap: 12,
  correct: [25, 50, 25],
  wrong: [80, 60, 80]
};

const PEAK_GAIN = 0.08;

export class Feedback {
  #context: AudioContext | null = null;
  enabled: boolean;

  constructor(enabled: boolean) {
    this.enabled = enabled;
  }

  play(cue: Cue): void {
    if (!this.enabled) return;
    this.#vibrate(cue);
    this.#sound(cue);
  }

  #vibrate(cue: Cue): void {
    if ('vibrate' in navigator) navigator.vibrate(VIBRATIONS[cue]);
  }

  #sound(cue: Cue): void {
    const context = this.#audio();
    if (!context) return;
    const now = context.currentTime;
    for (const tone of TONES[cue]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const begin = now + tone.start;
      const end = begin + tone.duration;
      oscillator.type = tone.wave;
      oscillator.frequency.setValueAtTime(tone.frequency, begin);
      gain.gain.setValueAtTime(0.0001, begin);
      gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, begin + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(begin);
      oscillator.stop(end + 0.02);
    }
  }

  #audio(): AudioContext | null {
    if (typeof AudioContext === 'undefined') return null;
    this.#context ??= new AudioContext();
    if (this.#context.state === 'suspended') void this.#context.resume();
    return this.#context;
  }
}
