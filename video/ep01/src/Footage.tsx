import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {noise2D} from '@remotion/noise';

// One shot of stock footage, framed like a camera: `focus` is a point in source pixels, `at` is where it sits on
// screen, `scale` is screen px per source px (animated s0 -> s1 across the shot, i.e. a dolly / push-in).
// Framing is clamped so the picture always covers the 1080x1920 frame.
export type ShotProps = {
  src: string;
  srcW: number;
  srcH: number;
  from: number; // seconds into the source
  rate?: number;
  focus: [number, number];
  at: [number, number];
  at1?: [number, number];
  s0: number;
  s1: number;
  dur: number; // frames
  shake?: number; // handheld amplitude in px
  grade?: string; // CSS filter
  blur?: number;
  seed?: string;
};

export const Shot: React.FC<ShotProps> = ({src, srcW, srcH, from, rate = 1, focus, at, at1, s0, s1, dur, shake = 0, grade = '', blur = 0, seed = 'a'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(f, [0, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 0, 0.4, 1)});
  const s = s0 + (s1 - s0) * p;
  const ax = at[0] + ((at1 ?? at)[0] - at[0]) * p;
  const ay = at[1] + ((at1 ?? at)[1] - at[1]) * p;
  const jx = shake * (noise2D(seed + 'x', f * 0.045, 0) + 0.35 * noise2D(seed + 'X', f * 0.19, 1));
  const jy = shake * (noise2D(seed + 'y', f * 0.045, 2) + 0.35 * noise2D(seed + 'Y', f * 0.19, 3));
  const rot = shake * 0.012 * noise2D(seed + 'r', f * 0.04, 4);
  let tx = ax - focus[0] * s + jx;
  let ty = ay - focus[1] * s + jy;
  const m = shake * 1.6; // keep a margin so the shake never reveals an edge
  tx = Math.min(-m, Math.max(1080 - srcW * s + m, tx));
  ty = Math.min(-m, Math.max(1920 - srcH * s + m, ty));
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: srcW, height: srcH, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${s})`, filter: `${grade} ${blur ? `blur(${blur}px)` : ''}`}}>
        <OffthreadVideo src={staticFile(src)} startFrom={Math.round(from * fps)} playbackRate={rate} muted style={{width: srcW, height: srcH}} />
      </div>
    </AbsoluteFill>
  );
};

// Film finish over the photographic shots: fine animated grain + soft vignette.
export const Finish: React.FC<{vignette?: number; grain?: number}> = ({vignette = 0.45, grain = 0.07}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)`}} />
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: grain, mixBlendMode: 'overlay'}}>
        <filter id={`g${f}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 97} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1080" height="1920" filter={`url(#g${f})`} />
      </svg>
    </AbsoluteFill>
  );
};
