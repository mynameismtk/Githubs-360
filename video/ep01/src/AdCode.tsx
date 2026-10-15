import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Headline} from './Type';
import {Phone} from './Phone';
import {BrandWorld, BrandContent} from './Brand';
import {HookScene, PatternCuts, DecisionBackdrop, NeighbourhoodScene} from './code/Scenes';
import {C, DISPLAY} from './theme';

// The all-code edition of Ep. 01: the same script, timing, voice and score as the footage cut,
// with every picture drawn in code. 25 s, 1080x1920, 24 fps.
const T = (s: number) => Math.round(s * 24);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// WORK. DEADLINES. ROUTINE. land one per cut, then drift apart and blur away.
const PatternWords: React.FC = () => {
  const f = useCurrentFrame(); // 0 = 3.0 s
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
          <div key={w.t} style={{position: 'absolute', left: 80, top: 300 + i * 150, height: 150, overflow: 'hidden', opacity: 1 - split}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 160, lineHeight: '150px', textTransform: 'uppercase', color: w.c, letterSpacing: -0.5, transform: `translate(${dir * split * 520}px, ${(1 - p) * 160}px)`, filter: `blur(${split * 14}px)`}}>{w.t}</div>
          </div>
        );
      })}
    </>
  );
};

export const AdCode: React.FC<{placeholder: boolean}> = ({placeholder}) => {
  const f = useCurrentFrame();
  const dip = interpolate(f, [T(6.72), T(6.86), T(7.08), T(7.3)], [0, 0.85, 0.85, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* SHOT 1 - hook 0-3 s */}
      <Sequence durationInFrames={T(3)}>
        <HookScene />
        <Headline lines={[{text: 'Busy with', size: 178}, {text: 'everything.', size: 178}]} x={80} y={300} inAt={null} outAt={T(1.18)} />
        <Sequence from={T(1.58)} layout="none">
          <Headline lines={[{text: 'Except your', size: 150}, {text: 'health?', size: 250, color: C.orange}]} x={80} y={292} inAt={0} stagger={3} dur={8} />
        </Sequence>
      </Sequence>

      {/* SHOT 2 - pattern 3-7.08 s: the work changes on every cut, the dot stays and grows */}
      <Sequence from={T(3)} durationInFrames={T(4.08)}>
        <PatternCuts />
        <PatternWords />
        <Sequence from={T(2.4)} layout="none">
          <Headline lines={[{text: 'Your health', size: 160}, {text: "can't wait", size: 160}, {text: 'forever.', size: 160, color: C.orange}]} x={80} y={300} inAt={0} stagger={3} dur={8} />
        </Sequence>
      </Sequence>
      <AbsoluteFill style={{background: '#000', opacity: dip, pointerEvents: 'none'}} />

      {/* SHOT 3 - decision 7.08-11 s */}
      <Sequence from={T(7.08)} durationInFrames={T(11) - T(7.08)}>
        <DecisionBackdrop />
        <Headline lines={[{text: 'Start with the right', size: 104}, {text: 'medical advice.', size: 104, color: C.yellow}]} x={80} y={292} inAt={T(0.25)} stagger={3} dur={9} outAt={T(3.25)} />
        <Phone />
      </Sequence>

      {/* SHOT 4 - closer to home 11-17.2 s */}
      <Sequence from={T(11)} durationInFrames={T(17.2) - T(11)}>
        <NeighbourhoodScene />
        <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [T(11), T(11.35)], [1, 0], clamp)}} />
        <Headline lines={[{text: 'Everyday', size: 150, color: C.purple}, {text: 'healthcare.', size: 150, color: C.purple}]} x={80} y={292} inAt={T(0.4)} stagger={3} dur={9} outAt={T(2.85)} shadow={false} />
        <Sequence from={T(3.25)} layout="none">
          <Headline lines={[{text: 'Closer', size: 150, color: C.purple}, {text: 'to home.', size: 150, color: C.orange}]} x={80} y={292} inAt={0} stagger={3} dur={9} shadow={false} />
        </Sequence>
      </Sequence>

      {/* SHOTS 5 + 6 - brand reveal and CTA, shared with the footage cut */}
      <Sequence from={T(16.8)}>
        <BrandWorld />
        <BrandContent placeholder={placeholder} />
      </Sequence>

      <Audio src={staticFile('mix.wav')} />
    </AbsoluteFill>
  );
};
