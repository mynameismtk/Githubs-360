/**
 * THE LIFTR
 *
 * Path A — Help me move: one question, one offer, one timer, one line of credit.
 * Path B — Just sit with me: no tasks, no questions, no upsell, no time limit.
 *
 * Design rules enforced here:
 *  - never a list of options where one offer will do
 *  - "Too much right now" always drops a full tier and never runs out
 *  - Done is available from the first second of the timer, and ending early counts
 *  - the Anchr is one tap away throughout
 *  - no paywall can appear during or after either path
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ACTIONS, CATEGORY_LABEL, GROUNDING_CARDS, LIFTR, tierForEnergy } from '../content';
import type { ActionTier, BAAction } from '../content/actions';
import { useStore } from '../store/useStore';
import { back, navigate } from '../lib/router';
import { haptic } from '../lib/haptics';
import { chime, playSound, stopSound } from '../lib/audio';
import { keepAwake, releaseAwake } from '../lib/wakelock';
import { mmss } from '../lib/date';
import { Mo } from '../components/Mo';
import { AnchrFab } from '../components/AnchrFab';
import { SafetyCard } from '../components/SafetyCard';
import { Button, DotRow } from '../components/ui';

type Stage = 'choose' | 'energy' | 'offer' | 'timer' | 'done' | 'sit';

function pick(tier: ActionTier, exclude: string[]): BAAction {
  const pool = ACTIONS.filter((a) => a.tier === tier && !exclude.includes(a.id));
  const from = pool.length ? pool : ACTIONS.filter((a) => a.tier === tier);
  return from[Math.floor(Math.random() * from.length)];
}

export function Liftr() {
  const [stage, setStage] = useState<Stage>('choose');
  const [tier, setTier] = useState<ActionTier>(3);
  const [offer, setOffer] = useState<BAAction | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [endedEarly, setEndedEarly] = useState(false);
  const [notSafe, setNotSafe] = useState(false);

  const addLift = useStore((s) => s.addLift);
  const addGround = useStore((s) => s.addGround);
  const quietPaywall = useStore((s) => s.quietPaywall);
  const region = useStore((s) => s.settings.region);

  const startedAt = useRef(0);

  /* ---------- timer ---------- */
  useEffect(() => {
    if (stage !== 'timer' && stage !== 'sit') return;
    startedAt.current = Date.now();
    void keepAwake();
    const id = window.setInterval(() => {
      setElapsed(Math.round((Date.now() - startedAt.current) / 1000));
    }, 250);
    return () => {
      window.clearInterval(id);
      void releaseAwake();
    };
  }, [stage]);

  /* ---------- Path B ambience ---------- */
  useEffect(() => {
    if (stage !== 'sit') return;
    quietPaywall(120); // no paywall during or after a comfort session
    playSound('night', 0.32);
    return () => stopSound();
  }, [stage, quietPaywall]);

  const offerNew = useCallback(
    (t: ActionTier, exclude: string[]) => {
      const next = pick(t, exclude);
      setOffer(next);
      setSeen((s) => [...s, next.id]);
    },
    [],
  );

  const chooseEnergy = (v: number) => {
    const t = tierForEnergy(v);
    setTier(t);
    setNote(null);
    offerNew(t, []);
    setStage('offer');
  };

  const tooMuch = () => {
    if (tier === 1) {
      setNote(LIFTR.atFloor);
      offerNew(1, seen);
      return;
    }
    const next = (tier - 1) as ActionTier;
    setTier(next);
    setNote(LIFTR.droppedTier);
    offerNew(next, seen);
  };

  const finish = (early: boolean) => {
    if (!offer) return;
    const seconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    addLift(offer, seconds, early);
    setEndedEarly(early);
    haptic('complete');
    chime();
    quietPaywall(60);
    setStage('done');
  };

  const leaveSit = () => {
    const seconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    if (seconds > 20) addGround({ tool: 'sit', label: 'Sat with Mo', seconds });
    stopSound();
    navigate('/');
  };

  return (
    <div className="flow">
      <div className="flow__inner">
        {stage === 'choose' && <Choose onA={() => setStage('energy')} onB={() => setStage('sit')} onClose={() => back()} />}

        {stage === 'energy' && (
          <>
            <TopBar onClose={() => back()} />
            <div className="flow__body">
              <Mo mood="listening" size={110} />
              <h2>{LIFTR.energyQ}</h2>
              <DotRow value={null} onChange={chooseEnergy} labels={LIFTR.energyLabels} name="Energy" />
              <p className="tiny dim center">No wrong answer. Nobody sees this.</p>
            </div>
          </>
        )}

        {stage === 'offer' && offer && (
          <>
            <TopBar onClose={() => back()} />
            <div className="flow__body">
              <div className="stack stack--tight">
                <span className="eyebrow">{LIFTR.offerLead}</span>
                <h2 className="serif">{offer.text}</h2>
                <div className="row row--wrap" style={{ marginTop: 'var(--s-3)' }}>
                  <span className="tag">{CATEGORY_LABEL[offer.category]}</span>
                  <span className="tag">about {offer.minutes} min</span>
                  <span className="tag">tier {offer.tier}</span>
                </div>
              </div>
              {note && <p className="small dim">{note}</p>}
            </div>
            <div className="flow__actions">
              <Button block onClick={() => setStage('timer')}>
                {LIFTR.accept}
              </Button>
              <Button variant="secondary" block onClick={() => offerNew(tier, seen)}>
                {LIFTR.swap}
              </Button>
              <Button variant="quiet" block onClick={tooMuch}>
                {LIFTR.tooMuch}
              </Button>
            </div>
          </>
        )}

        {stage === 'timer' && offer && (
          <>
            <TopBar onClose={() => finish(true)} label="Stop and log it" />
            <div className="flow__body center">
              <div style={{ display: 'grid', placeItems: 'center', gap: 'var(--s-6)' }}>
                <Mo mood="glowing" size={150} />
                <div>
                  <div className="serif" style={{ fontSize: 'var(--t-34)' }}>{mmss(elapsed)}</div>
                  <p className="small dim">of about {offer.minutes} minutes</p>
                </div>
                <p className="serif" style={{ fontSize: 'var(--t-22)' }}>{offer.text}</p>
                <p className="small dim">{LIFTR.timerNote}</p>
              </div>
            </div>
            <div className="flow__actions">
              <Button block onClick={() => finish(elapsed < offer.minutes * 60 * 0.6)}>
                {LIFTR.done}
              </Button>
            </div>
          </>
        )}

        {stage === 'done' && (
          <div className="flow__body center">
            <div style={{ display: 'grid', placeItems: 'center', gap: 'var(--s-5)' }}>
              <Mo mood="proud" size={150} />
              <h2>{endedEarly ? LIFTR.earlyTitle : LIFTR.completeTitle}</h2>
              <p className="dim">{endedEarly ? LIFTR.earlySub : LIFTR.completeSub}</p>
              <div style={{ width: '100%', display: 'grid', gap: 'var(--s-3)', marginTop: 'var(--s-6)' }}>
                <Button block onClick={() => navigate('/')}>
                  Back to home
                </Button>
                <Button variant="quiet" block onClick={() => setStage('sit')}>
                  Sit with Mo for a bit
                </Button>
              </div>
            </div>
          </div>
        )}

        {stage === 'sit' && <Sit elapsed={elapsed} onLeave={leaveSit} onNotSafe={() => setNotSafe(true)} />}
      </div>

      {/* Path B has its own, more explicit safety link — one pill is enough. */}
      {stage !== 'sit' && <AnchrFab inFlow />}

      {notSafe && (
        <SafetyCard
          region={region}
          variant="not-safe"
          onClose={() => setNotSafe(false)}
          onSit={() => {
            setNotSafe(false);
            setStage('sit');
          }}
        />
      )}
    </div>
  );
}

