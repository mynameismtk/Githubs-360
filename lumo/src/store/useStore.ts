import { create } from 'zustand';
import { dayKey, DAY_MS } from '../lib/date';
import { loadRaw, saveRaw, uid, wipe } from '../lib/storage';
import { guessRegion } from '../content/crisis';
import type {
  CheckIn,
  Contact,
  Energy,
  GroundSession,
  Lift,
  LumoState,
  Mood,
  Reframe,
  SafetyPlan,
  Settings,
  Sleep,
} from './types';
import type { BAAction } from '../content/actions';

const emptyPlan: SafetyPlan = {
  warnings: [],
  helped: [],
  message: [],
  call: [],
  professionals: [],
  reasons: [],
};

function initialState(): LumoState {
  return {
    version: 1,
    settings: {
      onboarded: false,
      name: '',
      region: guessRegion(),
      theme: 'dark',
      reminderTime: null,
      lockCode: null,
      narration: false,
      reduceMotion: false,
    },
    entitlement: { fullAccess: false, plan: null },
    checkIns: [],
    lifts: [],
    reframes: [],
    grounds: [],
    opens: [],
    safetyPlan: emptyPlan,
    lessonsDone: [],
    paywallQuietUntil: 0,
    safetyCardShown: 0,
  };
}

/** Merge persisted data over defaults so a new field never breaks an old install. */
function hydrate(): LumoState {
  const base = initialState();
  const saved = loadRaw<Partial<LumoState>>();
  if (!saved) return base;
  return {
    ...base,
    ...saved,
    settings: { ...base.settings, ...(saved.settings ?? {}) },
    entitlement: { ...base.entitlement, ...(saved.entitlement ?? {}) },
    safetyPlan: { ...emptyPlan, ...(saved.safetyPlan ?? {}) },
  };
}

interface Actions {
  markOpened: () => void;
  patchSettings: (p: Partial<Settings>) => void;
  completeOnboarding: (p: Partial<Settings>) => void;

  addCheckIn: (input: { mood: Mood; energy: Energy; sleep: Sleep; chips: string[]; note?: string }) => CheckIn;
  addLift: (action: BAAction, seconds: number, endedEarly: boolean) => void;
  addReframe: (r: Omit<Reframe, 'id' | 'ts' | 'day'>) => void;
  addGround: (g: Omit<GroundSession, 'id' | 'ts' | 'day'>) => void;

  setPlanList: (key: 'warnings' | 'helped' | 'reasons', items: string[]) => void;
  setPlanContacts: (key: 'message' | 'call' | 'professionals', items: Contact[]) => void;

  markLessonDone: (id: string) => void;
  unlock: (plan: 'monthly' | 'yearly' | 'lifetime') => void;
  relock: () => void;

  quietPaywall: (minutes?: number) => void;
  noteSafetyCard: () => void;
  deleteEverything: () => void;
}

export type Store = LumoState & Actions;

