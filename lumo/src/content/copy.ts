/**
 * STRINGS
 * Every user-facing line that is not a lesson, an action or a grounding card.
 * Tone: short sentences, second person, warm, plain, slightly dry.
 * Banned words: just, simply, easy, positive vibes, your journey.
 */

export const APP = {
  name: 'Lumo',
  tagline: 'For the days that are heavy.',
  subtitle: 'Depression Support, CBT & BA Tools',
};

export const DISCLAIMER = {
  onboarding:
    'Lumo is not therapy, not a diagnosis and not a crisis service. It is a set of tools you can use between the parts of your life that are. If you are in danger, use the crisis lines — they are built into the app and they work offline.',
  settings:
    'Lumo does not diagnose, treat or replace care from a professional. Nothing you record here is read by a person. If you are in immediate danger, contact your local emergency number or one of the crisis lines in the Anchr.',
};

/** Home screen line. Chosen by time of day and what has happened today. */
export const HOME_LINES = {
  firstEver: 'You found the app. That is the whole of today handled.',
  morning: ['Morning. Nothing is owed yet.', 'Early. Take it slowly.', 'The day is open. That can be hard.'],
  afternoon: ['Afternoon. Whatever happened this morning is done.', 'Middle of the day. No score is being kept.'],
  evening: ['Evening. The day is nearly out of demands.', 'Later on. The hard part of the day is behind you.'],
  night: ['Late. Mo is still on.', 'It is late and you are here. That is fine.'],
  afterCheckIn: 'Checked in. That is logged and you can leave it there.',
  afterLift: 'That was hard and you did it.',
  heavyRun: 'Heavy few days. Mo is not going anywhere.',
  returning: 'You came back. That counts on its own.',
};

export const LIFTR = {
  button: 'Today feels heavy',
  buttonSub: 'Tap for something small',
  chooseTitle: 'What would help more right now?',
  pathA: 'Help me move',
  pathASub: 'One small thing, about ten minutes',
  pathB: 'Just sit with me',
  pathBSub: 'No tasks, no questions',
  energyQ: 'How much is in the tank right now?',
  energyLabels: ['Empty', 'Low', 'Some', 'Okay', 'Decent'],
  offerLead: "Here's one thing.",
  accept: "I'll do this",
  swap: 'Give me another',
  tooMuch: 'Too much right now',
  droppedTier: 'Dropped it down. Smaller is the point.',
  atFloor: 'This is the smallest tier. You can do this from bed.',
  timerNote: 'Stop whenever you want. It still counts.',
  done: 'Done',
  stop: 'Stop here',
  completeTitle: 'That was hard and you did it.',
  completeSub: 'Logged. Nothing else is expected of you today.',
  earlyTitle: 'You started it. That is the part that counts.',
  earlySub: 'Started counts as done here. There is no half credit to lose.',
  sitTitle: 'Sit as long as you want',
  sitLeave: 'I want to go',
  notSafe: "I'm not safe right now",
};

export const CHECKIN = {
  title: "How's today?",
  moodQ: 'Mood',
  energyQ: 'Energy',
  sleepQ: 'Sleep',
  chipsQ: "What's around today?",
  chipsHint: 'Up to three. Skip if you want.',
  noteQ: 'Anything else?',
  noteHint: 'Optional, and always optional.',
  save: 'Save check-in',
  saved: 'Logged.',
  skip: 'Not today',
  moodFaces: ['Awful', 'Low', 'Flat', 'Okay', 'Good'],
  energyLabels: ['Empty', 'Low', 'Some', 'Okay', 'Decent'],
  sleepLabels: { short: 'Short', ok: 'Okay', long: 'Long' },
};

export const CONTEXT_CHIPS: string[] = [
  'alone',
  'people',
  'work',
  'pain',
  'outside',
  'screen',
  'rain',
  'noise',
  'money',
  'family',
  'travel',
  'hungover',
  'unwell',
  'meds',
  'no sleep',
  'good news',
  'bad news',
  'quiet day',
];

export const REFRAMR = {
  title: 'Talk it down',
  step1: "What's the thought?",
  step1Hint: 'One line is enough. Use the mic if typing is too much.',
  step2: 'Which shape is it?',
  step2Hint: 'Pick any that fit. Or none.',
  step3: 'If a friend said this to you, what would you say back?',
  step3Hint: 'You do not have to believe it yet.',
  step4: 'A kinder, truer version',
  step4Hint: 'Pick a starter and finish it, or write your own.',
  save: 'Save this',
  listTitle: "Things I've talked myself down from",
  empty: 'Nothing here yet. The first one is the hardest.',
  micUnsupported: 'Voice input is not available in this browser. Typing works.',
  listening: 'Listening. Talk normally.',
};