function TopBar({ onClose, label = 'Close' }: { onClose: () => void; label?: string }) {
  return (
    <div className="row row--between">
      <span className="eyebrow">The Liftr</span>
      <button className="btn btn--quiet" onClick={onClose} aria-label={label}>
        {label}
      </button>
    </div>
  );
}

function Choose({ onA, onB, onClose }: { onA: () => void; onB: () => void; onClose: () => void }) {
  return (
    <>
      <TopBar onClose={onClose} />
      <div className="flow__body">
        <Mo mood="warm" size={110} />
        <h2>{LIFTR.chooseTitle}</h2>
        <div className="stack">
          <button className="card card--tap" onClick={onA}>
            <div className="serif" style={{ fontSize: 'var(--t-22)' }}>{LIFTR.pathA}</div>
            <div className="small dim">{LIFTR.pathASub}</div>
          </button>
          <button className="card card--tap" onClick={onB}>
            <div className="serif" style={{ fontSize: 'var(--t-22)' }}>{LIFTR.pathB}</div>
            <div className="small dim">{LIFTR.pathBSub}</div>
          </button>
        </div>
      </div>
    </>
  );
}

/** Path B. Cards advance themselves so the user never has to tap. */
function Sit({ elapsed, onLeave, onNotSafe }: { elapsed: number; onLeave: () => void; onNotSafe: () => void }) {
  const order = useMemo(() => {
    const a = [...GROUNDING_CARDS];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, []);
  const index = Math.floor(elapsed / 12) % order.length;

  return (
    <div className="sit">
      <div className="sit__top">
        <span className="eyebrow">{LIFTR.sitTitle}</span>
        <button className="btn btn--quiet" onClick={onLeave}>
          {LIFTR.sitLeave}
        </button>
      </div>
      <div className="sit__body">
        <Mo mood="glowing" size={190} />
        <p key={index} className="sit__card serif">
          {order[index]}
        </p>
      </div>
      <button className="sit__notsafe" onClick={onNotSafe}>
        {LIFTR.notSafe}
      </button>
    </div>
  );
}
