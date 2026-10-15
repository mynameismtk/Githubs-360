import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Shot, Finish} from './Footage';
import {Headline} from './Type';
import {Phone} from './Phone';
import {BrandWorld, BrandContent} from './Brand';
import {C, DISPLAY} from './theme';

export const FPS = 24;
export const DURATION = 600; // 25.0 s
const T = (s: number) => Math.round(s * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Grades: the office is cool, contrasty and slightly desaturated; the clinic is warm, open and bright.
const OFFICE = 'contrast(1.12) saturate(0.82) brightness(0.92) sepia(0.06) hue-rotate(-6deg)';
const CLINIC = 'contrast(1.04) saturate(1.06) brightness(1.04) sepia(0.10)';
const office = {src: 'office.mp4', srcW: 1080, srcH: 1920, grade: OFFICE};

const Scrim: React.FC<{top?: number; bottom?: number}> = ({top = 0, bottom = 0}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(10,6,14,${top}) 0%, rgba(10,6,14,0) 38%, rgba(10,6,14,0) 52%, rgba(10,6,14,${bottom}) 100%)`}} />
);

// separate + vanish for the three pattern words: they drift apart sideways with motion blur
const PatternWords: React.FC = () => {
  const f = useCurrentFrame(); // local, 0 = 3.0 s
  const words = [
    {t: 'Work.', at: 0, c: '#fff'},
    {t: 'Deadlines.', at: T(0.8), c: '#fff'},
    {t: 'Routine.', at: T(1.5), c: C.orange},
  ];
  const split = interpolate(f, [T(2.05), T(2.4)], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  return (
    <>
      {words.map((w, i) => {
        const p = interpolate(f, [w.at, w.at + 6], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
        const dir = i % 2 === 0 ? -1 : 1;
        return (
          <div key={w.t} style={{position: 'absolute', left: 80, top: 300 + i * 158, height: 170, overflow: 'hidden', opacity: 1 - split}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 168, lineHeight: '170px', textTransform: 'uppercase', color: w.c, letterSpacing: -0.5, transform: `translate(${dir * split * 520}px, ${(1 - p) * 175}px)`, filter: `blur(${split * 14}px)`, textShadow: '0 4px 28px rgba(0,0,0,0.4)'}}>{w.t}</div>
          </div>
        );
      })}
    </>
  );
};

export const Ad: React.FC<{placeholder: boolean}> = ({placeholder}) => {
  const f = useCurrentFrame();
  const dip = interpolate(f, [T(6.72), T(6.86), T(7.08), T(7.3)], [0, 0.85, 0.85, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* ---------- SHOT 1 - THE HOOK 0-3 s: ECU, slow push-in, handheld ---------- */}
      <Sequence durationInFrames={T(3)}>
        <Shot {...office} from={16.15} rate={0.85} focus={[640, 760]} at={[540, 1120]} s0={1.72} s1={1.92} dur={T(3)} shake={5} seed="h" />
        <Finish vignette={0.55} />
        <Scrim top={0.55} />
        <Headline lines={[{text: 'Busy with', size: 178}, {text: 'everything.', size: 178}]} x={80} y={300} inAt={null} outAt={T(1.18)} />
        <Sequence from={T(1.58)} layout="none">
          <Headline lines={[{text: 'Except your', size: 150}, {text: 'health?', size: 250, color: C.orange}]} x={80} y={292} inAt={0} stagger={3} dur={8} />
        </Sequence>
      </Sequence>

      {/* ---------- SHOT 2 - THE PATTERN 3-7 s: three tightening match cuts, then the hold ---------- */}
      <Sequence from={T(3)} durationInFrames={T(0.8)}>
        <Shot {...office} from={11.0} focus={[600, 1020]} at={[540, 1080]} s0={1.22} s1={1.3} dur={T(0.8)} shake={4} seed="a" />
      </Sequence>
      <Sequence from={T(3.8)} durationInFrames={T(0.7)}>
        <Shot {...office} from={6.3} focus={[560, 1180]} at={[540, 1150]} s0={1.5} s1={1.58} dur={T(0.7)} shake={4} seed="b" />
      </Sequence>
      <Sequence from={T(4.5)} durationInFrames={T(0.6)}>
        <Shot {...office} from={17.45} focus={[640, 740]} at={[540, 1020]} s0={2.35} s1={2.45} dur={T(0.6)} shake={4} seed="c" />
      </Sequence>
      <Sequence from={T(5.1)} durationInFrames={T(1.98)}>
        <Shot {...office} from={18.35} rate={0.72} focus={[640, 760]} at={[540, 1160]} s0={1.55} s1={1.68} dur={T(1.98)} shake={2.5} seed="d" />
      </Sequence>
      <Sequence from={T(3)} durationInFrames={T(4.08)}>
        <Finish vignette={0.55} />
        <Scrim top={0.6} />
        <PatternWords />
        <Sequence from={T(2.4)} layout="none">
          <Headline lines={[{text: 'Your health', size: 160}, {text: "can't wait", size: 160}, {text: 'forever.', size: 160, color: C.orange}]} x={80} y={300} inAt={0} stagger={3} dur={8} />
        </Sequence>
      </Sequence>
      {/* a breath of near-black between the office and the decision */}
      <AbsoluteFill style={{background: '#000', opacity: dip, pointerEvents: 'none'}} />

      {/* ---------- SHOT 3 - THE DECISION 7.08-11 s: the search, then the match cut ---------- */}
      <Sequence from={T(7.08)} durationInFrames={T(11) - T(7.08)}>
        <Shot {...office} from={21.2} rate={0.8} focus={[600, 900]} at={[540, 960]} s0={1.15} s1={1.25} dur={T(3.92)} blur={16} grade={`${OFFICE} brightness(0.55)`} />
        <Finish vignette={0.5} grain={0.05} />
        <Headline lines={[{text: 'Start with the right', size: 104}, {text: 'medical advice.', size: 104, color: C.yellow}]} x={80} y={292} inAt={T(0.25)} stagger={3} dur={9} outAt={T(3.25)} />
        <Phone />
      </Sequence>

      {/* ---------- SHOT 4 - THE MERIVA EXPERIENCE 11-17 s: warm, stable dolly ---------- */}
      <Sequence from={T(11)} durationInFrames={T(12.7) - T(11)}>
        <Shot src="reception.mp4" srcW={1080} srcH={1920} from={0.0} focus={[540, 760]} at={[540, 820]} s0={1.04} s1={1.1} dur={T(1.7)} grade={CLINIC} />
      </Sequence>
      <Sequence from={T(12.7)} durationInFrames={T(14.9) - T(12.7)}>
        <Shot src="doctor_close.mp4" srcW={720} srcH={1366} from={0.0} focus={[300, 520]} at={[540, 760]} s0={1.72} s1={1.82} dur={T(2.2)} grade={CLINIC} />
      </Sequence>
      <Sequence from={T(14.9)} durationInFrames={T(17.2) - T(14.9)}>
        <Shot src="doctor_close.mp4" srcW={720} srcH={1366} from={3.0} focus={[360, 700]} at={[540, 960]} s0={1.5} s1={1.56} at1={[520, 960]} dur={T(2.3)} grade={CLINIC} />
      </Sequence>
      <Sequence from={T(11)} durationInFrames={T(17.2) - T(11)}>
        <Finish vignette={0.28} grain={0.05} />
        <Scrim bottom={0.62} />
        {/* the bright screen hands over to the bright clinic */}
        <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [T(11), T(11.35)], [1, 0], clamp)}} />
        <Headline lines={[{text: 'Everyday', size: 150}, {text: 'healthcare.', size: 150}]} x={80} y={1150} inAt={T(0.4)} stagger={3} dur={9} outAt={T(2.85)} />
        <Sequence from={T(3.25)} layout="none">
          <Headline lines={[{text: 'Closer', size: 150}, {text: 'to home.', size: 150, color: C.orange}]} x={80} y={1150} inAt={0} stagger={3} dur={9} />
        </Sequence>
      </Sequence>

      {/* ---------- SHOTS 5 + 6 - BRAND REVEAL 17-22 s and CTA 22-25 s ---------- */}
      <Sequence from={T(16.8)}>
        <BrandWorld />
        <BrandContent placeholder={placeholder} />
      </Sequence>

      <Audio src={staticFile('mix.wav')} />
    </AbsoluteFill>
  );
};
