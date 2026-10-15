import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {noise2D} from '@remotion/noise';
import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import {BODY, C, DISPLAY} from '../theme';

// Everything in this edition is drawn in code: no footage, no photos.
// The recurring device is THE DOT - the small, ignored symptom - which sits at the same screen point
// through every office cut and grows each time, "before it becomes big".

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const DOT: [number, number] = [612, 1090];
const NIGHT = '#120A18';

// ---------------------------------------------------------------------------------------------------------
// The symptom: a magenta point with a soft glow and rings that pulse outward.
export const Symptom: React.FC<{r: number; pulse?: number; x?: number; y?: number; rings?: number}> = ({r, pulse = 1, x = DOT[0], y = DOT[1], rings = 3}) => {
  const f = useCurrentFrame();
  return (
    <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="glow">
          <stop offset="0" stopColor={C.magenta} stopOpacity="0.55" />
          <stop offset="1" stopColor={C.magenta} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r * 4.2} fill="url(#glow)" opacity={0.6 + 0.4 * Math.sin(f * 0.25)} />
      {Array.from({length: rings}, (_, i) => {
        const ph = ((f * 0.9 + i * (36 / rings)) % 36) / 36;
        return <circle key={i} cx={x} cy={y} r={r * (1.2 + ph * 3.6 * pulse)} fill="none" stroke={C.magenta} strokeWidth={3} opacity={(1 - ph) * 0.55 * pulse} />;
      })}
      <circle cx={x} cy={y} r={r * (1 + 0.08 * Math.sin(f * 0.5))} fill={C.magenta} />
      <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.3} fill="#fff" opacity={0.35} />
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------------------
// SHOT 1 - the hook. A single-line profile drawn in white, the symptom at the temple, work piling up around it.
const HEAD =
  'M 170 1600 C 175 1500 150 1440 118 1380 C 52 1262 40 1070 170 958 C 300 846 520 840 622 980 ' +
  'C 668 1042 676 1110 672 1168 L 714 1262 C 722 1280 706 1290 690 1292 C 698 1318 692 1336 676 1342 ' +
  'C 688 1362 676 1388 656 1394 C 646 1446 600 1458 556 1456 C 520 1500 514 1550 520 1600';

const Toast: React.FC<{x: number; y: number; at: number; title: string; sub: string; accent: string}> = ({x, y, at, title, sub, accent}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 7], [0, 1], {...clamp, easing: ease});
  const drift = 6 * noise2D(title, f * 0.03, 0);
  return (
    <div style={{position: 'absolute', left: x, top: y + (1 - p) * 40 + drift, width: 380, padding: '20px 24px', borderRadius: 24, background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.14)', opacity: p, display: 'flex', gap: 16, alignItems: 'center', fontFamily: BODY}}>
      <div style={{width: 14, height: 14, borderRadius: 7, background: accent, flex: 'none'}} />
      <div>
        <div style={{fontSize: 26, fontWeight: 700, color: '#fff'}}>{title}</div>
        <div style={{fontSize: 21, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginTop: 2}}>{sub}</div>
      </div>
    </div>
  );
};

