/**
 * ONBOARDING — five screens, all skippable, no account, nothing mandatory.
 * The disclaimer is said once, plainly, and never repeated as a nag.
 */

import { useState } from 'react';
import { APP, DISCLAIMER, REGIONS } from '../content';
import type { RegionCode } from '../content/crisis';
import { useStore } from '../store/useStore';
import { askForNotifications } from '../lib/reminders';
import { guessRegion } from '../content/crisis';
import { Button } from '../components/ui';
import { Mo } from '../components/Mo';

export function Onboarding() {
  const complete = useStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [region, setRegion] = useState<RegionCode>(guessRegion());
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState('');

  const finish = () => complete({ region, reminderTime: time, name: name.trim() });

  const screens = [
    <>
      <Mo mood="warm" size={140} />
      <h1 className="serif">{APP.name}</h1>
      <p className="serif" style={{ fontSize: 'var(--t-22)' }}>
        {APP.tagline}
      </p>
      <p className="dim">
        This is a set of small tools for low mood. The main one offers you one thing to do, sized so that it is
        possible on a bad day. Everything else supports that.
      </p>
    </>,
    <>
      <Mo mood="listening" size={120} />
      <h2>What this is not</h2>
      <p className="dim">{DISCLAIMER.onboarding}</p>
      <p className="dim">
        There is no account, no server, and nothing you write here is read by anyone. Nothing is a streak. Nothing can
        be broken.
      </p>
    </>,
    <>
      <Mo mood="listening" size={110} />
      <h2>Where are you?</h2>
      <p className="dim">This sets which crisis lines the app dials. You can change it later.</p>
      <select aria-label="Region" value={region} onChange={(e) => setRegion(e.target.value as RegionCode)}>
        {REGIONS.map((r) => (
          <option key={r.code} value={r.code}>
            {r.label}
          </option>
        ))}
      </select>
    </>,
    <>
      <Mo mood="sleepy" size={110} />
      <h2>One invitation a day?</h2>
      <p className="dim">
        At most one, at a time you choose, and worded as an invitation. Never a reminder that you have missed
        something.
      </p>
      <input
        type="time"
        aria-label="Invitation time"
        value={time ?? '19:00'}
        onChange={(e) => setTime(e.target.value)}
      />
      <Button
        variant="secondary"
        block
        onClick={async () => {
          const ok = await askForNotifications();
          if (!ok) setTime(null);
        }}
      >
        Allow notifications
      </Button>
      <Button variant="quiet" block onClick={() => setTime(null)}>
        No notifications
      </Button>
    </>,
    <>
      <Mo mood="glowing" size={120} />
      <h2>What should Mo call you?</h2>
      <p className="dim">Optional. It stays on this device.</p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Leave it blank if you like" aria-label="Your name" />
    </>,
  ];

  const last = step === screens.length - 1;

  return (
    <div className="flow">
      <div className="flow__inner">
        <div className="row row--between">
          <span className="tiny dim">
            {step + 1} of {screens.length}
          </span>
          <button className="btn btn--quiet" onClick={finish}>
            Skip
          </button>
        </div>

        <div className="flow__body center" style={{ alignItems: 'center' }}>
          <div className="stack" style={{ alignItems: 'center', textAlign: 'center', maxWidth: '34ch' }}>
            {screens[step]}
          </div>
        </div>

        <div className="flow__actions">
          <Button block onClick={() => (last ? finish() : setStep(step + 1))}>
            {last ? 'Open Lumo' : 'Next'}
          </Button>
          {step > 0 && !last && (
            <Button variant="quiet" block onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
