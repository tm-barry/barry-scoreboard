type AudioState = {
  ctx: AudioContext | null;
  masterGain: GainNode | null;
  isMuted: boolean;
  volume: number;
};

const state: AudioState = {
  ctx: null,
  masterGain: null,
  isMuted: false,
  volume: 1,
};

/**
 * Initialize or resume audio context.
 */
export async function initAudio() {
  if (!state.ctx) {
    state.ctx = new AudioContext();

    state.masterGain = state.ctx.createGain();
    state.masterGain.gain.value = state.volume;

    state.masterGain.connect(state.ctx.destination);
  }

  if (state.ctx.state === 'suspended') {
    await state.ctx.resume();
  }
}

/**
 * Internal get audio context
 */
function getCtx(): AudioContext {
  if (!state.ctx || !state.masterGain) {
    throw new Error('Audio not initialized. Call initAudio() first.');
  }
  return state.ctx;
}

/**
 * Set volume (0.0 - 1.0)
 */
export function setVolume(value: number) {
  state.volume = Math.max(0, Math.min(1, value));

  if (state.masterGain) {
    state.masterGain.gain.value = state.isMuted ? 0 : state.volume;
  }
}

/**
 * Mute/unmute audio
 */
export function setMuted(muted: boolean) {
  state.isMuted = muted;

  if (state.masterGain) {
    state.masterGain.gain.value = muted ? 0 : state.volume;
  }
}

/**
 * Final timer buzzer
 */
export function playBuzzer() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  const duration = 2;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(1.0, t + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  const shaper = ctx.createWaveShaper();
  shaper.curve = makeClipCurve(85);
  shaper.oversample = '2x';

  master.connect(shaper);
  shaper.connect(state.masterGain!);

  // Vibration/pulsing
  const vibrato = ctx.createOscillator();
  vibrato.type = 'sine';
  vibrato.frequency.setValueAtTime(6, t); // 6Hz vibration speed

  const vibratoDepth = ctx.createGain();
  vibratoDepth.gain.setValueAtTime(0.3, t); // 0-1 range, controls vibration intensity

  vibrato.connect(vibratoDepth);

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const sub = ctx.createOscillator();

  osc1.type = 'square';
  osc2.type = 'sawtooth';
  sub.type = 'sine';

  const baseFreq = 400;

  osc1.frequency.setValueAtTime(baseFreq, t);
  osc2.frequency.setValueAtTime(baseFreq * 1.01, t);
  sub.frequency.setValueAtTime(baseFreq * 0.5, t);

  const mainGain = ctx.createGain();
  const subGain = ctx.createGain();

  mainGain.gain.setValueAtTime(0.0001, t);
  mainGain.gain.linearRampToValueAtTime(0.9, t + 0.02);
  mainGain.gain.setValueAtTime(0.9, t + duration - 0.1);
  mainGain.gain.linearRampToValueAtTime(0.0001, t + duration);

  subGain.gain.setValueAtTime(0.0001, t);
  subGain.gain.linearRampToValueAtTime(0.2, t + 0.02);
  subGain.gain.setValueAtTime(0.2, t + duration - 0.1);
  subGain.gain.linearRampToValueAtTime(0.0001, t + duration);

  // Connect vibrato to the main gains for amplitude modulation
  vibratoDepth.connect(mainGain.gain);
  vibratoDepth.connect(subGain.gain);

  osc1.connect(mainGain);
  osc2.connect(mainGain);
  sub.connect(subGain);

  mainGain.connect(master);
  subGain.connect(master);

  vibrato.start(t);
  osc1.start(t);
  osc2.start(t);
  sub.start(t);

  vibrato.stop(t + duration);
  osc1.stop(t + duration);
  osc2.stop(t + duration);
  sub.stop(t + duration);
}

function makeClipCurve(amount = 80) {
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);

  for (let i = 0; i < n_samples; i++) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = Math.tanh(amount * x);
  }

  return curve;
}

/**
 * Short beep (fouls/ect...)
 */
export function playBeep(frequency = 800, duration = 0.1) {
  const ctx = getCtx();
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, t);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.2, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain);
  gain.connect(state.masterGain!);

  osc.start(t);
  osc.stop(t + duration);
}

/**
 * Count down tick
 */
export function playTick() {
  playBeep(1200, 0.05);
}

/**
 * Stops all audio
 */
export function stopAllAudio() {
  if (state.ctx) {
    state.ctx.close();
    state.ctx = null;
    state.masterGain = null;
  }
}
