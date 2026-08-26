/**
 * THE GROUNDR — sensory and body tools.
 * Deliberately not the headline. The honesty note at the top says so.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { BODY_SCAN, BREATHING, GROUNDR, SOUNDSCAPES, VISUALISATIONS } from '../content';
import type { SoundKind } from '../content/soundscapes';
import { useStore } from '../store/useStore';
import { navigate, back } from '../lib/router';
import { mmss } from '../lib/date';
import { haptic } from '../lib/haptics';
import { chime, playSound, playingSound, setVolume, stopSound } from '../lib/audio';
import { canSpeak, hush, speak } from '../lib/speech';
import { keepAwake, releaseAwake } from '../lib/wakelock';
import { BackLink, Button, Card, Meter, PageHead } from '../components/ui';
import { Mo } from '../components/Mo';

/* ------------------------------------------------------------------ hub */

export function Groundr() {
  const full = useStore((s) => s.entitlement.fullAccess);
  return (
    <div className="screen">
      <PageHead title={GROUNDR.title} sub={GROUNDR.blurb} />

      <Card flat>
        <p className="small dim">{GROUNDR.honesty}</p>
      </Card>

      <hr className="divider" />

      <span className="eyebrow">Body scan</span>
      <div className="row" style={{ marginTop: 'var(--s-3)' }}>
        {[5, 10, 20].map((m) => (
          <Button key={m} variant="secondary" onClick={() => navigate(`/groundr/bodyscan/${m}`)}>
            {m} min
          </Button>
        ))}
      </div>

      <hr className="divider" />

      <span className="eyebrow">Breathing</span>
      <div className="stack" style={{ marginTop: 'var(--s-3)' }}>
        {Object.values(BREATHING).map((b) => (
          <Card key={b.id} onClick={() => navigate(`/groundr/breathing/${b.id}`)}>
            <div style={{ fontWeight: 600 }}>{b.title}</div>
            <div className="small dim">{b.blurb}</div>
          </Card>
        ))}
      </div>

      <hr className="divider" />

      <span className="eyebrow">Visualisations</span>
      <div className="stack" style={{ marginTop: 'var(--s-3)' }}>
        {VISUALISATIONS.map((v) => {
          const locked = !!v.premium && !full;
          return (
            <Card
              key={v.id}
              onClick={() => navigate(locked ? '/paywall' : `/groundr/vis/${v.id}`)}
              ariaLabel={locked ? `${v.title}, needs Full Access` : v.title}
            >
              <div className="row row--between">
                <div>
                  <div style={{ fontWeight: 600 }}>{v.title}</div>
                  <div className="small dim">{v.blurb}</div>
                </div>
                <span className="tag">{locked ? 'Full Access' : `${v.minutes} min`}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <hr className="divider" />

      <Card onClick={() => navigate('/groundr/sounds')}>
        <div className="row row--between">
          <div>
            <div style={{ fontWeight: 600 }}>Soundscapes</div>
            <div className="small dim">Generated on the device. They work offline.</div>
          </div>
          <span aria-hidden="true" className="dim">
            →
          </span>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------- script player */

function ScriptPlayer({
  title,
  lines,
  totalSeconds,
  tool,
}: {
  title: string;
  lines: string[];
  totalSeconds: number;
  tool: 'bodyscan' | 'visualisation';
}) {
  const narration = useStore((s) => s.settings.narration);
  const patch = useStore((s) => s.patchSettings);
  const addGround = useStore((s) => s.addGround);

  const per = totalSeconds / lines.length;
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const spokenRef = useRef(-1);
  const index = Math.min(lines.length - 1, Math.floor(elapsed / per));
  const finished = elapsed >= totalSeconds;

  useEffect(() => {
    void keepAwake();
    const id = window.setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 250);
    return () => {
      window.clearInterval(id);
      hush();
      void releaseAwake();
    };
  }, []);

  useEffect(() => {
    if (narration && spokenRef.current !== index) {
      spokenRef.current = index;
      speak(lines[index]);
    }
  }, [index, lines, narration]);

  useEffect(() => {
    if (!finished) return;
    haptic('complete');
    chime(396, 1.4);
  }, [finished]);

  const stop = () => {
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    if (seconds > 20) addGround({ tool, label: title, seconds });
    back('/groundr');
  };

  return (
    <div className="flow">
      <div className="flow__inner">
        <div className="row row--between">
          <span className="eyebrow">{title}</span>
          <button className="btn btn--quiet" onClick={stop}>
            {finished ? 'Done' : 'Stop here'}
          </button>
        </div>

        <div className="flow__body center">
          <div style={{ display: 'grid', placeItems: 'center', gap: 'var(--s-8)' }}>
            <Mo mood={finished ? 'proud' : 'resting'} size={128} />
            {finished ? (
              <>
                <h2>That is finished.</h2>
                <p className="dim">
                  {Math.round(totalSeconds / 60)} minutes of attention on your own body. Logged.
                </p>
              </>
            ) : (
              <p key={index} className="sit__card serif" style={{ fontSize: 'var(--t-22)' }}>
                {lines[index]}
              </p>
            )}
          </div>
        </div>

        <div className="stack">
          <Meter value={Math.min(elapsed, totalSeconds)} max={totalSeconds} label="Progress" />
          <div className="row row--between tiny dim">
            <span>{mmss(elapsed)}</span>
            <span>{mmss(totalSeconds)}</span>
          </div>
          {canSpeak() && (
            <Button variant="secondary" block onClick={() => patch({ narration: !narration })}>
              {narration ? 'Turn the voice off' : 'Read it aloud'}
            </Button>
          )}
          {finished && (
            <Button block onClick={stop}>
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function BodyScan({ minutes }: { minutes: number }) {
  return (
    <ScriptPlayer
      title={`Body scan · ${minutes} min`}
      lines={BODY_SCAN}
      totalSeconds={minutes * 60}
      tool="bodyscan"
    />
  );
}

export function VisualisationPlayer({ id }: { id: string }) {
  const v = VISUALISATIONS.find((x) => x.id === id);
  if (!v) {
    navigate('/groundr');
    return null;
  }
  return <ScriptPlayer title={v.title} lines={v.script} totalSeconds={v.minutes * 60} tool="visualisation" />;
}

/* ------------------------------------------------------------ breathing */

export function Breathing({ id }: { id: string }) {
  const pattern = BREATHING[id] ?? BREATHING.coherent;
  const addGround = useStore((s) => s.addGround);
  const [tick, setTick] = useState(0);
  const startRef = useRef(Date.now());

  const cycle = useMemo(() => pattern.phases.reduce((n, p) => n + p.seconds, 0), [pattern]);

  useEffect(() => {
    void keepAwake();
    const id2 = window.setInterval(() => setTick((Date.now() - startRef.current) / 1000), 80);
    return () => {
      window.clearInterval(id2);
      void releaseAwake();
    };
  }, []);

  const into = tick % cycle;
  let acc = 0;
  let phase = pattern.phases[0];
  let phaseElapsed = 0;
  for (const p of pattern.phases) {
    if (into < acc + p.seconds) {
      phase = p;
      phaseElapsed = into - acc;
      break;
    }
    acc += p.seconds;
  }
  const cycles = Math.floor(tick / cycle);
  const progress = phaseElapsed / phase.seconds;
  const scale =
    phase.label === 'In' ? 0.55 + 0.45 * progress : phase.label === 'Out' ? 1 - 0.45 * progress : phase.label === 'Hold' ? 1 : 0.55;

  const stop = () => {
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    if (seconds > 20) addGround({ tool: 'breathing', label: pattern.title, seconds });
    back('/groundr');
  };

  return (
    <div className="flow">
      <div className="flow__inner">
        <div className="row row--between">
          <span className="eyebrow">{pattern.title} breathing</span>
          <button className="btn btn--quiet" onClick={stop}>
            Stop here
          </button>
        </div>
        <div className="flow__body center">
          <div style={{ display: 'grid', placeItems: 'center', gap: 'var(--s-8)' }}>
            <div className="orb" style={{ transform: `scale(${scale})` }} aria-hidden="true" />
            <div>
              <div className="serif" style={{ fontSize: 'var(--t-34)' }}>
                {phase.label}
              </div>
              <p className="small dim">
                {Math.ceil(phase.seconds - phaseElapsed)} · {cycles} {cycles === 1 ? 'breath' : 'breaths'}
              </p>
            </div>
            <p className="small dim" style={{ maxWidth: '28ch' }}>
              {pattern.blurb} Stop whenever you want.
            </p>
          </div>
        </div>
        <div className="flow__actions">
          <Button block onClick={stop}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- sounds */

export function Sounds() {
  const full = useStore((s) => s.entitlement.fullAccess);
  const addGround = useStore((s) => s.addGround);
  const [playing, setPlaying] = useState<SoundKind | null>(playingSound());
  const [vol, setVol] = useState(0.5);
  const startRef = useRef(0);

  useEffect(
    () => () => {
      if (startRef.current) {
        const seconds = Math.round((Date.now() - startRef.current) / 1000);
        if (seconds > 30) addGround({ tool: 'sound', label: 'Soundscape', seconds });
      }
    },
    [addGround],
  );

  const toggle = (id: SoundKind, locked: boolean) => {
    if (locked) return navigate('/paywall');
    haptic('tap');
    if (playing === id) {
      stopSound();
      setPlaying(null);
      return;
    }
    playSound(id, vol);
    startRef.current = startRef.current || Date.now();
    setPlaying(id);
  };

  return (
    <div className="screen">
      <BackLink to="/groundr" />
      <PageHead title="Soundscapes" sub="Generated on this device. No download, no signal needed." />

      <div className="stack">
        {SOUNDSCAPES.map((s) => {
          const locked = !!s.premium && !full;
          return (
            <Card key={s.id} onClick={() => toggle(s.id, locked)} ariaLabel={`${s.title}${locked ? ', needs Full Access' : ''}`}>
              <div className="row row--between">
                <div>
                  <div style={{ fontWeight: 600 }}>{s.title}</div>
                  <div className="small dim">{s.blurb}</div>
                </div>
                <span className="tag">{locked ? 'Full Access' : playing === s.id ? 'Playing' : 'Play'}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <hr className="divider" />

      <label className="eyebrow" htmlFor="vol">
        Volume
      </label>
      <input
        id="vol"
        type="range"
        min={0}
        max={100}
        value={Math.round(vol * 100)}
        onChange={(e) => {
          const v = Number(e.target.value) / 100;
          setVol(v);
          setVolume(v);
        }}
        style={{ padding: 0, background: 'none', border: 0 }}
      />

      <p className="tiny dim" style={{ marginTop: 'var(--s-4)' }}>
        On the web, a locked screen may pause audio — that is a browser limit rather than a Lumo one.
      </p>
    </div>
  );
}
