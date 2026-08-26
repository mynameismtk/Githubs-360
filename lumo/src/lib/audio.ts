/**
 * SOUNDSCAPES, generated live with the Web Audio API.
 *
 * Nothing is downloaded and nothing is streamed, so every soundscape works in
 * airplane mode from the first launch, and none of them loop audibly.
 *
 * Browser limitation worth being straight about: a web page cannot guarantee
 * playback once the phone is locked. The native build uses expo-av with
 * background audio for that; see README.
 */

import type { SoundKind } from '../content/soundscapes';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let nodes: AudioNode[] = [];
let timer: number | null = null;
let current: SoundKind | null = null;

function audio(): AudioContext {
  if (!ctx) {
    const Ctor: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function noiseBuffer(c: AudioContext, brown: boolean): AudioBuffer {
  const len = c.sampleRate * 6;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.2;
    } else {
      d[i] = white;
    }
  }
  return buf;
}

function source(c: AudioContext, brown: boolean): AudioBufferSourceNode {
  const s = c.createBufferSource();
  s.buffer = noiseBuffer(c, brown);
  s.loop = true;
  return s;
}

function lfo(c: AudioContext, rate: number, depth: number, target: AudioParam, base: number) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.frequency.value = rate;
  gain.gain.value = depth;
  osc.connect(gain).connect(target);
  target.value = base;
  osc.start();
  nodes.push(osc, gain);
}

function build(kind: SoundKind) {
  const c = audio();
  const out = master as GainNode;

  switch (kind) {
    case 'rain': {
      const s = source(c, false);
      const hp = c.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 500;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 0.6;
      lfo(c, 0.07, 300, bp.frequency, 1500);
      s.connect(hp).connect(bp).connect(out);
      s.start();
      nodes.push(s, hp, bp);
      break;
    }
    case 'night': {
      const s = source(c, true);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 380;
      s.connect(lp).connect(out);
      s.start();
      nodes.push(s, lp);
      break;
    }
    case 'hum': {
      const s = source(c, true);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 180;
      const osc = c.createOscillator();
      osc.frequency.value = 84;
      const og = c.createGain();
      og.gain.value = 0.05;
      osc.connect(og).connect(out);
      osc.start();
      s.connect(lp).connect(out);
      s.start();
      nodes.push(s, lp, osc, og);
      break;
    }
    case 'shore': {
      const s = source(c, true);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 900;
      const swell = c.createGain();
      lfo(c, 0.09, 0.45, swell.gain, 0.55);
      s.connect(lp).connect(swell).connect(out);
      s.start();
      nodes.push(s, lp, swell);
      break;
    }
    case 'wind': {
      const s = source(c, false);
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 1.4;
      lfo(c, 0.05, 420, bp.frequency, 700);
      const g = c.createGain();
      lfo(c, 0.11, 0.3, g.gain, 0.5);
      s.connect(bp).connect(g).connect(out);
      s.start();
      nodes.push(s, bp, g);
      break;
    }
    case 'fire': {
      const s = source(c, true);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 620;
      s.connect(lp).connect(out);
      s.start();
      nodes.push(s, lp);
      // crackle
      const crackle = () => {
        if (current !== 'fire' || !ctx || !master) return;
        const now = ctx.currentTime;
        const pop = ctx.createBufferSource();
        pop.buffer = noiseBuffer(ctx, false);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 900 + Math.random() * 2600;
        bp.Q.value = 3;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.16 + Math.random() * 0.2, now + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07 + Math.random() * 0.1);
        pop.connect(bp).connect(g).connect(master);
        pop.start(now);
        pop.stop(now + 0.25);
        timer = window.setTimeout(crackle, 90 + Math.random() * 700);
      };
      timer = window.setTimeout(crackle, 200);
      break;
    }
  }
}

export function playSound(kind: SoundKind, volume = 0.5) {
  stopSound(true);
  current = kind;
  build(kind);
  const c = audio();
  master!.gain.cancelScheduledValues(c.currentTime);
  master!.gain.setValueAtTime(0.0001, c.currentTime);
  master!.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), c.currentTime + 1.6);
}

export function setVolume(volume: number) {
  if (!ctx || !master) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.linearRampToValueAtTime(Math.max(0.0001, volume), ctx.currentTime + 0.25);
}

export function stopSound(immediate = false) {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  current = null;
  if (!ctx || !master) return;
  const stopAll = () => {
    for (const n of nodes) {
      try {
        (n as OscillatorNode).stop?.();
      } catch {
        /* already stopped */
      }
      try {
        n.disconnect();
      } catch {
        /* already gone */
      }
    }
    nodes = [];
  };
  if (immediate) {
    master.gain.value = 0.0001;
    stopAll();
  } else {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    setTimeout(stopAll, 1400);
  }
}

export const playingSound = () => current;

/** A single soft tone. Used to mark a completed lift or a breath phase change. */
export function chime(freq = 528, seconds = 1.1, volume = 0.14) {
  try {
    const c = audio();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(volume, c.currentTime + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + seconds);
    osc.connect(g).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + seconds + 0.05);
  } catch {
    /* audio blocked until first gesture — fine */
  }
}
