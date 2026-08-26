/**
 * BEHAVIOURAL ACTIVATION LIBRARY
 *
 * This is the heart of Lumo. Every entry is one imperative sentence, second
 * person, no exclamation marks, no praise baked in.
 *
 * tier 1 = completable in bed on the worst possible day
 * tier 5 = a good day, or a determined one
 *
 * Editing: add or reword freely. Keep the `id` stable — past lifts are logged
 * against it. If you delete an id that has been used, old logs fall back to
 * their stored label.
 */

export type ActionCategory = 'body' | 'home' | 'connection' | 'outside' | 'sense' | 'creation';
export type ActionTier = 1 | 2 | 3 | 4 | 5;
export type ActionMinutes = 2 | 5 | 10 | 20;

export interface BAAction {
  id: string;
  text: string;
  tier: ActionTier;
  category: ActionCategory;
  minutes: ActionMinutes;
}

type Row = [string, string, ActionTier, ActionCategory, ActionMinutes];

const rows: Row[] = [
  // ---------- TIER 1 — doable without leaving the bed ----------
  ['curtain', 'Open the curtain nearest to you.', 1, 'home', 2],
  ['water-glass', 'Drink a full glass of water.', 1, 'body', 2],
  ['one-sock', 'Put on one sock.', 1, 'body', 2],
  ['one-word', 'Send one word to one person.', 1, 'connection', 2],
  ['feet-floor', 'Sit up and put both feet on the floor.', 1, 'body', 2],
  ['lamp', 'Turn on the lamp closest to you.', 1, 'home', 2],
  ['three-breaths', 'Take three slow breaths with a longer breath out.', 1, 'body', 2],
  ['pillow', 'Push your pillow into shape and lie back differently.', 1, 'home', 2],
  ['shoulders', 'Roll your shoulders back five times.', 1, 'body', 2],
  ['phone-down', 'Unlock your phone and then put it face down.', 1, 'sense', 2],
  ['name-three', 'Name three things you can see without moving your head.', 1, 'sense', 2],
  ['warm-cloth', 'Wipe your face with a warm cloth.', 1, 'body', 2],
  ['one-plate', 'Move one plate or glass from the bed to the floor by the door.', 1, 'home', 2],
  ['one-line-reply', 'Reply to one message with a single line.', 1, 'connection', 2],
  ['pillowcase', 'Change the pillowcase.', 1, 'home', 5],
  ['reach-up', 'Stretch your arms above your head and hold for ten seconds.', 1, 'body', 2],
  ['cold-hand', 'Put your hand flat on something cold and leave it there.', 1, 'sense', 2],
  ['window-crack', 'Open the window a hand-width.', 1, 'home', 2],
  ['eat-one-thing', 'Eat one thing, even a small one.', 1, 'body', 2],
  ['warmer-light', 'Turn off the overhead light and turn on something warmer.', 1, 'sense', 2],
  ['one-laundry', 'Put one item of clothing in the laundry basket.', 1, 'home', 2],
  ['look-out', 'Look out of a window for one minute.', 1, 'sense', 2],
  ['known-song', 'Play one song you already know the words to.', 1, 'sense', 5],
  ['one-sentence', 'Write one sentence about today. Any sentence.', 1, 'creation', 2],
  ['meds', 'Take your medication if today is a day you have it.', 1, 'body', 2],
  ['teeth-sitting', 'Brush your teeth sitting down if standing is too much.', 1, 'body', 2],
  ['water-later', 'Set a glass of water somewhere you will see it later.', 1, 'home', 2],
  ['one-paragraph', 'Read one paragraph of anything.', 1, 'sense', 2],
  ['text-hey', 'Text one person the word "hey".', 1, 'connection', 2],
  ['feet-blanket', 'Put your feet under a blanket and notice the warmth.', 1, 'sense', 2],

  // ---------- TIER 2 — up, but barely ----------
  ['cold-face', 'Wash your face with cold water.', 2, 'body', 2],
  ['other-clothes', 'Change into different clothes, even other soft ones.', 2, 'body', 5],
  ['hold-drink', 'Make a hot drink and hold it for a minute before you drink it.', 2, 'body', 5],
  ['one-surface', 'Clear one surface. Only one.', 2, 'home', 5],
  ['front-door', 'Stand outside your front door for two minutes.', 2, 'outside', 2],
  ['shoes-on', 'Put on shoes, even if you go nowhere.', 2, 'body', 2],
  ['three-things-sink', 'Wash three things in the sink.', 2, 'home', 5],
  ['send-photo', 'Send one person a photo of something near you.', 2, 'connection', 2],
  ['floor-stretch', 'Stretch on the floor for five minutes.', 2, 'body', 5],
  ['all-curtains', 'Open every curtain in one room.', 2, 'home', 2],
  ['fresh-sheets', 'Put clean sheets on the bed.', 2, 'home', 10],
  ['not-doing', 'Write down three things you are not going to do today.', 2, 'creation', 5],
  ['water-plant', 'Water one plant.', 2, 'home', 2],
  ['top-layer', 'Sort the top layer of one pile.', 2, 'home', 5],
  ['doorstep', 'Sit on the doorstep with a drink.', 2, 'outside', 5],
  ['podcast-still', 'Put on a podcast and lie still while it plays.', 2, 'sense', 10],
  ['bathroom-sink', 'Wipe down the bathroom sink.', 2, 'home', 5],
  ['bin-to-door', 'Take the bin bag as far as the front door.', 2, 'home', 2],
  ['brush-hair', 'Brush your hair.', 2, 'body', 2],
  ['good-day-photo', 'Find one photo from a good day and stay on it a while.', 2, 'sense', 2],
  ['real-question', 'Message one person a question you actually want the answer to.', 2, 'connection', 5],
  ['mugs', 'Wash the mugs, or start the dishwasher.', 2, 'home', 10],
  ['other-room', 'Move to a different room and sit there.', 2, 'home', 2],
  ['out-of-sleep-clothes', 'Change out of the clothes you slept in.', 2, 'body', 5],
  ['hand-cream', 'Put on hand cream, slowly.', 2, 'sense', 2],
  ['tomorrow-clothes', "Choose tomorrow's clothes and leave them out.", 2, 'home', 5],
  ['proper-meal', 'Eat a proper meal, even a simple one.', 2, 'body', 20],
  ['outside-air', 'Open the front door and breathe outside air for one minute.', 2, 'outside', 2],

  // ---------- TIER 3 — a small real effort ----------
  ['end-of-street', 'Walk to the end of the street and come back.', 3, 'outside', 10],
  ['shower-sitting', 'Have a shower, sitting down if you need to.', 3, 'body', 10],
  ['five-ingredients', 'Cook something with fewer than five ingredients.', 3, 'home', 20],
  ['let-them-talk', 'Call one person and let them do most of the talking.', 3, 'connection', 10],
  ['ten-min-tidy', 'Set a timer for ten minutes of tidying, then stop when it goes.', 3, 'home', 10],
  ['block', 'Walk around the block once.', 3, 'outside', 10],
  ['one-song-move', 'Put music on and move around the room for one song.', 3, 'body', 5],
  ['overdue-message', 'Write the message you have been putting off, and send it.', 3, 'connection', 10],
  ['daylight-ten', 'Stand in daylight for ten minutes.', 3, 'outside', 10],
  ['washing-up-podcast', 'Do the washing up with a podcast on.', 3, 'home', 10],
  ['follow-along-stretch', 'Follow a ten-minute stretch routine.', 3, 'body', 10],
  ['bench', 'Sit on a bench or a step outside for ten minutes.', 3, 'outside', 10],
  ['draw-badly', 'Draw something badly on purpose.', 3, 'creation', 10],
  ['one-drawer', 'Sort one drawer.', 3, 'home', 10],
  ['photo-window', 'Take a photo of one thing outside your window.', 3, 'creation', 2],
  ['make-bed', 'Make the bed properly.', 3, 'home', 5],
  ['shop-one-thing', 'Walk to the nearest shop, buy one thing, come back.', 3, 'outside', 20],
  ['three-pages', 'Read three pages of a book.', 3, 'sense', 10],
  ['cook-twice', 'Cook one thing you can eat again later.', 3, 'home', 20],
  ['clear-messages', 'Reply to every message that has been waiting.', 3, 'connection', 10],
  ['sheets-window', 'Change the sheets and open the window while you do it.', 3, 'home', 10],
  ['start-laundry', 'Load the laundry, start it, and walk away.', 3, 'home', 5],
  ['five-enjoyed', 'Write a list of five things you used to enjoy.', 3, 'creation', 10],
  ['dry-towel', 'Have a hot shower and use a towel that is actually dry.', 3, 'body', 10],
  ['any-direction', 'Put your shoes on and walk five minutes in any direction.', 3, 'outside', 5],
  ['one-window', 'Clean one window.', 3, 'home', 10],

  // ---------- TIER 4 — a decent day, or a stubborn one ----------
  ['twenty-walk', 'Walk for twenty minutes without a destination.', 4, 'outside', 20],
  ['table-meal', 'Cook a meal from start to finish and eat it at a table.', 4, 'home', 20],
  ['half-hour-coffee', 'Meet one person for a coffee, even for half an hour.', 4, 'connection', 20],
  ['one-room', 'Tidy one whole room.', 4, 'home', 20],
  ['cafe', 'Go to a café and sit there with a drink.', 4, 'outside', 20],
  ['twenty-exercise', 'Do twenty minutes of any exercise you can tolerate.', 4, 'body', 20],
  ['long-time-call', 'Ring someone you have not spoken to in a while.', 4, 'connection', 20],
  ['two-days-food', 'Go to the shop and buy food for two days.', 4, 'outside', 20],
  ['write-no-reread', 'Write for twenty minutes without reading it back.', 4, 'creation', 20],
  ['trees', 'Take a walk somewhere with trees.', 4, 'outside', 20],
  ['clear-kitchen', 'Clear the kitchen completely.', 4, 'home', 20],
  ['admin-pile', 'Set twenty minutes for the admin pile, then stop whatever is left.', 4, 'home', 20],
  ['month-old-task', 'Do the ten-minute task that has been on your list for a month.', 4, 'home', 10],
  ['water', 'Go for a swim, or stand in water.', 4, 'body', 20],
  ['old-route', 'Walk or cycle a route you used to like.', 4, 'outside', 20],
  ['cook-for-someone', 'Cook for someone else, even something small.', 4, 'connection', 20],
  ['instrument', 'Play an instrument you own, badly, for fifteen minutes.', 4, 'creation', 20],
  ['library', 'Go to a library and sit in it.', 4, 'outside', 20],
  ['laundry-to-wardrobe', 'Take one load of laundry all the way to the wardrobe.', 4, 'home', 20],
  ['morning-light', 'Get twenty minutes of daylight before noon.', 4, 'outside', 20],
  ['fix-small-thing', 'Fix one small broken thing in your home.', 4, 'creation', 20],
  ['make-a-plan', 'Make a plan with someone for a day this week.', 4, 'connection', 10],

  // ---------- TIER 5 — the ones that change a week ----------
  ['the-group', 'Go to the class, group or session you have been avoiding.', 5, 'connection', 20],
  ['say-yes', 'Say yes to one invitation.', 5, 'connection', 20],
  ['hour-outside', 'Spend an hour outside, at whatever pace you like.', 5, 'outside', 20],
  ['book-appointment', 'Book the appointment you have been putting off.', 5, 'home', 10],
  ['talk-to-stranger', 'Do the errand that involves talking to a stranger.', 5, 'outside', 20],
  ['new-place', 'Go somewhere in your own city you have never been.', 5, 'outside', 20],
  ['tell-someone', 'Tell one person honestly how you have been.', 5, 'connection', 20],
  ['full-workout', 'Do a full workout, at any intensity you like.', 5, 'body', 20],
  ['invite-to-eat', 'Cook a meal and invite one person to eat it.', 5, 'connection', 20],
  ['finish-abandoned', 'Finish something you abandoned.', 5, 'creation', 20],
  ['go-to-appointment', 'Go to the appointment. Take someone with you if that helps.', 5, 'home', 20],
  ['afternoon-out', 'Spend a whole afternoon away from your home.', 5, 'outside', 20],
  ['ask-for-help', 'Ask someone for the help you actually need.', 5, 'connection', 20],
  ['return-to-place', 'Go back to a place you stopped going.', 5, 'outside', 20],
  ['start-the-thing', 'Start the thing you have been researching instead of doing.', 5, 'creation', 20],
  ['volunteer', 'Give an hour of your time to something outside yourself.', 5, 'connection', 20],
  ['the-conversation', 'Have the conversation you have been rehearsing.', 5, 'connection', 20],
  ['day-trip', 'Take a short trip somewhere on public transport.', 5, 'outside', 20],
  ['teach', 'Teach someone something you know.', 5, 'connection', 20],
  ['hour-away', 'Walk somewhere that takes an hour to reach.', 5, 'outside', 20],
];

export const ACTIONS: BAAction[] = rows.map(([id, text, tier, category, minutes]) => ({
  id,
  text,
  tier,
  category,
  minutes,
}));

export const CATEGORY_LABEL: Record<ActionCategory, string> = {
  body: 'Body',
  home: 'Home',
  connection: 'Connection',
  outside: 'Outside',
  sense: 'Senses',
  creation: 'Making',
};

/** Energy 1–5 maps straight onto difficulty tier. */
export const tierForEnergy = (energy: number): ActionTier =>
  Math.min(5, Math.max(1, energy)) as ActionTier;

export const actionById = (id: string): BAAction | undefined => ACTIONS.find((a) => a.id === id);

export const actionsInTier = (tier: ActionTier): BAAction[] => ACTIONS.filter((a) => a.tier === tier);
