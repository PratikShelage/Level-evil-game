export class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sawOsc = null;
    this.sawGain = null;
  }

  unlock() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.25;
    this.masterGain.connect(this.ctx.destination);

    this.sawOsc = this.ctx.createOscillator();
    this.sawOsc.type = 'sawtooth';
    this.sawOsc.frequency.value = 72;
    this.sawGain = this.ctx.createGain();
    this.sawGain.gain.value = 0;
    this.sawOsc.connect(this.sawGain).connect(this.masterGain);
    this.sawOsc.start();
  }

  beep(freq, duration = 0.1, type = 'sine', startGain = 0.2) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(startGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain).connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration);
  }

  noise(duration = 0.12, gainStart = 0.28, hp = 300) {
    if (!this.ctx) return;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = hp;
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(gainStart, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(filter).connect(gain).connect(this.masterGain);
    source.start(now);
  }

  jump() { this.beep(420, 0.08, 'sine', 0.2); }
  death() { this.noise(0.15, 0.3, 120); }
  trapTrigger() { this.noise(0.1, 0.16, 850); }
  floorCollapse() { this.beep(85, 0.25, 'sine', 0.22); }
  levelComplete() { this.beep(520, 0.11, 'triangle', 0.2); setTimeout(() => this.beep(720, 0.15, 'triangle', 0.2), 80); }

  setSawIntensity(value) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.sawGain.gain.cancelScheduledValues(now);
    this.sawGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(0.12, value)), now + 0.05);
  }
}
