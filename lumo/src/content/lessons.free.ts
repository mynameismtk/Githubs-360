import type { Lesson } from './lessonTypes';

/** UNDERSTANDING — free tier. Five lessons, honest, no advocacy either way. */
export const FREE_LESSONS: Lesson[] = [
  {
    id: 'motivation',
    title: 'What depression does to motivation',
    blurb: 'Why the tank reads empty even when nothing is wrong with the engine.',
    minutes: 4,
    mo: 'listening',
    blocks: [
      {
        type: 'p',
        text: 'Most people describe depression as sadness. Sadness is often there, but it is rarely the thing that runs the day. The thing that runs the day is that starting anything costs far more than it used to.',
      },
      {
        type: 'p',
        text: 'This is not a metaphor. Depression changes how the brain calculates effort and reward. The parts of the system that estimate "how much will this cost me" and "how good will this feel afterwards" both shift. Cost gets over-estimated. Reward gets under-estimated. You are not imagining the weight. You are running the same task on worse numbers.',
      },
      { type: 'pull', text: 'Nothing is wrong with your willpower. The pricing is wrong.' },
      { type: 'h', text: 'Why this matters more than it sounds' },
      {
        type: 'p',
        text: 'If you believe the problem is willpower, every undone thing becomes evidence about your character. That is exhausting, and it is also wrong. If you believe the problem is a shifted calculation, then the fix is not to become a better person. The fix is to make the first step so small that even an inflated price is affordable.',
      },
      {
        type: 'p',
        text: 'That is the entire logic of this app. Not motivation. Not discipline. Just an offer priced low enough that a depressed brain will accept it.',
      },
      { type: 'h', text: 'The bit people get wrong' },
      {
        type: 'list',
        items: [
          'The energy does not arrive first. It arrives partway through, or afterwards, or sometimes not at all that day.',
          'The reward for a small action is quiet. You are looking for a feeling that is currently turned down, so it will not be loud.',
          'Doing a small thing badly still counts. The brain updates on having done it, not on having done it well.',
        ],
      },
      {
        type: 'try',
        text: 'Next time you notice "I cannot be bothered", try reading it as "the price is currently wrong" and see whether a two-minute version becomes possible.',
      },
    ],
    takeaway: 'Low motivation is a symptom with a mechanism, not a verdict about you.',
  },
  {
    id: 'wait-until',
    title: 'Why "wait until you feel like it" fails',
    blurb: 'The order most people assume is backwards.',
    minutes: 4,
    mo: 'warm',
    blocks: [
      {
        type: 'p',
        text: 'When you are well, the sequence usually runs: feel like it, then do it. So when you are unwell, waiting to feel like it seems reasonable. You are waiting for the normal starting conditions to return.',
      },
      { type: 'p', text: 'They do not return on their own. That is the trap.' },
      {
        type: 'p',
        text: 'Mood in depression is largely fed by what you do and what happens as a result. Activity is one of the main inputs. If activity drops, the input drops, and the mood that was supposed to trigger the activity drops further. The loop tightens in one direction, quietly, over weeks.',
      },
      { type: 'pull', text: 'Action comes first. The feeling, if it comes, comes second.' },
      { type: 'h', text: 'This is not "fake it till you make it"' },
      {
        type: 'p',
        text: 'Nobody is asking you to perform being fine. The point is not to look better, and it is not to feel better while you do it. Quite often the action is done badly, resentfully, and with no lift at all in the moment. It still works, because what is being rebuilt is the connection between doing things and getting something back — and that connection is repaired by repetition, not by enthusiasm.',
      },
      { type: 'h', text: 'What to expect, honestly' },
      {
        type: 'list',
        items: [
          'The first few times, expect nothing. Really nothing. That is normal and it is not failure.',
          'The lift, when it appears, tends to be small and late. An hour later, or the next morning.',
          'The strongest effect is usually cumulative: a fortnight of small actions beats one big one.',
        ],
      },
      {
        type: 'try',
        text: 'Pick something today that you would definitely refuse if you were waiting to feel like it. Do it anyway, badly, and do not check whether it worked for at least an hour.',
      },
    ],
    takeaway: 'You do not have to feel like it. That was never the requirement.',
  },
  {
    id: 'rest-vs-avoidance',
    title: 'The difference between rest and avoidance',
    blurb: 'They look identical from the outside. They feel different afterwards.',
    minutes: 5,
    mo: 'resting',
    blocks: [
      {
        type: 'p',
        text: 'A lot of advice about depression sounds like an instruction to stop resting. That advice is wrong and it makes people worse. Rest is necessary, especially when the illness itself is making everything cost more.',
      },
      {
        type: 'p',
        text: 'But there is a second thing that wears the same clothes. Avoidance also involves lying down, also involves a screen, and also gets called "having a rest". The difference is not in what you do. It is in what it is doing for you.',
      },
      { type: 'h', text: 'A test that actually works' },
      {
        type: 'list',
        items: [
          'Rest is chosen. Avoidance is a retreat from something specific.',
          'Rest has an end you can picture. Avoidance is open-ended and keeps extending itself.',
          'Rest leaves you slightly restored. Avoidance leaves you flatter, and usually with a bit of dread attached.',
          'After rest you can name what you were resting from. After avoidance you can name what you were avoiding, if you are honest for a second.',
        ],
      },
      {
        type: 'pull',
        text: 'The question is not "am I lying down too much". It is "does this leave me lighter or heavier".',
      },
      { type: 'h', text: 'What to do about avoidance' },
      {
        type: 'p',
        text: 'Not force. Avoidance responds badly to force and well to size. Take the thing being avoided and cut it until the smallest possible piece is left: not "reply to everyone", but "open the message and read it". Not "sort the admin", but "put the letters in one place".',
      },
      {
        type: 'p',
        text: 'And keep real rest. Protect it. Give it a shape — a time, a blanket, a decision — so it stops being the same undifferentiated grey as the avoidance.',
      },
      {
        type: 'try',
        text: 'Next time you lie down, decide out loud whether this is rest or a retreat. You do not have to change what you do. Just name it.',
      },
    ],
    takeaway: 'Rest restores. Avoidance charges interest. Same posture, different bill.',
  },
  {
    id: 'anhedonia',
    title: 'Anhedonia, in plain language',
    blurb: 'When the things you like stop working.',
    minutes: 4,
    mo: 'sleepy',
    blocks: [
      {
        type: 'p',
        text: 'Anhedonia is the loss of pleasure or interest in things that used to give you both. It is one of the two core features of depression, and for many people it is the more frightening one. Sadness at least feels like something. This feels like being unplugged.',
      },
      {
        type: 'p',
        text: 'Music that used to move you plays like furniture. Food is fuel. People you love are still people you love, in principle, but the warmth does not arrive when they walk in.',
      },
      { type: 'pull', text: 'The capacity has not been removed. It has been turned down.' },
      { type: 'h', text: 'Two halves worth separating' },
      {
        type: 'p',
        text: 'Researchers separate wanting from liking. In depression, wanting — the anticipation, the pull towards a thing — is usually hit harder than liking. Which means the moment of doing something is often less blank than the moment of deciding to do it.',
      },
      {
        type: 'p',
        text: 'This has a practical consequence. If you wait until you want something, you are waiting on the part that is most damaged. If you go anyway, you are testing the part that is often less damaged. That is why "I did not want to go and it was alright once I was there" is such a common sentence.',
      },
      { type: 'h', text: 'How to work with it' },
      {
        type: 'list',
        items: [
          'Lower the bar from enjoyment to tolerance. "That was okay" is a full result.',
          'Rate things afterwards, not before. Before-ratings in depression are almost always too low.',
          'Go back to old favourites more than once. First returns are usually flat, and people conclude too quickly that the thing is dead.',
          'Sensory and physical things — heat, cold, water, movement, texture — often come back online before emotional ones.',
        ],
      },
      {
        type: 'try',
        text: 'Pick something you used to like. Do a small piece of it and rate it out of ten afterwards. Expect a four. A four is data, not a disappointment.',
      },
    ],
    takeaway: 'Wanting recovers slower than liking. Go before the wanting comes back.',
  },
  {
    id: 'what-helps',
    title: 'What actually helps, ranked honestly',
    blurb: 'Neither advocacy nor stigma. What the evidence supports, and what it does not.',
    minutes: 5,
    mo: 'glowing',
    blocks: [
      {
        type: 'p',
        text: 'This lesson will not tell you what to do. It will tell you what tends to hold up, so that you can make your own decision with better information than an internet argument.',
      },
      { type: 'h', text: 'Strong support' },
      {
        type: 'list',
        items: [
          'Talking therapies, particularly CBT and behavioural activation. Behavioural activation is unusual in being simple, cheap and about as effective as more complex therapies for many people.',
          'Antidepressant medication, for moderate to severe depression. It works well for some people, partially for others, and not at all for a minority. Side effects are real and worth discussing honestly with a prescriber. Neither taking it nor not taking it is a moral position.',
          'Combining therapy and medication, which for more severe depression tends to beat either on its own.',
        ],
      },
      { type: 'h', text: 'Good support, and available to you today' },
      {
        type: 'list',
        items: [
          'Regular activity that gets you moving, particularly outdoors and particularly in daylight.',
          'A stable sleep and wake time. Waking at a consistent hour is more useful than trying to force sleep at a consistent hour.',
          'Contact with other people, in small doses, even when it is unrewarding at the time.',
          'Reducing alcohol, which is a depressant and reliably makes the following two days worse.',
        ],
      },
      { type: 'h', text: 'Mixed or overstated' },
      {
        type: 'list',
        items: [
          'Supplements. Most have thin evidence. Vitamin D matters if you are deficient; get tested rather than guessing.',
          'Mindfulness and meditation. Good for rumination and for preventing relapse. Less impressive as a treatment for an episode that is already underway, and for some people sitting still with their thoughts makes things briefly worse.',
          'Gratitude practices. Fine when things are mild. Frequently backfire in the middle of a bad episode, where they become another test to fail.',
        ],
      },
      { type: 'pull', text: 'Nothing on this list works quickly, and nothing on it works for everyone.' },
      {
        type: 'p',
        text: 'Where Lumo sits: this app is a behavioural activation tool with some CBT alongside it. That places it in the "good support, available today" band. It is not treatment, it does not replace a clinician, and if things are severe or you are not safe, the people on the crisis lines in the Anchr are the right call.',
      },
      {
        type: 'try',
        text: 'If you have been putting off asking a doctor, the smallest version is booking the appointment. That is one action, and it lives in the Liftr library.',
      },
    ],
    takeaway: 'Action, sleep, daylight, people — plus professional help when it is more than mild.',
  },
];