export const useStore = create<Store>((set, get) => ({
  ...hydrate(),

  markOpened: () => {
    const today = dayKey();
    if (get().opens.includes(today)) return;
    set((s) => ({ opens: [...s.opens, today] }));
  },

  patchSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),

  completeOnboarding: (p) =>
    set((s) => ({ settings: { ...s.settings, ...p, onboarded: true } })),

  addCheckIn: (input) => {
    const entry: CheckIn = { id: uid(), ts: Date.now(), day: dayKey(), ...input };
    set((s) => ({ checkIns: [entry, ...s.checkIns] }));
    // A paywall must never follow a low check-in.
    if (entry.mood <= 2) get().quietPaywall(120);
    return entry;
  },

  addLift: (action, seconds, endedEarly) => {
    const lift: Lift = {
      id: uid(),
      ts: Date.now(),
      day: dayKey(),
      actionId: action.id,
      label: action.text,
      tier: action.tier,
      category: action.category,
      plannedMinutes: action.minutes,
      seconds,
      endedEarly,
    };
    set((s) => ({ lifts: [lift, ...s.lifts] }));
  },

  addReframe: (r) =>
    set((s) => ({ reframes: [{ id: uid(), ts: Date.now(), day: dayKey(), ...r }, ...s.reframes] })),

  addGround: (g) =>
    set((s) => ({ grounds: [{ id: uid(), ts: Date.now(), day: dayKey(), ...g }, ...s.grounds] })),

  setPlanList: (key, items) =>
    set((s) => ({ safetyPlan: { ...s.safetyPlan, [key]: items, updatedAt: Date.now() } })),

  setPlanContacts: (key, items) =>
    set((s) => ({ safetyPlan: { ...s.safetyPlan, [key]: items, updatedAt: Date.now() } })),

  markLessonDone: (id) =>
    set((s) => (s.lessonsDone.includes(id) ? s : { lessonsDone: [...s.lessonsDone, id] })),

  unlock: (plan) => set({ entitlement: { fullAccess: true, plan, since: Date.now() } }),

  relock: () => set({ entitlement: { fullAccess: false, plan: null } }),

  quietPaywall: (minutes = 60) =>
    set((s) => ({
      paywallQuietUntil: Math.max(s.paywallQuietUntil, Date.now() + minutes * 60_000),
    })),

  noteSafetyCard: () => set({ safetyCardShown: Date.now() }),

  deleteEverything: () => {
    wipe();
    const fresh = initialState();
    // Keep them where they are: region and theme are not personal health data.
    fresh.settings.onboarded = true;
    fresh.settings.region = get().settings.region;
    fresh.settings.theme = get().settings.theme;
    set(fresh);
  },
}));

/* ---------- persistence ---------- */

const PERSIST_KEYS: (keyof LumoState)[] = [
  'version',
  'settings',
  'entitlement',
  'checkIns',
  'lifts',
  'reframes',
  'grounds',
  'opens',
  'safetyPlan',
  'lessonsDone',
  'paywallQuietUntil',
  'safetyCardShown',
];

useStore.subscribe((state) => {
  const snapshot: Record<string, unknown> = {};
  for (const k of PERSIST_KEYS) snapshot[k] = state[k];
  saveRaw(snapshot);
});

/* ---------- derived helpers ---------- */

export const todayCheckIn = (s: Store): CheckIn | undefined =>
  s.checkIns.find((c) => c.day === dayKey());

export interface Stats {
  lifts: number;
  checkIns: number;
  reframes: number;
  groundedMinutes: number;
  daysOpened: number;
  showedUp: number;
}

export function statsOf(s: Store): Stats {
  const groundedMinutes = Math.round(s.grounds.reduce((n, g) => n + g.seconds, 0) / 60);
  return {
    lifts: s.lifts.length,
    checkIns: s.checkIns.length,
    reframes: s.reframes.length,
    groundedMinutes,
    daysOpened: s.opens.length,
    // Everything counts, including simply opening the app.
    showedUp: s.opens.length + s.lifts.length + s.checkIns.length + s.reframes.length + s.grounds.length,
  };
}

/** Two lowest-possible moods in a row is the escalation trigger. */
export function inHeavyRun(s: Store): boolean {
  const [a, b] = s.checkIns;
  return !!a && !!b && a.mood === 1 && b.mood === 1;
}

export function paywallAllowed(s: Store): boolean {
  return !s.entitlement.fullAccess && Date.now() > s.paywallQuietUntil;
}

export function lastNDays(s: Store, n: number): { day: string; mood?: number; energy?: number }[] {
  const out: { day: string; mood?: number; energy?: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const key = dayKey(Date.now() - i * DAY_MS);
    const entry = s.checkIns.find((c) => c.day === key);
    out.push({ day: key, mood: entry?.mood, energy: entry?.energy });
  }
  return out;
}