export const HookScene: React.FC = () => {
  const f = useCurrentFrame(); // 0 = 0 s, 72 frames
  const draw = interpolate(f, [0, 24], [0.85, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const ev = evolvePath(draw, HEAD);
  const push = interpolate(f, [0, 72], [1, 1.07], clamp);
  const sym = interpolate(f, [30, 40], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at 55% 62%, #2A1736 0%, ${NIGHT} 70%)`}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: `${DOT[0]}px ${DOT[1]}px`}}>
        <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
          <path d={HEAD} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
        </svg>
        <Toast x={640} y={760} at={4} title="Q3 report" sub="Due today" accent={C.orange} />
        <Toast x={660} y={1420} at={12} title="Team call" sub="Starts in 5 min" accent={C.yellow} />
        <Toast x={600} y={1590} at={20} title="12 unread" sub="Inbox" accent={C.magenta} />
        {sym > 0 && <Symptom r={10 * sym} pulse={sym} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------------------
// SHOT 2 - the pattern. Three match cuts; the work changes, the dot stays where it is and grows.
const DocCut: React.FC<{r: number}> = ({r}) => {
  const f = useCurrentFrame();
  const lines = 13;
  return (
    <AbsoluteFill style={{background: NIGHT}}>
      <div style={{position: 'absolute', left: 120, top: 760, width: 840, height: 820, borderRadius: 36, background: '#1E1426', border: '1.5px solid rgba(255,255,255,0.1)', padding: 56, boxSizing: 'border-box'}}>
        {Array.from({length: lines}, (_, i) => {
          const w = [620, 700, 540, 680, 300, 650, 720, 480, 610, 690, 380, 560, 640][i];
          const p = interpolate(f, [i * 1.4, i * 1.4 + 3], [0, 1], clamp);
          return <div key={i} style={{height: 18, width: w * p, borderRadius: 9, background: i % 5 === 4 ? 'rgba(255,118,46,0.7)' : 'rgba(255,255,255,0.22)', marginBottom: 40}} />;
        })}
      </div>
      <Symptom r={r} />
    </AbsoluteFill>
  );
};

const CalendarCut: React.FC<{r: number}> = ({r}) => {
  const f = useCurrentFrame();
  const cols = 5, rows = 6, cw = 150, ch = 112, x0 = 150, y0 = 780;
  return (
    <AbsoluteFill style={{background: NIGHT}}>
      {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((d, i) => (
        <div key={d} style={{position: 'absolute', left: x0 + i * (cw + 12), top: y0 - 56, width: cw, textAlign: 'center', fontFamily: BODY, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: 'rgba(255,255,255,0.5)'}}>{d}</div>
      ))}
      {Array.from({length: cols * rows}, (_, k) => {
        const i = k % cols, j = Math.floor(k / cols);
        const order = (k * 7) % (cols * rows);
        const p = interpolate(f, [order * 0.5, order * 0.5 + 3], [0, 1], {...clamp, easing: ease});
        const col = [C.purple, C.orange, '#3A2A48', C.magenta][(k * 3) % 4];
        return <div key={k} style={{position: 'absolute', left: x0 + i * (cw + 12), top: y0 + j * (ch + 12), width: cw, height: ch, borderRadius: 18, background: col, opacity: 0.25 + 0.75 * p, transform: `scale(${0.6 + 0.4 * p})`}} />;
      })}
      <Symptom r={r} />
    </AbsoluteFill>
  );
};

const ClockCut: React.FC<{r: number}> = ({r}) => {
  const f = useCurrentFrame();
  const cx = 540, cy = 1130, R = 330;
  const minute = f * 30, hour = f * 2.5;
  return (
    <AbsoluteFill style={{background: NIGHT}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
        <circle cx={cx} cy={cy} r={R} fill="#1E1426" stroke="rgba(255,255,255,0.18)" strokeWidth={4} />
        {Array.from({length: 12}, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={cx + Math.sin(a) * (R - 40)} y1={cy - Math.cos(a) * (R - 40)} x2={cx + Math.sin(a) * (R - 16)} y2={cy - Math.cos(a) * (R - 16)} stroke="rgba(255,255,255,0.45)" strokeWidth={i % 3 === 0 ? 8 : 4} strokeLinecap="round" />;
        })}
        <line x1={cx} y1={cy} x2={cx + Math.sin((hour * Math.PI) / 180) * 170} y2={cy - Math.cos((hour * Math.PI) / 180) * 170} stroke="#fff" strokeWidth={14} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={cx + Math.sin((minute * Math.PI) / 180) * 260} y2={cy - Math.cos((minute * Math.PI) / 180) * 260} stroke={C.orange} strokeWidth={8} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={16} fill="#fff" />
      </svg>
      <Symptom r={r} />
    </AbsoluteFill>
  );
};

// The hold: the work falls away, only the symptom is left, and it is bigger now.
const HoldCut: React.FC = () => {
  const f = useCurrentFrame(); // 0 = 5.1 s, ~42 frames
  const r = interpolate(f, [0, 40], [30, 58], {...clamp, easing: Easing.out(Easing.cubic)});
  const ghost = interpolate(f, [0, 10], [0.5, 0], clamp);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at ${DOT[0]}px ${DOT[1]}px, #2A1033 0%, ${NIGHT} 55%)`}}>
      <div style={{position: 'absolute', left: 120, top: 760, width: 840, height: 820, borderRadius: 36, border: '1.5px solid rgba(255,255,255,0.2)', opacity: ghost, transform: `scale(${1 + (0.5 - ghost) * 0.2})`}} />
      <Symptom r={r} rings={4} />
    </AbsoluteFill>
  );
};

export const PatternCuts: React.FC = () => {
  const f = useCurrentFrame(); // 0 = 3.0 s
  const T = (s: number) => Math.round(s * 24);
  if (f < T(0.8)) return <DocCut r={14} />;
  if (f < T(1.5)) return <CalendarCut r={20} />;
  if (f < T(2.1)) return <ClockCut r={26} />;
  return <HoldCut />;
};

// ---------------------------------------------------------------------------------------------------------
// SHOT 3 backdrop: dark, with the symptom dimmed far behind the phone.
export const DecisionBackdrop: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at 50% 60%, #2A1736 0%, ${NIGHT} 75%)`}}>
    <div style={{position: 'absolute', inset: 0, opacity: 0.35, filter: 'blur(10px)'}}>
      <Symptom r={58} rings={3} />
    </div>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------------------
// SHOT 4 - closer to home. A warm neighbourhood map: the route from home to Meriva draws itself, short.
const ROUTE = 'M 240 1150 C 240 1070 300 1030 400 1030 L 600 1030 C 680 1030 720 990 720 930 L 720 860 C 720 815 760 790 820 790';

const Pin: React.FC<{x: number; y: number; p: number; kind: 'home' | 'clinic'}> = ({x, y, p, kind}) => (
  <g transform={`translate(${x} ${y}) scale(${p})`}>
    <ellipse cx={0} cy={6} rx={34} ry={10} fill="rgba(60,20,80,0.18)" />
    <path d="M 0 0 C -18 -26 -48 -46 -48 -82 A 48 48 0 1 1 48 -82 C 48 -46 18 -26 0 0 Z" fill={kind === 'clinic' ? 'url(#pinG)' : '#fff'} stroke={kind === 'clinic' ? 'none' : C.purple} strokeWidth={5} />
    {kind === 'clinic' ? (
      <path d="M -9 -104 h 18 v 13 h 13 v 18 h -13 v 13 h -18 v -13 h -13 v -18 h 13 z" fill="#fff" />
    ) : (
      <path d="M -20 -78 L 0 -98 L 20 -78 L 20 -60 L -20 -60 Z" fill={C.purple} />
    )}
  </g>
);

const Chip: React.FC<{x: number; y: number; text: string; p: number; strong?: boolean}> = ({x, y, text, p, strong}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translateY(${(1 - p) * 20}px)`, opacity: p, padding: '12px 22px', borderRadius: 999, background: strong ? C.purple : '#fff', color: strong ? '#fff' : C.purple, fontFamily: BODY, fontWeight: 700, fontSize: 28, boxShadow: '0 8px 24px rgba(84,32,111,0.14)', whiteSpace: 'nowrap'}}>{text}</div>
);

const Visit: React.FC<{x: number; y: number; at: number; icon: React.ReactNode; title: string}> = ({x, y, at, icon, title}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 9], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 280, height: 200, borderRadius: 32, background: '#fff', boxShadow: '0 18px 44px rgba(84,32,111,0.16)', opacity: p, transform: `translateY(${(1 - p) * 50}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}}>
      <div style={{width: 84, height: 84, borderRadius: 42, background: `linear-gradient(135deg, ${C.purple}, ${C.magenta})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div>
      <div style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 38, letterSpacing: 0.5, textTransform: 'uppercase', color: C.purple}}>{title}</div>
    </div>
  );
};

const I = (d: React.ReactNode) => (
  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

export const NeighbourhoodScene: React.FC = () => {
  const f = useCurrentFrame(); // 0 = 11.0 s, ~150 frames
  const route = interpolate(f, [12, 52], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const ev = evolvePath(route, ROUTE);
  const home = interpolate(f, [4, 14], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const clinic = interpolate(f, [46, 56], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  // after "closer to home", the map eases up and back to make room for the visit cards
  const mapT = `scale(${interpolate(f, [0, 150], [1, 1.05], clamp)})`;
  const blocks = [
    [60, 640, 140, 100], [300, 820, 380, 170], [780, 860, 190, 140], [60, 1260, 140, 200],
    [300, 1090, 380, 110], [780, 1090, 190, 110], [1050, 820, 120, 180], [300, 640, 380, 90],
  ];
  // the traveller dot rides the head of the route as it draws
  const head = getPointAtLength(ROUTE, getLength(ROUTE) * Math.max(0.0001, route));
  return (
    <AbsoluteFill style={{background: '#FFF6EE'}}>
      <AbsoluteFill style={{transform: mapT, transformOrigin: '540px 1100px'}}>
        <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
          <defs>
            <linearGradient id="pinG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={C.purple} /><stop offset="1" stopColor={C.magenta} /></linearGradient>
          </defs>
          {/* streets */}
          {[1030, 760, 1230].map((y) => <line key={y} x1={-20} y1={y} x2={1100} y2={y} stroke="#F2E2D4" strokeWidth={46} />)}
          {[250, 720, 1000].map((x) => <line key={x} x1={x} y1={600} x2={x} y2={1500} stroke="#F2E2D4" strokeWidth={46} />)}
          {/* blocks: homes, shops, a park */}
          {blocks.map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx={26} fill={i === 3 ? '#E3F1DC' : i % 2 ? '#FBE8DA' : '#F7E1EC'} opacity={0.9} />
          ))}
          {/* the route */}
          <path d={ROUTE} fill="none" stroke={C.magenta} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
          {head && route > 0 && route < 1 && <circle cx={head.x} cy={head.y} r={20} fill={C.purple} stroke="#fff" strokeWidth={6} />}
          <Pin x={240} y={1150} p={home} kind="home" />
          <Pin x={820} y={790} p={clinic} kind="clinic" />
        </svg>
        <Chip x={150} y={1175} text="Home" p={home} />
        <Chip x={330} y={680} text="Meriva Medical Centre" p={clinic} strong />
      </AbsoluteFill>
      {/* the visit, once there: welcomed, heard, and tests in the same place */}
      <Visit x={76} y={1270} at={96} title="Reception" icon={I(<><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /><path d="M3 20h18" /></>)} />
      <Visit x={400} y={1270} at={103} title="Consultation" icon={I(<><path d="M6 3v6a4 4 0 0 0 8 0V3" /><path d="M10 13v2a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="11" r="2" /></>)} />
      <Visit x={724} y={1270} at={110} title="Diagnostics" icon={I(<><path d="M9 3h6" /><path d="M10 3v6.5L5 18a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3L14 9.5V3" /><path d="M7.5 15h9" /></>)} />
    </AbsoluteFill>
  );
};
