import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {noise2D} from '@remotion/noise';
import {BODY, C, DISPLAY} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

// Organic blob: a closed smooth path whose radius wobbles with noise; filled with a gradient.
const blobPath = (cx: number, cy: number, r: number, f: number, seed: string, wob = 0.13) => {
  const n = 10;
  const pts = Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + wob * noise2D(seed, Math.cos(a) * 0.9 + f * 0.012, Math.sin(a) * 0.9));
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (i === 0) d += `M${p1[0]},${p1[1]}`;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d + 'Z';
};

// Frames are local: 0 = 16.8 s. The purple/magenta wave sweeps over the clinic, white opens from the centre,
// the colour settles into two organic shapes at the corners with small orange / yellow accents.
export const BrandWorld: React.FC = () => {
  const f = useCurrentFrame();
  const sweep = interpolate(f, [0, 9], [0, 1], {...clamp, easing: Easing.bezier(0.5, 0, 0.2, 1)});
  const open = interpolate(f, [8, 22], [0, 1], {...clamp, easing: Easing.bezier(0.5, 0, 0.1, 1)});
  // corner blobs: big while sweeping, settle to the corners
  const settle = interpolate(f, [8, 30], [0, 1], {...clamp, easing: ease});
  const tr = {cx: 1080 + 60 - 0 * settle, cy: -60, r: 2100 - 1720 * settle};
  const bl = {cx: -80, cy: 1980, r: 2100 - 1700 * settle};
  const acc = interpolate(f, [22, 40], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{background: 'transparent'}}>
      <AbsoluteFill style={{background: '#fff', opacity: f >= 8 ? 1 : 0}} />
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="gp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={C.magenta} /><stop offset="1" stopColor={C.purple} /></linearGradient>
          <linearGradient id="gm" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor={C.purple} /><stop offset="0.75" stopColor={C.magenta} /><stop offset="1" stopColor={C.orange} /></linearGradient>
          <mask id="open">
            <rect width="1080" height="1920" fill="white" />
            <path d={blobPath(540, 900, 1500 * open, f, 'open', 0.08)} fill="black" />
          </mask>
        </defs>
        {/* the sweep: a full-frame gradient that grows from bottom-left, then the white opens through it */}
        <g mask="url(#open)" opacity={sweep > 0 ? 1 : 0}>
          <path d={blobPath(-100, 2000, 2600 * sweep, f, 'sweep', 0.1)} fill="url(#gm)" />
        </g>
      </svg>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: interpolate(f, [14, 22], [0, 1], clamp)}}>
        <path d={blobPath(tr.cx, tr.cy, tr.r, f, 'tr')} fill="url(#gp)" />
        <path d={blobPath(bl.cx, bl.cy, bl.r, f + 40, 'bl')} fill="url(#gm)" />
        {/* accents */}
        <circle cx={150 + 8 * noise2D('a', f * 0.02, 0)} cy={300 + 10 * noise2D('b', f * 0.02, 0)} r={20 * acc} fill={C.yellow} />
        <circle cx={960} cy={1490 + 8 * noise2D('c', f * 0.02, 0)} r={30 * acc} fill="none" stroke={C.orange} strokeWidth={7} />
        <circle cx={905} cy={1560} r={10 * acc} fill={C.orange} />
      </svg>
    </AbsoluteFill>
  );
};

const Icon: React.FC<{kind: 'steth' | 'consult' | 'diag'}> = ({kind}) => (
  <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'steth' && (
      <>
        <path d="M6 3v6a4 4 0 0 0 8 0V3" />
        <path d="M10 13v2a5 5 0 0 0 10 0v-2" />
        <circle cx="20" cy="11" r="2" />
      </>
    )}
    {kind === 'consult' && (
      <>
        <circle cx="8" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M14 20a4 4 0 0 1 7.5-2" />
      </>
    )}
    {kind === 'diag' && (
      <>
        <path d="M9 3h6" />
        <path d="M10 3v6.5L5 18a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3L14 9.5V3" />
        <path d="M7.5 15h9" />
      </>
    )}
  </svg>
);

const SERVICES: {kind: 'steth' | 'consult' | 'diag'; text: string}[] = [
  {kind: 'steth', text: 'General medicine'},
  {kind: 'consult', text: 'Multispeciality consultations'},
  {kind: 'diag', text: 'Diagnostic services'},
];

