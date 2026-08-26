/**
 * DAILY INVITATION
 *
 * At most one a day, at a time the user chose, worded as an invitation.
 * Rotated from the copy library so it never reads like a nag.
 *
 * Web limitation, stated plainly: a page can only schedule a notification for
 * a time while it is still open. The native build uses expo-notifications for
 * true local scheduling; see README.
 */

import { notificationForDay } from '../content/notifications';
import { dayKey } from './date';

const SENT_KEY = 'lumo.lastInvitation';
let timer: number | null = null;

export async function askForNotifications(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

function alreadySentToday(): boolean {
  try {
    return localStorage.getItem(SENT_KEY) === dayKey();
  } catch {
    return false;
  }
}

function markSent() {
  try {
    localStorage.setItem(SENT_KEY, dayKey());
  } catch {
    /* nothing to do */
  }
}

export function scheduleTodaysInvitation(hhmm: string | null) {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!hhmm || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  if (alreadySentToday()) return;

  const [h, m] = hhmm.split(':').map(Number);
  const when = new Date();
  when.setHours(h, m, 0, 0);
  const delay = when.getTime() - Date.now();
  if (delay < 0) return; // that time has passed today — never fire late, and never twice

  timer = window.setTimeout(() => {
    const copy = notificationForDay(Math.floor(Date.now() / 86_400_000));
    try {
      new Notification(copy.title, { body: copy.body, icon: './icon.svg', silent: true });
      markSent();
    } catch {
      /* blocked — nothing breaks */
    }
  }, delay);
}
