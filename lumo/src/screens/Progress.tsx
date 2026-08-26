/**
 * PERSONAL PROGRESS — de-gamified.
 * Cumulative counts only. No streaks, no XP, no badges, no leaderboard,
 * nothing that can be broken or lost.
 */

import { useMemo } from 'react';
import { CATEGORY_LABEL, PROGRESS } from '../content';
import { lastNDays, statsOf, useStore } from '../store/useStore';
import { buildInsights } from '../lib/insights';
import { MoodChart } from '../components/MoodChart';
import { Card, PageHead, Stat } from '../components/ui';
import { Mo } from '../components/Mo';

export function Progress() {
  const store = useStore();
  const stats = statsOf(store);
  const chart = useMemo(() => lastNDays(store, 90), [store]);
  const insights = useMemo(() => buildInsights(store.checkIns, store.lifts), [store.checkIns, store.lifts]);

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of store.lifts) m.set(l.category, (m.get(l.category) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [store.lifts]);

  const hasChart = chart.some((d) => d.mood !== undefined);

  return (
    <div className="screen">
      <PageHead title={PROGRESS.title} />

      <Card className="center">
        <Mo mood={stats.showedUp > 20 ? 'proud' : 'warm'} size={92} />
        <div className="stat__n serif" style={{ fontSize: 'var(--t-34)', marginTop: 'var(--s-3)' }}>
          {stats.showedUp}
        </div>
        <div style={{ fontWeight: 500 }}>{PROGRESS.showedUp}</div>
        <p className="tiny dim" style={{ marginTop: 'var(--s-2)' }}>
          {PROGRESS.showedUpSub}
        </p>
      </Card>

      <div style={{ height: 'var(--s-5)' }} />

      <div className="statgrid">
        <Stat n={stats.lifts} label="lifts, all time" />
        <Stat n={stats.checkIns} label="check-ins" />
        <Stat n={stats.reframes} label="reframes" />
        <Stat n={stats.groundedMinutes} label="minutes grounded" />
        <Stat n={stats.daysOpened} label="days opened" />
        <Stat n={store.lessonsDone.length} label="lessons read" />
      </div>

      <hr className="divider" />

      <span className="eyebrow">{PROGRESS.chartTitle}</span>
      <div style={{ height: 'var(--s-3)' }} />
      {hasChart ? <MoodChart data={chart} /> : <p className="small dim">{PROGRESS.chartEmpty}</p>}

      {byCategory.length > 0 && (
        <>
          <hr className="divider" />
          <span className="eyebrow">Where your lifts have been</span>
          <div className="row row--wrap" style={{ marginTop: 'var(--s-3)' }}>
            {byCategory.map(([cat, n]) => (
              <span className="tag" key={cat}>
                {CATEGORY_LABEL[cat as keyof typeof CATEGORY_LABEL]} · {n}
              </span>
            ))}
          </div>
        </>
      )}

      <hr className="divider" />

      <span className="eyebrow">{PROGRESS.patternIntro}</span>
      <div className="stack" style={{ marginTop: 'var(--s-3)' }}>
        {insights.length === 0 ? (
          <p className="small dim">{PROGRESS.patternEmpty}</p>
        ) : (
          insights.map((i) => (
            <Card key={i.id} flat>
              <p className="small">{i.text}</p>
            </Card>
          ))
        )}
      </div>

      <div style={{ height: 'var(--s-6)' }} />
      <p className="tiny dim center">{PROGRESS.noStreaks}</p>
    </div>
  );
}
