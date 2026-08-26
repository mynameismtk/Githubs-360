/**
 * THE REFRAMR — a CBT thought record in four steps.
 * The seven-column version is too heavy for a depressed user, so this is:
 * thought → shape → what you would say to a friend → a kinder, truer version.
 * Voice input is offered first at step one. Typing always works.
 */

import { useEffect, useRef, useState } from 'react';
import { DISTORTIONS, REFRAMR, REFRAME_STARTERS } from '../content';
import { useStore } from '../store/useStore';
import { canDictate, dictate } from '../lib/speech';
import { haptic } from '../lib/haptics';
import { chime } from '../lib/audio';
import { formatDay } from '../lib/date';
import { back, navigate } from '../lib/router';
import { BackLink, Button, Card, Empty, Meter, PageHead } from '../components/ui';
import { Mo } from '../components/Mo';

export function Reframr() {
  const addReframe = useStore((s) => s.addReframe);
  const [step, setStep] = useState(1);
  const [thought, setThought] = useState('');
  const [shapes, setShapes] = useState<string[]>([]);
  const [friend, setFriend] = useState('');
  const [kinder, setKinder] = useState('');
  const [listening, setListening] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  const toggleMic = () => {
    if (listening) {
      stopRef.current?.();
      stopRef.current = null;
      setListening(false);
      return;
    }
    setListening(true);
    stopRef.current = dictate(
      (text) => setThought(text),
      () => setListening(false),
    );
  };

  const save = () => {
    haptic('complete');
    chime(432, 0.9);
    addReframe({ thought: thought.trim(), distortions: shapes, friendReply: friend.trim(), kinder: kinder.trim() });
    navigate('/reframr/list');
  };

  return (
    <div className="screen">
      <PageHead title={REFRAMR.title} onBack={() => (step === 1 ? back('/') : setStep(step - 1))} />
      <Meter value={step} max={4} label={`Step ${step} of 4`} />
      <div style={{ height: 'var(--s-6)' }} />

      {step === 1 && (
        <div className="stack stack--loose">
          <div className="stack stack--tight">
            <h3>{REFRAMR.step1}</h3>
            <p className="small dim">{REFRAMR.step1Hint}</p>
          </div>
          <textarea
            rows={4}
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="I am letting everyone down."
            aria-label={REFRAMR.step1}
          />
          {canDictate() ? (
            <Button variant={listening ? 'sage' : 'secondary'} block onClick={toggleMic}>
              {listening ? REFRAMR.listening : '🎙  Say it instead'}
            </Button>
          ) : (
            <p className="tiny dim">{REFRAMR.micUnsupported}</p>
          )}
          <Button block disabled={!thought.trim()} onClick={() => setStep(2)}>
            Next
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="stack stack--loose">
          <div className="stack stack--tight">
            <h3>{REFRAMR.step2}</h3>
            <p className="small dim">{REFRAMR.step2Hint}</p>
          </div>
          <div className="stack stack--tight">
            {DISTORTIONS.map((d) => {
              const on = shapes.includes(d.id);
              return (
                <button
                  key={d.id}
                  className={`card card--tap${on ? ' is-selected' : ''}`}
                  aria-pressed={on}
                  onClick={() => {
                    haptic('tap');
                    setShapes(on ? shapes.filter((x) => x !== d.id) : [...shapes, d.id]);
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{d.label}</div>
                  <div className="small dim">{d.plain}</div>
                </button>
              );
            })}
          </div>
          <Button block onClick={() => setStep(3)}>
            {shapes.length ? 'Next' : 'None of these'}
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="stack stack--loose">
          <div className="row">
            <Mo mood="warm" size={60} />
            <div className="stack stack--tight grow">
              <h3>{REFRAMR.step3}</h3>
              <p className="small dim">{REFRAMR.step3Hint}</p>
            </div>
          </div>
          <Card flat>
            <p className="small dim" style={{ marginBottom: 'var(--s-2)' }}>
              They said:
            </p>
            <p className="serif" style={{ fontSize: 'var(--t-22)' }}>
              {thought}
            </p>
          </Card>
          <textarea
            rows={4}
            value={friend}
            onChange={(e) => setFriend(e.target.value)}
            placeholder="I would tell them…"
            aria-label={REFRAMR.step3}
          />
          <Button block disabled={!friend.trim()} onClick={() => setStep(4)}>
            Next
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="stack stack--loose">
          <div className="stack stack--tight">
            <h3>{REFRAMR.step4}</h3>
            <p className="small dim">{REFRAMR.step4Hint}</p>
          </div>
          <div className="row row--wrap">
            {REFRAME_STARTERS.map((s) => (
              <button
                key={s}
                className="chip"
                onClick={() => {
                  haptic('tap');
                  setKinder(kinder ? `${kinder} ${s} ` : `${s} `);
                }}
              >
                {s}…
              </button>
            ))}
          </div>
          <textarea
            rows={4}
            value={kinder}
            onChange={(e) => setKinder(e.target.value)}
            placeholder="A version you could actually believe."
            aria-label={REFRAMR.step4}
          />
          <Button block disabled={!kinder.trim()} onClick={save}>
            {REFRAMR.save}
          </Button>
        </div>
      )}

      <div style={{ height: 'var(--s-6)' }} />
      <Button variant="quiet" block onClick={() => navigate('/reframr/list')}>
        {REFRAMR.listTitle}
      </Button>
    </div>
  );
}

export function ReframeList() {
  const reframes = useStore((s) => s.reframes);
  return (
    <div className="screen">
      <BackLink to="/reframr" />
      <PageHead title={REFRAMR.listTitle} sub={`${reframes.length} so far.`} />
      {reframes.length === 0 ? (
        <Empty>{REFRAMR.empty}</Empty>
      ) : (
        <div className="stack">
          {reframes.map((r) => (
            <Card key={r.id}>
              <div className="tiny dim">{formatDay(r.day)}</div>
              <p className="small dim" style={{ marginTop: 'var(--s-2)' }}>
                {r.thought}
              </p>
              <p className="serif" style={{ fontSize: 'var(--t-17)', marginTop: 'var(--s-3)' }}>
                {r.kinder}
              </p>
              {r.distortions.length > 0 && (
                <div className="row row--wrap" style={{ marginTop: 'var(--s-3)' }}>
                  {r.distortions.map((d) => (
                    <span className="tag" key={d}>
                      {DISTORTIONS.find((x) => x.id === d)?.label ?? d}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      <div style={{ height: 'var(--s-6)' }} />
      <Button block onClick={() => navigate('/reframr')}>
        Start a new one
      </Button>
    </div>
  );
}
