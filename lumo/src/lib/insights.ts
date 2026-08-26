/**
 * GENTLE CORRELATIONS
 *
 * Rules this file obeys:
 *  - never a causal claim, never a prescription
 *  - nothing at all until there is enough data to be honest
 *  - every line ends by saying it is a pattern, not a rule
 *  - never a negative framing about the user ("you did worse when…")
 */

import type { CheckIn, Lift } from '../store/types';

export interface Insight {
  id: string;
  text: string;
}

const MIN_CHECKINS = 10;
const MIN_GROUP = 3;

const mean = (n: number[]) => n.reduce((a, b) => a + b, 0) / n.length;

function magnitude(diff: number): string | null {
  if (diff >= 0.75) return 'higher';
  if (diff >= 0.35) return 'a little higher';
  return null;
}

export function buildInsights(checkIns: CheckIn[], lifts: Lift[]): Insight[] {
  if (checkIns.length < MIN_CHECKINS) return [];
  const out: Insight[] = [];

  // --- context chips vs mood ---
  const chips = new Set(checkIns.flatMap((c) => c.chips));
  for (const chip of chips) {
    const withChip = checkIns.filter((c) => c.chips.includes(chip));
    const without = checkIns.filter((c) => !c.chips.includes(chip));
    if (withChip.length < MIN_GROUP || without.length < MIN_GROUP) continue;
    const diff = mean(withChip.map((c) => c.mood)) - mean(without.map((c) => c.mood));
    const size = magnitude(Math.abs(diff));
    if (!size) continue;
    if (diff > 0) {
      out.push({
        id: `chip-${chip}`,
        text: `On days you logged "${chip}", your mood was ${size}. That's a pattern, not a rule.`,
      });
    } else {
      out.push({
        id: `chip-${chip}`,
        text: `Days with "${chip}" have tended to be heavier ones. Worth knowing, not worth blaming yourself for.`,
      });
    }
  }

  // --- lifts vs mood, same day ---
  const liftDays = new Set(lifts.map((l) => l.day));
  const withLift = checkIns.filter((c) => liftDays.has(c.day));
  const noLift = checkIns.filter((c) => !liftDays.has(c.day));
  if (withLift.length >= MIN_GROUP && noLift.length >= MIN_GROUP) {
    const diff = mean(withLift.map((c) => c.mood)) - mean(noLift.map((c) => c.mood));
    const size = magnitude(diff);
    if (size) {
      out.push({
        id: 'lifts',
        text: `On days you did a lift, your mood was ${size}. That's a pattern, not a rule.`,
      });
    }
  }

  // --- sleep vs energy ---
  const shortSleep = checkIns.filter((c) => c.sleep === 'short');
  const okSleep = checkIns.filter((c) => c.sleep === 'ok');
  if (shortSleep.length >= MIN_GROUP && okSleep.length >= MIN_GROUP) {
    const diff = mean(okSleep.map((c) => c.energy)) - mean(shortSleep.map((c) => c.energy));
    const size = magnitude(diff);
    if (size) {
      out.push({
        id: 'sleep',
        text: `After an okay night's sleep, your energy has read ${size}. That's a pattern, not a rule.`,
      });
    }
  }

  // --- categories of lift ---
  const byCategory = new Map<string, number[]>();
  for (const c of checkIns) {
    const cats = new Set(lifts.filter((l) => l.day === c.day).map((l) => l.category));
    for (const cat of cats) byCategory.set(cat, [...(byCategory.get(cat) ?? []), c.mood]);
  }
  const overall = mean(checkIns.map((c) => c.mood));
  for (const [cat, moods] of byCategory) {
    if (moods.length < MIN_GROUP + 1) continue;
    const size = magnitude(mean(moods) - overall);
    if (!size) continue;
    const label =
      cat === 'outside'
        ? 'got outside'
        : cat === 'connection'
          ? 'were in contact with someone'
          : cat === 'body'
            ? 'did something physical'
            : cat === 'home'
              ? 'sorted something at home'
              : cat === 'creation'
                ? 'made something'
                : 'used your senses on purpose';
    out.push({
      id: `cat-${cat}`,
      text: `On days you ${label}, your mood was ${size}. That's a pattern, not a rule.`,
    });
  }

  return out.slice(0, 5);
}
