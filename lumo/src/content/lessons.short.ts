import type { Lesson } from './lessonTypes';

/** SHORT-TERM COURSE — 12 lessons. Behavioural activation done properly. */
export const SHORT_COURSE_LESSONS: Lesson[] = [
  {
    id: 's1',
    title: 'What behavioural activation actually is',
    blurb: 'The whole treatment in one lesson, before we slow it down.',
    minutes: 4,
    mo: 'listening',
    blocks: [
      {
        type: 'p',
        text: 'Behavioural activation is a full treatment for depression, not a self-help tip. In head-to-head trials it performs about as well as cognitive therapy, and it is easier to learn. The whole of it fits in one sentence: when mood drops, activity drops, and when activity drops, mood drops further — so you change the activity first, deliberately, and let mood follow.',
      },
      {
        type: 'p',
        text: 'What makes it a treatment rather than a slogan is the method. You find out what you are actually doing. You find out what you have stopped doing. You work out which of the stopping is avoidance. Then you add things back in a specific order, at a specific size, on specific days, and you keep going during the stretch where it does not feel like it is working.',
      },
      { type: 'pull', text: 'Outside-in, not inside-out.' },
      { type: 'h', text: 'What it is not' },
      {
        type: 'list',
        items: [
          'Not "keep busy". Filling the day with distraction is avoidance wearing a hi-vis jacket.',
          'Not "do things you enjoy". At the start, enjoyment is offline. You are aiming for contact with the world, not for fun.',
          'Not positive thinking. This course barely touches your thoughts. It is about your Tuesdays.',
        ],
      },
      { type: 'h', text: 'The shape of the next eleven lessons' },
      {
        type: 'p',
        text: 'You will map what you do now, learn to grade tasks so they are the right size, schedule them before the day arrives rather than deciding in the moment, handle rumination when it interrupts, anchor your sleep, and connect all of it to what you actually care about. The last two lessons deal with self-criticism and with what to do in a week where none of it happens.',
      },
      {
        type: 'try',
        text: 'For the next week, use the Liftr once a day and log it. That is the raw material for lesson two.',
      },
    ],
    takeaway: 'Change what you do, in a planned way, and let the feeling catch up.',
  },
  {
    id: 's2',
    title: 'Your avoidance map',
    blurb: 'Before you add anything, find out what actually happens in a day.',
    minutes: 4,
    mo: 'listening',
    blocks: [
      {
        type: 'p',
        text: 'Almost everyone is wrong about their own week. Depression compresses memory: bad stretches feel like the whole picture, and anything that went alright disappears. So the first move in behavioural activation is boring and important — you look.',
      },
      {
        type: 'p',
        text: 'For a few days, note what you did in each rough block of the day, and give it two quick numbers out of ten: how much it gave you a sense of achievement, and how much it gave you any pleasure or comfort. The check-in does a light version of this. Two numbers and a note is enough.',
      },
      { type: 'h', text: 'What you are looking for' },
      {
        type: 'list',
        items: [
          'Blank stretches. Hours where nothing is recorded are usually hours in bed or on a screen, and they are where the day leaks away.',
          'Things scoring zero on both. These are pure avoidance: no achievement, no comfort, just time passing.',
          'Things scoring above zero on either. These are your starting material. You will do more of them.',
          'Things that have vanished entirely. Anything you did six months ago and have not done since.',
        ],
      },
      {
        type: 'pull',
        text: 'You are not auditing yourself. You are collecting parts to rebuild with.',
      },
      { type: 'h', text: 'The trap' },
      {
        type: 'p',
        text: 'The map will look worse than you expect, and self-criticism will offer to take over. Do not let it. A map that looks bad is a map that is working — it means you are seeing the illness clearly rather than through its own commentary.',
      },
      {
        type: 'try',
        text: 'Note three days. Then find the one hour that is most consistently empty. That hour is where lesson three goes to work.',
      },
    ],
    takeaway: 'Look at the week you are actually having, not the one you assume.',
  },
  {
    id: 's3',
    title: 'Scheduling: decide before the day',
    blurb: 'Because in-the-moment decisions are made by the illness.',
    minutes: 4,
    mo: 'warm',
    blocks: [
      {
        type: 'p',
        text: 'When you decide in the moment whether to do something, the decision is made by whichever version of you is present at that moment. In depression, that version is under-estimating reward and over-estimating cost. You will decide not to. You will decide not to almost every time.',
      },
      {
        type: 'p',
        text: 'Scheduling moves the decision earlier, to a moment when you are calmer, and it removes the decision from the hard hour entirely. The task at three o clock is not "do I feel like walking". It is "it is three o clock".',
      },
      { type: 'pull', text: 'The plan is made by yesterday-you, who is more generous and better rested.' },
      { type: 'h', text: 'How to schedule it so it survives' },
      {
        type: 'list',
        items: [
          'Attach it to a time or to another event, not to a mood. "After I make coffee", not "when I feel up to it".',
          'One or two a day. A crowded plan is a plan you abandon at the first missed item.',
          'Write what the very first physical movement is. Shoes by the door. Kettle on. Curtain open.',
          'Include some rest, on purpose, so rest stops being what happens when the plan collapses.',
        ],
      },
      { type: 'h', text: 'When you miss one' },
      {
        type: 'p',
        text: 'You will. The rule is that a missed item is deleted, not carried forward. Nothing accumulates. Nothing owes anything. A plan that builds up debt becomes a plan you dread, and dread is the fastest way back to avoidance.',
      },
      {
        type: 'try',
        text: 'Tonight, pick tomorrow. One action, one time, one first movement. Write it where you will see it.',
      },
    ],
    takeaway: 'Plan the day before the day, then stop consulting your mood about it.',
  },
  {
    id: 's4',
    title: 'Grading: choosing the right size',
    blurb: 'Most attempts fail because the step was too big, not because you were too weak.',
    minutes: 4,
    mo: 'warm',
    blocks: [
      {
        type: 'p',
        text: 'A task that is too big does not get done. Worse, not doing it produces evidence for the story that you cannot do anything, and the next task gets harder. Sizing is therefore not a comfort measure. It is the mechanism.',
      },
      {
        type: 'p',
        text: 'The rule of thumb: pick a size you are at least eighty per cent sure you can do today, on a bad day, at the worst time of day. If you are not that sure, cut it in half. Then cut it in half again if you flinched when you read it.',
      },
      { type: 'h', text: 'How to cut a task properly' },
      {
        type: 'list',
        items: [
          'By time. Twenty minutes becomes five, with an explicit permission to stop when the timer goes.',
          'By scope. "Tidy the kitchen" becomes "the mugs".',
          'By stage. "Do the laundry" becomes "put the laundry in the machine and walk away".',
          'By first movement only. "Go for a walk" becomes "put your shoes on". Often the rest follows; if it does not, the shoes still counted.',
        ],
      },
      { type: 'pull', text: 'The smallest version is not the consolation prize. It is the correct answer.' },
      { type: 'h', text: 'When to go up a size' },
      {
        type: 'p',
        text: 'When the current size has been reliable for several days, not when you feel ready. Feeling ready arrives late and is a poor signal. If a bigger step fails twice, go back down without ceremony. Nothing has been lost.',
      },
      {
        type: 'try',
        text: 'Take the thing you keep failing to do. Write down its two-minute version. Do that version instead, for a week.',
      },
    ],
    takeaway: 'Set the size so success is boring and near-certain.',
  },
  {
    id: 's5',
    title: 'Achievement, comfort, and connection',
    blurb: 'Three different fuels. Most people rebuild with only one.',
    minutes: 4,
    mo: 'listening',
    blocks: [
      {
        type: 'p',
        text: 'When people start adding activity back, they tend to add tasks. Washing up, admin, laundry. Achievement is a real fuel and it works, but a week built only out of achievement is joyless and it burns out.',
      },
      { type: 'p', text: 'There are three fuels, and you need all three in a week.' },
      {
        type: 'list',
        items: [
          'Achievement — something is different afterwards. A clear surface, a sent email, a walked route.',
          'Comfort — the body is treated better. Heat, water, food, texture, quiet, music.',
          'Connection — another human is involved, however briefly. A message, a shop assistant, a call where you say almost nothing.',
        ],
      },
      { type: 'pull', text: 'A week of only achievement is a punishing week, and it will not hold.' },
      { type: 'h', text: 'Connection when you cannot face people' },
      {
        type: 'p',
        text: 'Connection is the one people cut first and it is the one with the largest effect. Cut it by size, not out entirely: a one-word text is connection. Sitting in a café near strangers is connection. Being in a library is connection. You do not need to talk to anyone for the presence of other humans to register.',
      },
      {
        type: 'try',
        text: 'Look at the last three lifts you logged. Which fuel were they? Add one from a fuel you have not used this week.',
      },
    ],
    takeaway: 'Balance achievement with comfort and connection, or the plan collapses.',
  },
  {
    id: 's6',
    title: 'Rumination: what it actually is',
    blurb: 'It feels like problem-solving. It is the opposite.',
    minutes: 4,
    mo: 'sleepy',
    blocks: [
      {
        type: 'p',
        text: 'Rumination is repeated, abstract thinking about why you feel bad, what is wrong with you, and how long this has been going on. It is the single strongest predictor of how long a depressive episode lasts, and almost everyone doing it believes they are working something out.',
      },
      {
        type: 'p',
        text: 'The tell is the word "why". Why am I like this. Why can I not manage. Why did I say that. Why-questions about the self have no answers available, so the loop never terminates. It simply lowers mood and consumes the hours.',
      },
      { type: 'pull', text: 'If a thought loop has run more than twice, it is not solving anything.' },
      { type: 'h', text: 'Rumination versus reflection' },
      {
        type: 'list',
        items: [
          'Reflection is concrete: what happened, when, what could be different next time.',
          'Rumination is abstract: what does this say about me, why am I like this.',
          'Reflection ends in a decision. Rumination ends when something interrupts it.',
          'Reflection leaves you level or slightly better. Rumination always leaves you worse.',
        ],
      },
      { type: 'h', text: 'Why it is so sticky' },
      {
        type: 'p',
        text: 'Because it is rewarding in a poor way. It feels like effort, it feels responsible, and it postpones action. It also tends to run hardest when you are still, undistracted and horizontal, which is exactly where depression puts you.',
      },
      {
        type: 'try',
        text: 'For the next two days, just label it. Say "ruminating" when you notice. Do not fight it yet. Labelling alone reduces it.',
      },
    ],
    takeaway: 'Abstract why-questions about yourself are the loop. Concrete what-questions are not.',
  },
  {
    id: 's7',
    title: 'Interrupting a loop',
    blurb: 'Four interruptions that work, in the order to try them.',
    minutes: 4,
    mo: 'warm',
    blocks: [
      {
        type: 'p',
        text: 'You cannot argue your way out of rumination, because arguing is more of the same activity. You interrupt it instead. The reliable interruptions all have one property: they move attention from abstract to concrete.',
      },
      { type: 'h', text: 'In order of how little they cost' },
      {
        type: 'list',
        items: [
          'Change your posture or your room. Sit up, stand, go somewhere else in the house. Loops are surprisingly attached to physical position.',
          'Go concrete. Ask what, where, when — never why. "What is the next physical movement" is the best question available.',
          'Use the senses. Cold water, a strong taste, a texture, sound. Two minutes of clear sensory input breaks the abstraction.',
          'Do a small task with your hands. The Liftr exists for exactly this moment.',
        ],
      },
      { type: 'pull', text: 'Concrete beats clever. Every time.' },
      { type: 'h', text: 'The night version' },
      {
        type: 'p',
        text: 'At night, all of this is harder because there is nothing else happening. Two things help specifically then: a long out-breath pattern, because it settles the physical agitation the loop feeds on, and putting the content somewhere else — a note, a voice memo, a line in the journal — so the mind stops rehearsing it to keep it.',
      },
      {
        type: 'p',
        text: 'If you are looping at three in the morning, this is not the moment to reach conclusions about your life. Nothing decided at three in the morning is decided by you.',
      },
      {
        type: 'try',
        text: 'Choose your default interruption now, while calm, so you are not choosing during a loop. Write it in the Anchr under things that have helped.',
      },
    ],
    takeaway: 'Interrupt with posture, concreteness, senses or hands — not with arguments.',
  },
  {
    id: 's8',
    title: 'Anchoring sleep and wake',
    blurb: 'One fixed point does more than eight hours of trying.',
    minutes: 5,
    mo: 'resting',
    blocks: [
      {
        type: 'p',
        text: 'Sleep and depression run in both directions. Depression disturbs sleep, and disturbed sleep deepens depression. The usual advice — get eight hours — is unhelpful because sleep duration is not directly controllable. Timing partly is.',
      },
      { type: 'pull', text: 'Fix the wake time. Let the sleep time sort itself out.' },
      { type: 'h', text: 'Why waking is the lever' },
      {
        type: 'p',
        text: 'Your body clock is set mainly by light hitting your eyes in the morning, and by the regularity of when you get up. A consistent wake time, followed by daylight within an hour, gradually pulls sleep onset earlier. Trying to force sleep earlier without moving the wake time achieves very little and adds pressure at bedtime, which makes sleep worse.',
      },
      { type: 'h', text: 'The rules that matter, in order' },
      {
        type: 'list',
        items: [
          'Same wake time every day, within about an hour, including weekends.',
          'Daylight within an hour of waking, ideally outside, even in cloud. Ten minutes is worth having.',
          'Get out of bed when you wake, even if you go and lie on the sofa. The bed should mean sleep, not waiting.',
          'No naps after mid-afternoon. Before that, twenty minutes is fine.',
          'If you are awake for more than about twenty minutes in the night, get up, do something dull in low light, and go back when sleepy.',
        ],
      },
      { type: 'h', text: 'Early waking' },
      {
        type: 'p',
        text: 'Waking at four or five, unable to get back, with mood at its worst, is a common feature of depression rather than a personal failure. It usually improves as the episode does. In the meantime, treat those hours as unusable for thinking and use them for something dull and physical instead.',
      },
      {
        type: 'try',
        text: 'Pick a wake time you can hold seven days a week. Set it for a fortnight. Change nothing else about sleep.',
      },
    ],
    takeaway: 'A fixed wake time plus morning light is the highest-yield sleep move there is.',
  },
  {
    id: 's9',
    title: 'What you would be doing if this lifted',
    blurb: 'Values, without the workshop language.',
    minutes: 4,
    mo: 'listening',
    blocks: [
      {
        type: 'p',
        text: 'Once activity is moving again, it needs a direction, or you end up with a tidy kitchen and an empty life. The usual word for the direction is values, which sounds like a corporate away-day. A more useful phrasing: what would you be doing if this lifted?',
      },
      {
        type: 'p',
        text: 'Not what would you have. What would you be doing on an ordinary Wednesday. Who would you be talking to. What would you be making, tending, learning, showing up for.',
      },
      { type: 'pull', text: 'Values are directions, not destinations. You can move in one today.' },
      { type: 'h', text: 'Finding yours when everything feels flat' },
      {
        type: 'list',
        items: [
          'Look backwards. What did you spend time on before, when nobody was making you?',
          'Look at irritation. What makes you angry on behalf of other people is usually pointing at something you value.',
          'Look at envy, briefly and without shame. It is a reliable pointer, even when unpleasant.',
          'Ask what you would want a younger relative to have in their life. People are far more articulate about others.',
        ],
      },
      { type: 'h', text: 'Do not wait for clarity' },
      {
        type: 'p',
        text: 'Anhedonia makes values hard to feel, so a definitive answer is not available right now. A rough direction is enough. You are looking for something to aim the next small action at, not a life philosophy.',
      },
      {
        type: 'try',
        text: 'Write three words for directions that still matter, even faintly. Keep them for the next lesson.',
      },
    ],
    takeaway: 'A rough direction beats a perfect one. Aim the small actions somewhere.',
  },
  {
    id: 's10',
    title: 'Turning a value into a Tuesday',
    blurb: 'The step where most people stop.',
    minutes: 4,
    mo: 'warm',
    blocks: [
      {
        type: 'p',
        text: 'A value is useless until it has a size, a time and a first movement. "Being a good friend" does nothing. "Text Priya on Tuesday morning after coffee" does something.',
      },
      { type: 'h', text: 'The ladder' },
      {
        type: 'p',
        text: 'Take one direction and write four rungs, from something you could do in bed today to something that would be a genuinely good week. Then start at the bottom rung, even if it feels insulting. Especially if it feels insulting — that reaction is the illness objecting to being helped slowly.',
      },
      {
        type: 'list',
        items: [
          'Direction: being connected. Rungs: send one word · reply to a waiting message · call someone for ten minutes · see someone in person.',
          'Direction: making things. Rungs: open the box · lay the materials out · fifteen minutes badly · finish one small piece.',
          'Direction: looking after myself. Rungs: glass of water · shower sitting down · cook one real meal · a full week of eating properly.',
        ],
      },
      { type: 'pull', text: 'Every rung counts as movement in the direction. Not just the top one.' },
      { type: 'h', text: 'When the ladder stalls' },
      {
        type: 'p',
        text: 'If a rung fails twice, it was two rungs. Insert one between. There is no minimum step size, and there is no prize for climbing quickly.',
      },
      {
        type: 'try',
        text: 'Build one four-rung ladder tonight and schedule the bottom rung for tomorrow.',
      },
    ],
    takeaway: 'Directions become real when they have a day, a size and a first movement.',
  },
  {
    id: 's11',
    title: 'Self-criticism and what it costs',
    blurb: 'The internal voice that claims it is keeping you going.',
    minutes: 5,
    mo: 'warm',
    blocks: [
      {
        type: 'p',
        text: 'Most people with depression have a running commentary that would be considered abuse if it came from someone else. It usually claims to be motivating. It is not. Self-criticism reliably reduces the chance of the next attempt, because the cost of trying now includes the beating that follows failure.',
      },
      { type: 'pull', text: 'Nobody has ever been insulted into recovery.' },
      { type: 'h', text: 'Where it comes from' },
      {
        type: 'p',
        text: 'Often from somewhere it once made sense — a household where pre-empting criticism was safer, or a period where high standards worked. It is worth being fair to it. It is not stupid, and it is not you being weak. It is a strategy that has outlived its usefulness and is now running at a loss.',
      },
      { type: 'h', text: 'What actually shifts it' },
      {
        type: 'list',
        items: [
          'The friend test. Ask what you would say to a friend in the same position. This unlocks compassion far more reliably than trying to argue with the criticism directly. It is step three of the Reframr for that reason.',
          'Accuracy, not kindness. If "you are useless" is hard to counter, counter it with specifics instead: here is what was done today, here is what was not, here is what the illness accounts for.',
          'Naming the voice. Some people find it easier to answer a critic they can picture than a thought they are fused with.',
          'Tone, not content. Try saying the same sentence in a neutral voice. Much of the damage is in the delivery.',
        ],
      },
      { type: 'h', text: 'A warning about self-compassion' },
      {
        type: 'p',
        text: 'In deep low mood, warm self-talk can feel intolerable or provoke tears and resistance. That is common and it is not failure. If it happens, drop back to plain accuracy and neutral tone, and leave the warmth for later.',
      },
      {
        type: 'try',
        text: 'Take today’s harshest thought into the Reframr and answer only step three: what would you say to a friend.',
      },
    ],
    takeaway: 'Criticism raises the cost of trying. Accuracy and a neutral tone lower it.',
  },
  {
    id: 's12',
    title: 'The bad week plan',
    blurb: 'For the week where none of this happens.',
    minutes: 4,
    mo: 'resting',
    blocks: [
      {
        type: 'p',
        text: 'There will be a week where the plan collapses entirely. No lifts, no check-ins, nothing scheduled and nothing done. This lesson exists so that week is already accounted for and does not turn into a verdict.',
      },
      { type: 'pull', text: 'A bad week is weather inside an illness, not proof that the work failed.' },
      { type: 'h', text: 'What to do' },
      {
        type: 'list',
        items: [
          'Drop to the floor set: the two or three smallest things you keep doing regardless. Water, medication if you take it, one open curtain.',
          'Delete everything else. Do not carry it forward. Nothing accrues.',
          'Keep the wake time if you can keep only one thing. It is the fastest route back.',
          'Tell one person it is a bad week. You do not have to elaborate.',
          'Return at the bottom rung, not where you left off. Starting where you stopped is how people bounce off.',
        ],
      },
      { type: 'h', text: 'What not to do' },
      {
        type: 'p',
        text: 'Do not review the week to work out where it went wrong; that is rumination with a clipboard. Do not attempt a big compensating effort on the first good day, which reliably produces a crash and a second bad week. And do not read a collapse as evidence about your character. Recovery is not linear for anyone, and the graph is jagged even when the trend is up.',
      },
      {
        type: 'try',
        text: 'Write your floor set now, while things are workable, and put it in the Anchr under things that have helped.',
      },
    ],
    takeaway: 'Have a floor. Drop to it without shame, and restart at the bottom rung.',
  },
];
