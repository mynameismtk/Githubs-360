/**
 * THE REFLECTR — history, search, detail and export.
 * Everything here was written by the user and never leaves the device unless
 * they choose to export it.
 */

import { useMemo, useState } from 'react';
import { CHECKIN, PROGRESS } from '../content';
import { useStore } from '../store/useStore';
import { buildInsights } from '../lib/insights';
import { exportCheckInsCSV, exportEverythingCSV, printSummary } from '../lib/exporters';
import { formatDay, formatTime } from '../lib/date';
import { navigate, back } from '../lib/router';
import { BackLink, Button, Card, Empty, PageHead } from '../components/ui';
import { Mo } from '../components/Mo';

const FACES = ['😞', '🙁', '😐', '🙂', '😌'];

export function Reflectr() {
  const store = useStore();
  const [q, setQ] = useState('');
  const [showExport, setShowExport] = useState(false);

  const insights = useMemo(
    () => buildInsights(store.checkIns, store.lifts),
    [store.checkIns, store.lifts],
  );

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return store.checkIns;
    return store.checkIns.filter(
      (c) =>
        c.note?.toLowerCase().includes(needle) ||
        c.chips.some((chip) => chip.includes(needle)) ||
        formatDay(c.day).toLowerCase().includes(needle) ||
        CHECKIN.moodFaces[c.mood - 1].toLowerCase().includes(needle),
    );
  }, [q, store.checkIns]);

  return (
    <div className="screen">
      <PageHead title="Reflectr" sub={`${store.checkIns.length} check-ins, all on this device.`} />

      {insights.length > 0 && (
        <Card className="stack stack--tight" flat>
          <span className="eyebrow">{PROGRESS.patternIntro}</span>
          {insights.slice(0, 2).map((i) => (
            <p key={i.id} className="small">
              {i.text}
            </p>
          ))}
        </Card>
      )}

      <div style={{ height: 'var(--s-4)' }} />

      <label className="sr-only" htmlFor="reflectr-search">
        Search your check-ins
      </label>
      <input
        id="reflectr-search"
        type="search"
        placeholder="Search notes, context or a day"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div style={{ height: 'var(--s-4)' }} />

      {results.length === 0 ? (
        <Empty>
          {store.checkIns.length === 0
            ? 'No check-ins yet. The first one takes about thirty seconds.'
            : 'Nothing matched that.'}
        </Empty>
      ) : (
        <div className="stack">
          {results.map((c) => (
            <Card key={c.id} onClick={() => navigate(`/reflectr/${c.id}`)} ariaLabel={`Check-in from ${formatDay(c.day)}`}>
              <div className="row row--between">
                <div className="row">
                  <span style={{ fontSize: 24 }} aria-hidden="true">
                    {FACES[c.mood - 1]}
                  </span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{formatDay(c.day)}</div>
                    <div className="tiny dim">
                      {CHECKIN.moodFaces[c.mood - 1]} · energy {CHECKIN.energyLabels[c.energy - 1].toLowerCase()} ·{' '}
                      sleep {CHECKIN.sleepLabels[c.sleep].toLowerCase()}
                    </div>
                  </div>
                </div>
                <span className="tiny dim">{formatTime(c.ts)}</span>
              </div>
              {(c.chips.length > 0 || c.note) && (
                <div style={{ marginTop: 'var(--s-3)' }} className="row row--wrap">
                  {c.chips.map((chip) => (
                    <span className="tag" key={chip}>
                      {chip}
                    </span>
                  ))}
                  {c.note && <span className="tiny dim">{c.note.slice(0, 60)}{c.note.length > 60 ? '…' : ''}</span>}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <hr className="divider" />

      <Button variant="secondary" block onClick={() => setShowExport(!showExport)}>
        Export
      </Button>

      {showExport && (
        <div className="stack" style={{ marginTop: 'var(--s-4)' }}>
          <Button variant="secondary" block onClick={() => exportCheckInsCSV(store.checkIns)}>
            Check-ins as CSV
          </Button>
          <Button
            variant="secondary"
            block
            onClick={() => {
              if (!store.entitlement.fullAccess) return navigate('/paywall');
              exportEverythingCSV(store);
            }}
          >
            Everything as CSV {store.entitlement.fullAccess ? '' : '· Full Access'}
          </Button>
          <Button
            variant="secondary"
            block
            onClick={() => {
              if (!store.entitlement.fullAccess) return navigate('/paywall');
              printSummary({ name: store.settings.name, ...store });
            }}
          >
            One-page summary for a clinician {store.entitlement.fullAccess ? '' : '· Full Access'}
          </Button>
          <p className="tiny dim">
            The summary opens a print view. Every browser can save that as a PDF.
          </p>
        </div>
      )}
    </div>
  );
}

export function ReflectrEntry({ id }: { id: string }) {
  const entry = useStore((s) => s.checkIns.find((c) => c.id === id));
  const lifts = useStore((s) => s.lifts.filter((l) => l.day === entry?.day));

  if (!entry) {
    return (
      <div className="screen">
        <BackLink to="/reflectr" />
        <Empty>That entry is not here any more.</Empty>
      </div>
    );
  }

  return (
    <div className="screen">
      <BackLink to="/reflectr" />
      <div className="center stack" style={{ alignItems: 'center', margin: 'var(--s-5) 0 var(--s-8)' }}>
        <span style={{ fontSize: 46 }} aria-hidden="true">
          {FACES[entry.mood - 1]}
        </span>
        <h2>{formatDay(entry.day)}</h2>
        <p className="dim small">{formatTime(entry.ts)}</p>
      </div>

      <div className="statgrid">
        <div className="stat">
          <div className="stat__n">{CHECKIN.moodFaces[entry.mood - 1]}</div>
          <div className="stat__l">Mood</div>
        </div>
        <div className="stat">
          <div className="stat__n">{CHECKIN.energyLabels[entry.energy - 1]}</div>
          <div className="stat__l">Energy</div>
        </div>
        <div className="stat">
          <div className="stat__n">{CHECKIN.sleepLabels[entry.sleep]}</div>
          <div className="stat__l">Sleep</div>
        </div>
        <div className="stat">
          <div className="stat__n">{lifts.length}</div>
          <div className="stat__l">Lifts that day</div>
        </div>
      </div>

      {entry.chips.length > 0 && (
        <>
          <hr className="divider" />
          <span className="eyebrow">Context</span>
          <div className="row row--wrap" style={{ marginTop: 'var(--s-3)' }}>
            {entry.chips.map((c) => (
              <span className="tag" key={c}>
                {c}
              </span>
            ))}
          </div>
        </>
      )}

      {entry.note && (
        <>
          <hr className="divider" />
          <span className="eyebrow">Note</span>
          <p style={{ marginTop: 'var(--s-3)' }}>{entry.note}</p>
        </>
      )}

      {lifts.length > 0 && (
        <>
          <hr className="divider" />
          <span className="eyebrow">What you did</span>
          <div className="stack" style={{ marginTop: 'var(--s-3)' }}>
            {lifts.map((l) => (
              <div className="listitem" key={l.id}>
                <Mo mood="proud" size={34} animate={false} />
                <div className="grow">
                  <div className="small">{l.label}</div>
                  <div className="tiny dim">{Math.max(1, Math.round(l.seconds / 60))} min</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ height: 'var(--s-8)' }} />
      <Button variant="quiet" block onClick={() => back('/reflectr')}>
        Back to history
      </Button>
    </div>
  );
}