export const GROUNDR = {
  title: 'Groundr',
  blurb: 'Body and senses. These settle agitation and slow rumination down.',
  honesty:
    'Breathing helps with agitation and with the loops that run at night. It is not the main treatment for low mood — action is. Use this when you are wound up, not instead of the Liftr.',
};

export interface BreathPhase {
  label: 'In' | 'Out' | 'Hold';
  seconds: number;
}

export interface BreathPattern {
  id: string;
  title: string;
  blurb: string;
  phases: BreathPhase[];
}

export const BREATHING: Record<string, BreathPattern> = {
  box: {
    id: 'box',
    title: 'Box',
    blurb: 'Four in, four hold, four out, four hold.',
    phases: [
      { label: 'In', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Out', seconds: 4 },
      { label: 'Hold', seconds: 4 },
    ],
  },
  '478': {
    id: '478',
    title: '4-7-8',
    blurb: 'Long out-breath. Good before sleep.',
    phases: [
      { label: 'In', seconds: 4 },
      { label: 'Hold', seconds: 7 },
      { label: 'Out', seconds: 8 },
    ],
  },
  coherent: {
    id: 'coherent',
    title: 'Coherent',
    blurb: 'Five and a half seconds each way. Nothing to hold.',
    phases: [
      { label: 'In', seconds: 5.5 },
      { label: 'Out', seconds: 5.5 },
    ],
  },
};

export const ANCHR = {
  title: 'The Anchr',
  blurb: 'Your plan, written by you, kept on this device. Reachable from anywhere in the app.',
  sections: [
    { id: 'warnings', title: 'My warning signs', hint: 'What it looks like when things are sliding.' },
    { id: 'helped', title: 'Things that have helped before', hint: 'Even small ones. Especially small ones.' },
    { id: 'message', title: 'People I can message', hint: 'Lower effort than calling.' },
    { id: 'call', title: 'People I can call', hint: 'The ones who pick up.' },
    { id: 'professionals', title: 'Professionals', hint: 'GP, therapist, care team, out-of-hours.' },
    { id: 'reasons', title: 'Reasons to stay', hint: 'Write these for a version of you who cannot remember them.' },
  ],
  emptyPrompt: 'Nothing written here yet. Best done on a decent day, for a bad one.',
  quick: 'Safety',
  crisisTitle: 'Crisis lines',
  crisisNote: 'Free, confidential, and they will not rush you.',
};

export const SAFETY_CARD = {
  title: 'That looks like a heavy stretch.',
  body: 'Two low days in a row is worth taking seriously, and you answered honestly, which is the useful part. Nothing changes in the app and nothing is reported anywhere. If you want, one of these is here.',
  optionPlan: 'Open my safety plan',
  optionLine: 'Call a crisis line',
  optionSit: 'Just sit with Mo',
  dismiss: 'Not now',
};

export const NOT_SAFE_CARD = {
  title: 'Okay. You are still here and you said something.',
  body: 'You do not have to explain it to anyone. Pick whichever of these costs you least right now.',
};

export const PROGRESS = {
  title: 'Progress',
  showedUp: 'You showed up',
  showedUpSub: 'This number cannot go down.',
  noStreaks: 'There are no streaks here. Nothing you can break.',
  chartTitle: 'Last 90 days',
  chartEmpty: 'A few check-ins and a chart appears here.',
  patternIntro: 'Patterns, not rules',
  patternEmpty: 'Around ten check-ins in, patterns start showing up here.',
};

export const PAYWALL = {
  title: 'Lumo Full Access',
  sub: 'The courses, the full library, and the export a clinician can read.',
  reassure:
    'The Liftr, the Anchr, check-ins, reframes and every crisis feature stay free forever. They are not a trial and they never expire.',
  monthly: 'Monthly',
  yearly: 'Yearly',
  lifetime: 'Lifetime',
  trial: '7 days free, then',
  cta: 'Start',
  ctaLifetime: 'Buy once',
  restore: 'Restore a purchase',
  later: 'Not now',
  demoNote:
    'This build is a demo: no payment is taken and no card is asked for. Unlocking is instant and reversible in Settings.',
};

export const SETTINGS = {
  title: 'Settings',
  export: 'Export my data',
  exportSub: 'CSV or a printable summary. Yours to keep or hand to a clinician.',
  deleteAll: 'Delete everything',
  deleteSub: 'Wipes every check-in, lift, reframe and plan from this device. There is no copy anywhere else.',
  deleteConfirm: 'This cannot be undone. Delete all Lumo data?',
  lock: 'Passcode lock',
  lockSub: 'Ask for a four-digit code when Lumo opens.',
  reminders: 'Daily invitation',
  remindersSub: 'One a day, at a time you pick. Never a demand.',
};

export const LOCK = {
  title: 'Lumo',
  prompt: 'Enter your code',
  wrong: 'Not that one. Try again.',
  set: 'Choose a four-digit code',
  confirm: 'Enter it once more',
  mismatch: 'Those did not match. Start again.',
};
