import type { ActionCategory, ActionTier } from '../content/actions';
import type { RegionCode } from '../content/crisis';

export type Mood = 1 | 2 | 3 | 4 | 5;
export type Energy = 1 | 2 | 3 | 4 | 5;
export type Sleep = 'short' | 'ok' | 'long';

export interface CheckIn {
  id: string;
  ts: number;
  day: string;
  mood: Mood;
  energy: Energy;
  sleep: Sleep;
  chips: string[];
  note?: string;
}

export interface Lift {
  id: string;
  ts: number;
  day: string;
  actionId: string;
  label: string;
  tier: ActionTier;
  category: ActionCategory;
  plannedMinutes: number;
  seconds: number;
  endedEarly: boolean;
}

export interface Reframe {
  id: string;
  ts: number;
  day: string;
  thought: string;
  distortions: string[];
  friendReply: string;
  kinder: string;
}

export interface GroundSession {
  id: string;
  ts: number;
  day: string;
  tool: 'bodyscan' | 'breathing' | 'visualisation' | 'sound' | 'sit';
  label: string;
  seconds: number;
}

export interface Contact {
  id: string;
  name: string;
  phone?: string;
}

export interface SafetyPlan {
  warnings: string[];
  helped: string[];
  message: Contact[];
  call: Contact[];
  professionals: Contact[];
  reasons: string[];
  updatedAt?: number;
}

export interface Settings {
  onboarded: boolean;
  name: string;
  region: RegionCode;
  theme: 'dark' | 'light';
  reminderTime: string | null;
  lockCode: string | null;
  narration: boolean;
  reduceMotion: boolean;
}

export interface Entitlement {
  fullAccess: boolean;
  plan: 'monthly' | 'yearly' | 'lifetime' | null;
  since?: number;
}

export interface LumoState {
  version: 1;
  settings: Settings;
  entitlement: Entitlement;
  checkIns: CheckIn[];
  lifts: Lift[];
  reframes: Reframe[];
  grounds: GroundSession[];
  opens: string[];
  safetyPlan: SafetyPlan;
  lessonsDone: string[];
  /** Paywall is suppressed until this timestamp. Set after low mood or a comfort session. */
  paywallQuietUntil: number;
  /** Last time the safety card was shown, so it never nags. */
  safetyCardShown: number;
}
