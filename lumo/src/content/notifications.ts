/**
 * NOTIFICATION COPY LIBRARY
 *
 * Rules: at most one a day, at a time the user picked, rotated from here.
 * Every line is an invitation. None of them mention a streak, a miss, or a
 * number of days. None of them tell the user how to feel.
 */

export interface NotificationCopy {
  title: string;
  body: string;
}

export const NOTIFICATIONS: NotificationCopy[] = [
  { title: "Mo's here", body: 'Whenever you want. No plans needed.' },
  { title: 'A quiet check-in', body: 'Four taps, no typing. Or skip it — that is allowed.' },
  { title: 'Still here', body: 'Nothing is waiting for you. Come in if you want to.' },
  { title: 'Small is the point', body: 'There is something in here you can do from bed.' },
  { title: 'If today is heavy', body: 'Open Lumo and let it pick something small.' },
  { title: 'No agenda', body: 'You can just sit with Mo for a while.' },
  { title: 'One glass of water', body: 'That is a whole lift. It counts.' },
  { title: 'Two minutes', body: 'That is all today has to be.' },
  { title: 'Whenever you are ready', body: 'Mo is not going anywhere.' },
  { title: 'The lamp is on', body: 'Come and sit down for a minute.' },
  { title: 'Nothing today?', body: "That's allowed. Mo's still here." },
  { title: 'A check-in, if you want one', body: 'It takes about thirty seconds.' },
  { title: 'You do not have to feel like it', body: 'That was never the requirement.' },
  { title: 'Something small is here', body: 'You can swap it if it is too much.' },
  { title: 'Evening', body: 'If today was heavy, that can be logged and left behind.' },
  { title: 'Still on', body: 'Your safety plan and your tools are all here, offline.' },
  { title: 'One line', body: 'Write one sentence about today, or do not.' },
  { title: 'Ten minutes different', body: 'That is the most any of this promises.' },
  { title: 'Open the curtain', body: 'That is the whole task. Mo will wait.' },
  { title: 'Come back when you can', body: 'Nothing here expires.' },
];

/** Deterministic rotation so the same line does not land twice in a week. */
export function notificationForDay(dayIndex: number): NotificationCopy {
  return NOTIFICATIONS[Math.abs(dayIndex) % NOTIFICATIONS.length];
}
