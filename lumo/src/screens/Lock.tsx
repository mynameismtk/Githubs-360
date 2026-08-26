/**
 * PASSCODE LOCK — optional, off by default.
 * The code is kept on the device like everything else. It protects the journal
 * from someone picking up the phone; it is not encryption and does not pretend
 * to be. There is no recovery, which is said plainly when it is set.
 */

import { useState } from 'react';
import { LOCK } from '../content';
import { useStore } from '../store/useStore';
import { haptic } from '../lib/haptics';
import { navigate } from '../lib/router';
import { Button } from '../components/ui';
import { Mo } from '../components/Mo';

function Keypad({ onDigit, onDelete }: { onDigit: (d: string) => void; onDelete: () => void }) {
  return (
    <div className="keypad">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
        <button key={d} className="key" onClick={() => onDigit(d)} aria-label={d}>
          {d}
        </button>
      ))}
      <span />
      <button className="key" onClick={() => onDigit('0')} aria-label="0">
        0
      </button>
      <button className="key" onClick={onDelete} aria-label="Delete">
        ⌫
      </button>
    </div>
  );
}

function Dots({ n }: { n: number }) {
  return (
    <div className="row" style={{ justifyContent: 'center', gap: 'var(--s-4)' }} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={`pin ${i < n ? 'pin--on' : ''}`} />
      ))}
    </div>
  );
}

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const code = useStore((s) => s.settings.lockCode);
  const [entry, setEntry] = useState('');
  const [wrong, setWrong] = useState(false);

  const push = (d: string) => {
    haptic('tap');
    const next = entry + d;
    if (next.length < 4) {
      setEntry(next);
      return;
    }
    if (next === code) {
      haptic('complete');
      onUnlock();
    } else {
      setWrong(true);
      setEntry('');
    }
  };

  return (
    <div className="flow">
      <div className="flow__inner">
        <div className="flow__body center" style={{ alignItems: 'center' }}>
          <div className="stack" style={{ alignItems: 'center' }}>
            <Mo mood="resting" size={110} />
            <h2>{LOCK.title}</h2>
            <p className="dim small">{wrong ? LOCK.wrong : LOCK.prompt}</p>
            <Dots n={entry.length} />
          </div>
        </div>
        <Keypad onDigit={push} onDelete={() => setEntry(entry.slice(0, -1))} />
      </div>
    </div>
  );
}

export function SetCode() {
  const patch = useStore((s) => s.patchSettings);
  const [first, setFirst] = useState('');
  const [entry, setEntry] = useState('');
  const [msg, setMsg] = useState(LOCK.set);

  const push = (d: string) => {
    haptic('tap');
    const next = entry + d;
    if (next.length < 4) {
      setEntry(next);
      return;
    }
    if (!first) {
      setFirst(next);
      setEntry('');
      setMsg(LOCK.confirm);
      return;
    }
    if (next === first) {
      haptic('complete');
      patch({ lockCode: next });
      navigate('/settings');
    } else {
      setFirst('');
      setEntry('');
      setMsg(LOCK.mismatch);
    }
  };

  return (
    <div className="flow">
      <div className="flow__inner">
        <div className="row row--between">
          <span className="eyebrow">Passcode</span>
          <button className="btn btn--quiet" onClick={() => navigate('/settings')}>
            Cancel
          </button>
        </div>
        <div className="flow__body center" style={{ alignItems: 'center' }}>
          <div className="stack" style={{ alignItems: 'center' }}>
            <Mo mood="listening" size={92} />
            <p className="serif" style={{ fontSize: 'var(--t-22)' }}>
              {msg}
            </p>
            <Dots n={entry.length} />
            <p className="tiny dim" style={{ maxWidth: '30ch', textAlign: 'center' }}>
              There is no way to recover this code, because there is no account to recover it from.
            </p>
          </div>
        </div>
        <Keypad onDigit={push} onDelete={() => setEntry(entry.slice(0, -1))} />
        <div style={{ height: 'var(--s-4)' }} />
        <Button variant="quiet" block onClick={() => navigate('/settings')}>
          Not now
        </Button>
      </div>
    </div>
  );
}
