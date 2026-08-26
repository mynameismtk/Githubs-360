/**
 * A soft 90-day mood and energy chart. Hand-drawn SVG: no chart library, no
 * network, and it renders identically offline.
 * Days without a check-in are simply absent — no zero, no gap-shaming.
 */

import { formatDay } from '../lib/date';

export interface ChartPoint {
  day: string;
  mood?: number;
  energy?: number;
}

export function MoodChart({ data, height = 132 }: { data: ChartPoint[]; height?: number }) {
  const n = data.length;
  const w = 320;
  const gap = 1;
  const barW = Math.max(1.5, (w - gap * (n - 1)) / n);
  const scale = (v: number) => ((v - 0.4) / 4.6) * (height - 16);

  const filled = data.filter((d) => d.mood !== undefined).length;

  return (
    <figure style={{ margin: 0 }}>
      <svg
        viewBox={`0 0 ${w} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={`Mood and energy over the last ${n} days, from ${filled} check-ins.`}
        preserveAspectRatio="none"
      >
        {[1, 2, 3, 4, 5].map((v) => (
          <line
            key={v}
            x1="0"
            x2={w}
            y1={height - scale(v)}
            y2={height - scale(v)}
            stroke="var(--hairline)"
            strokeWidth="1"
          />
        ))}
        {data.map((d, i) => {
          const x = i * (barW + gap);
          if (d.mood === undefined) return null;
          const mh = scale(d.mood);
          const eh = scale(d.energy ?? 1);
          return (
            <g key={d.day}>
              <rect
                x={x}
                y={height - mh}
                width={barW}
                height={mh}
                rx={Math.min(1.5, barW / 2)}
                fill="var(--amber-core)"
                opacity="0.92"
              />
              <rect
                x={x}
                y={height - eh}
                width={barW}
                height="2"
                fill="var(--sage)"
              />
            </g>
          );
        })}
      </svg>
      <figcaption className="row row--between tiny dim" style={{ marginTop: 'var(--s-2)' }}>
        <span>{formatDay(data[0]?.day ?? '')}</span>
        <span>
          <span style={{ color: 'var(--amber-core)' }}>▮</span> mood ·{' '}
          <span style={{ color: 'var(--sage)' }}>▬</span> energy
        </span>
        <span>Today</span>
      </figcaption>
    </figure>
  );
}