// Logo, services and end card. Frames local: 0 = 16.8 s.  Logo lands at 26 (17.9 s, the bell),
// services 53/62/71 (19.0-19.8 s), hand-off to the end card at 125-138 (22.0-22.6 s).
export const BrandContent: React.FC<{placeholder: boolean}> = ({placeholder}) => {
  const f = useCurrentFrame();
  const lin = interpolate(f, [16, 28], [0, 1], {...clamp, easing: ease});
  const toCard = interpolate(f, [124, 140], [0, 1], {...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1)});
  // logo: centred big (width 640, top 330) -> end card (width 400, top 262)
  const lw = 640 + (400 - 640) * toCard;
  const ltop = 330 + (262 - 330) * toCard;
  const servOut = interpolate(f, [118, 128], [0, 1], clamp);
  const head = (i: number) => interpolate(f, [134 + i * 3, 145 + i * 3], [0, 1], {...clamp, easing: ease});
  const cta = interpolate(f, [146, 158], [0, 1], {...clamp, easing: ease});
  const ctaPulse = 1 + 0.018 * Math.sin(Math.max(0, f - 160) * 0.22) * interpolate(f, [160, 170], [0, 1], clamp);
  const web = interpolate(f, [154, 166], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 540 - lw / 2, top: ltop, width: lw, opacity: lin, transform: `scale(${0.9 + 0.1 * lin})`, filter: `blur(${(1 - lin) * 10}px)`}}>
        <Img src={staticFile('logo.png')} style={{width: '100%'}} />
      </div>
      {/* services */}
      <div style={{position: 'absolute', left: 150, top: 1080, width: 800, opacity: 1 - servOut, transform: `translateY(${-servOut * 30}px)`}}>
        {SERVICES.map((s, i) => {
          const p = interpolate(f, [53 + i * 9, 64 + i * 9], [0, 1], {...clamp, easing: ease});
          return (
            <div key={s.text} style={{display: 'flex', alignItems: 'center', gap: 30, height: 122, opacity: p, transform: `translateX(${(1 - p) * -40}px)`}}>
              <div style={{width: 92, height: 92, borderRadius: 46, flex: 'none', background: `linear-gradient(135deg, ${[C.purple, C.magenta, C.orange][i]}, ${[C.magenta, C.orange, C.yellow][i]})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Icon kind={s.kind} />
              </div>
              <div style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 54, letterSpacing: 0.5, textTransform: 'uppercase', color: C.purple, whiteSpace: 'nowrap'}}>{s.text}</div>
            </div>
          );
        })}
      </div>
      {/* end card */}
      <div style={{position: 'absolute', left: 0, width: 1080, top: 730, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, textTransform: 'uppercase', letterSpacing: -0.5}}>
        {[
          {t: 'Your first step', c: C.purple},
          {t: 'to better health.', c: C.magenta},
        ].map((l, i) => (
          <div key={i} style={{height: 128, overflow: 'hidden'}}>
            <div style={{fontSize: 124, lineHeight: '128px', color: l.c, transform: `translateY(${(1 - head(i)) * 130}px)`}}>{l.t}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 150, top: 1046, width: 780, height: 118, borderRadius: 59, background: `linear-gradient(90deg, ${C.purple}, ${C.magenta} 70%, ${C.orange})`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: cta, transform: `translateY(${(1 - cta) * 40}px) scale(${ctaPulse})`, boxShadow: '0 18px 40px rgba(84,32,111,0.28)'}}>
        <span style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 52, letterSpacing: 1.5, color: '#fff', textTransform: 'uppercase'}}>Book your consultation</span>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </div>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 1196, textAlign: 'center', opacity: web, fontFamily: BODY, fontWeight: 700, fontSize: 40, color: C.purple, letterSpacing: 0.3}}>merivamedicalcenter.com</div>
      {placeholder && (
        <div style={{position: 'absolute', left: 200, width: 680, top: 1268, height: 86, border: `3px dashed ${C.magenta}`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: web, fontFamily: BODY, fontWeight: 600, fontSize: 30, color: C.magenta}}>[ CLINIC PHONE · ADDRESS ]</div>
      )}
    </AbsoluteFill>
  );
};
