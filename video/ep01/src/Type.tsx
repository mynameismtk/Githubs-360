import React from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';
import {DISPLAY} from './theme';

const ease = Easing.bezier(0.16, 1, 0.3, 1);

export type Line = {text: string; color?: string; size: number; outline?: boolean};

// Oversized editorial headline. Each line rises out of its own mask (no fade from nothing), staggered.
// `inAt` = first frame of the entrance (the line is fully set `dur` frames later); null = already standing.
// `outAt` = lines slide up and out of their masks.
export const Headline: React.FC<{
  lines: Line[];
  x: number;
  y: number;
  inAt: number | null;
  outAt?: number;
  stagger?: number;
  dur?: number;
  align?: 'left' | 'center';
  shadow?: boolean;
  lineGap?: number;
  tracking?: number;
}> = ({lines, x, y, inAt, outAt, stagger = 3, dur = 9, align = 'left', shadow = true, lineGap = 0.93, tracking = -0.5}) => {
  const f = useCurrentFrame();
  let top = y;
  return (
    <>
      {lines.map((l, i) => {
        const h = l.size * lineGap;
        const y0 = top;
        top += h;
        const pin = inAt === null ? 1 : interpolate(f, [inAt + i * stagger, inAt + i * stagger + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
        const pout = outAt === undefined ? 0 : interpolate(f, [outAt + i * 2, outAt + i * 2 + 7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
        const ty = (1 - pin) * h * 1.15 - pout * h * 1.3;
        return (
          <div key={i} style={{position: 'absolute', left: align === 'center' ? 0 : x, width: align === 'center' ? 1080 : undefined, top: y0, height: h, overflow: 'hidden', textAlign: align}}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: l.size,
                lineHeight: `${h}px`,
                letterSpacing: tracking,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                color: l.outline ? 'transparent' : l.color ?? '#fff',
                WebkitTextStroke: l.outline ? `3px ${l.color ?? '#fff'}` : undefined,
                transform: `translateY(${ty}px)`,
                textShadow: shadow && !l.outline ? '0 4px 28px rgba(0,0,0,0.35)' : undefined,
              }}
            >
              {l.text}
            </div>
          </div>
        );
      })}
    </>
  );
};
