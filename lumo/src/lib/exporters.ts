/**
 * EXPORT
 * CSV for a spreadsheet, and a printable one-page summary that a person can
 * hand to a GP in a ten-minute appointment. Both are generated on the device;
 * nothing is uploaded anywhere.
 */

import type { CheckIn, GroundSession, Lift, Reframe } from '../store/types';
import { formatDay } from './date';

function download(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const esc = (v: string | number | undefined) => {
  const s = v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function exportCheckInsCSV(checkIns: CheckIn[]) {
  const head = 'date,time,mood_1_5,energy_1_5,sleep,context,note';
  const rows = [...checkIns]
    .sort((a, b) => a.ts - b.ts)
    .map((c) =>
      [
        c.day,
        new Date(c.ts).toLocaleTimeString(),
        c.mood,
        c.energy,
        c.sleep,
        c.chips.join(' | '),
        c.note ?? '',
      ]
        .map(esc)
        .join(','),
    );
  download(`lumo-checkins-${new Date().toISOString().slice(0, 10)}.csv`, [head, ...rows].join('\n'), 'text/csv');
}

export function exportEverythingCSV(data: {
  checkIns: CheckIn[];
  lifts: Lift[];
  reframes: Reframe[];
  grounds: GroundSession[];
}) {
  const lines: string[] = ['type,date,field_1,field_2,field_3,field_4'];
  for (const c of [...data.checkIns].sort((a, b) => a.ts - b.ts))
    lines.push(['check-in', c.day, `mood ${c.mood}`, `energy ${c.energy}`, `sleep ${c.sleep}`, c.chips.join(' | ')].map(esc).join(','));
  for (const l of [...data.lifts].sort((a, b) => a.ts - b.ts))
    lines.push(['lift', l.day, l.label, `tier ${l.tier}`, l.category, `${Math.round(l.seconds / 60)} min`].map(esc).join(','));
  for (const r of [...data.reframes].sort((a, b) => a.ts - b.ts))
    lines.push(['reframe', r.day, r.thought, r.distortions.join(' | '), r.friendReply, r.kinder].map(esc).join(','));
  for (const g of [...data.grounds].sort((a, b) => a.ts - b.ts))
    lines.push(['grounding', g.day, g.tool, g.label, `${Math.round(g.seconds / 60)} min`, ''].map(esc).join(','));
  download(`lumo-export-${new Date().toISOString().slice(0, 10)}.csv`, lines.join('\n'), 'text/csv');
}

/** Opens the browser's print dialogue — "Save as PDF" is in every one of them. */
export function printSummary(opts: {
  name: string;
  checkIns: CheckIn[];
  lifts: Lift[];
  reframes: Reframe[];
  grounds: GroundSession[];
  days?: number;
}) {
  const days = opts.days ?? 90;
  const cutoff = Date.now() - days * 86_400_000;
  const checkIns = opts.checkIns.filter((c) => c.ts >= cutoff).sort((a, b) => a.ts - b.ts);
  const lifts = opts.lifts.filter((l) => l.ts >= cutoff);
  const avg = (n: number[]) => (n.length ? (n.reduce((a, b) => a + b, 0) / n.length).toFixed(1) : '—');

  const bars = checkIns
    .map(
      (c) =>
        `<div class="b"><span style="height:${c.mood * 18}px"></span><span class="e" style="height:${c.energy * 18}px"></span></div>`,
    )
    .join('');

  const chipCounts = new Map<string, number>();
  for (const c of checkIns) for (const chip of c.chips) chipCounts.set(chip, (chipCounts.get(chip) ?? 0) + 1);
  const topChips = [...chipCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Lumo summary</title>
  <style>
    body{font:13px/1.55 -apple-system,Segoe UI,Roboto,sans-serif;color:#1c1613;margin:32px;max-width:720px}
    h1{font-size:20px;margin:0 0 2px} h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#7a6a5e;margin:22px 0 8px}
    .meta{color:#7a6a5e;margin-bottom:18px}
    table{border-collapse:collapse;width:100%} td,th{text-align:left;padding:4px 8px;border-bottom:1px solid #eee}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
    .k{border:1px solid #e6ded6;border-radius:8px;padding:8px}
    .k b{display:block;font-size:19px}
    .chart{display:flex;align-items:flex-end;gap:2px;height:100px;border-bottom:1px solid #ddd;padding-top:8px}
    .b{display:flex;align-items:flex-end;gap:1px}
    .b span{width:4px;background:#d9902f;display:block}
    .b .e{background:#b9c9bd}
    .note{color:#7a6a5e;font-size:11.5px;margin-top:26px;border-top:1px solid #eee;padding-top:10px}
  </style></head><body>
  <h1>Lumo summary${opts.name ? ` — ${opts.name}` : ''}</h1>
  <div class="meta">Last ${days} days · generated ${new Date().toLocaleDateString()} · self-reported, recorded on the person's own device</div>
  <div class="grid">
    <div class="k"><b>${avg(checkIns.map((c) => c.mood))}</b>mean mood (1–5)</div>
    <div class="k"><b>${avg(checkIns.map((c) => c.energy))}</b>mean energy (1–5)</div>
    <div class="k"><b>${checkIns.length}</b>check-ins</div>
    <div class="k"><b>${lifts.length}</b>activity records</div>
  </div>
  <h2>Mood (amber) and energy (green), by check-in</h2>
  <div class="chart">${bars || '<em>No check-ins in this period.</em>'}</div>
  <h2>Sleep</h2>
  <table><tr><th>Short</th><th>Okay</th><th>Long</th></tr><tr>
    <td>${checkIns.filter((c) => c.sleep === 'short').length}</td>
    <td>${checkIns.filter((c) => c.sleep === 'ok').length}</td>
    <td>${checkIns.filter((c) => c.sleep === 'long').length}</td></tr></table>
  <h2>Most-logged context</h2>
  <p>${topChips.map(([c, n]) => `${c} (${n})`).join(' · ') || '—'}</p>
  <h2>Activity records</h2>
  <table><tr><th>Date</th><th>Activity</th><th>Type</th><th>Minutes</th></tr>
  ${lifts
    .slice(0, 30)
    .map((l) => `<tr><td>${formatDay(l.day)}</td><td>${l.label}</td><td>${l.category}</td><td>${Math.round(l.seconds / 60)}</td></tr>`)
    .join('')}
  </table>
  <p class="note">Generated by Lumo, a self-help app. This is self-reported data collected by the person, not a clinical assessment, a screening score or a diagnosis. Lumo does not diagnose or treat.</p>
  </body></html>`;

  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
  return true;
}
