import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {noise2D} from '@remotion/noise';
import {BODY, C} from './theme';

// A generic phone search: she types "general physician near me", results load (no ratings, reviews or claims),
// the Meriva card is tapped and the bright screen grows to fill the frame - the match cut into the clinic.
// Frames are local to the sequence (0 = 7.08 s).
const QUERY = 'general physician near me';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const Skeleton: React.FC<{w: number; h?: number; c?: string}> = ({w, h = 18, c = '#E7E3EA'}) => <div style={{width: w, height: h, borderRadius: h / 2, background: c}} />;

export const Phone: React.FC = () => {
  const f = useCurrentFrame();
  const W = 640, H = 1300, R = 78;
  const enter = interpolate(f, [0, 14], [0, 1], {...clamp, easing: ease});
  const typed = Math.floor(interpolate(f, [10, 30], [0, QUERY.length], clamp));
  const results = interpolate(f, [33, 43], [0, 1], {...clamp, easing: ease});
  const highlight = interpolate(f, [52, 60], [0, 1], clamp);
  const press = interpolate(f, [74, 77, 81], [1, 0.95, 1], clamp);
  const ripple = interpolate(f, [76, 86], [0, 1], clamp);
  // the screen grows past the frame: phone scale 1 -> 3.4, bezel fades
  const grow = interpolate(f, [82, 94], [0, 1], {...clamp, easing: Easing.bezier(0.7, 0, 0.84, 0)});
  const scale = (0.94 + 0.06 * enter) * (1 + 2.6 * grow);
  const bob = 6 * noise2D('ph', f * 0.04, 0) * (1 - grow);
  const rot = (1 - enter) * -4 + 1.2 * noise2D('pr', f * 0.03, 0) * (1 - grow);
  const cx = 540, cy = 590 + H / 2;
  // the button sits at the zoom origin so the tap point is what fills the frame
  const ox = W / 2, oy = 760;
  const caret = Math.floor(f / 6) % 2 === 0 && f < 34;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: cx - W / 2,
          top: cy - H / 2 + (1 - enter) * 260 + bob,
          width: W,
          height: H,
          borderRadius: R,
          background: '#0c0a0e',
          padding: 16,
          boxSizing: 'border-box',
          transformOrigin: `${ox}px ${oy}px`,
          transform: `rotate(${rot}deg) scale(${scale})`,
          boxShadow: `0 60px 120px rgba(0,0,0,${0.55 * (1 - grow)})`,
          opacity: enter,
        }}
      >
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: R - 16, background: '#FAF8FB', overflow: 'hidden', fontFamily: BODY}}>
          {/* status bar */}
          <div style={{display: 'flex', justifyContent: 'space-between', padding: '26px 44px 0', fontSize: 24, fontWeight: 700, color: '#222'}}>
            <span>4:12</span>
            <span style={{letterSpacing: 4}}>▮▮▮ ◔</span>
          </div>
          <div style={{position: 'absolute', top: 18, left: '50%', width: 150, height: 40, marginLeft: -75, borderRadius: 20, background: '#0c0a0e'}} />
          {/* search field */}
          <div style={{margin: '58px 32px 0', height: 92, borderRadius: 46, background: '#fff', boxShadow: '0 6px 24px rgba(40,20,60,0.10)', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 20}}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#6b6472" strokeWidth="2.4" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></svg>
            <span style={{fontSize: 34, fontWeight: 500, color: '#1d1a20', whiteSpace: 'nowrap'}}>
              {QUERY.slice(0, typed)}
              <span style={{display: 'inline-block', width: 3, height: 38, marginLeft: 2, verticalAlign: -6, background: caret ? C.magenta : 'transparent'}} />
            </span>
          </div>
          {/* results */}
          <div style={{opacity: results, transform: `translateY(${(1 - results) * 60}px)`}}>
            <div style={{margin: '34px 40px 18px', fontSize: 24, fontWeight: 700, letterSpacing: 2, color: '#8b8392'}}>CLINICS NEAR YOU</div>
            {/* Meriva card */}
            <div style={{margin: '0 28px', padding: '30px 32px 32px', borderRadius: 34, background: '#fff', boxShadow: `0 10px 34px rgba(84,32,111,${0.08 + 0.14 * highlight})`, border: `3px solid rgba(197,43,131,${highlight})`, transform: `scale(${press})`}}>
              <div style={{display: 'flex', gap: 22, alignItems: 'center'}}>
                <div style={{width: 76, height: 76, borderRadius: 22, background: `linear-gradient(135deg, ${C.purple}, ${C.magenta})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <svg width="40" height="40" viewBox="0 0 24 24"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" fill="#fff" /></svg>
                </div>
                <div>
                  <div style={{fontSize: 36, fontWeight: 800, color: '#1d1a20', letterSpacing: -0.5}}>Meriva Medical Centre</div>
                  <div style={{fontSize: 26, fontWeight: 500, color: '#6b6472', marginTop: 4}}>Multispeciality clinic · Coimbatore</div>
                </div>
              </div>
              <div style={{display: 'flex', gap: 12, marginTop: 24}}>
                {['General medicine', 'Diagnostics'].map((t) => (
                  <span key={t} style={{fontSize: 23, fontWeight: 600, color: C.purple, background: '#F3EAF6', padding: '9px 18px', borderRadius: 18}}>{t}</span>
                ))}
              </div>
              <div style={{position: 'relative', marginTop: 26, height: 84, borderRadius: 42, background: `linear-gradient(90deg, ${C.purple}, ${C.magenta})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                <span style={{fontSize: 31, fontWeight: 700, color: '#fff'}}>Book consultation</span>
                <div style={{position: 'absolute', left: '50%', top: '50%', width: 700, height: 700, marginLeft: -350, marginTop: -350, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', transform: `scale(${ripple})`, opacity: 1 - ripple}} />
              </div>
            </div>
            {/* generic, unreadable results below: no names, ratings or claims */}
            {[0, 1].map((k) => (
              <div key={k} style={{margin: '22px 28px 0', padding: '30px 32px', borderRadius: 34, background: '#fff', display: 'flex', gap: 22, alignItems: 'center', opacity: 0.85}}>
                <div style={{width: 76, height: 76, borderRadius: 22, background: '#EEEAF1'}} />
                <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
                  <Skeleton w={300 - k * 40} h={24} />
                  <Skeleton w={220 + k * 30} />
                </div>
              </div>
            ))}
          </div>
          {/* the screen brightens to white as it fills the frame */}
          <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [84, 93], [0, 1], clamp)}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
