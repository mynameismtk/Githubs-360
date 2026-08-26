/**
 * HOME
 * Mo, one line of contextual copy, the Liftr, today's check-in card, and a
 * small quick-tools row. One primary action, in the bottom third.
 */

import { useState } from 'react';
import { APP, CHECKIN, HOME_LINES, LIFTR } from '../content';
import { useStore, todayCheckIn, inHeavyRun, statsOf } from '../store/useStore';
import { dayKey, partOfDay } from '../lib/date';
import { navigate } from '../lib/router';
import { haptic } from '../lib/haptics';
import { Mo, type MoMood } from '../components/Mo';
import { CheckInSheet } from './CheckIn';
import { SafetyCard } from '../components/SafetyCard';

function pickLine(store: ReturnType<typeof useStore.getState>): string {
  const stats = statsOf(store);
  const today = todayCheckIn(store);
  const liftToday = store.lifts.some((l) => l.day === dayKey());
  if (stats.showedUp <= 1) return HOME_LINES.firstEver;
  if (inHeavyRun(store)) return HOME_LINES.heavyRun;
  if (liftToday) return HOME_LINES.afterLift;
  if (today) return HOME_LINES.afterCheckIn;
  const part = partOfDay();
  const pool = HOME_LINES[part];
  return pool[new Date().getDate() % pool.length];
}

export function Home() {
  const store = useStore();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [safety, setSafety] = useState(false);

  const today = todayCheckIn(store);
  const stats = statsOf(store);
  const line = pickLine(store);
  const liftToday = store.lifts.filter((l) => l.day === dayKey()).length;

  const moMood: MoMood = liftToday
    ? 'proud'
    : today
      ? 'warm'
      : partOfDay() === 'night'
        ? 'sleepy'
        : 'listening';

  return (
    <div className="screen">
      <header className="row row--between" style={{ marginBottom: 'var(--s-6)' }}>
        <div>
          <div className="eyebrow">{APP.name}</div>
          <div className="tiny dim">{APP.tagline}</div>
        </div>
        <button
          className="btn btn--quiet"
          aria-label="Settings"
          onClick={() => navigate('/settings')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15a1.7 1.7 0 0 0-1.6-1H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 3 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 3.4V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 9h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <div className="center stack" style={{ alignItems: 'center', marginBottom: 'var(--s-6)' }}>
        <Mo mood={moMood} size={116} />
        <p className="serif" style={{ fontSize: 'var(--t-22)', maxWidth: '24ch', marginTop: 'var(--s-3)' }}>
          {store.settings.name ? `${store.settings.name}. ${line}` : line}
        </p>
        <p className="tiny dim">
          You have shown up {stats.showedUp} {stats.showedUp === 1 ? 'time' : 'times'}. That number cannot go down.
        </p>
      </div>

      <button
        className="liftr"
        onClick={() => {
          haptic('soft');
          navigate('/liftr');
        }}
      >
        {LIFTR.button}
        <span className="liftr__sub">{LIFTR.buttonSub}</span>
      </button>

      <div style={{ height: 'var(--s-5)' }} />

      {today ? (
        <div className="card">
          <div className="row row--between">
            <div>
              <div className="eyebrow">Today</div>
              <div className="tiny dim">
                Mood {CHECKIN.moodFaces[today.mood - 1].toLowerCase()} · energy{' '}
                {CHECKIN.energyLabels[today.energy - 1].toLowerCase()} · sleep{' '}
                {CHECKIN.sleepLabels[today.sleep].toLowerCase()}
              </div>
            </div>
            <button className="btn btn--quiet" onClick={() => navigate('/reflectr')}>
              History
            </button>
          </div>
        </div>
      ) : (
        <button className="card card--tap" onClick={() => setCheckInOpen(true)}>
          <div className="row row--between">
            <div>
              <div className="serif" style={{ fontSize: 'var(--t-22)' }}>
                {CHECKIN.title}
              </div>
              <div className="small dim">Four taps. No typing.</div>
            </div>
            <span aria-hidden="true" className="dim">
              →
            </span>
          </div>
        </button>
      )}

      <div style={{ height: 'var(--s-5)' }} />

      <div className="quickrow">
        <QuickTool label="Reframe" to="/reframr" d="M4 6h16M4 12h10M4 18h13" />
        <QuickTool label="Breathe" to="/groundr/breathing/coherent" d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
        <QuickTool label="Sounds" to="/groundr/sounds" d="M4 9v6h4l5 4V5L8 9H4Zm13-1a5 5 0 0 1 0 8" />
        <QuickTool label="Body scan" to="/groundr/bodyscan/10" d="M12 3v18M8 7h8M7 12h10M8 17h8" />
      </div>

      {checkInOpen && (
        <CheckInSheet
          onClose={() => setCheckInOpen(false)}
          onDone={(low) => {
            setCheckInOpen(false);
            // Two lowest-possible moods in a row surfaces a calm card. Nothing is forced.
            const s = useStore.getState();
            if (low && inHeavyRun(s) && Date.now() - s.safetyCardShown > 12 * 3600_000) {
              s.noteSafetyCard();
              setSafety(true);
            }
          }}
        />
      )}

      {safety && (
        <SafetyCard
          region={store.settings.region}
          onClose={() => setSafety(false)}
          onSit={() => {
            setSafety(false);
            navigate('/liftr');
          }}
        />
      )}
    </div>
  );
}

function QuickTool({ label, to, d }: { label: string; to: string; d: string }) {
  return (
    <button
      className="quick"
      onClick={() => {
        haptic('tap');
        navigate(to);
      }}
      aria-label={label}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}
